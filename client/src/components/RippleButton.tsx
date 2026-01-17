import React, { useState, useLayoutEffect } from 'react';
import { cn } from "@/lib/utils";

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'ghost' | 'icon';
}

export function RippleButton({ children, className, onClick, variant = 'primary', ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If e.defaultPrevented is true, we should still execute ripples but be aware.
    // However, the most likely issue is that onClick is being called but 
    // something in the parent is preventing it or the ripple is eating the click.
    
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    
    // Clean up ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    // Call the original onClick passed from props
    onClick?.(e);
  };

  const baseClasses = "relative overflow-hidden transition-all duration-200 focus:outline-none";
  const variants = {
    primary: "bg-[hsl(var(--tg-accent))] text-white hover:bg-[hsl(var(--tg-accent-hover))] rounded-xl px-4 py-2 font-medium shadow-sm active:translate-y-[1px]",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[hsl(var(--tg-text))] rounded-lg px-3 py-2",
    icon: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[hsl(var(--tg-text-secondary))] hover:text-[hsl(var(--tg-accent))] rounded-full p-2"
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], className)}
      onClick={addRipple}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
        {children}
      </span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-current opacity-20 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            // Centering the ripple expansion
            marginLeft: '-10px',
            marginTop: '-10px',
            padding: '10px', 
          }}
        />
      ))}
    </button>
  );
}
