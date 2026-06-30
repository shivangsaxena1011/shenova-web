import React from 'react';
import { motion } from 'framer-motion';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label className={`flex items-start justify-between cursor-pointer gap-4 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-semibold text-text-primary font-poppins">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-secondary font-inter">
              {description}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <motion.div
          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
            checked ? 'bg-primary-violet' : 'bg-bg-border'
          }`}
          animate={{
            backgroundColor: checked ? '#7C3AED' : '#E5E7EB',
          }}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow-md"
            layout
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
            animate={{
              x: checked ? 20 : 0,
            }}
          />
        </motion.div>
      </div>
    </label>
  );
};
