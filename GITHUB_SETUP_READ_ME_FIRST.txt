LI BUILT — GITHUB / NETLIFY DEPLOYMENT

IMPORTANT:
1. Delete every file currently in the GitHub repository before uploading this corrected package.
2. Upload the CONTENTS of this unzipped folder to the repository root.
3. There should be NO _redirects file in the repository.
4. netlify.toml must be visible at the repository root.
5. The netlify/functions folder must contain:
   - visualize-space-background.mjs
   - visualize-status.mjs
   - visualizer-health.mjs
6. In Netlify, connect this GitHub repository and deploy.
7. Add OPENAI_API_KEY in Netlify Environment Variables.
8. Trigger a fresh deploy after saving the key.

Netlify automatically installs dependencies from package.json/package-lock.json.
