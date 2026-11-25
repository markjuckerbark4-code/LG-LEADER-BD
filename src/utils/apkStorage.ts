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

export interface ActiveApkInfo {
  exists: boolean;
  source?: 'server' | 'static' | 'firestore';
  fileName?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  version?: string;
  uploadedAt?: string;
  downloadUrl?: string;
  firestoreMeta?: FirestoreApkMeta | null;
}

const CHUNK_SIZE = 650 * 1024; // 650 KB raw (~867 KB base64, safely under Firestore 1 MiB limit)
const SERVER_CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB chunks for Express server (stays well under 32 MB proxy cap)
export const MAX_FIRESTORE_APK_BYTES = 120 * 1024 * 1024; // 120 MB
export const MAX_SERVER_APK_BYTES = 250 * 1024 * 1024; // 250 MB

export function formatApkBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err || '');
  return (
    msg.includes('resource-exhausted') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota') ||
    msg.includes('quota') ||
    msg.includes('FIRESTORE_TIMEOUT')
  );
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

export function sanitizeApkFileName(raw: string): string {
  // Handle mobile browser duplicate names like "app.apk (1)" or "app (1).apk"
  let cleaned = raw.trim().replace(/\s*\(\d+\)\s*$/i, '');
  cleaned = cleaned.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!cleaned) return 'LG_LEADER_BD.apk';
  return cleaned.toLowerCase().endsWith('.apk') ? cleaned : `${cleaned}.apk`;
}

export async function getFirestoreApkMeta(): Promise<FirestoreApkMeta | null> {
  try {
    const snap = await withTimeout(
      getDoc(doc(db, 'apk_meta', 'current')),
      5000,
      'FIRESTORE_READ_TIMEOUT'
    );
    if (!snap.exists()) return null;
    const data = snap.data() as FirestoreApkMeta;
    if (!data?.batchId || !data?.chunkCount) return null;
    return data;
  } catch {
    return null;
  }
}

async function deleteBatchChunks(batchId: string, chunkCount: number): Promise<void> {
  const CONCURRENCY = 6;
  for (let i = 0; i < chunkCount; i += CONCURRENCY) {
    const tasks: Promise<void>[] = [];
    for (let j = i; j < Math.min(chunkCount, i + CONCURRENCY); j++) {
      tasks.push(
        withTimeout(
          deleteDoc(doc(db, 'apk_chunks', `${batchId}_${j}`)),
          3000,
          'DELETE_TIMEOUT'
        ).catch(() => {})
      );
    }
    await Promise.all(tasks);
  }
}

