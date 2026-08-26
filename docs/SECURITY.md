# Security & Threat Model

## 1. Authentication & Tenant Isolation
- **Firebase Auth:** Multi-provider authentication (Email/Password & Google OAuth).
- **Rule Isolation:** Granular Firestore and Cloud Storage Security Rules enforce `request.auth.uid == userId`. No user can access or mutate another user's transactions.

## 2. Input Sanitization & Arithmetic Sandboxing
- **Math Expression Engine:** `evaluateMathExpression()` strictly whitelists safe arithmetic characters `[0-9+\-*/().%\s]` and rejects arbitrary JavaScript execution.
- **Statement Ingestion:** File size is capped to 10MB; mime-types are restricted to `application/pdf` and `text/csv`.

## 3. API Key & Reverse Proxy Architecture
- **NVIDIA AI Key Protection:** API calls are routed via Vite server proxy (`/api/nvidia`) with environment variable encapsulation to prevent client-side credential leakage.
- **Zero Known Vulnerabilities:** Strict dependency audits via `npm audit`.

