import { Injectable, Logger } from '@nestjs/common';

/**
 * Interface for tracking IP violations
 */
interface ViolationRecord {
  count: number;
  firstViolation: Date;
  lastViolation: Date;
}

/**
 * Interface for tracking blocked IPs
 */
interface BlockRecord {
  blockedAt: Date;
  blockedUntil: Date;
  reason: string;
}

/**
 * Service to track rate limit violations and temporarily block IPs
 */
@Injectable()
export class IPBlockingService {
  private readonly logger = new Logger(IPBlockingService.name);
  private readonly violations = new Map<string, ViolationRecord>();
  private readonly blockedIPs = new Map<string, BlockRecord>();
  private readonly VIOLATION_THRESHOLD = 10;
  private readonly VIOLATION_WINDOW_MS = 3600000; // 1 hour

  /**
   * Record a rate limit violation for an IP
   * @param ip IP address
   */
  recordViolation(ip: string): void {
    const existing = this.violations.get(ip);
    const now = new Date();

    if (existing) {
      // Reset count if outside violation window
      const timeSinceLastViolation =
        now.getTime() - existing.lastViolation.getTime();
      if (timeSinceLastViolation > this.VIOLATION_WINDOW_MS) {
        this.violations.set(ip, {
          count: 1,
          firstViolation: now,
          lastViolation: now,
        });
      } else {
        this.violations.set(ip, {
          count: existing.count + 1,
          firstViolation: existing.firstViolation,
          lastViolation: now,
        });
      }
    } else {
      this.violations.set(ip, {
        count: 1,
        firstViolation: now,
        lastViolation: now,
      });
    }

    const violations = this.violations.get(ip);
    if (violations && violations.count >= this.VIOLATION_THRESHOLD) {
      this.blockIP(ip, 3600); // Block for 1 hour after reaching threshold
      this.logger.warn(`IP ${ip} blocked after ${violations.count} violations`);
    } else {
      this.logger.debug(
        `IP ${ip} violation recorded (${violations?.count}/${this.VIOLATION_THRESHOLD})`,
      );
    }
  }

  /**
   * Check if an IP is currently blocked
   * @param ip IP address
   * @returns true if IP is blocked
   */
  isBlocked(ip: string): boolean {
    const block = this.blockedIPs.get(ip);
    if (!block) return false;

    // Check if block has expired
    if (new Date() > block.blockedUntil) {
      this.unblockIP(ip);
      return false;
    }

    return true;
  }

  /**
   * Manually block an IP for a specified duration
   * @param ip IP address
   * @param durationSeconds Duration in seconds
   * @param reason Optional reason for blocking
   */
  blockIP(
    ip: string,
    durationSeconds: number,
    reason = 'Rate limit exceeded',
  ): void {
    const now = new Date();
    const blockedUntil = new Date(Date.now() + durationSeconds * 1000);
    this.blockedIPs.set(ip, { blockedAt: now, blockedUntil, reason });
    this.logger.warn(
      `IP ${ip} blocked until ${blockedUntil.toISOString()} - ${reason}`,
    );
  }

  /**
   * Unblock an IP and reset its violation count
   * @param ip IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.violations.delete(ip);
    this.logger.log(`IP ${ip} unblocked`);
  }

  /**
   * Get violation count for an IP
   * @param ip IP address
   * @returns Number of violations
   */
  getViolations(ip: string): number {
    const record = this.violations.get(ip);
    if (!record) return 0;

    // Return 0 if outside violation window
    const timeSinceLastViolation = Date.now() - record.lastViolation.getTime();
    if (timeSinceLastViolation > this.VIOLATION_WINDOW_MS) {
      return 0;
    }

    return record.count;
  }

  /**
   * Get all IPs with violations
   * @returns Array of violations with details
   */
  getAllViolations(): Array<{
    ip: string;
    count: number;
    firstViolation: Date;
    lastViolation: Date;
  }> {
    const result: Array<{
      ip: string;
      count: number;
      firstViolation: Date;
      lastViolation: Date;
    }> = [];
    const now = Date.now();

    for (const [ip, record] of this.violations.entries()) {
      // Only include violations within the window
      const timeSinceLastViolation = now - record.lastViolation.getTime();
      if (timeSinceLastViolation <= this.VIOLATION_WINDOW_MS) {
        result.push({
          ip,
          count: record.count,
          firstViolation: record.firstViolation,
          lastViolation: record.lastViolation,
        });
      }
    }

    return result;
  }

  /**
   * Get all currently blocked IPs
   * @returns Array of blocked IPs with details
   */
  getBlockedIPs(): Array<{
    ip: string;
    reason: string;
    blockedAt: Date;
    expiresAt: Date;
  }> {
    const now = new Date();
    const blocked: Array<{
      ip: string;
      reason: string;
      blockedAt: Date;
      expiresAt: Date;
    }> = [];

    for (const [ip, block] of this.blockedIPs.entries()) {
      if (now <= block.blockedUntil) {
        blocked.push({
          ip,
          reason: block.reason,
          blockedAt: block.blockedAt,
          expiresAt: block.blockedUntil,
        });
      }
    }

    return blocked;
  }

  /**
   * Clear all violations and blocks (for testing)
   */
  clearAll(): void {
    this.violations.clear();
    this.blockedIPs.clear();
    this.logger.debug('All violations and blocks cleared');
  }
}
