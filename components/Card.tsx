
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-md border border-slate-200 transition-shadow hover:shadow-lg ${className}`}>
            {children}
        </div>
    );
};

export default Card;
