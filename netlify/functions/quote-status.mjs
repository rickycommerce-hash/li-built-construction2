import { getStore } from '@netlify/blobs';

const cleanJobId = value => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

export default async request => {
  const url = new URL(request.url);
  const jobId = cleanJobId(url.searchParams.get('jobId'));
  if (!jobId) return Response.json({ error: 'A quote job ID is required.' }, { status: 400 });

  const jobs = getStore('arg-quote-jobs');
  const job = await jobs.get(jobId, { type: 'json', consistency: 'strong' });
  if (!job) return Response.json({ status: 'working', stage: 'queued', percent: 5 }, { headers: { 'Cache-Control': 'no-store' } });
  return Response.json(job, { headers: { 'Cache-Control': 'no-store' } });
};

export const config = { path: '/api/quote-status', method: 'GET' };
