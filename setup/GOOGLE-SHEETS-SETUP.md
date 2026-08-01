# Connect the ARG transformation lead tracker

1. Open the **ARG Transformation Tool Lead Tracker** Google Sheet.
2. Select **Extensions → Apps Script**.
3. Replace the starter code with the contents of `google-sheets-webhook.gs` and save.
4. Select **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then deploy.
6. Copy the generated `/exec` URL.
7. In Netlify, add an environment variable named `GOOGLE_SHEETS_WEBHOOK_URL` with that URL and redeploy the site.

The website stores a private backup of each completed transformation submission in Netlify Blobs even if the Google Sheet webhook is temporarily unavailable.
