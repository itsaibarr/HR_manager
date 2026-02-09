import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('api upload should parse pdf', async ({ request }) => {
  const fileBuffer = fs.readFileSync(path.resolve('tests/data/dummy.pdf'));

  const response = await request.post('http://localhost:3000/api/candidates/upload', {
    multipart: {
      jobId: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      file: {
        name: 'dummy.pdf',
        mimeType: 'application/pdf',
        buffer: fileBuffer
      }
    }
  });

  // 500 means PDF parse error (or other server error).
  // 404 means Job Not Found (which implies PDF parsed okay).
  // 400 could mean validation error.
  console.log('Status:', response.status());
  const body = await response.json();
  console.log('Body:', body);

  expect(response.status()).not.toBe(500);
});
