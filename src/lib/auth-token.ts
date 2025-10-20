import crypto from 'crypto'

/**
 * Gera um token aleatório seguro para autenticação
 * Formato: base64url de 32 bytes de dados aleatórios
 * Exemplo: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
 */
export function generateAuthToken(): string {
  const randomBytes = crypto.randomBytes(32)
  const token = randomBytes.toString('base64url')
  return token
}

/**
 * Valida um token (básico - só verifica formato)
 */
export function isValidToken(token: string): boolean {
  return !!(token && token.length >= 40)
}

/**
 * Extrai informações do token (pode ser expandido)
 */
export function getTokenInfo(token: string) {
  return {
    length: token.length,
    isValid: isValidToken(token),
  }
}
