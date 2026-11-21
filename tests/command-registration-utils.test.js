import test from 'node:test';
import assert from 'node:assert/strict';
import { getCommandRegistrationScopes, getGuildCommandCleanupIds } from '../lib/command-registration-utils.js';

test('registers only one global command scope even when a development guild id is configured', () => {
  assert.deepEqual(getCommandRegistrationScopes(), ['global']);
  assert.deepEqual(getCommandRegistrationScopes('123456789012345678'), ['global']);
  assert.deepEqual(getCommandRegistrationScopes('invalid'), ['global']);
});

test('returns unique valid guild ids for cleaning stale guild-scoped commands', () => {
  assert.deepEqual(
    getGuildCommandCleanupIds([
      '123456789012345678',
      '123456789012345678',
      'invalid',
      null,
      '234567890123456789'
    ]),
    ['123456789012345678', '234567890123456789']
  );
  assert.deepEqual(getGuildCommandCleanupIds('not-an-array'), []);
});
