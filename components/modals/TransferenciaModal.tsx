
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { FinanceData, Banco } from '../../types';

interface TransferenciaModalProps {
    isOpen: boolean;
    onClose: () => void;
    bancos: Banco[];
    origemId?: number;
    updateFinanceData: (updater: (prev: FinanceData) => FinanceData) => void;
}

const TransferenciaModal: React.FC<TransferenciaModalProps> = ({ isOpen, onClose, bancos, origemId, updateFinanceData }) => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(formData.valor);
        const oId = parseInt(formData.origemId);
        const dId = parseInt(formData.destinoId);

        if (isNaN(valor) || isNaN(oId) || isNaN(dId) || oId === dId) {
            alert('Dados inválidos. Verifique os bancos e o valor.');
            return;
        }

        const bancoOrigem = bancos.find(b => b.id === oId);
        if (!bancoOrigem || bancoOrigem.saldo < valor) {
            alert('Saldo insuficiente no banco de origem.');
            return;
        }

        updateFinanceData(prev => {
            const newBancos = prev.bancos.map(b => {
                if (b.id === oId) return { ...b, saldo: b.saldo - valor };
                if (b.id === dId) return { ...b, saldo: b.saldo + valor };
                return b;
            });
            return { ...prev, bancos: newBancos };
        });

        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transferência entre Bancos">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Banco de Origem</label>
                    <select name="origemId" value={formData.origemId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required>
                        {bancos.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
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
                    <Button type="submit" variant="success">Transferir</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransferenciaModal;
