// Item in a document (receipt or invoice)
export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  currency: string;
}

// Document type distinction
export type DocumentType = 'receipt' | 'invoice';

// Document status (for invoices)
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue';

// Unified document interface (replaces SavedReceipt)
export interface Document {
  id: string;
  type: DocumentType;
  documentNumber: string;
  date: string;
  dueDate?: string; // For invoices only
  items: ReceiptItem[];
  subtotal: number;
  taxRate?: number; // Percentage
  taxAmount?: number;
  total: number;
  clientName: string;
  clientEmail?: string;
  paymentTerms?: string; // "Net 30", "Due on receipt", etc.
  notes?: string; // Payment instructions
  status?: DocumentStatus; // For invoices
}

// Legacy type for backward compatibility
export interface SavedReceipt {
  id: string;
  date: string;
  items: ReceiptItem[];
  total: number;
  clientName: string;
}

// Branding configuration
export interface BrandingConfig {
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessAddress?: string;
  taxId?: string; // EIN, VAT, etc.
  logo?: string; // base64 encoded image
  primaryColor: string; // hex color
  secondaryColor: string; // hex color
  fontFamily?: string; // optional custom font
}

export enum PricingTier {
  FREE = 'Free',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

// User tier type
export type UserTier = 'demo' | 'basic' | 'pro';

// User interface with branding
export interface User {
  name: string;
  email: string;
  tier: UserTier;
  branding?: BrandingConfig; // Pro users only
  documentCounter: number; // For auto-numbering
  onboardingCompleted?: boolean; // Track onboarding status
}

// Storage keys
export const STORAGE_KEYS = {
  documents: 'documents', // Renamed from 'receipts'
  savedReceipts: 'savedReceipts', // Legacy key
  user: 'user',
  usage: 'startreceipt_usage',
} as const;