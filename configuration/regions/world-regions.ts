import { Option } from '../../src/app/ui/menu/menu.component';

export const WorldBankRegions: (Option & { color: string })[] = [
    {
        label: 'East Asia & Pacific',
        value: 'EAS',
        color: '#DF7F2F'
    },
    {
        label: 'Europe & Central Asia',
        value: 'ECS',
        color: '#CE1249'
    },
    {
        label: 'Latin America & Caribbean',
        value: 'LCN',
        color: '#3B933B'
    },
    {
        label: 'Middle East & North Africa',
        value: 'MEA',
        color: '#803E84'
    },
    {
        label: 'North America',
        value: 'NAC',
        color: '#58585A'
    },
    {
        label: 'South Asia',
        value: 'SAS',
        color: '#2079B5'
    },
    {
        label: 'Sub-Saharan Africa',
        value: 'SSF',
        color: '#FFCB08'
    }
] as const;
