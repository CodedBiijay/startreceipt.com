import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { User } from '../types';

interface LeadFormProps {
  onSignUp?: (user: User) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSignUp }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://formspree.io/f/xeodykab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: 'New Lead via Landing Page Form'
        })
      });

      if (response.ok) {
        if (onSignUp) {
          onSignUp({ name: formData.name, email: formData.email });
        } else {
            alert("Thanks for signing up!");
            setFormData({ name: '', email: '' });
        }
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Get Started Today</h2>
          <p className="text-slate-600">Start creating professional receipts in seconds. No credit card required.</p>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow bg-white text-slate-900"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-shadow bg-white text-slate-900"
              placeholder="Jane Doe"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-brand-dark text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Create Free Account'}
          </button>
          
          <p className="text-xs text-center text-slate-400 mt-4">
            No credit card required. Free plan available forever.
          </p>
        </form>
      </div>
    </section>
  );
};