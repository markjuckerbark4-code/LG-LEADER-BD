import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface FirestoreApkMeta {
  batchId: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  version: string;
  chunkCount: number;
  uploadedAt: string;
}

const CHUNK_SIZE = 650 * 1024; // 650 KB raw (~867 KB base64, safely under Firestore 1 MiB limit)
export const MAX_FIRESTORE_APK_BYTES = 120 * 1024 * 1024; // 120 MB

export function formatApkBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function uint8ToBase64(bytes: Uint8Array): string {
  const BLOCK = 0x2000; // 8 KB slice prevents call stack overflow
  let binary = '';
  for (let i = 0; i < bytes.length; i += BLOCK) {
    const slice = bytes.subarray(i, i + BLOCK);
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function sanitizeFileName(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!cleaned) return 'LG_LEADER_BD.apk';
  return cleaned.toLowerCase().endsWith('.apk') ? cleaned : `${cleaned}.apk`;
}

export async function getFirestoreApkMeta(): Promise<FirestoreApkMeta | null> {
  try {
    const snap = await getDoc(doc(db, 'apk_meta', 'current'));
    if (!snap.exists()) return null;
    const data = snap.data() as FirestoreApkMeta;
    if (!data?.batchId || !data?.chunkCount) return null;
    return data;
  } catch (err) {
    console.warn('Could not read Firestore APK meta:', err);
    return null;
  }
}

async function deleteBatchChunks(batchId: string, chunkCount: number): Promise<void> {
  const CONCURRENCY = 6;
  for (let i = 0; i < chunkCount; i += CONCURRENCY) {
    const tasks: Promise<void>[] = [];
    for (let j = i; j < Math.min(chunkCount, i + CONCURRENCY); j++) {
      tasks.push(deleteDoc(doc(db, 'apk_chunks', `${batchId}_${j}`)).catch(() => {}));
    }
    await Promise.all(tasks);
  }
}

async function tryMirrorToExpressServer(file: File, fileName: string, version: string): Promise<void> {
  try {
    const initRes = await fetch('/api/upload-apk-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, version, totalSize: file.size }),
    });
    if (!initRes.ok) return; // Static hosting (404/405) -> skip silently
    const initData = await initRes.json().catch(() => null);
    if (!initData?.success || !initData?.uploadId) return;

    const SERVER_CHUNK = 2 * 1024 * 1024;
    const total = Math.max(1, Math.ceil(file.size / SERVER_CHUNK));
    for (let i = 0; i < total; i++) {
      const start = i * SERVER_CHUNK;
      const end = Math.min(file.size, start + SERVER_CHUNK);
      const res = await fetch('/api/upload-apk-chunk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Upload-Id': initData.uploadId,
          'X-Chunk-Index': String(i),
        },
        body: file.slice(start, end),
      });
      if (!res.ok) return;
    }

    await fetch('/api/upload-apk-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId: initData.uploadId }),
    });
  } catch {
    // Express mirror is optional; Firestore storage is primary & works everywhere
  }
}

export async function uploadApkToFirestore(
  file: File,
  version: string,
  onProgress?: (percent: number) => void
): Promise<FirestoreApkMeta> {
  if (file.size === 0) {
    throw new Error('খালি APK ফাইল আপলোড করা যাবে না।');
  }
  if (file.size > MAX_FIRESTORE_APK_BYTES) {
    throw new Error(
      'ফাইলের সাইজ ১২০ MB-এর বেশি হলে সরাসরি "External URL" অপশন ব্যবহার করুন অথবা APK সাইজ কমান।'
    );
  }

  const prevMeta = await getFirestoreApkMeta();
  const fileName = sanitizeFileName(file.name);
  const cleanVersion = version.trim() || 'v1.0.0';
  const batchId = `apk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

  let completed = 0;
  const CONCURRENCY = 4;

  for (let startIdx = 0; startIdx < totalChunks; startIdx += CONCURRENCY) {
    const batchPromises: Promise<void>[] = [];
    for (let idx = startIdx; idx < Math.min(totalChunks, startIdx + CONCURRENCY); idx++) {
      const start = idx * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const blob = file.slice(start, end);

      batchPromises.push(
        (async () => {
          const buffer = await blob.arrayBuffer();
          const b64 = uint8ToBase64(new Uint8Array(buffer));
          await setDoc(doc(db, 'apk_chunks', `${batchId}_${idx}`), {
            batchId,
            index: idx,
            data: b64,
          });
          completed += 1;
          onProgress?.(Math.min(95, Math.round((completed / totalChunks) * 94)));
        })()
      );
    }
    await Promise.all(batchPromises);
  }

  const meta: FirestoreApkMeta = {
    batchId,
    fileName,
    fileSize: file.size,
    fileSizeFormatted: formatApkBytes(file.size),
    version: cleanVersion,
    chunkCount: totalChunks,
    uploadedAt: new Date().toLocaleString(),
  };

  await setDoc(doc(db, 'apk_meta', 'current'), meta);
  onProgress?.(98);

  // Best-effort sync to Express server if available + clean up previous APK chunks
  void tryMirrorToExpressServer(file, fileName, cleanVersion);
  if (prevMeta?.batchId && prevMeta.batchId !== batchId) {
    void deleteBatchChunks(prevMeta.batchId, prevMeta.chunkCount);
  }

  onProgress?.(100);
  return meta;
}

export async function downloadApkFromFirestore(
  meta: FirestoreApkMeta,
  onProgress?: (percent: number) => void
): Promise<void> {
  const totalChunks = meta.chunkCount;
  const parts: Uint8Array[] = new Array(totalChunks);
  let loaded = 0;
  const CONCURRENCY = 6;

  for (let startIdx = 0; startIdx < totalChunks; startIdx += CONCURRENCY) {
    const tasks: Promise<void>[] = [];
    for (let idx = startIdx; idx < Math.min(totalChunks, startIdx + CONCURRENCY); idx++) {
      tasks.push(
        (async () => {
          const snap = await getDoc(doc(db, 'apk_chunks', `${meta.batchId}_${idx}`));
          if (!snap.exists()) {
            throw new Error(`APK ফাইলটির অংশ (${idx + 1}/${totalChunks}) পাওয়া যায়নি।`);
          }
          const data = snap.data() as { data?: string };
          if (!data?.data) {
            throw new Error(`APK ডাটা ত্রুটিপূর্ণ (${idx + 1}/${totalChunks})।`);
          }
          parts[idx] = base64ToUint8(data.data);
          loaded += 1;
          onProgress?.(Math.min(98, Math.round((loaded / totalChunks) * 96)));
        })()
      );
    }
    await Promise.all(tasks);
  }

  const blobParts: BlobPart[] = parts.map((chunk) => {
    const copy = new Uint8Array(chunk.byteLength);
    copy.set(chunk);
    return copy.buffer;
  });

  const apkBlob = new Blob(blobParts, {
    type: 'application/vnd.android.package-archive',
  });
  const url = URL.createObjectURL(apkBlob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', meta.fileName || 'LG_LEADER_BD.apk');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onProgress?.(100);

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function deleteApkFromFirestore(meta?: FirestoreApkMeta | null): Promise<void> {
  const targetMeta = meta || (await getFirestoreApkMeta());
  await deleteDoc(doc(db, 'apk_meta', 'current')).catch(() => {});
  if (targetMeta?.batchId && targetMeta?.chunkCount) {
    await deleteBatchChunks(targetMeta.batchId, targetMeta.chunkCount);
  }
  try {
    await fetch('/api/delete-apk', { method: 'DELETE' });
  } catch {
    // Ignore on static hosting
  }
}
