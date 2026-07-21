import { getStore } from '@netlify/blobs';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

const respond = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async (request) => {
  if (request.method === 'OPTIONS') return respond({ ok: true });
  if (request.method !== 'GET') return respond({ error: 'Method not allowed.' }, 405);

  const url = new URL(request.url);
  const jobId = String(url.searchParams.get('jobId') || '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 100);

  if (!jobId) return respond({ error: 'Missing job ID.' }, 400);

  try {
    const store = getStore('li-built-visualizer-jobs');
    const job = await store.get(jobId, { type: 'json', consistency: 'strong' });
    return respond(job || { status: 'queued', stage: 'queued', percent: 3 });
  } catch (error) {
    console.error('Visualizer status error', error);
    return respond({
      error: 'The AI backend is unavailable. Confirm this site was deployed through Netlify Git or the Netlify CLI so Functions were built and published.',
      code: 'BACKEND_UNAVAILABLE'
    }, 503);
  }
};

export const config = {
  path: '/api/visualize-status',
  method: ['GET', 'OPTIONS']
};
