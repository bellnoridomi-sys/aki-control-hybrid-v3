import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLegacyBuilderChannelName,
  getLegacyBuilderChannelNames,
  getLegacyBuilderCategoryName,
  getServerBuilderGroups,
  getServerBuilderPreview,
  getTicketCategoryName
} from '../lib/server-builder-layout.js';

test('server builder has eight clean categories with only three or four channels each', () => {
  const groups = getServerBuilderGroups();
  assert.equal(groups.length, 8);
  for (const group of groups) {
    assert.ok(group.items.length >= 3 && group.items.length <= 4, group.key + ' should have 3–4 channels');
    assert.match(group.name, /・『.+』$/u);
    for (const [name] of group.items) assert.match(name, /・『.+』$/u);
  }
  assert.equal(groups.reduce((sum, group) => sum + group.items.length, 0), 29);
});

test('channel names are unique across the layout and the role/ticket panels have required homes', () => {
  const names = getServerBuilderGroups().flatMap(group => group.items.map(([name]) => name));
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes('🎭・『nhận-role』'));
  assert.ok(names.includes('🎫・『mở-ticket』'));
});

test('welcome topic can be supplied without changing other channel descriptions', () => {
  const groups = getServerBuilderGroups('Aki community');
  const welcome = groups.find(group => group.key === 'start').items.find(([name]) => name === '👋・『chào-mừng』');
  const rules = groups.find(group => group.key === 'start').items.find(([name]) => name === '📜・『nội-quy』');
  assert.equal(welcome[1], 'Aki community');
  assert.match(rules[1], /nội quy/u);
});

test('all migrated channel names have a legacy source and legacy-only channels remain identifiable for archiving', () => {
  const newNames = getServerBuilderGroups().flatMap(group => group.items.map(([name]) => name));
  for (const name of newNames) assert.ok(getLegacyBuilderChannelName(name), 'Missing legacy alias for ' + name);
  const legacy = getLegacyBuilderChannelNames();
  assert.ok(legacy.includes('📣・thông-báo'));
  assert.ok(legacy.includes('🔨・mod-actions'));
});

test('legacy categories and ticket category are mapped to the bracketed layout', () => {
  assert.equal(getLegacyBuilderCategoryName('community'), '💬・TRÒ CHUYỆN & GIAO LƯU');
  assert.equal(getTicketCategoryName(), '🎫・『TICKETS』');
  assert.deepEqual(getServerBuilderPreview()[0], [
    '📌・『BẮT ĐẦU』',
    '📜・『nội-quy』',
    '👋・『chào-mừng』',
    '✅・『xác-minh』',
    '🎭・『nhận-role』'
  ]);
});
