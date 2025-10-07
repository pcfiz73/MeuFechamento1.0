
import React from 'react';
import type { Tab } from '../types';
import { TABS } from '../constants';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isSidebarOpen, setSidebarOpen }) => {
    return (
        <>
            <div className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 pt-8 z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        <i className="fas fa-motorcycle"></i>
                    </div>
                    <h1 className="text-2xl font-bold">MotoFinance</h1>
                    <p className="text-sm opacity-90">Seu parceiro financeiro</p>
                </div>
                <nav>
                    <ul>
                        {TABS.map((tab) => (
                            <li key={tab.id} className="mb-2">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab(tab.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 ease-in-out ${
                                        activeTab === tab.id
                                            ? 'bg-white/20 text-white'
                                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <i className={`fas ${tab.icon} w-6 mr-3 text-center`}></i>
                                    <span>{tab.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}
        </>
    );
};

export default Sidebar;
