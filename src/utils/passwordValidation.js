export function validatePassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[\W_]/.test(password),
  }
}

export function isPasswordValid(criteria) {
  return Object.values(criteria).every(Boolean)
}
