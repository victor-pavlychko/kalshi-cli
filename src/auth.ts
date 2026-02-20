export function resolvePrivateKey(privateKeyBase64?: string): string | undefined {
  if (!privateKeyBase64) {
    return undefined;
  }

  const normalized = privateKeyBase64.replace(/\s+/g, "");
  const decoded = Buffer.from(normalized, "base64").toString("utf8");
  const isValidBase64 = Buffer.from(decoded, "utf8").toString("base64") === normalized;

  if (!isValidBase64 || !decoded.includes("BEGIN") || !decoded.includes("PRIVATE KEY")) {
    throw new Error("KALSHI_PRIVATE_KEY_BASE64 must be a valid base64-encoded PEM private key");
  }

  return decoded;
}
