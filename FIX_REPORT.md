# Fix Report

## 1. PDF Upload Fix (`src/app/api/candidates/upload/route.ts`)

- **Issue**: The code was using `new PDFParse(...)` which is incorrect because `pdf-parse` exports a function, not a class. This would cause runtime errors on PDF upload.
- **Fix**: Changed import to `import pdf from 'pdf-parse'` and usage to `const data = await pdf(buffer)`.
- **Status**: Updated.

## 2. Email API Logging (`src/app/api/email/send/route.ts`)

- **Issue**: Test candidates often have no email, resulting in a silent `400 Bad Request`.
- **Fix**: Added `console.warn` to log explicitly when a candidate is skipped due to missing email: `[Email API] Candidate X has no email`.
- **Status**: Updated.

You can now test these features.
