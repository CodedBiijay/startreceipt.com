import React, { useState } from 'react';
import { User, STORAGE_KEYS } from '../types';
import { Check, CreditCard, Shield, Sparkles, X } from 'lucide-react';

interface PaymentPageProps {
  user: User;
  onClose: () => void;
  onUpgradeComplete: (updatedUser: User) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ user, onClose, onUpgradeComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  // For demo purposes, this simulates a payment process
  // In production, you would integrate with Stripe, PayPal, etc.
  const handleUpgrade = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Upgrade user to Pro tier
    const upgradedUser: User = {
      ...user,
      tier: 'pro',
    };

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(upgradedUser));
    onUpgradeComplete(upgradedUser);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-blue to-indigo-600 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Upgrade to Pro</h2>
              <p className="text-white/80">Unlock unlimited potential</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Pricing */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-5xl font-bold text-slate-900">$9.99</span>
              <span className="text-slate-600">/month</span>
            </div>
            <p className="text-center text-slate-600 text-sm">
              Cancel anytime. No long-term commitment.
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">What's included:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Unlimited AI generations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Custom logo upload</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Brand colors customization</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Business information on all documents</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Invoice status tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Client management</span>
              </div>
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-500 shrink-0" />
                <span className="text-slate-700">Priority support</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Payment method:</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-brand-blue bg-brand-light text-brand-blue'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard size={20} />
                <span className="font-medium">Credit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'paypal'
                    ? 'border-brand-blue bg-brand-light text-brand-blue'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-xl">P</span>
                <span className="font-medium">PayPal</span>
              </button>
            </div>
          </div>

          {/* Payment Form (Demo) */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Demo Mode:</strong> This is a demo payment page. In production, this would integrate with a real payment processor like Stripe or PayPal. Click "Complete Upgrade" to simulate the upgrade process.
            </p>
          </div>

          {/* Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-blue to-indigo-600 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Complete Upgrade - $9.99/mo'}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
            <Shield size={16} />
            <span>Secure payment • Cancel anytime</span>
          </div>

          {/* Money-back Guarantee */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 text-sm mb-1">30-Day Money-Back Guarantee</p>
                <p className="text-xs text-green-700">
                  If you don't save at least an hour of admin time in your first month, we'll refund your $9.99—no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
