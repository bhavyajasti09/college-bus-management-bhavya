import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    busOrRoute: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Campus Transit Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
            Contact & Operations Desk
          </h1>
          <p className="mt-3 text-sm text-slate-400 light:text-slate-600">
            Have a question regarding bus passes, lost belongings, or route schedules? Reach out to our 24/7 campus transportation team.
          </p>
        </div>

        {/* 3 Hotlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 mb-4">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Emergency Dispatch Hotline</h3>
              <p className="text-xs text-slate-400 mb-4">
                Immediate dispatch response for urgent safety concerns, breakdown assistance, or medical incidents.
              </p>
            </div>
            <div className="text-lg font-bold text-red-400 font-mono">
              +1 (800) 555-9111
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-4">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Student Pass Desk</h3>
              <p className="text-xs text-slate-400 mb-4">
                Assistance with digital bus pass approvals, concessions, receipt downloads, and renewal queries.
              </p>
            </div>
            <div className="text-lg font-bold text-cyan-400 font-mono">
              +1 (800) 555-RIDE
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Lost & Found Property</h3>
              <p className="text-xs text-slate-400 mb-4">
                Items recovered on board university buses are logged at the Central Terminal office daily.
              </p>
            </div>
            <div className="text-sm font-bold text-blue-400 font-mono">
              lostfound@campusride.edu
            </div>
          </div>
        </div>

        {/* Contact Form and Terminal Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Send a Message to Dispatch</h3>
            <p className="text-xs text-slate-400 mb-6">
              Inquiries are answered by the transport coordinator within 2 hours during transit hours.
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Message Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  Thank you, {formData.name}. Ticket #CR-TKT-{Math.floor(1000 + Math.random() * 9000)} has been generated and routed to the campus transit desk.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'General Inquiry', busOrRoute: '', message: '' });
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 mt-2"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@campusride.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subject Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option>General Inquiry</option>
                      <option>Lost & Found Property</option>
                      <option>Bus Pass & Payment</option>
                      <option>Report Route Delay</option>
                      <option>Propose New Campus Stop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Bus Number / Route (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bus CR-01 or Route NCR-101"
                      value={formData.busOrRoute}
                      onChange={(e) => setFormData({ ...formData, busOrRoute: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your request, issue, or feedback in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-xs font-bold text-slate-950 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Inquiry to Dispatch Desk</span>
                </button>
              </form>
            )}
          </div>

          {/* Terminal Location Card */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Central Operations Center</h3>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Main Campus Bus Depot</strong>
                  <span>Building 14, East Transit Concourse</span>
                  <span className="block text-slate-400">University Boulevard, Gate 1</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Office Operating Hours</strong>
                  <span>Monday – Friday: 06:30 AM – 09:00 PM</span>
                  <span className="block text-slate-400">Saturday: 08:00 AM – 06:00 PM</span>
                  <span className="block text-slate-400">Sunday: Closed (On-call emergency dispatch only)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong>Pass Collection Window:</strong> Approved digital passes are valid directly on your smartphone screen. Physical RFID smartcards may also be picked up at the counter upon presentation of student ID.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
