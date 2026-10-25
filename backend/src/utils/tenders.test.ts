import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canReleaseSession,
  mapOrderTender,
  pickUnbilledOrders,
  validateTenders,
} from './tenders';

describe('validateTenders', () => {
  it('accepts cash plus online that covers the total', () => {
    const result = validateTenders({
      cash: 60,
      online: 40,
      credit: 0,
      billTotal: 100,
    });
    assert.equal(result.paid, 100);
  });

  it('rejects underpayment', () => {
    assert.throws(
      () => validateTenders({ cash: 10, online: 0, credit: 0, billTotal: 50 }),
      /cover the bill total/,
    );
  });
});

describe('session billing helpers', () => {
  it('picks only unbilled non-cancelled tickets', () => {
    const unbilled = pickUnbilledOrders([
      { billed: true, status: 'in-progress' },
      { billed: false, status: 'pending' },
      { billed: false, status: 'cancelled' },
    ]);
    assert.equal(unbilled.length, 1);
    assert.equal(unbilled[0].status, 'pending');
  });

  it('allows release when every ticket is billed or cancelled', () => {
    assert.equal(
      canReleaseSession([
        { billed: true, status: 'in-progress' },
        { billed: false, status: 'cancelled' },
      ]),
      true,
    );
    assert.equal(
      canReleaseSession([{ billed: false, status: 'pending' }]),
      false,
    );
  });

  it('maps kitchen tenders onto Pos payment fields', () => {
    assert.deepEqual(mapOrderTender('card', 80), {
      paymentMethod: 'card',
      cash: 0,
      credit: 0,
      online: 80,
    });
    assert.equal(mapOrderTender('counter', 25).paymentMethod, 'cash');
  });
});
