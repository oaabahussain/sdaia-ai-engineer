import test from 'node:test';
import assert from 'node:assert/strict';
import { stableJson, sha256Text } from '../scripts/process/stable_json.js';

test('stableJson emits deterministic schema-ordered UTF-8 JSON text', () => {
  const value = {
    z: 9,
    a: {
      c: 3,
      a: 1,
      b: 2
    },
    m: ['b', 'a']
  };
  const order = {
    '/': ['a', 'm'],
    '/a': ['b', 'a']
  };
  const expected = [
    '{',
    '  "a": {',
    '    "b": 2,',
    '    "a": 1,',
    '    "c": 3',
    '  },',
    '  "m": [',
    '    "b",',
    '    "a"',
    '  ],',
    '  "z": 9',
    '}',
    ''
  ].join('\n');
  const first = stableJson(value, order);
  const second = stableJson(JSON.parse(JSON.stringify(value)), order);
  assert.equal(first, expected);
  assert.equal(second, expected);
  assert.equal(first.endsWith('\n'), true);
  assert.equal(first.endsWith('\n\n'), false);
  assert.equal(first.includes('\r'), false);
});

test('stableJson sorts unlisted object keys lexically and preserves arrays', () => {
  assert.equal(
    stableJson({ d: 4, b: 2, c: 3, a: 1 }),
    '{\n  "a": 1,\n  "b": 2,\n  "c": 3,\n  "d": 4\n}\n'
  );
  assert.equal(stableJson([3, 1, 2]), '[\n  3,\n  1,\n  2\n]\n');
});

test('sha256Text returns lowercase 64-hex SHA-256', () => {
  assert.equal(
    sha256Text('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
  assert.match(sha256Text(''), /^[0-9a-f]{64}$/);
});
