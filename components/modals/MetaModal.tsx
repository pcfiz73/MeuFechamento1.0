
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { FinanceData, Metas } from '../../types';

interface MetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    metas: Metas;
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

const MetaModal: React.FC<MetaModalProps> = ({ isOpen, onClose, metas, updateFinanceData }) => {
    const [formData, setFormData] = useState(metas);

    useEffect(() => {
        if (isOpen) {
            setFormData(metas);
        }
    }, [isOpen, metas]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFinanceData(prev => ({
            ...prev,
            metas: formData
        }));
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Definir Metas de Receita">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Meta Diária (R$)</label>
                    <input type="number" name="diaria" value={formData.diaria} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Meta Semanal (R$)</label>
                    <input type="number" name="semanal" value={formData.semanal} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Meta Mensal (R$)</label>
                    <input type="number" name="mensal" value={formData.mensal} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary">Salvar Metas</Button>
                </div>
            </form>
        </Modal>
    );
};

export default MetaModal;
