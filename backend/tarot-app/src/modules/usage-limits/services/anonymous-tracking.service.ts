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
    const fingerprint = this.generateFingerprint(ip, userAgent);

    // Get start of today in UTC
    // All dates are normalized to UTC 00:00:00 for consistency across timezones
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateString = today.toISOString().split('T')[0];

    // Check if fingerprint already accessed today
    const existingUsage = await this.anonymousUsageRepository.findOne({
      where: {
        fingerprint,
        date: dateString,
        feature: UsageFeature.TAROT_READING,
      },
    });

    return !existingUsage; // Can access if no existing usage found
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
