import fs from "fs";
import path from "path";

const TMP_FILE = path.join("/tmp", "newlab_fcm_tokens.json");

// In-Memory Token Store for mapping user identifiers (e.g. phone, username, role) to FCM device tokens
const globalTokenMap = new Map<string, Set<string>>();

function loadFromDisk() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      const data: Record<string, string[]> = JSON.parse(raw);
      Object.entries(data).forEach(([user, tokens]) => {
        if (!globalTokenMap.has(user)) globalTokenMap.set(user, new Set());
        tokens.forEach(t => globalTokenMap.get(user)?.add(t));
      });
    }
  } catch {}
}

function saveToDisk() {
  try {
    const data: Record<string, string[]> = {};
    globalTokenMap.forEach((tokens, user) => {
      data[user] = Array.from(tokens);
    });
    fs.writeFileSync(TMP_FILE, JSON.stringify(data), "utf-8");
  } catch {}
}

// Initial load
loadFromDisk();

export function registerUserFcmToken(userIdentifier: string, token: string) {
  if (!userIdentifier || !token) return;
  loadFromDisk();

  const cleanUser = String(userIdentifier).trim().toLowerCase();
  
  if (!globalTokenMap.has(cleanUser)) {
    globalTokenMap.set(cleanUser, new Set());
  }

  globalTokenMap.get(cleanUser)?.add(token);
  saveToDisk();

  console.log(`[FCM Store] Registered token for user [${cleanUser}]. Total tokens for user:`, globalTokenMap.get(cleanUser)?.size);
}

export function getUserFcmTokens(userIdentifier: string): string[] {
  if (!userIdentifier) return [];
  loadFromDisk();

  const cleanUser = String(userIdentifier).trim().toLowerCase();
  const tokensSet = globalTokenMap.get(cleanUser);
  if (!tokensSet) return [];
  return Array.from(tokensSet);
}

export function getAllFcmTokens(): string[] {
  loadFromDisk();
  const allTokens = new Set<string>();
  globalTokenMap.forEach((tokens) => {
    tokens.forEach((t) => allTokens.add(t));
  });
  return Array.from(allTokens);
}
