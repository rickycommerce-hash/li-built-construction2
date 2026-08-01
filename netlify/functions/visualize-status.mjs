import { getStore } from '@netlify/blobs';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const respond = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

export default async (request) => {
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
      error: 'The design studio is temporarily unavailable. Please call or text 631-579-3122 for assistance.',
      code: 'BACKEND_UNAVAILABLE'
    }, 503);
  }
};

export const config = {
  path: '/api/visualize-status',
  method: 'GET'
};
