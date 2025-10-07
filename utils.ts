
import type { Receita, Despesa, Period } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(dateString: string): string {
  // Add T00:00:00 to ensure the date is parsed in the local timezone, not UTC
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function filterDataByPeriod<T extends { data: string }>(data: T[], period: Period): T[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (period) {
        case 'hoje':
            return data.filter(item => new Date(item.data + 'T00:00:00').getTime() === now.getTime());
        case 'semana': {
            const firstDayOfWeek = new Date(now);
            firstDayOfWeek.setDate(now.getDate() - now.getDay());
            firstDayOfWeek.setHours(0,0,0,0);
            
            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23,59,59,999);

            return data.filter(item => {
                const itemDate = new Date(item.data + 'T00:00:00');
                return itemDate >= firstDayOfWeek && itemDate <= lastDayOfWeek;
            });
        }
        case 'mes':
            return data.filter(item => {
                const itemDate = new Date(item.data + 'T00:00:00');
                return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            });
        default:
            return data;
    }
}
