import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG10_CONFIGURATION: SdgConfiguration = {
    id: 10,
    color: '#4CAE50',
    topics: [
        {
            name: 'Social Exclusion',
            wikiConcepts: ['Inclusive growth', 'Smart growth', 'Social exclusion'],
        },
        {
            name: 'Discrimination',
            wikiConcepts: ['Discrimination', 'Antisemitism', 'Anti-Catholicism', 'Anti-Arabism'],
        },
        {
            name: 'Income Inequality',
            wikiConcepts: ['Income distribution', 'Economic inequality', 'Distribution of wealth'],
        },
        {
            name: 'Social Mobility',
            wikiConcepts: ['Social mobility', 'Social stigma', 'Spatial inequality'],
        },
        {
            name: 'Equitable Opportunities',
            wikiConcepts: ['Social equity', 'Social justice', 'Social privilege'],
        },
        {
            name: 'Migrants & Refugees',
            wikiConcepts: ['Migrant', 'Refugee', 'Diaspora', 'Asylum seeker'],
        },
        {
            name: 'Developmental Disability',
            wikiConcepts: ['Disability', 'Assistive technology', 'Parents with disabilities', 'Developmental disability'],
        },
        {
            name: 'Global Citizenship',
            wikiConcepts: ['Global citizenship', 'Transnationality', 'Transnationalism', 'Globalization'],
        },
        {
            name: 'Fair Trade',
            wikiConcepts: ['Fair trade', 'Fairtrade International', 'Alter-globalization'],
        },
        {
            name: 'Distribution of Wealth',
            wikiConcepts: ['Social inequality', 'Gini coefficient', 'Distribution of wealth'],
        }
    ]
};
