export type AuditAction =
  | 'PROMPT_MODIFIED'
  | 'META_CREDENTIALS_UPDATED'
  | 'PRODUCT_PRICE_CHANGED'
  | 'PROMPT_INJECTION_BLOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TOKEN_QUOTA_EXCEEDED'
  | 'OPERATOR_ASSIGNED';

export type AuditSeverity = 'info' | 'warning' | 'high' | 'critical';

export interface AuditLogEntry {
  id: string;
  businessId: string;
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  severity: AuditSeverity;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];

  log(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.logs.push(fullEntry);
    return fullEntry;
  }

  getLogsByBusiness(businessId: string, limit = 50): AuditLogEntry[] {
    return this.logs
      .filter((l) => l.businessId === businessId)
      .slice(-limit)
      .reverse();
  }

  getAllLogs(limit = 100): AuditLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  clear(): void {
    this.logs = [];
  }
}
