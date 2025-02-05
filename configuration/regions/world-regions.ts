import { Option } from '../../src/app/ui/components/menu/menu.component';

export const WorldBankRegions: (Option & { color: string })[] = [
    {
        label: 'East Asia & Pacific',
        value: 'WB_EAP',
        color: '#DF7F2F'
    },
    {
        label: 'Europe & Central Asia',
        value: 'WB_ECA',
        color: '#CE1249'
    },
    {
        label: 'Latin America & Caribbean',
        value: 'WB_LAC',
        color: '#3B933B'
    },
    {
        label: 'Middle East & North Africa',
        value: 'WB_MNA',
        color: '#803E84'
    },
    {
        label: 'North America',
        value: 'WB_NAR',
        color: '#58585A'
    },
    {
        label: 'South Asia',
        value: 'WB_SAR',
        color: '#2079B5'
    },
    {
        label: 'Sub-Saharan Africa',
        value: 'WB_SSA',
        color: '#FFCB08'
    }
] as const;

export function getRegionColor(region: string) {
    return WorldBankRegions.find(r => r.value === region)?.color ?? '#000000';
}
