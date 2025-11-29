import React, { useState, useRef, ChangeEvent } from 'react';
import { User, BrandingConfig, STORAGE_KEYS } from '../types';
import { ArrowRight, ArrowLeft, Check, Sparkles, Upload, X } from 'lucide-react';

interface OnboardingWizardProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [branding, setBranding] = useState<BrandingConfig>({
    businessName: user.branding?.businessName || '',
    businessEmail: user.branding?.businessEmail || user.email,
    businessPhone: user.branding?.businessPhone || '',
    businessAddress: user.branding?.businessAddress || '',
    taxId: user.branding?.taxId || '',
    logo: user.branding?.logo || '',
    primaryColor: user.branding?.primaryColor || '#2257F5',
    secondaryColor: user.branding?.secondaryColor || '#EBF1FF',
    tagline: user.branding?.tagline || '',
  });
  const [logoError, setLogoError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 3;

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError('');

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Please upload a PNG, JPG, or SVG file');
      return;
    }

    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      setLogoError('Logo must be smaller than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setBranding(prev => ({ ...prev, logo: base64 }));
    };
    reader.onerror = () => {
      setLogoError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    const updatedUser: User = {
      ...user,
      branding,
      onboardingCompleted: true,
    };

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    onComplete(updatedUser);
  };

  const handleSkip = () => {
    const updatedUser: User = {
      ...user,
      onboardingCompleted: true,
    };

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    onSkip();
  };

  const canProceed = () => {
    if (step === 1) return true; // Welcome step
    if (step === 2) return branding.businessName && branding.businessEmail;
    if (step === 3) return true; // Branding is optional
    return false;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-100 h-2">
          <div
            className="bg-brand-blue h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Welcome to StartReceipt Pro! 🎉
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
                Let's set up your business branding in just 3 quick steps. This will make your invoices and receipts look professional and build trust with clients.
              </p>
              <div className="bg-brand-light border-l-4 border-brand-blue p-4 rounded-r-lg mb-6 text-left max-w-md mx-auto">
                <p className="text-sm text-slate-700">
                  <strong>What you'll get:</strong>
                </p>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li>✓ Custom logo on all documents</li>
                  <li>✓ Your brand colors</li>
                  <li>✓ Professional business information</li>
                  <li>✓ Unlimited AI generations</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Business Details</h2>
              <p className="text-slate-600 mb-6">
                This information will appear on all your invoices and receipts.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branding.businessName}
                    onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
                    placeholder="Acme Consulting LLC"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={branding.businessEmail}
                    onChange={(e) => setBranding({ ...branding, businessEmail: e.target.value })}
                    placeholder="contact@acme.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={branding.businessPhone}
                      onChange={(e) => setBranding({ ...branding, businessPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tax ID (EIN/VAT)
                    </label>
                    <input
                      type="text"
                      value={branding.taxId}
                      onChange={(e) => setBranding({ ...branding, taxId: e.target.value })}
                      placeholder="12-3456789"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Address
                  </label>
                  <textarea
                    value={branding.businessAddress}
                    onChange={(e) => setBranding({ ...branding, businessAddress: e.target.value })}
                    placeholder="123 Main St, Suite 100, New York, NY 10001"
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Tagline or Mission (Optional)
                  </label>
                  <textarea
                    value={branding.tagline}
                    onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                    placeholder="E.g., 'Quality service you can trust' or 'Building tomorrow's solutions today'"
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will appear on your receipts and invoices to showcase your brand
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Make It Yours</h2>
              <p className="text-slate-600 mb-6">
                Upload your logo and choose your brand colors. This step is optional - you can always add these later.
              </p>

              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Business Logo
                  </label>

                  {branding.logo ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center gap-4">
                        <img
                          src={branding.logo}
                          alt="Business logo"
                          className="h-16 w-16 object-contain bg-white rounded border border-slate-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Logo uploaded</p>
                          <p className="text-xs text-slate-500">Looks great!</p>
                        </div>
                        <button
                          onClick={() => {
                            setBranding({ ...branding, logo: '' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-blue hover:bg-brand-light transition-colors"
                    >
                      <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG, or SVG • Max 500KB
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {logoError && (
                    <p className="mt-2 text-red-600 text-sm">{logoError}</p>
                  )}
                </div>

                {/* Color Pickers */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Brand Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-12 w-20 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm"
                      placeholder="#2257F5"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Preview</p>
                  <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <div
                      className="p-4 text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <div className="flex items-center justify-between">
                        {branding.logo && (
                          <img
                            src={branding.logo}
                            alt="Logo"
                            className="h-10 object-contain bg-white rounded p-1"
                          />
                        )}
                        <div className="text-right">
                          <p className="font-bold text-lg">INVOICE</p>
                          <p className="text-xs opacity-80">INV-0001</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-400 mb-1">From</p>
                      <p className="font-semibold text-slate-900">
                        {branding.businessName || 'Your Business Name'}
                      </p>
                      <p className="text-sm text-slate-600">{branding.businessEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                Skip for now
              </button>
            </div>

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                <Check size={18} />
                Start Creating Invoices
              </button>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === step
                    ? 'bg-brand-blue w-8'
                    : i < step
                    ? 'bg-brand-blue'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
