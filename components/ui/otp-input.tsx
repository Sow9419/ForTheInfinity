'use client'

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from "@/lib/utils"

interface OtpInputProps {
  /** Code actuel (chaîne de chiffres, ex: "123456") */
  value: string;
  onChange: (value: string) => void;
  /** Nombre de chiffres (défaut: 6) */
  length?: number;
  disabled?: boolean;
  /** Appelé quand le code est complet (ex: auto-vérification) */
  onComplete?: (value: string) => void;
}

/**
 * Saisie d'un code OTP à N chiffres : une case par chiffre,
 * passage automatique au suivant, gestion du collage et des flèches.
 */
export function OtpInput({ value, onChange, length = 6, disabled, onComplete }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusDigit = (i: number) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const sanitize = (raw: string) => raw.replace(/\D/g, '');

  const handleChange = (i: number, raw: string) => {
    const digit = sanitize(raw).slice(-1);
    if (!digit) return; // effacement géré via Backspace

    const chars = [...digits];
    chars[i] = digit;
    const next = chars.join('');
    onChange(next);

    if (i < length - 1) {
      focusDigit(i + 1);
    }
    if (next.length === length) {
      onComplete?.(next);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focusDigit(i - 1);
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusDigit(Math.max(0, i - 1));
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusDigit(Math.min(length - 1, i + 1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clean = sanitize(e.clipboardData.getData('text'));
    if (!clean) return;
    const next = clean.slice(0, length);
    onChange(next);
    focusDigit(Math.min(next.length, length - 1));
    if (next.length === length) {
      onComplete?.(next);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {digits.map((digit, i) => (
        <motion.input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={digit}
          placeholder="·"
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={() => { setFocusedIndex(i); refs.current[i]?.select(); }}
          onBlur={() => setFocusedIndex(null)}
          whileFocus={{ scale: 1.05 }}
          className={cn(
            "h-12 w-11 rounded-lg bg-white/5 border text-center text-lg font-bold text-white",
            "placeholder:text-white/20 outline-none transition-all duration-200",
            "selection:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed",
            focusedIndex === i
              ? "border-white/30 bg-white/10"
              : "border-white/10 hover:bg-white/[0.07]"
          )}
        />
      ))}
    </div>
  );
}
