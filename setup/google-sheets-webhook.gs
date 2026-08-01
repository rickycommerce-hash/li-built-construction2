const SHEET_NAME = 'Transformation Leads';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const lead = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Lead tracker tab not found.');

    sheet.appendRow([
      lead.submittedAt ? new Date(lead.submittedAt) : new Date(),
      lead.status || 'New',
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.zip || '',
      lead.space || '',
      lead.style || '',
      lead.size || '',
      lead.finish || '',
      Number(lead.areaSqFt) || '',
      Array.isArray(lead.features) ? lead.features.join(' · ') : '',
      lead.vision || '',
      lead.preserveLayout ? 'Yes' : 'No',
      lead.photorealistic ? 'Yes' : 'No',
      Number(lead.quoteTotal) || '',
      lead.estimatedTimeline || '',
      lead.quoteValidUntil ? new Date(lead.quoteValidUntil) : '',
      lead.source || 'Website Transformation Tool',
      lead.jobId || '',
      ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
