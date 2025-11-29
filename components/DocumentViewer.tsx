import React from 'react';
import { Document, User, STORAGE_KEYS } from '../types';
import { X, Download, Mail, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  // Get user from localStorage for branding
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem(STORAGE_KEYS.user);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const handleDownload = async () => {
    const element = document.getElementById('document-preview');
    if (!element) {
      alert('Error: Could not find document preview');
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'letter',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);

      const docType = document.type === 'receipt' ? 'receipt' : 'invoice';
      const cleanClientName = document.clientName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${docType}-${document.documentNumber}-${cleanClientName}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Trying print dialog...');
      window.print();
    }
  };

  const handleEmail = () => {
    if (!document.clientEmail) {
      alert('No client email available for this document.');
      return;
    }

    const subject = `${document.type === 'invoice' ? 'Invoice' : 'Receipt'} ${document.documentNumber}`;
    const body = `Hi,\n\nPlease find attached your ${document.type} ${document.documentNumber}.\n\nTotal: $${document.total.toFixed(2)}\n\nThank you for your business!`;

    window.location.href = `mailto:${document.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {document.type === 'invoice' ? 'Invoice' : 'Receipt'} {document.documentNumber}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {document.clientName} • {new Date(document.date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Document Preview */}
        <div className="p-6">
          <div
            id="document-preview"
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Header with branding */}
            <div
              className="text-white p-6"
              style={{
                backgroundColor: user?.branding?.primaryColor || '#0f172a',
                color: '#ffffff',
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
                    {document.type === 'receipt' ? 'RECEIPT' : 'INVOICE'}
                  </div>
                  <div className="text-white text-opacity-80 text-sm mt-1">
                    <p>{document.documentNumber}</p>
                    <p>{new Date(document.date).toLocaleDateString()}</p>
                    {document.type === 'invoice' && document.dueDate && (
                      <p className="text-yellow-300 font-medium">
                        Due: {new Date(document.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* From/To Section */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-white text-opacity-60 text-xs uppercase tracking-wider mb-2">From</p>
                  <p className="font-semibold text-lg">{user?.branding?.businessName || 'Your Business'}</p>
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

                <div>
                  <p className="text-white text-opacity-60 text-xs uppercase tracking-wider mb-2">
                    {document.type === 'receipt' ? 'To' : 'Bill To'}
                  </p>
                  <p className="font-semibold text-lg">{document.clientName}</p>
                  {document.clientEmail && (
                    <p className="text-white text-opacity-80 text-sm">{document.clientEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-6">
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
                  {document.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-50 last:border-0">
                      <td className="py-4 text-slate-800 font-medium">{item.description}</td>
                      <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                      <td className="py-4 text-slate-600 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-4 text-slate-800 text-right font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">Subtotal</span>
                    <span>${document.subtotal.toFixed(2)}</span>
                  </div>

                  {document.taxRate && document.taxAmount && (
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-medium">Tax ({document.taxRate}%)</span>
                      <span>${document.taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-2xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${document.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Terms & Notes */}
                {document.type === 'invoice' && (document.paymentTerms || document.notes) && (
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    {document.paymentTerms && (
                      <div>
                        <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Payment Terms</p>
                        <p className="text-sm text-slate-700 font-medium">
                          {document.paymentTerms.replace('-', ' ').toUpperCase()}
                        </p>
                      </div>
                    )}
                    {document.notes && (
                      <div>
                        <p className="text-xs uppercase text-slate-400 font-semibold mb-1">Payment Instructions</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{document.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer size={16} />
            Print
          </button>
          {document.clientEmail && (
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Mail size={16} />
              Email Client
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
