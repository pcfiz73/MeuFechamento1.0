import React, { useState, useEffect, useContext } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { Banco } from '../../types';
import { FinanceContext } from '../../context/FinanceContext';

interface TransferenciaModalProps {
    isOpen: boolean;
    onClose: () => void;
    bancos: Banco[];
    origemId?: number;
}

const TransferenciaModal: React.FC<TransferenciaModalProps> = ({ isOpen, onClose, bancos, origemId }) => {
    const { transferirSaldo } = useContext(FinanceContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        origemId: origemId?.toString() || '',
        destinoId: '',
        valor: ''
    });

    useEffect(() => {
        if (isOpen) {
            const initialOrigemId = origemId?.toString() || (bancos.length > 0 ? bancos[0].id.toString() : '');
            const initialDestinoId = bancos.length > 1 && bancos.find(b => b.id.toString() !== initialOrigemId)
                ? bancos.find(b => b.id.toString() !== initialOrigemId)!.id.toString()
                // FIX: Added a fallback value to prevent undefined errors when there is only one bank.
                : '';

            setFormData({
                origemId: initialOrigemId,
                destinoId: initialDestinoId,
                valor: ''
            });
        }
    }, [isOpen, origemId, bancos]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const valor = parseFloat(formData.valor);
        const oId = parseInt(formData.origemId);
        const dId = parseInt(formData.destinoId);

        if (isNaN(valor) || isNaN(oId) || isNaN(dId) || oId === dId || valor <= 0) {
            alert('Dados inválidos. Verifique os bancos e o valor.');
            setIsSubmitting(false);
            return;
        }

        try {
            await transferirSaldo(oId, dId, valor);
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Falha ao realizar transferência.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transferência entre Bancos">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Origem</label>
                    <select name="origemId" value={formData.origemId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                        {bancos.map(b => <option key={b.id} value={b.id}>{b.nome} ({b.saldo.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Destino</label>
                    <select name="destinoId" value={formData.destinoId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                        {bancos.filter(b => b.id.toString() !== formData.origemId).map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                    <input type="number" name="valor" value={formData.valor} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="success" disabled={isSubmitting}>
                        {isSubmitting ? 'Transferindo...' : 'Transferir'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransferenciaModal;