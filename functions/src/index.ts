import * as functions from "firebase-functions";
import {defineString} from "firebase-functions/params";
import * as admin from "firebase-admin";
import {RecaptchaEnterpriseServiceClient} from "@google-cloud/recaptcha-enterprise";
import * as crypto from "crypto";

admin.initializeApp();

const client = new RecaptchaEnterpriseServiceClient();
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
const RECAPTCHA_SITE_KEY = defineString("RECAPTCHA_SITE_KEY");

// Risk score threshold — block anything below this
const RISK_THRESHOLD = 0.5;

interface AssessmentRequest {
  token: string;
  action: string;
  userAgent?: string;
}

/** SHA256 hash for Account Defender — Google requires a stable hashed account ID */
function hashAccountId(uid: string): string {
  return crypto.createHash("sha256").update(uid).digest("hex");
}

/**
 * Creates a reCAPTCHA Enterprise assessment with Account Defender enabled.
 * Called from the client before auth actions (login, signup).
 * Returns risk score + account defender verdict.
 */
export const createRecaptchaAssessment = functions.https.onCall(
  async (request: functions.https.CallableRequest<AssessmentRequest>) => {
    const {token, action} = request.data;

    if (!token || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing token or action"
      );
    }

    const siteKey = RECAPTCHA_SITE_KEY.value();
    if (!siteKey) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "reCAPTCHA site key not configured"
      );
    }

    // Use SHA256 of the user's UID as the hashed account ID for Account Defender
    const hashedAccountId = request.auth?.uid
      ? hashAccountId(request.auth.uid)
      : undefined;

    // Get client IP for horizontal telemetry
    const userIpAddress = request.rawRequest?.ip || "";

    try {
      const [assessment] = await client.createAssessment({
        parent: `projects/${PROJECT_ID}`,
        assessment: {
          event: {
            token,
            siteKey: siteKey,
            expectedAction: action,
            userAgent: request.data.userAgent || "",
            userIpAddress,
            hashedAccountId,
          },
        },
      });

      const riskScore = assessment.riskAnalysis?.score ?? 0;
      const reasons = assessment.riskAnalysis?.reasons ?? [];
      const tokenValid = assessment.tokenProperties?.valid ?? false;
      const tokenAction = assessment.tokenProperties?.action ?? "";

      // Account Defender verdict
      const accountDefender = assessment.accountDefenderAssessment;
      const accountLabels = accountDefender?.labels ?? [];

      // Log for monitoring
      functions.logger.info("reCAPTCHA Assessment", {
        action,
        riskScore,
        tokenValid,
        tokenAction,
        reasons,
        accountLabels,
        uid: request.auth?.uid,
        assessmentName: assessment.name,
      });

      // Check validity
      if (!tokenValid) {
        return {
          allowed: false,
          reason: "invalid_token",
          score: 0,
        };
      }

      // Check action matches
      if (tokenAction !== action) {
        return {
          allowed: false,
          reason: "action_mismatch",
          score: riskScore,
        };
      }

      // Check risk score
      if (riskScore < RISK_THRESHOLD) {
        return {
          allowed: false,
          reason: "low_score",
          score: riskScore,
          accountLabels,
        };
      }

      // Check Account Defender labels for suspicious activity
      const blockLabels = [
        "SUSPICIOUS_LOGIN_ACTIVITY",
        "SUSPICIOUS_ACCOUNT_CREATION",
        "RELATED_ACCOUNTS_NUMBER_HIGH",
      ];
      const hasBlockLabel = accountLabels.some((label) =>
        blockLabels.includes(String(label))
      );

      if (hasBlockLabel) {
        return {
          allowed: false,
          reason: "account_defender_block",
          score: riskScore,
          accountLabels,
        };
      }

      return {
        allowed: true,
        score: riskScore,
        accountLabels,
        assessmentName: assessment.name,
      };
    } catch (error) {
      functions.logger.error("reCAPTCHA assessment failed", error);
      throw new functions.https.HttpsError(
        "internal",
        "Assessment failed"
      );
    }
  }
);

/**
 * Annotates a previous assessment with the outcome.
 * Call after login succeeds or fails so Account Defender learns.
 * Also supports account modification annotations (step 3).
 */
export const annotateAssessment = functions.https.onCall(
  async (request: functions.https.CallableRequest<{
    assessmentName: string;
    annotation: "LEGITIMATE" | "FRAUDULENT" | "PASSWORD_CORRECT" | "PASSWORD_INCORRECT";
    reasons?: string[];
    accountId?: string;
  }>) => {
    const {assessmentName, annotation} = request.data;

    if (!assessmentName || !annotation) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing assessmentName or annotation"
      );
    }

    // Only authenticated users can annotate
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated"
      );
    }

    try {
      await client.annotateAssessment({
        name: assessmentName,
        annotation: (annotation as "LEGITIMATE" | "FRAUDULENT" | "PASSWORD_CORRECT" | "PASSWORD_INCORRECT") || "LEGITIMATE",
        reasons: request.data.reasons?.map((r) => r as unknown as number) || [],
        hashedAccountId: request.auth.uid
          ? hashAccountId(request.auth.uid) : undefined,
      });

      functions.logger.info("Assessment annotated", {
        assessmentName,
        annotation,
        uid: request.auth.uid,
      });

      return {success: true};
    } catch (error) {
      functions.logger.error("Annotation failed", error);
      throw new functions.https.HttpsError("internal", "Annotation failed");
    }
  }
);

/**
 * Reports account modification actions to Account Defender (step 3).
 * Call after profile updates, role changes, or other account modifications.
 * Creates a new assessment for the action and immediately annotates it.
 */
export const reportAccountModification = functions.https.onCall(
  async (request: functions.https.CallableRequest<{
    token: string;
    action: string;
    userAgent?: string;
  }>) => {
    const {token, action} = request.data;

    if (!token || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing token or action"
      );
    }

    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated"
      );
    }

    const siteKey = RECAPTCHA_SITE_KEY.value();
    if (!siteKey) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "reCAPTCHA site key not configured"
      );
    }

    const userIpAddress = request.rawRequest?.ip || "";

    try {
      // Create assessment for the modification action
      const [assessment] = await client.createAssessment({
        parent: `projects/${PROJECT_ID}`,
        assessment: {
          event: {
            token,
            siteKey,
            expectedAction: action,
            userAgent: request.data.userAgent || "",
            userIpAddress,
            hashedAccountId: hashAccountId(request.auth.uid),
          },
        },
      });

      // Annotate the modification as legitimate (the user is authenticated)
      if (assessment.name) {
        await client.annotateAssessment({
          name: assessment.name,
          annotation: "LEGITIMATE",
          reasons: ["CORRECT_PASSWORD" as unknown as number],
          hashedAccountId: hashAccountId(request.auth.uid),
        });
      }

      functions.logger.info("Account modification reported", {
        action,
        uid: request.auth.uid,
        assessmentName: assessment.name,
        score: assessment.riskAnalysis?.score,
      });

      return {
        success: true,
        score: assessment.riskAnalysis?.score ?? 0,
        assessmentName: assessment.name,
      };
    } catch (error) {
      functions.logger.error("Account modification report failed", error);
      throw new functions.https.HttpsError("internal", "Report failed");
    }
  }
);
