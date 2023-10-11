import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as base32Encode from 'hi-base32';

@Injectable()
export class LibService {
  /*Generate secret for opt*/

  private readonly dateModifiers: Record<
    string,
    (date: Date, value: number) => Date
  > = {
    MIN: this.addMinutes,
    HOURS: this.addHours,
    DAYS: this.addDays,
  };

  addMinutes(date: Date, minutesToAdd: number): Date {
    return new Date(date.getTime() + minutesToAdd * 60000);
  }

  addHours(date: Date, hoursToAdd: number): Date {
    return new Date(date.getTime() + hoursToAdd * 3600000);
  }

  addDays(date: Date, daysToAdd: number): Date {
    return new Date(date.getTime() + daysToAdd * 86400000);
  }

  getEndBanTime(unit: string, date: Date, value: number): Date {
    if (value === Number.MAX_SAFE_INTEGER)
      return new Date('9999-12-31T23:59:59.999Z');

    const modifier = this.dateModifiers[unit];
    return modifier(date, value);
  }

  generateRandomSecretInBase32(): string {
    const buffer = crypto.randomBytes(20);
    const truncatedBase32 = base32Encode
      .encode(buffer)
      .replace(/=/g, '')
      .substring(0, 24);

    return truncatedBase32;
  }

  checkIfString(data: any): boolean {
    return typeof data !== 'string' || data.length === 0;
  }
}
