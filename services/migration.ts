import { SavedReceipt, Document, STORAGE_KEYS } from '../types';

/**
 * Migration service to convert existing receipts to new document format
 */
class MigrationService {
  private migrationKey = 'migration_completed';

  /**
   * Check if migration has already been completed
   */
  private isMigrationCompleted(): boolean {
    return localStorage.getItem(this.migrationKey) === 'true';
  }

  /**
   * Mark migration as completed
   */
  private markMigrationCompleted(): void {
    localStorage.setItem(this.migrationKey, 'true');
  }

  /**
   * Migrate old receipts to new documents structure
   */
  migrateReceiptsToDocuments(): void {
    // Skip if migration already completed
    if (this.isMigrationCompleted()) {
      console.log('[Migration] Already completed, skipping...');
      return;
    }

    console.log('[Migration] Starting receipts → documents migration...');

    try {
      // Check for old receipts in localStorage
      const oldReceiptsData = localStorage.getItem(STORAGE_KEYS.savedReceipts);

      if (!oldReceiptsData) {
        console.log('[Migration] No old receipts found');
        this.markMigrationCompleted();
        return;
      }

      const oldReceipts: SavedReceipt[] = JSON.parse(oldReceiptsData);

      if (oldReceipts.length === 0) {
        console.log('[Migration] Empty receipts array');
        this.markMigrationCompleted();
        return;
      }

      console.log(`[Migration] Found ${oldReceipts.length} receipts to migrate`);

      // Convert old receipts to new document format
      const migratedDocuments: Document[] = oldReceipts.map((receipt, index) => {
        const documentNumber = `R-${String(index + 1).padStart(4, '0')}`;

        return {
          id: receipt.id,
          type: 'receipt' as const,
          documentNumber: documentNumber,
          date: receipt.date,
          items: receipt.items,
          subtotal: receipt.total, // Old receipts didn't have tax
          taxRate: 0,
          taxAmount: 0,
          total: receipt.total,
          clientName: receipt.clientName,
          status: 'paid' as const, // Old receipts are assumed paid
        };
      });

      // Check if documents already exist (avoid overwriting)
      const existingDocuments = localStorage.getItem(STORAGE_KEYS.documents);

      if (existingDocuments) {
        console.log('[Migration] Documents already exist, merging...');
        const existingDocs: Document[] = JSON.parse(existingDocuments);

        // Merge, avoiding duplicates by ID
        const mergedDocuments = [...existingDocs];
        migratedDocuments.forEach(migDoc => {
          if (!existingDocs.find(doc => doc.id === migDoc.id)) {
            mergedDocuments.push(migDoc);
          }
        });

        localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(mergedDocuments));
        console.log(`[Migration] Merged ${mergedDocuments.length} total documents`);
      } else {
        // No existing documents, just save migrated ones
        localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(migratedDocuments));
        console.log(`[Migration] Saved ${migratedDocuments.length} migrated documents`);
      }

      // Keep old receipts for safety (don't delete yet)
      // Future cleanup can remove after confirming migration success

      this.markMigrationCompleted();
      console.log('[Migration] ✓ Migration completed successfully');
    } catch (error) {
      console.error('[Migration] Error during migration:', error);
      // Don't mark as completed if error occurred
    }
  }

  /**
   * Initialize user settings if not exists
   */
  initializeUserIfNeeded(): void {
    const existingUser = localStorage.getItem(STORAGE_KEYS.user);

    if (!existingUser) {
      console.log('[Migration] Initializing default user settings...');

      const defaultUser = {
        name: '',
        email: 'demo@user.com',
        tier: 'demo' as const,
        documentCounter: 1,
        onboardingCompleted: false,
      };

      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(defaultUser));
    }
  }

  /**
   * Run all migrations
   */
  runMigrations(): void {
    console.log('[Migration] Running all migrations...');
    this.migrateReceiptsToDocuments();
    this.initializeUserIfNeeded();
    console.log('[Migration] All migrations complete');
  }

  /**
   * Reset migration (for testing purposes)
   */
  resetMigration(): void {
    localStorage.removeItem(this.migrationKey);
    console.log('[Migration] Reset completed');
  }
}

export const migrationService = new MigrationService();
