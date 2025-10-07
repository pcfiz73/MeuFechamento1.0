import React, { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import type { Page } from '../types';
import { Home, PlusCircle, BarChart3, Target } from 'lucide-react';

const navItems = [
    { id: "dashboard" as Page, icon: Home, label: "Dashboard" },
    { id: "add" as Page, icon: PlusCircle, label: "Adicionar" },
    { id: "reports" as Page, icon: BarChart3, label: "Relatórios" },
    { id: "goals" as Page, icon: Target, label: "Metas" },
];

// FIX: Define props with an interface for better clarity and to resolve type inference issues in consuming components.
interface LayoutProps {
  children: React.ReactNode;
}

// FIX: Changed component definition to use React.FC to align with other components and resolve type error in App.tsx.
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activePage, navigate } = useContext(FinanceContext);

  const isActive = (pageId: Page) => activePage === pageId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      <style>{`
        :root {
          --primary-500: #3b82f6;
          --primary-600: #2563eb;
          --success-500: #10b981;
          --warning-500: #f59e0b;
          --error-500: #ef4444;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      
      <main className="p-4 md:p-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            
            return (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.id);
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  active ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <div className={`relative transition-transform ${active ? "transform scale-110 -translate-y-1" : ""}`}>
                  <Icon className={`w-6 h-6 ${active ? "stroke-[2.5]" : "stroke-2"}`} />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? "text-blue-600" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Layout;