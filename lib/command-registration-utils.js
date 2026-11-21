export function getCommandRegistrationScopes() {
  // Publish one application-wide command set. A guild-scoped set with the same names
  // appears beside the global commands in Discord's slash-command picker.
  return ['global'];
}

export function getGuildCommandCleanupIds(guildIds = []) {
  if (!Array.isArray(guildIds)) return [];
  return [...new Set(guildIds.filter(id => typeof id === 'string' && /^\d{17,20}$/.test(id)))];
}
