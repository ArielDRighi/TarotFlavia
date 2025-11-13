import { Injectable, Logger } from '@nestjs/common';

/**
 * Service to manage IP whitelist for rate limiting
 */
@Injectable()
export class IPWhitelistService {
  private readonly logger = new Logger(IPWhitelistService.name);
  private readonly whitelist = new Set<string>();

  constructor() {
    // Add default whitelisted IPs from environment
    const envWhitelist = process.env.IP_WHITELIST || '';
    if (envWhitelist) {
      const ips = envWhitelist.split(',').map((ip) => ip.trim());
      ips.forEach((ip) => {
        if (ip) {
          this.whitelist.add(ip);
          this.logger.log(`Added ${ip} to whitelist from environment`);
        }
      });
    }

    // Always whitelist localhost/loopback
    this.whitelist.add('127.0.0.1');
    this.whitelist.add('::1');
    this.whitelist.add('::ffff:127.0.0.1');
  }

  /**
   * Check if an IP is whitelisted
   * @param ip IP address
   * @returns true if IP is whitelisted
   */
  isWhitelisted(ip: string): boolean {
    return this.whitelist.has(ip);
  }

  /**
   * Add an IP to the whitelist
   * @param ip IP address
   */
  addIP(ip: string): void {
    this.whitelist.add(ip);
    this.logger.log(`Added ${ip} to whitelist`);
  }

  /**
   * Remove an IP from the whitelist
   * @param ip IP address
   */
  removeIP(ip: string): void {
    this.whitelist.delete(ip);
    this.logger.log(`Removed ${ip} from whitelist`);
  }

  /**
   * Get all whitelisted IPs
   * @returns Array of whitelisted IPs
   */
  getWhitelistedIPs(): string[] {
    return Array.from(this.whitelist);
  }

  /**
   * Clear all IPs from whitelist (except defaults)
   */
  clearAll(): void {
    this.whitelist.clear();
    // Re-add defaults
    this.whitelist.add('127.0.0.1');
    this.whitelist.add('::1');
    this.whitelist.add('::ffff:127.0.0.1');
    this.logger.debug('Whitelist cleared (except defaults)');
  }
}
