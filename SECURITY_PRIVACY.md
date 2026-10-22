# Khoza Security & Privacy Architecture

## 1. Authentication & Role-Based Access Control (RBAC)
- **Token Verification:** Every privileged backend operation derives the user identity strictly from Firebase Authentication tokens (`context.auth.uid`). Client-supplied user IDs are never trusted.
- **Firestore Security Rules:** Private user collections (`users/{uid}/search_history` and `users/{uid}/bookmarks`) enforce `request.auth.uid == userId` rules.
- **Public vs Private Separation:** Reusable global search results are indexed into `search_cache` by deterministic hashes, with no private or identifiable user metadata stored in shared collections.

## 2. Prompt-Injection & Untrusted Data Defense
- Webpage content and third-party provider snippets are treated as untrusted text strings.
- System instructions explicitly direct the LLM model to treat retrieved content solely as data and ignore any meta-instructions contained inside external documents.
- Strict input length limit of 500 characters on queries prevents token exhaustion attacks.

## 3. Privacy & Zero-Broker Guarantee
- Khoza operates under India's Digital Personal Data Protection Act (DPDP) principles:
  - No behavioral cross-site tracking pixels.
  - Search history is strictly opt-in and can be deleted by the user with a single click.
  - IP addresses and query logs are anonymized.
