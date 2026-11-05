'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInCard } from '@/components/ui/sign-in-card-2';
import { OtpInput } from '@/components/ui/otp-input';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertCircle, RefreshCw, ArrowLeft, Mail } from 'lucide-react';

type Step = 'email' | 'otp';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const interval = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [resendIn]);

  useEffect(() => {
    if (!resendSuccess) return;
    const timeout = setTimeout(() => setResendSuccess(false), 4000);
    return () => clearTimeout(timeout);
  }, [resendSuccess]);

  /** Étape 1 — demande du code : signInWithOtp envoie un e-mail contenant le code à 6 chiffres */
  const handleSignIn = async (value: string) => {
    setError(null);
    try {
      const { error: supabaseError, } = await supabase.auth.signInWithOtp({
        email: value,
      });

      if (supabaseError) throw supabaseError;

      setEmail(value);
      setCode('');
      setStep('otp');
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi du code.");
    }
  };

  /** Étape 2 — vérification du code et création de la session */
  const handleVerify = async (otpCode: string) => {
    if (!email || otpCode.length !== OTP_LENGTH) return;
    setError(null);
    setIsVerifying(true);
    try {
      const { error: supabaseError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (supabaseError) throw supabaseError;

      // La session est stockée par Supabase : /admin la lit via getSession()
      router.push('/admin');
    } catch (err: any) {
      setError('Code invalide ou expiré. Vérifiez le code reçu et réessayez.');
      setCode('');
      setIsVerifying(false);
    }
  };

  /** Nouveau code */
  const handleResend = async () => {
    if (resendIn > 0 || isResending) return;
    setError(null);
    setIsResending(true);
    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (supabaseError) throw supabaseError;

      setResendSuccess(true);
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi du code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.div
            key="auth-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <SignInCard onSignIn={handleSignIn} initialEmail={email} />
          </motion.div>
        ) : (
          <motion.div
            key="otp-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
          >
            {/* Background gradient effect (même style que la carte) */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

            {/* Top radial glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />

            {/* Glass card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 max-w-sm w-full bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.05] shadow-2xl space-y-6"
            >
              {/* Icône */}
              <div className="mx-auto w-14 h-14 rounded-full border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                  Entrez le code
                </h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Un code à {OTP_LENGTH} chiffres a été envoyé à
                  <br />
                  <span className="text-white/90 font-medium break-all">{email}</span>
                </p>
              </div>

              <OtpInput
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (error) setError(null);
                }}
                length={OTP_LENGTH}
                disabled={isVerifying}
                onComplete={handleVerify}
              />

              {/* Bouton vérifier */}
              <button
                onClick={() => handleVerify(code)}
                disabled={code.length !== OTP_LENGTH || isVerifying}
                className="w-full relative h-12 bg-white text-black font-bold rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wider hover:bg-white/90"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Vérifier le code'
                )}
              </button>

              {/* Actions secondaires */}
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setStep('email')}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Changer d&apos;e-mail
                </button>

                <button
                  onClick={handleResend}
                  disabled={resendIn > 0 || isResending}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                  {isResending ? (
                    <div className="w-3 h-3 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {resendIn > 0 ? `Renvoyer (${resendIn}s)` : 'Renvoyer le code'}
                </button>
              </div>

              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-green-400 text-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Un nouveau code a été envoyé
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast d'erreur global */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full flex items-center gap-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
