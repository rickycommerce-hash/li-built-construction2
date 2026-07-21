This release replaces the original synchronous image request with a background-job workflow.

Files used:
- netlify/functions/visualize-space-background.background.mjs
- netlify/functions/visualize-status.mjs
- @netlify/blobs dependency
- assets/js/visualizer.js

Deploy as a new Netlify deployment and confirm OPENAI_API_KEY is set before testing.