async function tryUploadToExpressServer(
  file: File,
  fileName: string,
  version: string,
  onProgress?: (percent: number) => void
): Promise<{ supported: boolean; info?: ActiveApkInfo }> {
  let initRes: Response;
  try {
    initRes = await fetch('/api/upload-apk-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, version, totalSize: file.size }),
    });
  } catch {
    return { supported: false };
  }

  // Static deployments (ais-pre, Vercel static) return 404 or 405 on POST /api/*
  if (initRes.status === 404 || initRes.status === 405) {
    return { supported: false };
  }

  const initData = await initRes.json().catch(() => null);
  if (!initRes.ok || !initData?.success || !initData?.uploadId) {
    throw new Error(
      initData?.error || `সার্ভারে APK আপলোড শুরু করতে ব্যর্থ (HTTP ${initRes.status})।`
    );
  }

  const totalChunks = Math.max(1, Math.ceil(file.size / SERVER_CHUNK_SIZE));
  for (let i = 0; i < totalChunks; i++) {
    const start = i * SERVER_CHUNK_SIZE;
    const end = Math.min(file.size, start + SERVER_CHUNK_SIZE);
    const res = await fetch('/api/upload-apk-chunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Upload-Id': initData.uploadId,
        'X-Chunk-Index': String(i),
      },
      body: file.slice(start, end),
    });

    const chunkData = await res.json().catch(() => null);
    if (!res.ok || !chunkData?.success) {
      throw new Error(chunkData?.error || `আপলোডের অংশ (${i + 1}/${totalChunks}) ব্যর্থ হয়েছে।`);
    }

    onProgress?.(Math.min(95, Math.round(((i + 1) / totalChunks) * 94)));
  }

  const completeRes = await fetch('/api/upload-apk-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId: initData.uploadId }),
  });

  const completeData = await completeRes.json().catch(() => null);
  if (!completeRes.ok || !completeData?.success) {
    throw new Error(completeData?.error || 'APK ফাইল ফাইনাল সেভ করতে ব্যর্থ হয়েছে।');
  }

  onProgress?.(100);

  return {
    supported: true,
    info: {
      exists: true,
      source: 'server',
      fileName: completeData.fileName || fileName,
      fileSize: completeData.fileSize || file.size,
      fileSizeFormatted: formatApkBytes(completeData.fileSize || file.size),
      version: completeData.version || version,
      uploadedAt: completeData.uploadedAt || new Date().toLocaleString(),
      downloadUrl: '/api/download-apk',
    },
  };
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
  const fileName = sanitizeApkFileName(file.name);
  const cleanVersion = version.trim() || 'v1.0.0';
  const batchId = `apk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

  let completed = 0;
  const CONCURRENCY = 3;

  try {
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
            await withTimeout(
              setDoc(doc(db, 'apk_chunks', `${batchId}_${idx}`), {
                batchId,
                index: idx,
                data: b64,
              }),
              12000,
              'FIRESTORE_TIMEOUT: Firebase ডাটাবেসে সেভ করতে বেশি সময় লাগছে (ফ্রি কোটা পূর্ণ হতে পারে)।'
            );
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

    await withTimeout(
      setDoc(doc(db, 'apk_meta', 'current'), meta),
      10000,
      'FIRESTORE_TIMEOUT: মেটাডাটা সেভ করা যায়নি।'
    );
    onProgress?.(98);

    if (prevMeta?.batchId && prevMeta.batchId !== batchId) {
      void deleteBatchChunks(prevMeta.batchId, prevMeta.chunkCount);
    }

    onProgress?.(100);
    return meta;
  } catch (err) {
    if (isQuotaError(err)) {
      throw new Error(
        'Firebase-এর আজকের ফ্রি কোটা শেষ হয়ে যাওয়ায় স্ট্যাটিক লিংক থেকে সরাসরি APK আপলোড আটকে গেছে। অনুগ্রহ করে Development App URL থেকে আপলোড করুন অথবা নিচের External URL বক্সে ডাইরেক্ট APK লিংক সেভ করুন।'
      );
    }
    throw err;
  }
}

export async function uploadApkSmart(
  file: File,
  version: string,
  onProgress?: (percent: number) => void
): Promise<ActiveApkInfo> {
  if (file.size === 0) {
    throw new Error('খালি APK ফাইল আপলোড করা যাবে না।');
  }
  if (file.size > MAX_SERVER_APK_BYTES) {
    throw new Error('ফাইলের সাইজ সর্বোচ্চ 250 MB এর বেশি হতে পারবে না।');
  }

  const fileName = sanitizeApkFileName(file.name);
  const cleanVersion = version.trim() || 'v1.0.0';

  // Priority 1: Direct Express server chunked upload (works immediately without using Firestore quota)
  const serverAttempt = await tryUploadToExpressServer(file, fileName, cleanVersion, onProgress);
  if (serverAttempt.supported && serverAttempt.info) {
    // Best-effort clear stale Firestore APK meta so clients prefer the fresh server/static file
    void withTimeout(
      deleteDoc(doc(db, 'apk_meta', 'current')),
      3000,
      'CLEANUP_TIMEOUT'
    ).catch(() => {});
    return serverAttempt.info;
  }

  // Priority 2: Static deployment fallback -> Firestore cloud chunks (with fast quota timeout)
  const meta = await uploadApkToFirestore(file, cleanVersion, onProgress);
  return {
    exists: true,
    source: 'firestore',
    fileName: meta.fileName,
    fileSize: meta.fileSize,
    fileSizeFormatted: meta.fileSizeFormatted,
    version: meta.version,
    uploadedAt: meta.uploadedAt,
    downloadUrl: `firestore://${meta.batchId}`,
    firestoreMeta: meta,
  };
}

