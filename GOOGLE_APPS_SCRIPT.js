/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
/**
 * GOOGLE APPS SCRIPT FOR LEAD CAPTURE
 * 
 * Instructions:
 * 1. Go to script.google.com
 * 2. Create a new project named "GuardLink Leads"
 * 3. Paste this code into the editor.
 * 4. Create a Google Sheet named "GuardLink Leads" with these headers in row 1:
 *    Timestamp, First Name, Last Name, Email, Phone, Age, Education, Interest, MOS, Source, Message
 * 5. In the script, replace 'YOUR_SHEET_ID' with the ID of your Google Sheet.
 * 6. Click "Deploy" -> "New Deployment".
 * 7. Select "Web App".
 * 8. Set "Execute as" to "Me".
 * 9. Set "Who has access" to "Anyone".
 * 10. Copy the Web App URL and paste it into your .env file as VITE_LEADS_SCRIPT_URL.
 */

/*
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.age,
      data.education,
      data.interest,
      data.mos || 'N/A',
      data.source || 'Website',
      data.message
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
