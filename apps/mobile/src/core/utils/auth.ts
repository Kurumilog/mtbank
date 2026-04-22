export function normalizeLogin(value: string) {
  return value.trim().toLowerCase();
}

export function loginToEmail(login: string) {
  return `${normalizeLogin(login)}@mtbank.app`;
}
