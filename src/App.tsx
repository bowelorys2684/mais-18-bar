/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Settings } from 'lucide-react';
import { cn } from './utils';
import { AdminPanel } from './components/AdminPanel';

type Profile = 'CASAL' | 'SOLTEIRO';

export default function App() {
  const [profile, setProfile] = useState<Profile>('CASAL');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsApp(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !consent) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp, profile }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setName('');
          setWhatsapp('');
          setProfile('CASAL');
          setConsent(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-10">
        
        {/* Header / Logo Section */}
        <div className="flex items-center gap-4">
          {/* Custom Logo SVG based on the image */}
          <div 
            className="relative w-24 h-24 cursor-pointer active:scale-95 transition-transform"
            onDoubleClick={() => setIsAdminOpen(true)}
          >
            <img 
              src="https://i.imgur.com/16ghhZu.png" 
              alt="Mais 18 Bar Liberal" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-1">
              <span className="text-white italic">BAR</span>
              <span className="neon-text-blue italic">LIBERAL</span>
            </h1>
            <p className="text-zinc-500 font-bold text-xs tracking-[0.3em] uppercase">
              Check-in Portaria
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Profile Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Perfil</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProfile('CASAL')}
                className={cn(
                  "py-4 rounded-2xl font-black transition-all duration-300",
                  profile === 'CASAL' 
                    ? "neon-border-pink text-[#e91e63] bg-[#e91e63]/10" 
                    : "bg-[#111] text-zinc-600 border border-transparent"
                )}
              >
                CASAL
              </button>
              <button
                type="button"
                onClick={() => setProfile('SOLTEIRO')}
                className={cn(
                  "py-4 rounded-2xl font-black transition-all duration-300",
                  profile === 'SOLTEIRO' 
                    ? "neon-border-pink text-[#e91e63] bg-[#e91e63]/10" 
                    : "bg-[#111] text-zinc-600 border border-transparent"
                )}
              >
                SOLTEIRO
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full input-dark py-5 px-6 rounded-2xl text-lg placeholder:text-zinc-800"
            />
          </div>

          {/* WhatsApp Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">WhatsApp</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={handleWhatsAppChange}
              placeholder="(00) 00000-0000"
              className="w-full input-dark py-5 px-6 rounded-2xl text-lg placeholder:text-zinc-800"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-4 p-4 bg-[#111] rounded-2xl border border-zinc-900">
            <button
              type="button"
              onClick={() => setConsent(!consent)}
              className={cn(
                "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                consent 
                  ? "bg-[#e91e63] border-[#e91e63] shadow-[0_0_10px_rgba(233,30,99,0.5)]" 
                  : "border-zinc-700 bg-transparent"
              )}
            >
              {consent && <CheckCircle2 size={16} className="text-white" />}
            </button>
            <div className="space-y-1 cursor-pointer" onClick={() => setConsent(!consent)}>
              <span className="text-xs font-black text-white uppercase tracking-wider">Aceito</span>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                Consinto com a coleta dos meus dados para controle de público da casa e envio de promoções. 
                Seguimos a risca a LGPD e os dados são absolutamente sigilosos e protegidos.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess || !consent}
              className="w-full btn-pink py-6 rounded-3xl text-xl shadow-2xl shadow-pink/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isSuccess ? (
                <>
                  <CheckCircle2 />
                  ENTRADA CONFIRMADA
                </>
              ) : (
                'CONFIRMAR ENTRADA'
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <p className="text-center text-[10px] text-zinc-700 font-medium tracking-widest uppercase">
          Mais 18 Bar Liberal • Gestão de Acesso
        </p>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-24 h-24 bg-pink/20 rounded-full flex items-center justify-center mx-auto border-2 border-pink shadow-[0_0_30px_rgba(233,30,99,0.3)]">
                <CheckCircle2 size={48} className="text-pink" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black italic">BEM-VINDO!</h2>
                <p className="text-zinc-400 font-medium">Sua entrada foi registrada com sucesso.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>

      {/* Hidden Admin Trigger Button (Optional, for easier access) */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-4 left-4 p-2 text-zinc-900 hover:text-zinc-700 transition-colors"
      >
        <Settings size={16} />
      </button>
    </div>
  );
}
