export interface ChannelConnectionInfo {
  id: string;
  businessId: string;
  channelType: 'whatsapp';
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  billingType: 'client_direct_meta' | 'agency_consolidated';
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface TenantChannelRouter {
  resolveByPhoneNumberId(phoneNumberId: string): Promise<ChannelConnectionInfo | null>;
}

/**
 * In-memory router for testing, emulation, and local mocking
 */
export class InMemoryTenantChannelRouter implements TenantChannelRouter {
  private connections: Map<string, ChannelConnectionInfo> = new Map();

  registerConnection(connection: ChannelConnectionInfo): void {
    this.connections.set(connection.phoneNumberId, connection);
  }

  async resolveByPhoneNumberId(phoneNumberId: string): Promise<ChannelConnectionInfo | null> {
    const conn = this.connections.get(phoneNumberId);
    if (!conn || !conn.isActive) {
      return null;
    }
    return conn;
  }
}
