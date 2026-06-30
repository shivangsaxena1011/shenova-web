import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-bg-border bg-white shadow-2xl md:mx-auto md:max-w-md"
          >
            {/* Drag Handle & Header */}
            <div className="flex flex-col items-center py-3 border-b border-bg-border/60">
              <div className="h-1.5 w-12 rounded-full bg-bg-border" />
              {title && (
                <h3 className="mt-3 text-base font-bold text-text-primary font-poppins">
                  {title}
                </h3>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-5 font-inter text-sm text-text-secondary">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
