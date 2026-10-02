export type SubscriptionPlan = 'trial' | 'growth' | 'pro' | 'enterprise';

export interface PlanTokenBudget {
  plan: SubscriptionPlan;
  monthlyTokenLimit: number;
}

export const DEFAULT_PLAN_BUDGETS: Record<SubscriptionPlan, number> = {
  trial: 100_000,       // 100K tokens (~$0.008 USD)
  growth: 1_000_000,    // 1M tokens (~$0.075 USD)
  pro: 5_000_000,       // 5M tokens (~$0.375 USD)
  enterprise: 50_000_000, // 50M tokens
};

export interface QuotaCheckResult {
  allowed: boolean;
  status: 'normal' | 'warning_80' | 'exhausted_100';
  currentTokens: number;
  monthlyLimit: number;
  usagePercent: number;
  remainingTokens: number;
  actionRequired?: string;
}

export class TokenQuotaManager {
  private customBudgets: Map<string, number> = new Map();

  setCustomBudget(businessId: string, tokenLimit: number): void {
    this.customBudgets.set(businessId, tokenLimit);
  }

  /**
   * Checks current tenant token usage against allocated budget
   *
   * @param businessId - Business identifier
   * @param currentMonthlyTokens - Total tokens consumed this calendar month
   * @param plan - Subscription plan level
   */
  checkQuota(
    businessId: string,
    currentMonthlyTokens: number,
    plan: SubscriptionPlan = 'growth'
  ): QuotaCheckResult {
    const limit = this.customBudgets.get(businessId) || DEFAULT_PLAN_BUDGETS[plan] || 1_000_000;
    const usagePercent = Math.min(100, Math.round((currentMonthlyTokens / limit) * 1000) / 10);
    const remainingTokens = Math.max(0, limit - currentMonthlyTokens);

    // 100% Hard Cutoff: AI bot generation is stopped to prevent uncontrolled debt
    if (currentMonthlyTokens >= limit) {
      return {
        allowed: false,
        status: 'exhausted_100',
        currentTokens: currentMonthlyTokens,
        monthlyLimit: limit,
        usagePercent,
        remainingTokens: 0,
        actionRequired:
          'Límite de tokens del plan agotado. La IA ha sido pausada y las consultas se transfieren a atención humana.',
      };
    }

    // 80% Preventive Warning: Notify business admin in dashboard
    if (usagePercent >= 80) {
      return {
        allowed: true,
        status: 'warning_80',
        currentTokens: currentMonthlyTokens,
        monthlyLimit: limit,
        usagePercent,
        remainingTokens,
        actionRequired:
          'Has alcanzado más del 80% de tu cuota mensual de tokens de IA. Considera ampliar tu plan.',
      };
    }

    return {
      allowed: true,
      status: 'normal',
      currentTokens: currentMonthlyTokens,
      monthlyLimit: limit,
      usagePercent,
      remainingTokens,
    };
  }
}
