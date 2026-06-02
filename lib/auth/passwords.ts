import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Bcrypt hashes always start with $2a$, $2b$, or $2y$.
 * SHA-256 hex hashes are 64 characters with no $ prefix.
 */
function isBcryptHash(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
}

/**
 * Hash a password using bcrypt with a random salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a stored hash.
 * Supports both bcrypt (new) and legacy SHA-256 hex hashes.
 * On successful legacy verification, the hash is NOT auto-upgraded
 * — the user's next password change will use bcrypt.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }

  // Legacy SHA-216 hex hash fallback (64 hex chars)
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "event-planner-salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const computed = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return computed === storedHash;
  } catch {
    return false;
  }
}
