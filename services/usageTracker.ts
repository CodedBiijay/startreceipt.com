/**
 * Usage Tracking Service
 * Tracks AI generation usage per user with localStorage
 */

export interface UsageRecord {
  timestamp: number;
  userEmail: string;
  success: boolean;
  errorType?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface UserUsageStats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  lastGeneration: number | null;
  monthlyGenerations: number;
  todayGenerations: number;
}

const STORAGE_KEY = 'startreceipt_usage';
const MAX_RECORDS = 1000; // Keep last 1000 records

class UsageTracker {
  private records: UsageRecord[] = [];

  constructor() {
    this.loadRecords();
  }

  private loadRecords(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.records = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load usage records:', error);
      this.records = [];
    }
  }

  private saveRecords(): void {
    try {
      // Keep only the last MAX_RECORDS
      if (this.records.length > MAX_RECORDS) {
        this.records = this.records.slice(-MAX_RECORDS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (error) {
      console.error('Failed to save usage records:', error);
    }
  }

  /**
   * Track a new AI generation attempt
   */
  track(userEmail: string, success: boolean, errorType?: string, inputTokens?: number, outputTokens?: number): void {
    const record: UsageRecord = {
      timestamp: Date.now(),
      userEmail,
      success,
      errorType,
      inputTokens,
      outputTokens,
    };

    this.records.push(record);
    this.saveRecords();

    // Log for monitoring
    console.log('📊 Usage tracked:', {
      user: userEmail,
      success,
      total: this.records.length,
    });
  }

  /**
   * Get usage statistics for a specific user
   */
  getUserStats(userEmail: string): UserUsageStats {
    const userRecords = this.records.filter(r => r.userEmail === userEmail);

    const now = Date.now();
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const monthlyRecords = userRecords.filter(r => r.timestamp > monthAgo);
    const todayRecords = userRecords.filter(r => r.timestamp > todayStart);

    return {
      totalGenerations: userRecords.length,
      successfulGenerations: userRecords.filter(r => r.success).length,
      failedGenerations: userRecords.filter(r => !r.success).length,
      lastGeneration: userRecords.length > 0 ? userRecords[userRecords.length - 1].timestamp : null,
      monthlyGenerations: monthlyRecords.length,
      todayGenerations: todayRecords.length,
    };
  }

  /**
   * Check if user has exceeded their monthly limit
   */
  hasExceededMonthlyLimit(userEmail: string, limit: number): boolean {
    const stats = this.getUserStats(userEmail);
    return stats.monthlyGenerations >= limit;
  }

  /**
   * Get remaining generations for the month
   */
  getRemainingGenerations(userEmail: string, limit: number): number {
    const stats = this.getUserStats(userEmail);
    return Math.max(0, limit - stats.monthlyGenerations);
  }

  /**
   * Get all usage statistics (for admin dashboard)
   */
  getAllStats() {
    const now = Date.now();
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const monthlyRecords = this.records.filter(r => r.timestamp > monthAgo);
    const weeklyRecords = this.records.filter(r => r.timestamp > weekAgo);
    const todayRecords = this.records.filter(r => r.timestamp > todayStart);

    // Get unique users
    const uniqueUsers = new Set(this.records.map(r => r.userEmail));

    // Calculate total tokens
    const totalInputTokens = this.records.reduce((sum, r) => sum + (r.inputTokens || 0), 0);
    const totalOutputTokens = this.records.reduce((sum, r) => sum + (r.outputTokens || 0), 0);

    // Error breakdown
    const errors = this.records.filter(r => !r.success);
    const errorTypes = errors.reduce((acc, r) => {
      const type = r.errorType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: {
        generations: this.records.length,
        successfulGenerations: this.records.filter(r => r.success).length,
        failedGenerations: errors.length,
        uniqueUsers: uniqueUsers.size,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
      monthly: {
        generations: monthlyRecords.length,
        successfulGenerations: monthlyRecords.filter(r => r.success).length,
      },
      weekly: {
        generations: weeklyRecords.length,
        successfulGenerations: weeklyRecords.filter(r => r.success).length,
      },
      today: {
        generations: todayRecords.length,
        successfulGenerations: todayRecords.filter(r => r.success).length,
      },
      errorBreakdown: errorTypes,
    };
  }

  /**
   * Export usage data as CSV
   */
  exportCSV(): string {
    const headers = ['Timestamp', 'Date', 'User Email', 'Success', 'Error Type', 'Input Tokens', 'Output Tokens'];
    const rows = this.records.map(r => [
      r.timestamp,
      new Date(r.timestamp).toISOString(),
      r.userEmail,
      r.success ? 'Yes' : 'No',
      r.errorType || '',
      r.inputTokens || 0,
      r.outputTokens || 0,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  /**
   * Clear all usage data (use with caution)
   */
  clearAll(): void {
    this.records = [];
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ All usage data cleared');
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();
