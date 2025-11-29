import React, { useState } from 'react';
import { SmartReceiptDemo } from './components/SmartReceiptDemo';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { FAQ } from './components/FAQ';
import { User } from './types';
import { Menu, X, Check, Star, Shield, Zap, FileText, Sparkles, LogIn, Users } from 'lucide-react';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLogin={handleLogin}
        initialMode={authMode}
      />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-slate-900 tracking-tight">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            StartReceipt
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-slate-600 hover:text-brand-blue font-medium text-sm">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-slate-600 hover:text-brand-blue font-medium text-sm">How It Works</button>
            <button onClick={() => scrollTo('pricing')} className="text-slate-600 hover:text-brand-blue font-medium text-sm">Pricing</button>
            <div className="h-6 w-px bg-slate-200"></div>
            <button onClick={() => openAuth('signin')} className="text-slate-600 hover:text-brand-blue font-medium text-sm">Sign In</button>
            <button onClick={() => openAuth('signup')} className="bg-brand-blue text-white px-5 py-2.5 rounded-full font-medium text-sm hover:bg-brand-dark transition-colors shadow-sm">
              Start Free
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-xl">
            <button onClick={() => scrollTo('features')} className="text-left p-2 text-slate-600 font-medium">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-left p-2 text-slate-600 font-medium">How It Works</button>
            <button onClick={() => scrollTo('pricing')} className="text-left p-2 text-slate-600 font-medium">Pricing</button>
            <hr className="border-slate-100" />
            <button onClick={() => openAuth('signin')} className="text-left p-2 text-slate-600 font-medium flex items-center gap-2">
               <LogIn size={16} /> Sign In
            </button>
            <button onClick={() => openAuth('signup')} className="bg-brand-blue text-white w-full py-3 rounded-xl font-medium">Start Free</button>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="pt-20 pb-20 md:pt-32 md:pb-32 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Get Paid Faster,<br className="hidden md:block"/>
              <span className="text-brand-blue">Skip the Paperwork.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional receipts in 30 seconds. No accounting degree required.
              Built for freelancers who'd rather do the work than document it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => openAuth('signup')} className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white rounded-full font-bold text-lg hover:bg-brand-dark transition-all transform hover:-translate-y-1 shadow-lg shadow-brand-blue/30">
                Start Free
              </button>
              <span className="text-sm text-slate-500 font-medium">No credit card required</span>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-10 border-y border-slate-100 bg-slate-50/50">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
              Built for Independent Professionals
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { emoji: "🔧", label: "General Contractors", desc: "Plumbing, electrical, HVAC" },
                { emoji: "🎨", label: "Creative Services", desc: "Design, photography, video" },
                { emoji: "💻", label: "Tech Consultants", desc: "Development, IT, consulting" },
                { emoji: "🏠", label: "Home Services", desc: "Cleaning, landscaping, repairs" }
              ].map((category, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{category.emoji}</div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{category.label}</div>
                  <div className="text-xs text-slate-500">{category.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="py-24 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                         <h2 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-2">Who It's For</h2>
                         <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Stop fighting with spreadsheets</h3>
                         <p className="text-lg text-slate-600 mb-6">
                            You're a contractor, not an accountant. Stop wasting hours formatting Excel cells or fighting with complex invoicing software designed for enterprises.
                         </p>
                         <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                 <div className="mt-1 bg-red-100 text-red-600 rounded-full p-1"><X size={14}/></div>
                                 <span className="text-slate-700">No more manual calculations</span>
                             </li>
                             <li className="flex items-start gap-3">
                                 <div className="mt-1 bg-red-100 text-red-600 rounded-full p-1"><X size={14}/></div>
                                 <span className="text-slate-700">No more ugly Word documents</span>
                             </li>
                             <li className="flex items-start gap-3">
                                 <div className="mt-1 bg-red-100 text-red-600 rounded-full p-1"><X size={14}/></div>
                                 <span className="text-slate-700">No more "I'll send it later" delays</span>
                             </li>
                         </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-blue/5 rounded-3xl transform rotate-3"></div>
                        <img
                          src="/hero-image.png"
                          alt="Road ahead - Start your receipt journey"
                          className="relative rounded-3xl shadow-2xl w-full object-cover h-[400px]"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Gemini Demo Section */}
        <SmartReceiptDemo
          mode="demo"
          onSignupPrompt={() => openAuth('signup')}
        />

        {/* Features */}
        <section id="features" className="py-24 px-4 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to get paid</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: <Zap className="text-brand-blue" />, title: "Send It While You're Still There", desc: "Create and email a receipt in under 30 seconds. Get paid faster because clients get documentation immediately." },
                    { icon: <Shield className="text-brand-blue" />, title: "Your Data Never Leaves Your Device", desc: "No cloud storage. No data breach risk. Receipts are generated locally and you decide where they go." },
                    { icon: <FileText className="text-brand-blue" />, title: "Look Like You Have an Accountant", desc: "Clean, professional PDFs that make you look established—even if you're working out of your truck." },
                    { icon: <Star className="text-brand-blue" />, title: "No More Word Document Embarrassment", desc: "Stop sending receipts that look like homework assignments. Our templates look like they came from a real business." },
                    { icon: <Sparkles className="text-brand-blue" />, title: "Type How You Talk", desc: "Just describe the job: 'Fixed sink, 2 hours, $85/hr.' Our AI formats it professionally. No math, no formatting, no spreadsheets." },
                    { icon: <Menu className="text-brand-blue" />, title: "Create Receipts in the Driveway", desc: "Done with the job? Pull out your phone and send a receipt before you leave. No 'I'll send it later' excuses." },
                ].map((feature, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                        <p className="text-slate-600">{feature.desc}</p>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 px-4 bg-white">
             <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
                </div>
                <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2 hidden md:block"></div>
                    
                    <div className="space-y-12 relative">
                        {[
                            { step: "01", title: "Enter Details", desc: "Type manually or let AI extract items from your notes." },
                            { step: "02", title: "Customize", desc: "Add your logo, change colors, and set tax rates." },
                            { step: "03", title: "Download", desc: "Get a PDF instantly and send it to your client." }
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <div className="hidden md:block w-1/2 text-right">
                                    {i % 2 === 0 && (
                                        <>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-600">{item.desc}</p>
                                        </>
                                    )}
                                </div>
                                <div className="relative z-10 w-12 h-12 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 border-4 border-white shadow-lg mx-auto md:mx-0">
                                    {item.step}
                                </div>
                                <div className="w-full md:w-1/2 text-center md:text-left">
                                     {i % 2 !== 0 ? (
                                        <>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-600">{item.desc}</p>
                                        </>
                                     ) : (
                                         <div className="block md:hidden">
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-600">{item.desc}</p>
                                         </div>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-4 bg-slate-50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-slate-600">Start for free, upgrade when you grow.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Basic</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-6">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-700"><Check size={18} className="text-green-500"/> 50 Generations/Month</li>
                        <li className="flex items-center gap-3 text-slate-700"><Check size={18} className="text-green-500"/> Unlimited Manual Receipts</li>
                        <li className="flex items-center gap-3 text-slate-700"><Check size={18} className="text-green-500"/> Professional PDF Export</li>
                        <li className="flex items-center gap-3 text-slate-700"><Check size={18} className="text-green-500"/> Basic Templates</li>
                    </ul>
                    <p className="text-xs text-slate-500 mb-4 text-center">
                      50 generations resets monthly
                    </p>
                    <button onClick={() => openAuth('signup')} className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-brand-blue hover:text-brand-blue transition-colors">Start Free</button>
                </div>
                
                <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                    <div className="text-4xl font-bold text-white mb-6">$12<span className="text-lg text-slate-400 font-normal">/mo</span></div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-brand-blue"/> Everything in Basic</li>
                        <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-brand-blue"/> Unlimited AI Generations</li>
                        <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-brand-blue"/> Custom Branding</li>
                        <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-brand-blue"/> Client Management</li>
                    </ul>
                    <button onClick={() => openAuth('signup')} className="w-full py-4 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-600 transition-colors">Start Pro Trial</button>
                </div>
            </div>

            {/* Money-Back Guarantee */}
            <div className="max-w-2xl mx-auto mt-12 bg-green-50 border-2 border-green-200 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full p-2 shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">Try Risk-Free</h3>
                  <p className="text-slate-700 mb-4">
                    Start with our free plan. No credit card required. If you upgrade to Pro and don't save at least
                    an hour of admin time in your first month, we'll refund your $12—no questions asked.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Check size={16} className="text-green-600" /> Cancel anytime
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={16} className="text-green-600" /> No hidden fees
                    </span>
                    <span className="flex items-center gap-1">
                      <Check size={16} className="text-green-600" /> Keep all your receipts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
          <div className="container mx-auto max-w-6xl grid md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                    <div className="w-6 h-6 bg-brand-blue rounded flex items-center justify-center text-white">
                        <FileText size={14} />
                    </div>
                    StartReceipt
                  </div>
                  <p className="text-sm">Professional receipts in 30 seconds. Built by freelancers, for freelancers.</p>
              </div>

              <div>
                  <h4 className="text-white font-bold mb-4">Product</h4>
                  <ul className="space-y-2 text-sm">
                      <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button></li>
                      <li><button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                      <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                  </ul>
              </div>

              <div>
                  <h4 className="text-white font-bold mb-4">Resources</h4>
                  <ul className="space-y-2 text-sm">
                      <li><a href="mailto:support@startreceipt.com" className="hover:text-white transition-colors">Support</a></li>
                  </ul>
              </div>

              <div>
                  <h4 className="text-white font-bold mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm">
                      <li><span className="text-slate-500">Privacy & Terms coming soon</span></li>
                  </ul>
              </div>
          </div>

          <div className="container mx-auto max-w-6xl mt-8 pt-8 border-t border-slate-800">
            <div className="grid md:grid-cols-3 gap-8 text-center text-sm">
              <div>
                <Shield className="mx-auto mb-2 text-slate-500" size={24} />
                <p className="text-slate-400">Your data stays on your device</p>
              </div>
              <div>
                <Sparkles className="mx-auto mb-2 text-slate-500" size={24} />
                <p className="text-slate-400">Powered by Google Gemini AI</p>
              </div>
              <div>
                <Users className="mx-auto mb-2 text-slate-500" size={24} />
                <p className="text-slate-400">Built by contractors, for contractors</p>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-slate-800 text-center text-xs">
              &copy; {new Date().getFullYear()} StartReceipt. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default App;

