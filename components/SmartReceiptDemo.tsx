import React, { useState, useEffect } from 'react';
import { parseReceiptDescription } from '../services/geminiService';
import { ReceiptItem, DocumentType, Document, DocumentStatus, STORAGE_KEYS, User } from '../types';
import { Sparkles, Loader2, RefreshCw, Save, Check, Download, FileText, Receipt, Send, CheckCircle, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SmartReceiptDemoProps {
  mode?: 'demo' | 'app';
  userEmail?: string;
  userTier?: 'demo' | 'basic' | 'pro';
  onSaveDocument?: (document: Document) => void;
  onSignupPrompt?: () => void;
}

export const SmartReceiptDemo: React.FC<SmartReceiptDemoProps> = ({
  mode = 'demo',
  userEmail = 'demo@user.com',
  userTier = 'demo',
  onSaveDocument,
  onSignupPrompt
}) => {
  // Get user from localStorage for branding
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem(STORAGE_KEYS.user);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  // Document type state
  const [documentType, setDocumentType] = useState<DocumentType>('receipt');

  // Basic fields
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([
    { description: 'Web Design Consultation', quantity: 2, price: 150 },
    { description: 'Hosting Setup', quantity: 1, price: 50 },
  ]);
  const [clientName, setClientName] = useState('Client Name');
  const [clientEmail, setClientEmail] = useState('');

  // Invoice-specific fields
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('due-on-receipt');
  const [notes, setNotes] = useState('');

  // Tax calculation
  const [taxRate, setTaxRate] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Generate document number
  const generateDocumentNumber = () => {
    const counter = user?.documentCounter || 1;
    const prefix = documentType === 'receipt' ? 'R' : 'INV';
    return `${prefix}-${String(counter).padStart(4, '0')}`;
  };

  const documentNumber = generateDocumentNumber();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      // Determine monthly limit based on user tier
      const monthlyLimit = userTier === 'demo' ? 20 : userTier === 'basic' ? 50 : 999999;

      const parsedItems = await parseReceiptDescription(
        description,
        userEmail,
        userTier,
        monthlyLimit
      );

      if (parsedItems.length > 0) {
        setItems(parsedItems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (status: DocumentStatus = 'draft') => {
    if (onSaveDocument) {
      const document: Document = {
        id: Date.now().toString(),
        type: documentType,
        documentNumber: documentNumber,
        date: new Date().toISOString(),
        dueDate: dueDate || undefined,
        items,
        subtotal: calculateSubtotal(),
        taxRate: taxRate > 0 ? taxRate : undefined,
        taxAmount: taxRate > 0 ? calculateTaxAmount() : undefined,
        total: calculateTotal(),
        clientName,
        clientEmail: clientEmail || undefined,
        paymentTerms: documentType === 'invoice' ? paymentTerms : undefined,
        notes: notes || undefined,
        status: documentType === 'invoice' ? status : 'paid', // Receipts are always "paid"
      };

      onSaveDocument(document);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleDownload = () => {
    if (mode === 'demo' && items.length > 0) {
      // Show soft signup prompt first in demo mode
      setShowSignupPrompt(true);
      return;
    }
    // Proceed with download in app mode or after prompt
    performDownload();
  };

  const performDownload = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) {
      console.error('❌ Receipt element not found');
      alert('Error: Receipt element not found in the DOM');
      return;
    }

    console.log('📄 Receipt element found:', element);
    console.log('📏 Element dimensions:', {
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight
    });

    setShowSignupPrompt(false);

    console.log('✅ PDF libraries imported successfully');

    try {
      console.log('🚀 Starting PDF generation using html2canvas + jsPDF...');

      // Use html2canvas directly for better control
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc: Document) => {
          console.log('🖨️ html2canvas: Document cloned');
          const clonedElement = clonedDoc.getElementById('printable-receipt');
          if (clonedElement) {
            console.log('✅ Cloned receipt element found');

            // Remove buttons/ignore elements
            const ignoreElements = clonedElement.querySelectorAll('[data-html2canvas-ignore], .no-print');
            console.log(`🗑️ Removing ${ignoreElements.length} ignore elements`);
            ignoreElements.forEach(el => el.remove());

            // Force inline styles for better rendering
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.width = element.offsetWidth + 'px';

            // Get user data for branding
            const userData = localStorage.getItem(STORAGE_KEYS.user);
            let brandColor = '#0f172a';
            if (userData) {
              try {
                const parsedUser = JSON.parse(userData);
                brandColor = parsedUser.branding?.primaryColor || '#0f172a';
              } catch (e) {
                console.error('Failed to parse user data for PDF', e);
              }
            }

            // Style the header with branding color
            const headers = clonedElement.querySelectorAll('.text-white.p-6');
            headers.forEach((header: Element) => {
              const el = header as HTMLElement;
              el.style.backgroundColor = brandColor;
              el.style.color = '#ffffff';
              el.style.padding = '24px';
            });

            // Ensure logo renders properly
            const logos = clonedElement.querySelectorAll('img');
            logos.forEach((logo: Element) => {
              const el = logo as HTMLImageElement;
              if (el.src.startsWith('data:image')) {
                // Logo is base64, should render fine
                el.style.maxHeight = '64px';
                el.style.objectFit = 'contain';
              }
            });

            // Style tables
            const tables = clonedElement.querySelectorAll('table');
            tables.forEach((table: Element) => {
              const el = table as HTMLElement;
              el.style.width = '100%';
              el.style.borderCollapse = 'collapse';
            });

            console.log('✅ Styles applied to cloned element');
          } else {
            console.error('❌ Could not find cloned receipt element!');
          }
        }
      });

      console.log('✅ Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions - element may be hidden or empty');
      }

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      console.log('✅ Image data created, length:', imgData.length);

      if (imgData.length < 100) {
        throw new Error('Image data is too small - canvas may be empty');
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'letter',
        compress: true
      });

      console.log('✅ PDF document created');

      // Calculate dimensions to fit the page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('📐 PDF dimensions:', {
        pageWidth,
        pageHeight,
        imgWidth,
        imgHeight,
        margin
      });

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      console.log('✅ Image added to PDF');

      // Save PDF with document type and number
      const docType = documentType === 'receipt' ? 'receipt' : 'invoice';
      const cleanClientName = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${docType}-${documentNumber}-${cleanClientName}.pdf`;
      pdf.save(filename);
      console.log('✅ PDF saved:', filename);

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Trying print dialog...`);
      window.print();
    }
  };

  const handleSendEmail = () => {
    if (!clientEmail) {
      alert('Please enter a client email address to send the document.');
      return;
    }

    const subject = `${documentType === 'invoice' ? 'Invoice' : 'Receipt'} from ${clientName || 'StartReceipt'}`;
    const body = `Hi,

Please find attached your ${documentType} with the following details:

${items.map((item, i) => `${i + 1}. ${item.description} - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Subtotal: $${calculateSubtotal().toFixed(2)}
${taxRate > 0 ? `Tax (${taxRate}%): $${calculateTaxAmount().toFixed(2)}\n` : ''}Total: $${calculateTotal().toFixed(2)}

${documentType === 'invoice' && dueDate ? `\nDue Date: ${new Date(dueDate).toLocaleDateString()}` : ''}
${documentType === 'invoice' && paymentTerms ? `Payment Terms: ${paymentTerms.replace('-', ' ').toUpperCase()}` : ''}
${notes ? `\nNotes: ${notes}` : ''}

Thank you for your business!

---
Generated with StartReceipt.com`;

    const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const calculateTaxAmount = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const isAppMode = mode === 'app';

  return (
    <section className={`py-${isAppMode ? '8' : '20'} ${isAppMode ? 'bg-transparent' : 'bg-brand-light/30'}`}>
      <div className={isAppMode ? 'w-full' : 'container mx-auto px-4'}>
        {!isAppMode && (
          <>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light rounded-full text-brand-blue font-medium text-sm mb-4">
                <Sparkles size={16} />
                <span>Powered by Gemini AI</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Try the Smart Generator
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Don't waste time typing rows manually. Just describe what you did, and our AI will format the receipt for you instantly.
              </p>
            </div>
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-dashed border-brand-blue/30 max-w-6xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="bg-brand-blue text-white rounded-full p-2 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">Try it right now (no signup required)</h3>
                  <p className="text-slate-600 text-sm">
                    Type a job description below or click "Try an example" to see AI instantly format a professional receipt.
                    This actually works—we're not showing you a video.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {isAppMode && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                New {documentType === 'receipt' ? 'Receipt' : 'Invoice'}
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-brand-blue rounded-full text-xs font-semibold">
                <Sparkles size={12} /> Gemini Enabled
              </div>
            </div>

            {/* Document Type Toggle */}
            <div className="flex gap-3 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setDocumentType('receipt')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  documentType === 'receipt'
                    ? 'bg-white text-brand-blue shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt size={16} />
                Receipt
              </button>
              <button
                onClick={() => setDocumentType('invoice')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  documentType === 'invoice'
                    ? 'bg-white text-brand-blue shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={16} />
                Invoice
              </button>
            </div>
          </div>
        )}

        <div className={`flex flex-col ${isAppMode ? 'xl:flex-row' : 'lg:flex-row'} gap-12 items-start ${!isAppMode ? 'max-w-6xl mx-auto' : ''}`}>
          {/* Input Side */}
          <div className={`w-full ${isAppMode ? 'xl:w-1/3' : 'lg:w-1/2'} space-y-6`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Describe the job or items sold
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., I painted the kitchen for 5 hours at $40/hr and bought 3 cans of paint for $25 each."
                className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none resize-none text-slate-900 bg-white"
              />
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setDescription("Fixed leaky faucet (2 hours @ $85/hr) and replaced valve ($15).")}
                  className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-700 font-medium transition-colors"
                >
                  ✨ Try an example →
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !description}
                  className={`w-full flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold transition-all ${
                    loading || !description ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-dark hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {loading ? 'Generating...' : `Generate ${documentType === 'invoice' ? 'Invoice' : 'Receipt'}`}
                </button>
              </div>
            </div>

            {/* Invoice-Specific Fields - Only in app mode */}
            {isAppMode && documentType === 'invoice' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900 mb-3">Invoice Details</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  >
                    <option value="due-on-receipt">Due on Receipt</option>
                    <option value="net-15">Net 15</option>
                    <option value="net-30">Net 30</option>
                    <option value="net-60">Net 60</option>
                    <option value="net-90">Net 90</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payment Instructions / Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Bank account details, Venmo, PayPal, etc."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Tax Calculation - App mode only */}
            {isAppMode && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tax Rate (optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  />
                  <span className="text-slate-600 font-medium">%</span>
                </div>
                {taxRate > 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    Tax: ${calculateTaxAmount().toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {!isAppMode && (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="font-semibold text-brand-dark mb-2 flex items-center gap-2">
                  <RefreshCw size={18} /> How it works
                </h3>
                <p className="text-slate-600 text-sm">
                  We use Google Gemini Flash models to instantly analyze your natural language text and extract structured data, including descriptions, quantities, and prices, automatically calculating totals.
                </p>
              </div>
            )}
          </div>

          {/* Preview Side */}
          <div className={`w-full ${isAppMode ? 'xl:w-2/3' : 'lg:w-1/2'}`}>
            <div id="printable-receipt" className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
              {/* Header with branding */}
              <div
                className="text-white p-6"
                style={{
                  backgroundColor: user?.branding?.primaryColor || '#0f172a',
                  color: '#ffffff'
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  {/* Logo or Business Name */}
                  <div className="flex-1">
                    {user?.branding?.logo ? (
                      <img
                        src={user.branding.logo}
                        alt={user.branding.businessName}
                        className="h-16 object-contain bg-white rounded p-1"
                      />
                    ) : user?.branding?.businessName ? (
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                        <p className="font-bold text-xl text-white">{user.branding.businessName}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Document type and number */}
                  <div className="text-right">
                    <div className="font-bold text-2xl tracking-tight">
                      {documentType === 'receipt' ? 'RECEIPT' : 'INVOICE'}
                    </div>
                    <div className="text-white text-opacity-80 text-sm mt-1">
                      <p>{documentNumber}</p>
                      <p>{new Date().toLocaleDateString()}</p>
                      {documentType === 'invoice' && dueDate && (
                        <p className="text-yellow-300 font-medium">
                          Due: {new Date(dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* From/To Section */}
                <div className="grid grid-cols-2 gap-6">
                  {/* From Section */}
                  <div>
                    <p className="text-white text-opacity-60 text-xs uppercase tracking-wider mb-2">From</p>
                    <p className="font-semibold text-lg">
                      {user?.branding?.businessName || 'Your Business'}
                    </p>
                    {user?.branding?.tagline && (
                      <p className="text-white text-opacity-70 text-xs italic mt-1 mb-2">{user.branding.tagline}</p>
                    )}
                    {user?.branding?.businessEmail && (
                      <p className="text-white text-opacity-80 text-sm">{user.branding.businessEmail}</p>
                    )}
                    {user?.branding?.businessPhone && (
                      <p className="text-white text-opacity-80 text-sm">{user.branding.businessPhone}</p>
                    )}
                    {user?.branding?.businessAddress && (
                      <p className="text-white text-opacity-70 text-xs mt-1">{user.branding.businessAddress}</p>
                    )}
                    {user?.branding?.taxId && (
                      <p className="text-white text-opacity-70 text-xs">Tax ID: {user.branding.taxId}</p>
                    )}
                  </div>

                  {/* To Section */}
                  <div>
                    <p className="text-white text-opacity-60 text-xs uppercase tracking-wider mb-2">
                      {documentType === 'receipt' ? 'To' : 'Bill To'}
                    </p>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-transparent border-none text-white font-semibold p-0 w-full focus:ring-0 placeholder-white placeholder-opacity-40 text-lg mb-1"
                      placeholder="Client Name"
                    />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="bg-transparent border-none text-white text-opacity-80 p-0 w-full focus:ring-0 placeholder-white placeholder-opacity-30 text-sm"
                      placeholder="client@email.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 min-h-[300px] flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 text-xs uppercase text-slate-500 font-semibold w-1/2">Description</th>
                      <th className="py-3 text-xs uppercase text-slate-500 font-semibold text-center">Qty</th>
                      <th className="py-3 text-xs uppercase text-slate-500 font-semibold text-right">Price</th>
                      <th className="py-3 text-xs uppercase text-slate-500 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-50 last:border-0 group hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-slate-800 font-medium">{item.description}</td>
                        <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                        <td className="py-4 text-slate-600 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-4 text-slate-800 text-right font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                          No items yet. Describe your work to generate them!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <div className="flex flex-col gap-2">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-medium">Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>

                    {/* Tax (if applicable) */}
                    {taxRate > 0 && (
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Tax ({taxRate}%)</span>
                        <span>${calculateTaxAmount().toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center text-2xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Terms & Notes (for invoices) */}
                  {documentType === 'invoice' && (paymentTerms || notes) && (
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                      {paymentTerms && (
                        <div>
                          <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Payment Terms</p>
                          <p className="text-sm text-slate-700 font-medium">
                            {paymentTerms === 'due-on-receipt' && 'Due on Receipt'}
                            {paymentTerms === 'net-15' && 'Net 15 Days'}
                            {paymentTerms === 'net-30' && 'Net 30 Days'}
                            {paymentTerms === 'net-60' && 'Net 60 Days'}
                            {paymentTerms === 'net-90' && 'Net 90 Days'}
                          </p>
                        </div>
                      )}
                      {notes && (
                        <div>
                          <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Payment Instructions</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Button Container - Hidden from PDF generation via data-html2canvas-ignore */}
              <div
                className="bg-slate-50 px-4 md:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-slate-100 no-print"
                data-html2canvas-ignore="true"
              >
                 {isAppMode ? (
                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                     {documentType === 'invoice' ? (
                       <>
                         <button
                            type="button"
                            onClick={() => handleSaveClick('draft')}
                            disabled={isSaved}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                              isSaved
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                         >
                            <FileText size={16} />
                            <span className="hidden sm:inline">Save as Draft</span>
                            <span className="sm:hidden">Draft</span>
                         </button>
                         <button
                            type="button"
                            onClick={() => handleSaveClick('sent')}
                            disabled={isSaved}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                              isSaved
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                         >
                            <Send size={16} />
                            <span className="hidden sm:inline">Mark as Sent</span>
                            <span className="sm:hidden">Sent</span>
                         </button>
                         <button
                            type="button"
                            onClick={() => handleSaveClick('paid')}
                            disabled={isSaved}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                              isSaved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                         >
                            <CheckCircle size={16} />
                            <span className="hidden sm:inline">Mark as Paid</span>
                            <span className="sm:hidden">Paid</span>
                         </button>
                       </>
                     ) : (
                       <button
                          type="button"
                          onClick={() => handleSaveClick('paid')}
                          disabled={isSaved}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            isSaved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-brand-blue text-white hover:bg-brand-dark'
                          }`}
                       >
                          {isSaved ? <Check size={16} /> : <Save size={16} />}
                          {isSaved ? 'Saved!' : `Save ${documentType === 'invoice' ? 'Invoice' : 'Receipt'}`}
                       </button>
                     )}
                   </div>
                 ) : (
                   <div></div>
                 )}
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                   <button
                    type="button"
                    onClick={handleSendEmail}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
                   >
                     <Mail size={16} />
                     <span className="hidden sm:inline">Send {documentType === 'invoice' ? 'Invoice' : 'Receipt'}</span>
                     <span className="sm:inline md:hidden">{documentType === 'invoice' ? 'Invoice' : 'Receipt'}</span>
                   </button>
                   <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-brand-blue text-brand-blue rounded-lg font-semibold text-sm hover:bg-brand-blue hover:text-white transition-colors"
                   >
                     <Download size={16} />
                     <span className="hidden sm:inline">Download PDF</span>
                     <span className="sm:inline md:hidden">PDF</span>
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Prompt Modal */}
      {showSignupPrompt && mode === 'demo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Your receipt is ready!
            </h3>
            <p className="text-slate-600 mb-6">
              Create a free account to save this receipt and access it anytime from any device.
              Plus get 50 AI generations per month.
            </p>
            <div className="flex gap-3">
              <button
                onClick={performDownload}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue transition-colors"
              >
                Just Download
              </button>
              <button
                onClick={() => {
                  setShowSignupPrompt(false);
                  onSignupPrompt && onSignupPrompt();
                }}
                className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-lg"
              >
                Sign Up Free
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">No credit card required</p>
          </div>
        </div>
      )}
    </section>
  );
};