import React, { useState, useEffect } from 'react';
import { SmartReceiptDemo } from './SmartReceiptDemo';
import { Settings as SettingsComponent } from './Settings';
import { OnboardingWizard } from './OnboardingWizard';
import { PaymentPage } from './PaymentPage';
import { User as UserType, Document, DocumentType, DocumentStatus, STORAGE_KEYS } from '../types';
import { FileText, Plus, Settings, Clock, Receipt, DollarSign, CheckCircle, Send, XCircle, Sparkles } from 'lucide-react';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: UserType) => void;
}

type FilterType = 'all' | 'invoice' | 'receipt';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUserUpdate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Check if user is Pro and hasn't completed onboarding
  useEffect(() => {
    if (currentUser.tier === 'pro' && !currentUser.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [currentUser]);

  // Load documents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.documents);
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse documents from local storage", e);
      }
    }
  }, []);

  const handleSaveDocument = (doc: Document) => {
    const updatedDocuments = [doc, ...documents];
    setDocuments(updatedDocuments);
    localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(updatedDocuments));

    // Increment document counter
    const updatedUser = {
      ...currentUser,
      documentCounter: currentUser.documentCounter + 1,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  const handleStatusUpdate = (docId: string, newStatus: DocumentStatus) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === docId ? { ...doc, status: newStatus } : doc
    );
    setDocuments(updatedDocuments);
    localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(updatedDocuments));
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.type === filter;
  });

  // Get status badge styling
  const getStatusBadge = (status?: DocumentStatus) => {
    if (!status) return null;

    const styles = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
    };

    const icons = {
      draft: FileText,
      sent: Send,
      paid: CheckCircle,
      overdue: XCircle,
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Check if invoice is overdue
  const isOverdue = (doc: Document): boolean => {
    if (doc.type !== 'invoice' || !doc.dueDate || doc.status === 'paid') return false;
    return new Date(doc.dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            StartReceipt
          </div>

          <div className="flex items-center gap-4">
             {/* Upgrade to Pro button for non-Pro users */}
             {currentUser.tier !== 'pro' && (
               <button
                 onClick={() => setShowPayment(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
               >
                 <Sparkles size={16} />
                 <span className="hidden sm:inline">Upgrade to Pro</span>
                 <span className="sm:hidden">Pro</span>
               </button>
             )}
             <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full">
                <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                {currentUser.tier === 'pro' && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-brand-blue to-indigo-600 text-white text-xs font-bold rounded-full">PRO</span>
                )}
             </div>
             <button
               onClick={onLogout}
               className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
             >
               Sign Out
             </button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
         <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-brand-blue text-white rounded-xl font-medium shadow-sm hover:bg-brand-dark transition-colors"
                >
                    <Plus size={18} /> New Document
                </button>

                {/* Filter Navigation */}
                <nav className="pt-4 space-y-1">
                    <button
                      onClick={() => setFilter('all')}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-left ${
                        filter === 'all'
                          ? 'text-slate-900 bg-white shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className={filter === 'all' ? 'text-brand-blue' : ''} />
                        All Documents
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {documents.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setFilter('invoice')}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-left ${
                        filter === 'invoice'
                          ? 'text-slate-900 bg-white shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign size={18} className={filter === 'invoice' ? 'text-brand-blue' : ''} />
                        Invoices
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {documents.filter(d => d.type === 'invoice').length}
                      </span>
                    </button>

                    <button
                      onClick={() => setFilter('receipt')}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-left ${
                        filter === 'receipt'
                          ? 'text-slate-900 bg-white shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Receipt size={18} className={filter === 'receipt' ? 'text-brand-blue' : ''} />
                        Receipts
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {documents.filter(d => d.type === 'receipt').length}
                      </span>
                    </button>

                    <div className="pt-2">
                      <button
                        onClick={() => setShowSettings(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-left"
                      >
                          <Settings size={18} /> Settings
                      </button>
                    </div>
                </nav>

                {/* Recent Documents */}
                <div className="pt-8">
                    <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Recent History
                    </h3>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                        {filteredDocuments.length > 0 ? (
                          filteredDocuments.slice(0, 10).map((doc) => (
                             <div key={doc.id} className="px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer border-b border-slate-100 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-slate-900">{doc.clientName}</span>
                                  <span className="text-xs text-slate-400">
                                    {doc.type === 'invoice' ? 'INV' : 'REC'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">${doc.total.toFixed(2)}</span>
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(doc.date).toLocaleDateString()}
                                  </span>
                                </div>
                                {doc.status && (
                                  <div className="mt-2">
                                    {getStatusBadge(isOverdue(doc) ? 'overdue' : doc.status)}
                                  </div>
                                )}
                             </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-sm text-slate-400 text-center italic">
                            No documents saved yet.
                          </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <SmartReceiptDemo
                  mode="app"
                  onSaveDocument={handleSaveDocument}
                  userEmail={currentUser.email}
                  userTier={currentUser.tier}
                />
            </main>
         </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsComponent
          user={currentUser}
          onSave={handleUserUpdate}
          onClose={() => setShowSettings(false)}
          onUpgrade={() => setShowPayment(true)}
        />
      )}

      {/* Onboarding Wizard - Only for Pro users who haven't completed onboarding */}
      {showOnboarding && (
        <OnboardingWizard
          user={currentUser}
          onComplete={(updatedUser) => {
            handleUserUpdate(updatedUser);
            setShowOnboarding(false);
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Payment Page - For upgrading to Pro */}
      {showPayment && (
        <PaymentPage
          user={currentUser}
          onClose={() => setShowPayment(false)}
          onUpgradeComplete={(upgradedUser) => {
            handleUserUpdate(upgradedUser);
            setShowPayment(false);
            setShowOnboarding(true); // Show onboarding after upgrade
          }}
        />
      )}
    </div>
  );
};
