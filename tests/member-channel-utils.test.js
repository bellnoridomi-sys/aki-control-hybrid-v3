import test from 'node:test';
import assert from 'node:assert/strict';
import { isMemberMessageChannel, normalizeMemberChannelSelection } from '../lib/member-channel-utils.js';

const welcome = '123456789012345678';
const goodbye = '234567890123456789';

test('keeps an omitted member channel unchanged', () => {
  assert.deepEqual(normalizeMemberChannelSelection({}), {});
});

test('normalizes both configured member channels', () => {
  assert.deepEqual(normalizeMemberChannelSelection({
    welcome_channel_id: '  ' + welcome + ' ',
    goodbye_channel_id: goodbye
  }), {
    welcome_channel_id: welcome,
    goodbye_channel_id: goodbye
  });
});

test('empty channel selection explicitly disables that event message', () => {
  assert.deepEqual(normalizeMemberChannelSelection({
    welcome_channel_id: '',
    goodbye_channel_id: null
  }), {
    welcome_channel_id: null,
    goodbye_channel_id: null
  });
});

test('rejects malformed channel IDs instead of storing them', () => {
  assert.throws(() => normalizeMemberChannelSelection({ welcome_channel_id: 'not-a-channel' }), /ID kênh chào mừng không hợp lệ/);
  assert.throws(() => normalizeMemberChannelSelection({ goodbye_channel_id: '12345' }), /ID kênh tạm biệt không hợp lệ/);
});

test('accepts only text and announcement channels from the selected guild', () => {
  const guild = { id: 'guild-1' };
  assert.equal(isMemberMessageChannel({ guild, type: 0 }, guild.id), true);
  assert.equal(isMemberMessageChannel({ guild, type: 5 }, guild.id), true);
  assert.equal(isMemberMessageChannel({ guild, type: 2 }, guild.id), false);
  assert.equal(isMemberMessageChannel({ guild: { id: 'guild-2' }, type: 0 }, guild.id), false);
  assert.equal(isMemberMessageChannel(null, guild.id), false);
});
