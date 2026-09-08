export const SHARED_ACTIVATION_SECRET = 'TT_PRO_ACTIVATION_SECRET_KEY_2026_QOL_UNLOCKED'

/**
 * Generates a self-verifying activation code using the Web Crypto API.
 * Format: base64(currentTimestamp + ":" + HMAC-SHA256(currentTimestamp, SHARED_SECRET))
 */
export async function generateActivationCode(
  secret: string = SHARED_ACTIVATION_SECRET
): Promise<string> {
  const timestamp = Date.now().toString()
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(timestamp)
  )

  const hashArray = Array.from(new Uint8Array(signatureBuffer))
  const signatureHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const payload = `${timestamp}:${signatureHex}`
  return btoa(payload)
}
