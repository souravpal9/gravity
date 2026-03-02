import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable dropdown menu.
 * Props:
 *   icon      – lucide icon component (default: MoreHorizontal)
 *   options   – [{ label, icon: LucideIcon, action, danger? }]
 *   btnClass  – extra classes for the trigger button
 */
const DropdownMenu = ({ icon: Icon = MoreHorizontal, options = [], btnClass = '' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { isDark } = useTheme();

    // Close when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={`p-2 rounded-xl transition-colors ${isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    } ${btnClass}`}
            >
                <Icon size={18} />
            </button>

            {open && (
                <div className={`absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                    {options.map((opt, i) => {
                        const OptIcon = opt.icon;
                        return (
                            <button
                                key={i}
                                onClick={() => { setOpen(false); opt.action?.(); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left
                                    ${opt.danger
                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                                        : isDark
                                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                    ${i > 0 ? `border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}` : ''}
                                `}
                            >
                                {OptIcon && <OptIcon size={15} className="flex-shrink-0" />}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;