import { createHmac, timingSafeEqual } from 'node:crypto';

export class WhatsAppSignatureValidator {
  /**
   * Verifies the cryptographic HMAC SHA-256 signature sent by Meta in the 'X-Hub-Signature-256' header.
   *
   * @param rawBody - The raw string/buffer of the incoming HTTP request body.
   * @param signatureHeader - The value of the 'X-Hub-Signature-256' header (e.g. "sha256=abcdef...").
   * @param appSecret - The Meta App Secret configured for the webhook app.
   * @returns boolean - true if signature is valid, false otherwise.
   */
  static validateSignature(
    rawBody: string | Buffer,
    signatureHeader: string | null | undefined,
    appSecret: string
  ): boolean {
    if (!signatureHeader || !appSecret) {
      return false;
    }

    const parts = signatureHeader.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return false;
    }

    const signatureHex = parts[1];
    if (!signatureHex) {
      return false;
    }

    const hmac = createHmac('sha256', appSecret);
    hmac.update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody);
    const expectedHex = hmac.digest('hex');

    try {
      const signatureBuffer = Buffer.from(signatureHex, 'hex');
      const expectedBuffer = Buffer.from(expectedHex, 'hex');

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Generates a valid HMAC SHA-256 signature string for testing or outgoing verification.
   */
  static generateSignature(rawBody: string | Buffer, appSecret: string): string {
    const hmac = createHmac('sha256', appSecret);
    hmac.update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verifies Meta's initial Webhook Handshake (GET request verification).
   * Meta sends hub.mode, hub.verify_token, and hub.challenge.
   */
  static verifyHandshake(params: {
    mode?: string | null;
    verifyToken?: string | null;
    expectedToken: string;
    challenge?: string | null;
  }): { isValid: boolean; challenge?: string } {
    if (
      params.mode === 'subscribe' &&
      params.verifyToken &&
      params.verifyToken === params.expectedToken &&
      params.challenge
    ) {
      return {
        isValid: true,
        challenge: params.challenge,
      };
    }

    return {
      isValid: false,
    };
  }
}
