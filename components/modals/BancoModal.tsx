import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { FinanceData, Banco } from '../../types';

interface BancoModalProps {
    isOpen: boolean;
    onClose: () => void;
    banco?: Banco;
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

const BancoModal: React.FC<BancoModalProps> = ({ isOpen, onClose, banco, updateFinanceData }) => {
    const [formData, setFormData] = useState({ nome: '', conta: '', saldo: '0' });

    useEffect(() => {
        if (banco) {
            setFormData({
                nome: banco.nome || '',
                conta: banco.conta || '',
                saldo: banco.saldo?.toString() || '0'
            });
        } else {
            setFormData({ nome: '', conta: '', saldo: '0' });
        }
    }, [banco, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const saldo = parseFloat(formData.saldo);
        if (isNaN(saldo)) return;

        updateFinanceData(prev => {
            if (banco) { // Editing
                return {
                    ...prev,
                    bancos: prev.bancos.map(b => b.id === banco.id ? { ...b, ...formData, saldo } : b)
                };
            } else { // Adding
                const newBanco: Banco = {
                    id: Date.now(),
                    ...formData,
                    saldo,
                };
                return { ...prev, bancos: [...prev.bancos, newBanco] };
            }
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={banco ? 'Editar Banco' : 'Adicionar Banco'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Banco</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Número da Conta</label>
                    <input type="text" name="conta" value={formData.conta} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Saldo (R$)</label>
                    <input type="number" name="saldo" value={formData.saldo} onChange={handleChange} step="0.01" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default BancoModal;