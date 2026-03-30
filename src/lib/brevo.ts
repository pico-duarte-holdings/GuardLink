/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

// ─── Brevo (formerly Sendinblue) REST API v3 client ───────────────────────────
// Docs: https://developers.brevo.com/reference/

const BREVO_API_BASE = 'https://api.brevo.com/v3';

function getApiKey(): string {
  return (import.meta.env.VITE_BREVO_API_KEY as string) || '';
}

async function brevoFetch<T = unknown>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: object
): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'Brevo API key not configured. Add VITE_BREVO_API_KEY to your .env file.'
    );
  }

  const response = await fetch(`${BREVO_API_BASE}${path}`, {
    method,
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `Brevo API error ${response.status}`;
    try {
      const errBody = await response.json();
      errorMessage += `: ${errBody.message || JSON.stringify(errBody)}`;
    } catch {
      errorMessage += `: ${await response.text()}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  return response.json() as Promise<T>;
}

// ─── Transactional Email ──────────────────────────────────────────────────────

export interface EmailRecipient {
  email: string;
  name?: string;
}

export async function sendTransactionalEmail(params: {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  senderName?: string;
  senderEmail?: string;
  replyTo?: string;
  templateId?: number;
  templateParams?: Record<string, string>;
}): Promise<{ messageId: string }> {
  return brevoFetch<{ messageId: string }>('/smtp/email', 'POST', {
    sender: {
      name: params.senderName || 'GuardLink Recruiting',
      email: params.senderEmail || 'noreply@guardlink.app',
    },
    to: params.to,
    subject: params.subject,
    htmlContent: params.htmlContent,
    ...(params.replyTo ? { replyTo: { email: params.replyTo } } : {}),
    ...(params.templateId ? { templateId: params.templateId } : {}),
    ...(params.templateParams ? { params: params.templateParams } : {}),
  });
}

// ─── Transactional SMS ────────────────────────────────────────────────────────

export async function sendSMS(params: {
  to: string; // E.164 format, e.g. +15551234567
  content: string;
  sender?: string; // max 11 alphanumeric chars
}): Promise<unknown> {
  return brevoFetch('/transactionalSMS/sms', 'POST', {
    sender: (params.sender || 'GuardLink').substring(0, 11),
    recipient: params.to,
    content: params.content,
    type: 'transactional',
  });
}

// ─── Contacts & Lists ─────────────────────────────────────────────────────────

export async function addOrUpdateContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  listIds?: number[];
  attributes?: Record<string, string | number | boolean>;
}): Promise<unknown> {
  return brevoFetch('/contacts', 'POST', {
    email: params.email,
    listIds: params.listIds || [],
    updateEnabled: true,
    attributes: {
      FIRSTNAME: params.firstName || '',
      LASTNAME: params.lastName || '',
      SMS: params.phone ? normalizePhoneE164(params.phone) : '',
      ...params.attributes,
    },
  });
}

export async function getContactLists(): Promise<{
  lists: Array<{ id: number; name: string; totalSubscribers: number; folderId: number }>;
  count: number;
}> {
  return brevoFetch('/contacts/lists?limit=50&sort=desc', 'GET');
}

export async function addEmailsToList(listId: number, emails: string[]): Promise<unknown> {
  // Brevo limits to 150 emails per call – chunk if needed
  const chunks: string[][] = [];
  for (let i = 0; i < emails.length; i += 150) {
    chunks.push(emails.slice(i, i + 150));
  }
  const results = await Promise.allSettled(
    chunks.map((chunk) =>
      brevoFetch(`/contacts/lists/${listId}/contacts/add`, 'POST', { emails: chunk })
    )
  );
  return results;
}

// ─── Email Campaigns ──────────────────────────────────────────────────────────

export interface BrevoEmailCampaign {
  id: number;
  name: string;
  subject: string;
  status: 'draft' | 'sent' | 'archive' | 'queued' | 'suspended' | 'limited' | 'scheduled';
  type: string;
  createdAt: string;
  modifiedAt: string;
  scheduledAt?: string;
  sentDate?: string;
  statistics?: {
    globalStats?: {
      delivered: number;
      opens: number;
      uniqueOpens: number;
      clickers: number;
      uniqueClicks: number;
      bounces: number;
      unsubscribed: number;
    };
  };
}

export async function getEmailCampaigns(params?: {
  status?: string;
  limit?: number;
}): Promise<{ campaigns: BrevoEmailCampaign[]; count: number }> {
  const qs = new URLSearchParams({
    limit: String(params?.limit ?? 50),
    sort: 'desc',
    ...(params?.status ? { status: params.status } : {}),
  });
  return brevoFetch(`/emailCampaigns?${qs}`, 'GET');
}

export async function createEmailCampaign(params: {
  name: string;
  subject: string;
  htmlContent: string;
  senderName: string;
  senderEmail: string;
  listIds: number[];
  replyTo?: string;
  scheduledAt?: string;
}): Promise<{ id: number }> {
  return brevoFetch<{ id: number }>('/emailCampaigns', 'POST', {
    name: params.name,
    subject: params.subject,
    sender: { name: params.senderName, email: params.senderEmail },
    type: 'classic',
    htmlContent: params.htmlContent,
    recipients: { listIds: params.listIds },
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    ...(params.scheduledAt ? { scheduledAt: params.scheduledAt } : {}),
  });
}

export async function sendEmailCampaignNow(campaignId: number): Promise<null> {
  return brevoFetch<null>(`/emailCampaigns/${campaignId}/sendNow`, 'POST');
}

// ─── SMS Campaigns ────────────────────────────────────────────────────────────

export interface BrevoSMSCampaign {
  id: number;
  name: string;
  status: 'draft' | 'sent' | 'archive' | 'queued' | 'suspended' | 'inProgress' | 'scheduled';
  content: string;
  sender: string;
  createdAt: string;
  modifiedAt: string;
  scheduledAt?: string;
  statistics?: {
    delivered?: number;
    sent?: number;
    softBounces?: number;
    hardBounces?: number;
    unsubscribed?: number;
    answered?: number;
  };
}

export async function getSMSCampaigns(params?: {
  status?: string;
  limit?: number;
}): Promise<{ campaigns: BrevoSMSCampaign[]; count: number }> {
  const qs = new URLSearchParams({
    limit: String(params?.limit ?? 50),
    sort: 'desc',
    ...(params?.status ? { status: params.status } : {}),
  });
  return brevoFetch(`/smsCampaigns?${qs}`, 'GET');
}

export async function createSMSCampaign(params: {
  name: string;
  sender: string;
  content: string;
  listIds: number[];
  scheduledAt?: string;
}): Promise<{ id: number }> {
  return brevoFetch<{ id: number }>('/smsCampaigns', 'POST', {
    name: params.name,
    sender: params.sender.substring(0, 11),
    content: params.content,
    recipients: { listIds: params.listIds },
    ...(params.scheduledAt ? { scheduledAt: params.scheduledAt } : {}),
  });
}

export async function sendSMSCampaignNow(campaignId: number): Promise<null> {
  return brevoFetch<null>(`/smsCampaigns/${campaignId}/sendNow`, 'POST');
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Normalise a US phone number to E.164 format required by Brevo SMS.
 * Examples: "3055551234" → "+13055551234"
 *           "13055551234" → "+13055551234"
 *           "+13055551234" → "+13055551234"
 */
export function normalizePhoneE164(phone: string, countryCode = '+1'): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return phone;
  if (digits.length === 10) return `${countryCode}${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `${countryCode}${digits}`;
}

/** Simple email templates kept here so components stay lean. */
export const emailTemplates = {
  playerWelcome: (name: string, recruiterName: string): string => {
    const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : name;
    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#030000;font-family:Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px;background:#030000;">
    <tr><td style="text-align:center;padding:24px 0;background:#030000;">
      <img src="https://gen-lang-client-0786963463.web.app/logo-email.png" alt="GuardLink" width="160" height="160" style="display:block;margin:0 auto;" />
    </td></tr>
    <tr><td style="background:#111;border:1px solid rgba(255,213,48,0.2);padding:32px;">
      <h2 style="color:#FFD530;font-size:20px;text-transform:uppercase;margin:0 0 16px;">Welcome to Your Player Portal, ${displayName}!</h2>
      <p style="color:#ccc;line-height:1.6;margin:0 0 16px;">Your recruiting coordinator <strong style="color:#FFD530;">${recruiterName}</strong> has granted you access to the GuardLink Player Portal.</p>
      <p style="color:#ccc;line-height:1.6;margin:0 0 24px;">Log in to complete your intake form, upload required documents, and track your enlistment progress.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://guardlink.app" style="display:inline-block;background:#FFD530;color:#030000;padding:14px 32px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;text-decoration:none;font-size:13px;">Access Your Portal →</a>
      </div>
      <p style="color:#666;font-size:11px;line-height:1.6;margin:24px 0 0;">Questions? Reply to this email or contact ${recruiterName} directly. This is an automated message from GuardLink.</p>
    </td></tr>
    <tr><td style="background:#030000;padding:16px;text-align:center;">
      <p style="color:#444;font-size:10px;margin:0;">To unsubscribe from recruiting messages, reply with STOP to <a href="mailto:support@guardlink.site" style="color:#FFD530;">support@guardlink.site</a>.</p>
    </td></tr>
  </table>
</body>
</html>`;
  },

  intakeConfirmation: (name: string, recruiterName: string): string => {
    const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : name;
    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#030000;font-family:Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px;background:#030000;">
    <tr><td style="text-align:center;padding:24px 0;background:#030000;">
      <img src="https://gen-lang-client-0786963463.web.app/logo-email.png" alt="GuardLink" width="160" height="160" style="display:block;margin:0 auto;" />
    </td></tr>
    <tr><td style="background:#111;border:1px solid rgba(255,213,48,0.2);padding:32px;">
      <h2 style="color:#FFD530;font-size:20px;text-transform:uppercase;margin:0 0 16px;">✓ Intake Form Received</h2>
      <p style="color:#ccc;line-height:1.6;margin:0 0 16px;">Thank you, <strong style="color:#FFD530;">${displayName}</strong>! Your intake application has been successfully submitted.</p>
      <p style="color:#ccc;line-height:1.6;margin:0 0 16px;">Your recruiter <strong style="color:#FFD530;">${recruiterName}</strong> will review your file and reach out to schedule your next steps.</p>
      <div style="background:#0a0a0a;border-left:3px solid #FFD530;padding:16px;margin:24px 0;">
        <p style="color:#FFD530;font-size:11px;font-weight:bold;text-transform:uppercase;margin:0 0 8px;">Next Steps</p>
        <ul style="color:#ccc;margin:0;padding-left:20px;line-height:2;">
          <li>Upload any remaining documents in your portal</li>
          <li>Await a call/email from your recruiter to schedule ASVAB</li>
          <li>Keep your phone and email accessible</li>
        </ul>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://guardlink.app" style="display:inline-block;background:#FFD530;color:#030000;padding:14px 32px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;text-decoration:none;font-size:13px;">View Your Portal →</a>
      </div>
    </td></tr>
    <tr><td style="background:#030000;padding:16px;text-align:center;">
      <p style="color:#444;font-size:10px;margin:0;">To unsubscribe from recruiting messages, reply with STOP to <a href="mailto:support@guardlink.site" style="color:#FFD530;">support@guardlink.site</a>.</p>
    </td></tr>
  </table>
</body>
</html>`;
  },

  massEmailBlast: (bodyHtml: string, recruiterName: string, _recruiterEmail: string): string => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#030000;font-family:Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px;background:#030000;">
    <tr><td style="text-align:center;padding:24px 0;background:#030000;">
      <img src="https://gen-lang-client-0786963463.web.app/logo-email.png" alt="GuardLink" width="160" height="160" style="display:block;margin:0 auto;" />
    </td></tr>
    <tr><td style="background:#111;border:1px solid rgba(255,213,48,0.2);padding:32px;">
      ${bodyHtml}
    </td></tr>
    <tr><td style="background:#030000;padding:16px;text-align:center;">
      <p style="color:#444;font-size:10px;margin:0;">Message sent by <strong style="color:#666;">${recruiterName}</strong> via GuardLink Recruiting Platform. To unsubscribe from recruiting messages, reply with STOP to <a href="mailto:support@guardlink.site" style="color:#FFD530;">support@guardlink.site</a>.</p>
    </td></tr>
  </table>
</body>
</html>`,
};
