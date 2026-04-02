// Credential-based auth for BloodBank Pro
// Passwords can be changed via "Forgot Password" / generate new password

export type AuthRole = "admin" | "staff" | "donor" | "patient" | "hospital";

const AUTH_KEY = "authRole";
const AUTH_LOGGED_IN = "authLoggedIn";
const PASSWORDS_KEY = "bbp_passwords";

// Default credentials
const DEFAULT_CREDENTIALS: Record<
  AuthRole,
  { username: string; password: string }
> = {
  admin: { username: "admin", password: "admin123" },
  staff: { username: "staff", password: "staff123" },
  donor: { username: "donor", password: "donor123" },
  patient: { username: "patient", password: "patient123" },
  hospital: { username: "hospital", password: "hospital123" },
};

// Load persisted passwords (overrides defaults)
function loadPasswords(): Record<AuthRole, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (raw) return JSON.parse(raw) as Record<AuthRole, string>;
  } catch {
    /* ignore */
  }
  const defaults: Record<string, string> = {};
  for (const role of Object.keys(DEFAULT_CREDENTIALS) as AuthRole[]) {
    defaults[role] = DEFAULT_CREDENTIALS[role].password;
  }
  return defaults as Record<AuthRole, string>;
}

function savePasswords(passwords: Record<AuthRole, string>): void {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}

/** Get the current password for a role */
export function getPasswordForRole(role: AuthRole): string {
  return loadPasswords()[role] ?? DEFAULT_CREDENTIALS[role].password;
}

/** Get the username for a role */
export function getUsernameForRole(role: AuthRole): string {
  return DEFAULT_CREDENTIALS[role].username;
}

/** Generate a random strong password */
export function generatePassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!%&*";
  const all = upper + lower + digits + special;
  let pass = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  for (let i = pass.length; i < length; i++) {
    pass.push(all[Math.floor(Math.random() * all.length)]);
  }
  // Shuffle
  for (let i = pass.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pass[i], pass[j]] = [pass[j], pass[i]];
  }
  return pass.join("");
}

/** Reset a role's password to a newly generated one */
export function resetPassword(role: AuthRole): string {
  const newPass = generatePassword();
  const passwords = loadPasswords();
  passwords[role] = newPass;
  savePasswords(passwords);
  return newPass;
}

/** Validate credentials */
export function validateCredentials(
  role: AuthRole,
  username: string,
  password: string,
): boolean {
  const expectedUsername = DEFAULT_CREDENTIALS[role].username;
  const expectedPassword = getPasswordForRole(role);
  return expectedUsername === username.trim() && expectedPassword === password;
}

export function isAdminCredentials(
  username: string,
  password: string,
): boolean {
  return validateCredentials("admin", username, password);
}

/** Store auth role + mark as logged in (no IC needed) */
export function storeAuth(role: AuthRole): void {
  localStorage.setItem(AUTH_KEY, role);
  localStorage.setItem(AUTH_LOGGED_IN, "1");
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_LOGGED_IN);
  localStorage.removeItem("portalRole");
}

export function getStoredRole(): AuthRole | null {
  return (localStorage.getItem(AUTH_KEY) as AuthRole) ?? null;
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_LOGGED_IN) === "1" && !!getStoredRole();
}
