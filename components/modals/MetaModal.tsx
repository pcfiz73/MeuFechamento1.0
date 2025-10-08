import React, { useState, useEffect, useContext } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { Metas } from '../../types';
import { FinanceContext } from '../../context/FinanceContext';

interface MetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    metas: Metas;
}

const MetaModal: React.FC<MetaModalProps> = ({ isOpen, onClose, metas }) => {
    const { updateMetas } = useContext(FinanceContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(metas);

    useEffect(() => {
        if (isOpen) {
            setFormData(metas);
        }
    }, [isOpen, metas]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateMetas(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Falha ao salvar metas.");
        } finally {
            setIsSubmitting(false);
        }
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
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Metas'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default MetaModal;