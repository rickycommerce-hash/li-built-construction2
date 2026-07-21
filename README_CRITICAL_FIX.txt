LI BUILT AI VISUALIZER — ROUTING + BACKGROUND PAYLOAD FIX

This package fixes:
1. 404 when starting the background visualizer.
2. 404 while polling visualizer status.
3. Netlify's 256 KB background-function request limit.
4. The private/internal npm registry lock-file problem.
5. Browser caching of the old visualizer JavaScript.

DEPLOYMENT
- Upload all files in this folder to the root of the GitHub repository.
- Replace existing files when GitHub asks.
- package-lock.json should NOT exist.
- .npmrc must exist and use https://registry.npmjs.org/
- In Netlify, keep Publish directory = . and Functions directory = netlify/functions.
- Add OPENAI_API_KEY in Netlify environment variables.
- Recommended: OPENAI_IMAGE_MODEL=gpt-image-2
- Run: Clear cache and deploy site.

The new flow uses a normal start function to store the uploaded image in Netlify Blobs. It then invokes a background worker using only a small job ID. The browser polls /api/visualize-status until the result is ready.
