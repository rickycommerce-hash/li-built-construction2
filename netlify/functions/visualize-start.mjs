import { getStore } from '@netlify/blobs';

const MAX_IMAGE_DATA_LENGTH = 5_000_000;
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const respond = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
const cleanJobId = (value) => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

export default async (request) => {
  if (request.method === 'OPTIONS') return respond({ ok: true });
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return respond({ error: 'The visualizer request could not be read.' }, 400);
  }

  const jobId = cleanJobId(body.jobId);
  const imageDataUrl = String(body.imageDataUrl || '');
  if (!jobId) return respond({ error: 'Missing visualizer job ID.' }, 400);
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageDataUrl)) {
    return respond({ error: 'Please upload a valid JPG, PNG, or WebP image.' }, 400);
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_LENGTH) {
    return respond({ error: 'The processed image is still too large. Please use a smaller photo.' }, 413);
  }

  const inputs = getStore('li-built-visualizer-inputs');
  const jobs = getStore('li-built-visualizer-jobs');

  try {
    await inputs.setJSON(jobId, { ...body, jobId, createdAt: new Date().toISOString() });
    await jobs.setJSON(jobId, {
      status: 'queued',
      stage: 'queued',
      percent: 3,
      updatedAt: new Date().toISOString()
    });

    const workerUrl = new URL('/api/visualize-worker', request.url);
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    });

    if (!workerResponse.ok && workerResponse.status !== 202) {
      const detail = await workerResponse.text().catch(() => '');
      await jobs.setJSON(jobId, {
        status: 'error',
        error: `The background visualizer worker could not start (${workerResponse.status}). ${detail}`.trim(),
        updatedAt: new Date().toISOString()
      });
      return respond({ error: `The background visualizer worker could not start (${workerResponse.status}).` }, 502);
    }

    return respond({ ok: true, jobId, status: 'queued' }, 202);
  } catch (error) {
    console.error('Visualizer start error', error);
    return respond({
      error: error?.message || 'The visualizer job could not be started.'
    }, 500);
  }
};

export const config = {
  path: '/api/visualize-start',
  method: ['POST', 'OPTIONS']
};
