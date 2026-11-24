import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ZodIssue } from 'zod';
import { POST } from './route';

const convert = (body: unknown) =>
  POST(
    new Request('http://localhost/api/exchange-rates/convert', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );

test('invalid input is rejected with 400 and per-field details', async () => {
  const response = await convert({ amount: 'ten', fromCurrency: 'USD', toCurrency: 'XXX' });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Invalid input');
  assert.ok(Array.isArray(payload.details), `expected a list of issues, got ${JSON.stringify(payload.details)}`);
  assert.deepEqual(
    payload.details.map((issue: ZodIssue) => issue.path),
    [['amount'], ['toCurrency']]
  );
});
