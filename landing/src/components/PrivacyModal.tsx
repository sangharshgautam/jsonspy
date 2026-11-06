import React from 'react';
import { ShieldCheck, X, Lock, Database, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">JSONSpy Privacy Policy</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">100% On-Device Local Data Guarantee</p>
          </div>
        </div>

        <div className="py-5 space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Lock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Local Processing Guarantee</h3>
              <p>
                JSONSpy operates <strong>100% locally on your machine or browser</strong>. All JSON payloads, schemas, formatting operations, and JSONata transformations are executed in-memory. Your JSON data is never transmitted to, stored on, or processed by any external cloud server.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            <EyeOff className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Zero Analytics & Tracking</h3>
              <p>
                We do not collect usage telemetry, tracking cookies, advertising identifiers, or analytics data. You can use JSONSpy in offline or air-gapped enterprise environments with complete privacy.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Local Storage</h3>
              <p>
                User interface preferences (such as Light/Dark Mode theme selection and recent workspace document tabs) are saved strictly inside your browser's local storage or application config files on your own device.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
