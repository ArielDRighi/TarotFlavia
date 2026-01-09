import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import { UsageFeature } from '../entities/usage-limit.entity';
import { Request } from 'express';

@Injectable()
export class AnonymousTrackingService {
  constructor(
    @InjectRepository(AnonymousUsage)
    private anonymousUsageRepository: Repository<AnonymousUsage>,
  ) {}

  /**
   * Generates a SHA-256 fingerprint from IP and User Agent
   * @param ip - IP address of the user
   * @param userAgent - User agent string from browser
   * @returns SHA-256 hash as hex string (64 characters)
   */
  generateFingerprint(ip: string, userAgent: string): string {
    const data = `${ip}|${userAgent}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Checks if an anonymous user can access the daily card feature
   * @param req - Express request object
   * @returns true if user can access, false if limit reached
   */
  async canAccess(req: Request): Promise<boolean> {
    const ip = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.canAccessByIpAndUserAgent(ip, userAgent, UsageFeature.DAILY_CARD);
  }

  /**
   * Checks if an anonymous user can access a specific feature by IP and User-Agent
   * @param ip - IP address
   * @param userAgent - User-Agent header
   * @param feature - The feature to check
   * @returns true if user can access, false if limit reached
   */
  async canAccessByIpAndUserAgent(
    ip: string,
    userAgent: string,
    feature: UsageFeature,
  ): Promise<boolean> {
    const fingerprint = this.generateFingerprint(ip, userAgent);

    // Get start of today in UTC
    // All dates are normalized to UTC 00:00:00 for consistency across timezones
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];

    // Check if fingerprint already accessed today for this feature
    const existingUsage = await this.anonymousUsageRepository.findOne({
      where: {
        fingerprint,
        date: dateString,
        feature,
      },
    });

    return !existingUsage; // Can access if no existing usage found
  }

  /**
   * Gets the usage count for an anonymous user for a specific feature today
   * @param ip - IP address
   * @param userAgent - User-Agent header
   * @param feature - The feature to check
   * @returns Number of times the feature was used today (0 or 1 for daily limits)
   */
  async getUsageByIpAndUserAgent(
    ip: string,
    userAgent: string,
    feature: UsageFeature,
  ): Promise<number> {
    const fingerprint = this.generateFingerprint(ip, userAgent);

    // Get start of today in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];

    // Count usage for this fingerprint today
    const count = await this.anonymousUsageRepository.count({
      where: {
        fingerprint,
        date: dateString,
        feature,
      },
    });

    return count;
  }

  /**
   * Records usage for an anonymous user
   * @param req - Express request object
   * @returns The created AnonymousUsage record
   */
  async recordUsage(req: Request): Promise<AnonymousUsage> {
    const ip = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    const fingerprint = this.generateFingerprint(ip, userAgent);

    // Get start of today in UTC
    // All dates are normalized to UTC 00:00:00 for consistency across timezones
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];

    const anonymousUsage = this.anonymousUsageRepository.create({
      fingerprint,
      ip,
      date: dateString,
      feature: UsageFeature.TAROT_READING,
    });

    return await this.anonymousUsageRepository.save(anonymousUsage);
  }
}
