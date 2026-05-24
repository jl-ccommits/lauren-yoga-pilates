import assert from 'node:assert/strict';
import test from 'node:test';
import { getBrand, resolveBrand } from '../www/js/brand.js';

test('private build uses Lauren Landman monogram', () => {
  assert.deepEqual(getBrand(), {
    monogram: 'LL',
    ownerName: 'Lauren Landman',
    ariaLabel: "Lauren Landman's class planner",
  });
});

test('brand falls back to Namast when a personal logo is not configured', () => {
  assert.deepEqual(resolveBrand({}), {
    monogram: 'N',
    ownerName: 'Namast',
    ariaLabel: 'Namast class planner',
  });
});
