import { getStore } from '@netlify/blobs';

const MAX_IMAGE_DATA_LENGTH = 8_500_000;
const clean = (value, max = 1200) => String(value || '').trim().slice(0, max);

function friendlyOpenAIError(status, data) {
  const raw = data?.error?.message || data?.message || 'OpenAI could not generate this concept.';
  const code = data?.error?.code || data?.error?.type || '';
  if (status === 401) return 'The OpenAI API key is invalid or was not saved correctly in Netlify.';
  if (status === 403) return 'This OpenAI account does not currently have access to the image model. Organization verification may be required.';
  if (status === 429) {
    if (/quota|billing|credit/i.test(raw)) return 'The OpenAI API account has no available billing credit or quota.';
    return 'The OpenAI API account is temporarily rate-limited. Please try again shortly.';
  }
  if (status === 400 && /model/i.test(raw)) return `The selected OpenAI image model is unavailable. ${raw}`;
  if (status === 400 && /image|format|file|url/i.test(raw)) return `OpenAI could not use the uploaded image. ${raw}`;
  if (status >= 500) return 'OpenAI had a temporary image-generation problem. Please try again.';
  return code ? `${raw} (${code})` : raw;
}

export default async (request) => {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return;
  }

  const jobId = clean(body.jobId, 100).replace(/[^a-zA-Z0-9_-]/g, '');
  if (!jobId) return;

  const store = getStore('li-built-visualizer-jobs');
  const save = async (value) => store.setJSON(jobId, {
    ...value,
    updatedAt: new Date().toISOString()
  });

  await save({ status: 'working', stage: 'preparing', percent: 8 });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('The AI visualizer is not connected. Add OPENAI_API_KEY in Netlify environment variables and redeploy.');

    const imageDataUrl = String(body.imageDataUrl || '').trim();
    const space = clean(body.space, 80);
    const style = clean(body.style, 80);
    const vision = clean(body.vision, 1600);
    const features = Array.isArray(body.features)
      ? body.features.map(item => clean(item, 120)).filter(Boolean).slice(0, 12)
      : [];
    const preserveLayout = body.preserveLayout !== false;
    const photorealistic = body.photorealistic !== false;

    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageDataUrl)) throw new Error('Please upload a valid JPG, PNG, or WebP image.');
    if (imageDataUrl.length > MAX_IMAGE_DATA_LENGTH) throw new Error('The processed image is too large. Please use a smaller photo.');
    if (!space || !style || vision.length < 12) throw new Error('Please choose the space and style and describe the renovation you want.');

    const prompt = [
      `Create a photorealistic renovation edit of the uploaded ${space.toLowerCase()} photograph.`,
      `DESIGN STYLE: ${style}.`,
      features.length ? `REQUESTED FEATURES: ${features.join('; ')}.` : '',
      `HOMEOWNER VISION: ${vision}`,
      preserveLayout
        ? 'PRESERVATION: Keep the exact camera viewpoint and preserve recognizable room proportions, window and door positions, ceiling geometry, and structural layout unless the homeowner explicitly asks to change them.'
        : 'LAYOUT: Thoughtfully reconfigure the space where requested while keeping the original property and viewpoint recognizable.',
      photorealistic
        ? 'REALISM: The result must look like a professionally photographed, completed construction project with believable materials, lighting, scale, joinery, and craftsmanship.'
        : 'PRESENTATION: Create a polished architectural renovation concept.',
      'OUTPUT: Return one finished after image only. Do not include text, labels, people, watermarks, logos, borders, mood boards, or split-screen comparisons.',
      'The design should feel aspirational but practical and buildable for an elite Long Island residential contractor.'
    ].filter(Boolean).join('\n');

    await save({ status: 'working', stage: 'analyzing', percent: 24 });

    const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
    const payload = {
      model,
      images: [{ image_url: imageDataUrl }],
      prompt,
      n: 1,
      size: process.env.OPENAI_IMAGE_SIZE || '1536x1024',
      quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
      output_format: 'jpeg',
      output_compression: 82,
      moderation: 'auto',
      input_fidelity: 'high'
    };

    await save({ status: 'working', stage: 'rendering', percent: 55 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12 * 60 * 1000);
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));

    const requestId = response.headers.get('x-request-id') || '';
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = friendlyOpenAIError(response.status, data);
      console.error('OpenAI visualizer error', { status: response.status, requestId, error: data?.error || data });
      await save({ status: 'error', error, requestId });
      return;
    }

    await save({ status: 'working', stage: 'finalizing', percent: 92 });
    const base64 = data?.data?.[0]?.b64_json;
    if (!base64) {
      await save({ status: 'error', error: 'OpenAI completed the request but returned no image.', requestId });
      return;
    }

    await save({
      status: 'complete',
      percent: 100,
      imageDataUrl: `data:image/jpeg;base64,${base64}`,
      requestId
    });
  } catch (error) {
    console.error('Background visualizer error', error);
    await save({
      status: 'error',
      error: error?.name === 'AbortError'
        ? 'The image generation took too long. Please try a smaller image or lower quality.'
        : (error?.message || 'The concept generator could not complete the request.')
    });
  }
};

export const config = {
  background: true,
  path: '/api/visualize-start'
};
