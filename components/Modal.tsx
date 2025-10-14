
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-modal-slide-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-800 text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
            {/* Fix: Removed `jsx` prop from style tag as it's not a valid attribute in standard React with TypeScript. */}
            <style>{`
                @keyframes modal-slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-modal-slide-in {
                    animation: modal-slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Modal;