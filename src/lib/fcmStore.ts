// In-Memory Token Store for mapping user identifiers (e.g. phone, username, role) to FCM device tokens
const globalTokenMap = new Map<string, Set<string>>();

export function registerUserFcmToken(userIdentifier: string, token: string) {
  if (!userIdentifier || !token) return;
  const cleanUser = String(userIdentifier).trim().toLowerCase();
  
  if (!globalTokenMap.has(cleanUser)) {
    globalTokenMap.set(cleanUser, new Set());
  }

  globalTokenMap.get(cleanUser)?.add(token);
  console.log(`[FCM Store] Registered token for user [${cleanUser}]. Total tokens for user:`, globalTokenMap.get(cleanUser)?.size);
}

export function getUserFcmTokens(userIdentifier: string): string[] {
  if (!userIdentifier) return [];
  const cleanUser = String(userIdentifier).trim().toLowerCase();
  const tokensSet = globalTokenMap.get(cleanUser);
  if (!tokensSet) return [];
  return Array.from(tokensSet);
}

export function getAllFcmTokens(): string[] {
  const allTokens = new Set<string>();
  globalTokenMap.forEach((tokens) => {
    tokens.forEach((t) => allTokens.add(t));
  });
  return Array.from(allTokens);
}
