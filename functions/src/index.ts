import * as functions from "firebase-functions";
import {defineString} from "firebase-functions/params";
import * as admin from "firebase-admin";
import {RecaptchaEnterpriseServiceClient} from "@google-cloud/recaptcha-enterprise";

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

    // Use the authenticated user's UID as the hashed account ID for Account Defender
    const hashedAccountId = request.auth?.uid || undefined;

    try {
      const [assessment] = await client.createAssessment({
        parent: `projects/${PROJECT_ID}`,
        assessment: {
          event: {
            token,
            siteKey: siteKey,
            expectedAction: action,
            userAgent: request.data.userAgent || "",
            hashedAccountId: hashedAccountId ?
              Buffer.from(hashedAccountId).toString("base64") : undefined,
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
 */
export const annotateAssessment = functions.https.onCall(
  async (request: functions.https.CallableRequest<{
    assessmentName: string;
    legitimateOrFraudulent: "LEGITIMATE" | "FRAUDULENT";
  }>) => {
    const {assessmentName, legitimateOrFraudulent} = request.data;

    if (!assessmentName || !legitimateOrFraudulent) {
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
        annotation: legitimateOrFraudulent === "LEGITIMATE"
          ? "LEGITIMATE"
          : "FRAUDULENT",
        reasons: legitimateOrFraudulent === "FRAUDULENT"
          ? ["INITIATED_TWO_FACTOR" as unknown as number]
          : [],
      });

      functions.logger.info("Assessment annotated", {
        assessmentName,
        annotation: legitimateOrFraudulent,
        uid: request.auth.uid,
      });

      return {success: true};
    } catch (error) {
      functions.logger.error("Annotation failed", error);
      throw new functions.https.HttpsError("internal", "Annotation failed");
    }
  }
);
