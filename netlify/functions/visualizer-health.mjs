export default async () => new Response(JSON.stringify({
  ok: true,
  functions: true,
  openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
}), {
  status: 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export const config = { path: '/api/visualizer-health' };
