import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY || '';

let scriptLoaded = false;

/** Load the reCAPTCHA Enterprise script once */
function loadRecaptchaScript(): Promise<void> {
  if (scriptLoaded || window.grecaptcha?.enterprise) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(script);
  });
}

interface AssessmentResult {
  allowed: boolean;
  score: number;
  reason?: string;
  accountLabels?: string[];
  assessmentName?: string;
}

/**
 * Run a reCAPTCHA Enterprise assessment with Account Defender.
 * Call before login/signup. Returns whether the action is allowed.
 */
export async function verifyRecaptcha(action: string): Promise<AssessmentResult> {
  if (!SITE_KEY) {
    // reCAPTCHA not configured — allow through (dev mode)
    console.warn('reCAPTCHA: no site key configured, skipping assessment');
    return { allowed: true, score: 1 };
  }

  try {
    await loadRecaptchaScript();

    const token = await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.enterprise.ready(async () => {
        try {
          const t = await window.grecaptcha!.enterprise.execute(SITE_KEY, { action });
          resolve(t);
        } catch (e) {
          reject(e);
        }
      });
    });

    const functions = getFunctions(getApp());
    const createAssessment = httpsCallable<
      { token: string; action: string; userAgent: string },
      AssessmentResult
    >(functions, 'createRecaptchaAssessment');

    const result = await createAssessment({
      token,
      action,
      userAgent: navigator.userAgent,
    });

    return result.data;
  } catch (error) {
    console.error('reCAPTCHA assessment error:', error);
    // Fail open in case of network issues — App Check still protects the backend
    return { allowed: true, score: 0 };
  }
}

/**
 * Annotate a previous assessment as legitimate or fraudulent.
 * Helps Account Defender learn patterns over time.
 */
export async function annotateLogin(assessmentName: string, legitimate: boolean): Promise<void> {
  if (!assessmentName) return;

  try {
    const functions = getFunctions(getApp());
    const annotate = httpsCallable(functions, 'annotateAssessment');
    await annotate({
      assessmentName,
      legitimateOrFraudulent: legitimate ? 'LEGITIMATE' : 'FRAUDULENT',
    });
  } catch (error) {
    // Non-critical — just log
    console.error('Assessment annotation failed:', error);
  }
}
