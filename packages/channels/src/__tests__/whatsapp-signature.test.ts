import { describe, it, expect } from 'vitest';
import { WhatsAppSignatureValidator } from '../whatsapp/signature-validator.js';

describe('WhatsAppSignatureValidator', () => {
  const appSecret = 'super_secret_meta_app_key_456';
  const payload = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ id: 'waba_123', changes: [] }],
  });

  it('validates a correct HMAC SHA-256 signature', () => {
    const validSignature = WhatsAppSignatureValidator.generateSignature(payload, appSecret);
    const isValid = WhatsAppSignatureValidator.validateSignature(payload, validSignature, appSecret);
    expect(isValid).toBe(true);
  });

  it('rejects an altered payload with the same signature', () => {
    const validSignature = WhatsAppSignatureValidator.generateSignature(payload, appSecret);
    const tamperedPayload = payload + ' ';
    const isValid = WhatsAppSignatureValidator.validateSignature(tamperedPayload, validSignature, appSecret);
    expect(isValid).toBe(false);
  });

  it('rejects if signature header has invalid format or missing sha256 prefix', () => {
    const isValid = WhatsAppSignatureValidator.validateSignature(payload, 'md5=abcdef123456', appSecret);
    expect(isValid).toBe(false);
  });

  it('rejects if header is null or secret is empty', () => {
    expect(WhatsAppSignatureValidator.validateSignature(payload, null, appSecret)).toBe(false);
    expect(WhatsAppSignatureValidator.validateSignature(payload, 'sha256=123', '')).toBe(false);
  });

  it('verifies Meta GET handshake correctly', () => {
    const result = WhatsAppSignatureValidator.verifyHandshake({
      mode: 'subscribe',
      verifyToken: 'expected_secret_123',
      expectedToken: 'expected_secret_123',
      challenge: 'challenge_code_98765',
    });

    expect(result.isValid).toBe(true);
    expect(result.challenge).toBe('challenge_code_98765');
  });

  it('rejects Meta GET handshake on wrong verify_token or mode', () => {
    const wrongTokenResult = WhatsAppSignatureValidator.verifyHandshake({
      mode: 'subscribe',
      verifyToken: 'wrong_secret',
      expectedToken: 'expected_secret_123',
      challenge: 'challenge_code_98765',
    });
    expect(wrongTokenResult.isValid).toBe(false);

    const wrongModeResult = WhatsAppSignatureValidator.verifyHandshake({
      mode: 'unsubscribe',
      verifyToken: 'expected_secret_123',
      expectedToken: 'expected_secret_123',
      challenge: 'challenge_code_98765',
    });
    expect(wrongModeResult.isValid).toBe(false);
  });
});
