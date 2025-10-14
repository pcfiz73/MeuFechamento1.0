import React, { useContext } from 'react';
import type { FinanceData, ModalState } from '../../types';
import Card from '../Card';
import Button from '../Button';
import { formatCurrency } from '../../utils';
import { FinanceContext } from '../../context/FinanceContext';

interface BancosTabProps {
    onOpenModal: (type: ModalState['type'], data?: any) => void;
}

const BankCard: React.FC<{
    banco: FinanceData['bancos'][0],
    onEdit: () => void,
    onDelete: () => void,
    onTransfer: () => void,
    onAddSaldo: () => void
}> = ({ banco, onEdit, onDelete, onTransfer, onAddSaldo }) => {
    return (
        <Card className="relative overflow-hidden pt-8">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{banco.nome}</h3>
                    <p className="text-sm text-slate-400">Conta: {banco.conta}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="text-slate-400 hover:text-blue-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i className="fas fa-edit"></i></button>
                    <button onClick={onDelete} className="text-slate-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i className="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-4">{formatCurrency(banco.saldo)}</div>
            <div className="flex gap-2">
                <button onClick={onTransfer} className="flex-1 py-2 px-3 text-sm bg-slate-100 hover:bg-blue-500 hover:text-white rounded-lg transition font-semibold">Transferir</button>
                <button onClick={onAddSaldo} className="flex-1 py-2 px-3 text-sm bg-slate-100 hover:bg-green-500 hover:text-white rounded-lg transition font-semibold">Adicionar Saldo</button>
            </div>
        </Card>
    );
};

const BancosTab: React.FC<BancosTabProps> = ({ onOpenModal }) => {
    const { financeData, deleteBanco, addSaldoBanco } = useContext(FinanceContext);
    
    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este banco?')) {
            return;
        }
        try {
            await deleteBanco(id);
        } catch (error: any) {
            console.error("Erro ao deletar banco:", error);
            alert(error.message || 'Falha ao excluir banco.');
        }
    };

    const handleAddSaldo = async (id: number, nome: string) => {
        const valorStr = prompt(`Adicionar saldo ao banco '${nome}':`);
        if (valorStr) {
            const valor = parseFloat(valorStr);
            if (!isNaN(valor) && valor > 0) {
                try {
                    await addSaldoBanco(id, valor);
                } catch (error) {
                    console.error("Erro ao adicionar saldo:", error);
                    alert('Falha ao adicionar saldo.');
                }
            } else {
                alert("Valor inválido.");
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Bancos</h2>
                    <p className="text-slate-500">Gerencie suas contas bancárias.</p>
                </div>
                <Button onClick={() => onOpenModal('banco')}>
                    <i className="fas fa-plus mr-2"></i> Adicionar Banco
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {financeData.bancos.map(banco => (
                    <BankCard
                        key={banco.id}
                        banco={banco}
                        onEdit={() => onOpenModal('banco', banco)}
                        onDelete={() => handleDelete(banco.id)}
                        onTransfer={() => onOpenModal('transferencia', { origemId: banco.id })}
                        onAddSaldo={() => handleAddSaldo(banco.id, banco.nome)}
                    />
                ))}
            </div>
            {financeData.bancos.length === 0 && (
                <Card className="text-center py-12">
                    <p className="text-slate-500">Nenhum banco cadastrado.</p>
                </Card>
            )}
             {/* Fix: Removed `jsx` prop from style tag as it's not a valid attribute in standard React with TypeScript. */}
             <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
            `}</style>
        </div>
    );
};

export default BancosTab;