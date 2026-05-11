'use client';

import React, { useState } from 'react';
import { SignInCard } from '@/components/ui/sign-in-card-2';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleSignIn = async (email: string) => {
    setError(null);
    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (supabaseError) throw supabaseError;

      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du lien magique.');
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {!isSent ? (
          <motion.div
            key="auth-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SignInCard onSignIn={handleSignIn} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
          >
             {/* Background gradient effect (same as card) */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

            <div className="relative z-10 max-w-sm w-full bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.05] shadow-2xl text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Vérifiez vos e-mails</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Un lien magique a été envoyé à votre adresse e-mail. Cliquez sur le lien pour vous connecter à l'administration.
                </p>
              </div>

              <button
                onClick={() => setIsSent(false)}
                className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
              >
                Retour
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
