import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const hasError = !!error;
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-text-secondary font-inter tracking-wide uppercase">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-secondary pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`w-full px-4 py-2.5 rounded-lg border bg-white font-inter text-sm text-text-primary transition-all duration-200 outline-none
              ${leftIcon ? 'pl-10' : ''} 
              ${rightIcon || hasError || success ? 'pr-10' : ''}
              ${hasError 
                ? 'border-state-error focus:ring-2 focus:ring-state-error/20 bg-state-error/[0.02]' 
                : success
                ? 'border-state-success focus:ring-2 focus:ring-state-success/20 bg-state-success/[0.02]'
                : 'border-bg-border focus:border-primary-violet focus:ring-2 focus:ring-primary-violet/20 hover:border-text-secondary/40'
              } 
              disabled:opacity-50 disabled:bg-bg-surface disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          
          {(rightIcon || hasError || success) && (
            <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-state-error" />
              ) : success ? (
                <CheckCircle2 className="h-5 w-5 text-state-success" />
              ) : (
                <div className="text-text-secondary">{rightIcon}</div>
              )}
            </div>
          )}
        </div>
        
        {helperText && !hasError && (
          <p className="text-xs text-text-secondary font-inter">
            {helperText}
          </p>
        )}
        
        {hasError && (
          <p className="text-xs text-state-error font-medium font-inter">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
