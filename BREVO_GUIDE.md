# BREVO EMAIL AUTOMATION GUIDE

## 1. Setup Brevo
1. Sign up at [brevo.com](https://www.brevo.com)
2. Get your **API Key** from Settings -> SMTP & API
3. Add it to your AI Studio Secrets as `BREVO_API_KEY`

## 2. Create a Welcome Template
1. Go to **Transactional** -> **Templates**
2. Create a new template named "GuardLink Welcome"
3. Use the Drag & Drop editor to add GuardLink branding (Army Black/Gold)
4. Use placeholders like `{{ params.FIRSTNAME }}`

## 3. Automated Workflow
1. Go to **Automation** -> **Workflows**
2. Create a workflow triggered by "A contact is added to a list"
3. Add steps:
   - **Send Email:** Select your Welcome Template
   - **Wait:** 3 days
   - **Send Email:** Follow-up #1 (Benefits Highlight)
   - **Wait:** 4 days
   - **Send Email:** Follow-up #2 (ASVAB Tips)

## 4. Integration
To automatically add leads to Brevo, you can update the Google Apps Script to also call the Brevo API, or use a tool like Zapier to connect Google Sheets to Brevo.
