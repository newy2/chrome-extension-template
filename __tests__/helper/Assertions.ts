import * as assert from "assert";
// import { expect } from "vitest";

export function assertEquals(
  expected: unknown,
  actual: unknown,
  message?: string | Error,
) {
  // expect(actual, message?.toString()).toBe(expected)
  assert.equal(actual, expected, message);
}

export function assertDeepEquals(
  expected: unknown,
  actual: unknown,
  message?: string | Error,
) {
  assert.deepEqual(actual, expected, message);
}

export function assertTrue(value: unknown, message?: string | Error) {
  assert.ok(value, message);
}

export function assertFalse(value: unknown, message?: string | Error) {
  assert.ok(!value, message);
}

export function assertThrows(block: () => unknown, message?: string | Error) {
  assert.throws(block, message);
}