export async function getActiveApkInfo(): Promise<ActiveApkInfo> {
  const [serverRes, staticRes, fsMeta] = await Promise.all([
    fetch(`/api/apk-info?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null),
    fetch(`/downloads/apk-meta.json?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null),
    getFirestoreApkMeta(),
  ]);

  if (serverRes?.exists && serverRes?.fileName) {
    return {
      exists: true,
      source: 'server',
      fileName: serverRes.fileName,
      fileSize: serverRes.fileSize,
      fileSizeFormatted: formatApkBytes(serverRes.fileSize),
      version: serverRes.version || 'v1.0.0',
      uploadedAt: serverRes.uploadedAt,
      downloadUrl: '/api/download-apk',
    };
  }

  if (staticRes?.fileName && staticRes?.downloadUrl) {
    return {
      exists: true,
      source: 'static',
      fileName: staticRes.fileName,
      fileSize: staticRes.fileSize,
      fileSizeFormatted: formatApkBytes(staticRes.fileSize),
      version: staticRes.version || 'v1.0.0',
      uploadedAt: staticRes.uploadedAt,
      downloadUrl: staticRes.downloadUrl || '/downloads/app.apk',
    };
  }

  if (fsMeta) {
    return {
      exists: true,
      source: 'firestore',
      fileName: fsMeta.fileName,
      fileSize: fsMeta.fileSize,
      fileSizeFormatted: fsMeta.fileSizeFormatted,
      version: fsMeta.version,
      uploadedAt: fsMeta.uploadedAt,
      downloadUrl: `firestore://${fsMeta.batchId}`,
      firestoreMeta: fsMeta,
    };
  }

  return { exists: false };
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
          const snap = await withTimeout(
            getDoc(doc(db, 'apk_chunks', `${meta.batchId}_${idx}`)),
            12000,
            'APK ডাউনলোড করতে সময় বেশি লাগছে। আবার চেষ্টা করুন।'
          );
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

export async function downloadApkSmart(
  info: ActiveApkInfo,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (!info.exists) {
    throw new Error('কোনো APK ফাইল পাওয়া যায়নি।');
  }

  const fileName = info.fileName || 'LG_LEADER_BD.apk';

  if (info.source === 'server') {
    const link = document.createElement('a');
    link.href = `/api/download-apk?t=${Date.now()}`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onProgress?.(100);
    return;
  }

  if (info.source === 'static') {
    const link = document.createElement('a');
    link.href = `${info.downloadUrl || '/downloads/app.apk'}?t=${Date.now()}`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onProgress?.(100);
    return;
  }

  if (info.firestoreMeta) {
    await downloadApkFromFirestore(info.firestoreMeta, onProgress);
  }
}

export async function deleteApkFromFirestore(meta?: FirestoreApkMeta | null): Promise<void> {
  const targetMeta = meta || (await getFirestoreApkMeta());
  await withTimeout(
    deleteDoc(doc(db, 'apk_meta', 'current')),
    3500,
    'DELETE_META_TIMEOUT'
  ).catch(() => {});
  if (targetMeta?.batchId && targetMeta?.chunkCount) {
    await deleteBatchChunks(targetMeta.batchId, targetMeta.chunkCount);
  }
  try {
    await fetch('/api/delete-apk', { method: 'DELETE' });
  } catch {
    // Ignore on static hosting
  }
}

export async function deleteApkSmart(info?: ActiveApkInfo | null): Promise<void> {
  await Promise.all([
    fetch('/api/delete-apk', { method: 'DELETE' }).catch(() => {}),
    deleteApkFromFirestore(info?.firestoreMeta).catch(() => {}),
  ]);
}
