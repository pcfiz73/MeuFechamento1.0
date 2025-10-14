

import React, { useMemo } from 'react';
import type { FinanceData } from '../../types';
import Card from '../Card';
import { formatCurrency } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RelatoriosTabProps {
    financeData: FinanceData;
}

const ReportItem: React.FC<{ label: string, value: string | number, color?: string }> = ({ label, value, color }) => (
    <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-blue-500">
        <div className="text-sm text-slate-500 mb-1">{label}</div>
        <div className={`text-xl font-bold text-slate-800 ${color}`}>{value}</div>
    </div>
);

const RelatoriosTab: React.FC<RelatoriosTabProps> = ({ financeData }) => {
    const monthName = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const monthlyData = useMemo(() => {
        const now = new Date();
        const receitas = financeData.receitas.filter(r => {
            const d = new Date(r.data + 'T00:00:00');
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        // Fix: Renamed inner variable to `itemDate` to avoid redeclaring `d`, which is the parameter name.
        const despesas = financeData.despesas.filter(d => {
            const itemDate = new Date(d.data + 'T00:00:00');
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        });

        const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
        const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);

        const despesasPorCategoria: { [key: string]: number } = {};
        despesas.forEach(d => {
            despesasPorCategoria[d.descricao] = (despesasPorCategoria[d.descricao] || 0) + d.valor;
        });
        
        const topDespesas = Object.entries(despesasPorCategoria)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3);

        return {
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            topDespesas
        };
    }, [financeData]);

    const chartData = useMemo(() => {
        const dataByDay: { name: string, receita: number, despesa: number }[] = [];
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            dataByDay.push({ name: `Dia ${i}`, receita: 0, despesa: 0 });
        }

        financeData.receitas.forEach(r => {
            const d = new Date(r.data + 'T00:00:00');
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                dataByDay[d.getDate() - 1].receita += r.valor;
            }
        });

        // Fix: Renamed inner variable to `itemDate` to avoid redeclaring `d`, which is the parameter name.
        financeData.despesas.forEach(d => {
            const itemDate = new Date(d.data + 'T00:00:00');
            if (itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()) {
                dataByDay[itemDate.getDate() - 1].despesa += d.valor;
            }
        });

        return dataByDay;
    }, [financeData]);

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Relatório Mensal - {monthName}</h2>
            
            <Card>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Resumo Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ReportItem label="Total Receitas" value={formatCurrency(monthlyData.totalReceitas)} color="text-green-500" />
                    <ReportItem label="Total Despesas" value={formatCurrency(monthlyData.totalDespesas)} color="text-red-500" />
                    <ReportItem label="Saldo" value={formatCurrency(monthlyData.saldo)} color="text-blue-500" />
                </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-bold text-slate-800 mb-4">Receitas vs Despesas Diárias</h3>
                 <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="receita" fill="#4ade80" name="Receita" />
                            <Bar dataKey="despesa" fill="#f87171" name="Despesa" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Principais Despesas</h3>
                    <div className="space-y-4">
                        {monthlyData.topDespesas.map(([desc, valor]) => (
                            <ReportItem key={desc} label={desc} value={formatCurrency(valor)} />
                        ))}
                        {monthlyData.topDespesas.length === 0 && <p className="text-slate-500">Nenhuma despesa este mês.</p>}
                    </div>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Objetivos de Poupança</h3>
                    <div className="space-y-4">
                        {financeData.objetivos.map(obj => (
                             <ReportItem key={obj.id} label={obj.titulo} value={`${formatCurrency(obj.valor_atual)} / ${formatCurrency(obj.meta_valor)}`} />
                        ))}
                         {financeData.objetivos.length === 0 && <p className="text-slate-500">Nenhum objetivo cadastrado.</p>}
                    </div>
                </Card>
            </div>
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

export default RelatoriosTab;