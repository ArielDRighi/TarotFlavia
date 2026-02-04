import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import { UsageFeature } from '../entities/usage-limit.entity';
import { Request } from 'express';
import { getTodayUTCDateString } from '../../../common/utils/date.utils';

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
    return this.canAccessByIpAndUserAgent(
      ip,
      userAgent,
      UsageFeature.DAILY_CARD,
    );
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
    const todayStr = getTodayUTCDateString();

    // Check if fingerprint already accessed today for this feature
    const existingUsage = await this.anonymousUsageRepository.findOne({
      where: {
        fingerprint,
        date: todayStr,
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
    const todayStr = getTodayUTCDateString();

    // Count usage for this fingerprint today
    const count = await this.anonymousUsageRepository.count({
      where: {
        fingerprint,
        date: todayStr,
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
    const todayStr = getTodayUTCDateString();

    const anonymousUsage = this.anonymousUsageRepository.create({
      fingerprint,
      ip,
      date: todayStr,
      feature: UsageFeature.TAROT_READING,
    });

    return await this.anonymousUsageRepository.save(anonymousUsage);
  }

  /**
   * Checks if an anonymous user can access a feature with lifetime limit (no date restriction)
   * Used for features like PENDULUM_QUERY for anonymous users (1 total, not daily)
   * @param fingerprint - User fingerprint (SHA-256 hash)
   * @param feature - The feature to check
   * @returns true if user has never used the feature, false otherwise
   */
  async canAccessLifetime(
    fingerprint: string,
    feature: UsageFeature,
  ): Promise<boolean> {
    // Check if fingerprint has ever accessed this feature (no date filter)
    const existingUsage = await this.anonymousUsageRepository.findOne({
      where: {
        fingerprint,
        feature,
      },
    });

    return !existingUsage; // Can access if no existing usage found
  }

  /**
   * Records lifetime usage for an anonymous user (uses fixed date 1970-01-01)
   * @param fingerprint - User fingerprint (SHA-256 hash)
   * @param ip - IP address
   * @param feature - The feature being used
   * @returns The created AnonymousUsage record
   */
  async recordLifetimeUsage(
    fingerprint: string,
    ip: string,
    feature: UsageFeature,
  ): Promise<AnonymousUsage> {
    const usage = this.anonymousUsageRepository.create({
      fingerprint,
      ip,
      feature,
      date: '1970-01-01', // Fixed date for lifetime tracking
    });

    return await this.anonymousUsageRepository.save(usage);
  }
}
