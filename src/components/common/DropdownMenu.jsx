import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, MoreHorizontal } from 'lucide-react';

const DropdownMenu = ({
    trigger,
    options = [],
    align = 'right',
    icon: Icon = MoreVertical
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
                {trigger || <Icon size={18} />}
            </button>

            {isOpen && (
                <div className={`
                    absolute z-50 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden
                    ${align === 'right' ? 'right-0' : 'left-0'}
                    animate-in fade-in zoom-in-95 duration-200
                `}>
                    <div className="py-1">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    option.action();
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
                                    ${option.danger ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}
                                `}
                            >
                                {option.icon && <option.icon size={16} />}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
