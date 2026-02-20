import test from "node:test";
import assert from "node:assert/strict";
import { resolvePrivateKey } from "../src/auth";

test("resolvePrivateKey decodes a base64 PEM", () => {
  const pem = "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n";
  const encoded = Buffer.from(pem, "utf8").toString("base64");

  assert.equal(resolvePrivateKey(encoded), pem);
});

test("resolvePrivateKey throws on invalid value", () => {
  assert.throws(
    () => resolvePrivateKey("not-valid-base64"),
    /KALSHI_PRIVATE_KEY_BASE64 must be a valid base64-encoded PEM private key/
  );
});
