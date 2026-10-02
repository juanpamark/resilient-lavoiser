import { describe, it, expect, beforeEach } from 'vitest';
import {
  SlidingWindowRateLimiter,
  TokenQuotaManager,
  AuditLogger,
} from '../security/index.js';

describe('SlidingWindowRateLimiter', () => {
  let rateLimiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    rateLimiter = new SlidingWindowRateLimiter();
  });

  it('allows requests within limit', () => {
    const res1 = rateLimiter.limit('user_123', 5, 1000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(4);

    const res2 = rateLimiter.limit('user_123', 5, 1000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it('blocks requests exceeding maximum allowance', () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.limit('client_burst', 5, 10000);
    }

    const blocked = rateLimiter.limit('client_burst', 5, 10000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInMs).toBeGreaterThan(0);
  });

  it('enforces WhatsApp sender limit of 20 req/min', () => {
    const phone = '+5215512345678';
    for (let i = 0; i < 20; i++) {
      const res = rateLimiter.checkWhatsAppSenderLimit(phone);
      expect(res.allowed).toBe(true);
    }

    const blocked = rateLimiter.checkWhatsAppSenderLimit(phone);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

describe('TokenQuotaManager', () => {
  let quotaManager: TokenQuotaManager;
  const businessId = 'test-biz-uuid';

  beforeEach(() => {
    quotaManager = new TokenQuotaManager();
  });

  it('reports normal status below 80% usage', () => {
    // Growth limit is 1,000,000. 500k is 50%
    const res = quotaManager.checkQuota(businessId, 500_000, 'growth');
    expect(res.allowed).toBe(true);
    expect(res.status).toBe('normal');
    expect(res.usagePercent).toBe(50);
    expect(res.remainingTokens).toBe(500_000);
  });

  it('issues preventive warning at 80% usage threshold', () => {
    // 850,000 / 1,000,000 = 85%
    const res = quotaManager.checkQuota(businessId, 850_000, 'growth');
    expect(res.allowed).toBe(true);
    expect(res.status).toBe('warning_80');
    expect(res.usagePercent).toBe(85);
    expect(res.actionRequired).toBeDefined();
  });

  it('enforces 100% hard cutoff when token limit is exhausted', () => {
    const res = quotaManager.checkQuota(businessId, 1_000_001, 'growth');
    expect(res.allowed).toBe(false);
    expect(res.status).toBe('exhausted_100');
    expect(res.remainingTokens).toBe(0);
    expect(res.actionRequired).toContain('pausada');
  });

  it('supports custom business budgets', () => {
    quotaManager.setCustomBudget(businessId, 250_000);
    const res = quotaManager.checkQuota(businessId, 260_000, 'enterprise');
    expect(res.allowed).toBe(false);
    expect(res.status).toBe('exhausted_100');
    expect(res.monthlyLimit).toBe(250_000);
  });
});

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  it('records audit events and retrieves by business ID', () => {
    logger.log({
      businessId: 'biz_01',
      action: 'PROMPT_INJECTION_BLOCKED',
      resourceType: 'conversation',
      severity: 'critical',
      details: { attack: 'DAN override' },
    });

    logger.log({
      businessId: 'biz_02',
      action: 'RATE_LIMIT_EXCEEDED',
      resourceType: 'sender',
      severity: 'warning',
      details: { ip: '1.2.3.4' },
    });

    const biz01Logs = logger.getLogsByBusiness('biz_01');
    expect(biz01Logs).toHaveLength(1);
    expect(biz01Logs[0]?.action).toBe('PROMPT_INJECTION_BLOCKED');
    expect(biz01Logs[0]?.severity).toBe('critical');

    const all = logger.getAllLogs();
    expect(all).toHaveLength(2);
  });
});
