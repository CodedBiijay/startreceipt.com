import React, { useState, useRef, ChangeEvent } from 'react';
import { User, BrandingConfig, STORAGE_KEYS } from '../types';
import { X, Upload, Palette, Building2, Save, AlertCircle, Lock } from 'lucide-react';

interface SettingsProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onClose: () => void;
  onUpgrade?: () => void; // Callback to open payment page
}

export const Settings: React.FC<SettingsProps> = ({ user, onSave, onClose, onUpgrade }) => {
  const isPro = user.tier === 'pro';

  // Initialize branding state with defaults
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
  const [saveSuccess, setWithSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle logo file upload
   */
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setLogoError('');

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Please upload a PNG, JPG, or SVG file');
      return;
    }

    // Validate file size (500KB max)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      setLogoError('Logo must be smaller than 500KB. Please compress or resize your image.');
      return;
    }

    // Convert to base64
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

  /**
   * Remove uploaded logo
   */
  const handleRemoveLogo = () => {
    setBranding(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Save settings to localStorage and update parent
   */
  const handleSave = () => {
    // For basic/demo users: save business info but not custom branding (logo, colors)
    // For Pro users: save everything including logo and custom colors
    const brandingToSave: BrandingConfig = isPro
      ? branding // Pro: save everything
      : {
          // Basic/demo: save business info but use default colors and no logo
          businessName: branding.businessName,
          businessEmail: branding.businessEmail,
          businessPhone: branding.businessPhone,
          businessAddress: branding.businessAddress,
          taxId: branding.taxId,
          tagline: branding.tagline,
          logo: '', // No logo for non-Pro users
          primaryColor: '#0f172a', // Default color
          secondaryColor: '#EBF1FF', // Default color
        };

    const updatedUser: User = {
      ...user,
      branding: brandingToSave,
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

    // Update parent component
    onSave(updatedUser);

    // Show success message
    setWithSaveSuccess(true);
    setTimeout(() => {
      setWithSaveSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
            <p className="text-slate-600 text-sm mt-1">
              Manage your business information and branding
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Column: Settings Forms */}
          <div className="space-y-6">
            {/* Business Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-brand-blue" />
                <h3 className="font-semibold text-slate-900">Business Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branding.businessName}
                    onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
                    placeholder="Your Business Name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
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
                    placeholder="contact@business.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={branding.businessPhone}
                    onChange={(e) => setBranding({ ...branding, businessPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Address
                  </label>
                  <textarea
                    value={branding.businessAddress}
                    onChange={(e) => setBranding({ ...branding, businessAddress: e.target.value })}
                    placeholder="123 Main St, City, State 12345"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will appear on your receipts and invoices to showcase your brand
                  </p>
                </div>
              </div>
            </section>

            {/* Branding Section - Pro Only */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Palette size={20} className="text-brand-blue" />
                <h3 className="font-semibold text-slate-900">Custom Branding</h3>
                {!isPro && (
                  <span className="ml-auto text-xs bg-brand-light text-brand-blue px-2 py-1 rounded-full font-medium">
                    Pro Only
                  </span>
                )}
              </div>

              {!isPro ? (
                // Upgrade Prompt for Demo/Basic Users
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Lock size={24} className="text-brand-blue flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Unlock Custom Branding with Pro
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-700 mb-4">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          Upload your logo to all invoices & receipts
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          Customize brand colors
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          Unlimited AI generations
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          Priority support
                        </li>
                      </ul>
                      <button
                        onClick={() => {
                          if (onUpgrade) {
                            onClose(); // Close settings first
                            onUpgrade(); // Open payment modal
                          }
                        }}
                        className="w-full bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                      >
                        Upgrade to Pro - $9.99/month
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Branding Controls for Pro Users
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Business Logo
                    </label>

                    {branding.logo ? (
                      // Logo Preview
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                        <div className="flex items-center gap-4">
                          <img
                            src={branding.logo}
                            alt="Business logo"
                            className="h-20 w-20 object-contain bg-white rounded border border-slate-200"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Logo uploaded</p>
                            <p className="text-xs text-slate-500">
                              PNG, JPG, or SVG • Max 500KB
                            </p>
                          </div>
                          <button
                            onClick={handleRemoveLogo}
                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Upload Button
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
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        <span>{logoError}</span>
                      </div>
                    )}
                  </div>

                  {/* Color Pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          className="h-10 w-16 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          placeholder="#2257F5"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                          className="h-10 w-16 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                          placeholder="#EBF1FF"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-slate-900">Live Preview</h3>
              <span className="text-xs text-slate-500">(How your documents will look)</span>
            </div>

            {/* Mini Document Preview */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-lg">
              {/* Header */}
              <div
                className="p-4"
                style={{ backgroundColor: isPro ? branding.primaryColor : '#0f172a' }}
              >
                <div className="flex justify-between items-start">
                  {isPro && branding.logo && (
                    <img
                      src={branding.logo}
                      alt="Logo"
                      className="h-12 object-contain bg-white rounded p-1"
                    />
                  )}
                  <div className={`${isPro && branding.logo ? '' : 'w-full'} text-right`}>
                    <p className="text-white font-bold text-lg">INVOICE</p>
                    <p className="text-white text-opacity-80 text-xs">INV-0001</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4" style={{ backgroundColor: isPro ? branding.secondaryColor : '#ffffff' }}>
                {/* From Section */}
                <div className="mb-4">
                  <p className="text-xs uppercase text-slate-400 mb-1">From</p>
                  <p className="font-semibold text-slate-900">
                    {branding.businessName || 'Your Business Name'}
                  </p>
                  {branding.businessEmail && (
                    <p className="text-sm text-slate-600">{branding.businessEmail}</p>
                  )}
                  {branding.businessPhone && (
                    <p className="text-sm text-slate-600">{branding.businessPhone}</p>
                  )}
                  {branding.businessAddress && (
                    <p className="text-xs text-slate-500 mt-1">{branding.businessAddress}</p>
                  )}
                </div>

                {/* To Section */}
                <div className="mb-4">
                  <p className="text-xs uppercase text-slate-400 mb-1">Bill To</p>
                  <p className="font-medium text-slate-900">Client Name</p>
                  <p className="text-sm text-slate-600">client@example.com</p>
                </div>

                {/* Sample Items */}
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-600 font-medium">Item</th>
                      <th className="text-right py-2 text-slate-600 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 text-slate-900">Design Services</td>
                      <td className="text-right text-slate-900">$500.00</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 text-slate-900">Development Work</td>
                      <td className="text-right text-slate-900">$1,200.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="w-48">
                    <div className="flex justify-between py-2 border-t-2 border-slate-300">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-slate-900">$1,700.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
              {isPro
                ? 'Your custom branding will appear on all documents'
                : 'Upgrade to Pro to add your logo and colors'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!branding.businessName || !branding.businessEmail}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saveSuccess ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
