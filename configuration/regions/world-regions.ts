import { Option } from '../../src/app/ui/components/menu/menu.component';

export const WorldBankRegions: (Option & { color: string })[] = [
    {
        label: 'Australia and New Zealand',
        value: 'Australia and New Zealand',
        color: '#00857e'
    },
    {
        label: 'Central and Southern Asia',
        value: 'Central and Southern Asia',
        color: '#588146'
    },
    {
        label: 'Eastern and South-Eastern Asia',
        value: 'Eastern and South-Eastern Asia',
        color: '#b26216'
    },
    {
        label: 'Europe and Northern America',
        value: 'Europe and Northern America',
        color: '#4c6a9c'
    },
    {
        label: 'Latin America and the Caribbean',
        value: 'Latin America and the Caribbean',
        color: '#873039'
    },
    {
        label: 'Northern Africa and Western Asia',
        value: 'Northern Africa and Western Asia',
        color: '#bb8f5b'
    },
    {
        label: 'Oceania',
        value: 'Oceania',
        color: '#39aaba'
    },
    {
        label: 'Sub-Saharan Africa',
        value: 'Sub-Saharan Africa',
        color: '#8c4469'
    },
] as const;

export function getRegionColor(region: string) {
    return WorldBankRegions.find(r => r.value === region)?.color ?? '#000000';
}
