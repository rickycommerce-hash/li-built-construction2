import { getStore } from '@netlify/blobs';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const respond = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);

export default async request => {
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return respond({ error: 'Please review the project details and try again.' }, 400);
  }

  const lead = {
    submittedAt: text(body.submittedAt, 40) || new Date().toISOString(),
    status: 'New',
    name: text(body.name, 80),
    email: text(body.email, 120),
    phone: text(body.phone, 30),
    zip: text(body.zip, 10),
    space: text(body.space, 80),
    style: text(body.style, 80),
    size: text(body.size, 40),
    finish: text(body.finish, 40),
    areaSqFt: Math.max(0, Number(body.areaSqFt) || 0),
    features: Array.isArray(body.features) ? body.features.map(item => text(item, 100)).slice(0, 30) : [],
    vision: text(body.vision, 1200),
    preserveLayout: Boolean(body.preserveLayout),
    photorealistic: Boolean(body.photorealistic),
    quoteTotal: Math.max(0, Number(body.quoteTotal) || 0),
    estimatedTimeline: text(body.estimatedTimeline, 60),
    quoteValidUntil: text(body.quoteValidUntil, 40),
    consent: Boolean(body.consent),
    source: 'Website Transformation Tool',
    jobId: text(body.jobId, 100)
  };

  if (!lead.name || !/^\S+@\S+\.\S+$/.test(lead.email) || !lead.phone || !/^\d{5}$/.test(lead.zip)) {
    return respond({ error: 'Please provide your name, email, phone number and five-digit ZIP code.' }, 400);
  }

  const leadKey = `${Date.now()}-${lead.jobId || crypto.randomUUID()}`;
  try {
    await getStore('arg-transformation-leads').setJSON(leadKey, lead);
  } catch (error) {
    console.error('Lead backup storage error', error);
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const sheetResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
        redirect: 'follow'
      });
      if (!sheetResponse.ok) console.error('Lead sheet response', sheetResponse.status);
    } catch (error) {
      console.error('Lead sheet delivery error', error);
    }
  }

  return respond({ ok: true }, 202);
};

export const config = { path: '/api/transformation-lead', method: 'POST' };
