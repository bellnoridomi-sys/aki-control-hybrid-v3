const MEMBER_CHANNEL_FIELDS = Object.freeze(['welcome_channel_id', 'goodbye_channel_id']);
const TEXT_CHANNEL_TYPES = new Set([0, 5]); // Discord GuildText and GuildAnnouncement

export function normalizeMemberChannelSelection(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Cấu hình kênh thành viên không hợp lệ.');
  }
  const patch = {};
  for (const field of MEMBER_CHANNEL_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) continue;
    const value = input[field] == null ? '' : String(input[field]).trim();
    if (!value) {
      patch[field] = null;
      continue;
    }
    if (!/^\d{17,20}$/.test(value)) {
      throw new TypeError(field === 'welcome_channel_id'
        ? 'ID kênh chào mừng không hợp lệ.'
        : 'ID kênh tạm biệt không hợp lệ.');
    }
    patch[field] = value;
  }
  return patch;
}

export function isMemberMessageChannel(channel, guildId) {
  return Boolean(
    channel &&
    channel.guild?.id === String(guildId) &&
    TEXT_CHANNEL_TYPES.has(Number(channel.type))
  );
}
