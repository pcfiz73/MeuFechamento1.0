
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-transform transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md hover:shadow-lg',
        secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
        success: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md hover:shadow-lg',
        danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md hover:shadow-lg',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
