import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG10_CONFIGURATION: SdgConfiguration = {
    id: 10,
    color: '#4CAE50',
    topics: [
        {
            name: 'Social Exclusion',
            wikiConcepts: ['Inclusive growth', 'Smart growth', 'Social exclusion'],
            openAlexCategory: 'Social exclusion'
        },
        {
            name: 'Discrimination',
            wikiConcepts: ['Discrimination', 'Antisemitism', 'Anti-Catholicism', 'Anti-Arabism'],
            openAlexCategory: 'Social discrimination'
        },
        {
            name: 'Income Inequality',
            wikiConcepts: ['Income distribution', 'Economic inequality', 'Distribution of wealth'],
            openAlexCategory: 'Income inequality metrics'
        },
        {
            name: 'Social Mobility',
            wikiConcepts: ['Social mobility', 'Social stigma', 'Spatial inequality'],
            openAlexCategory: 'Social mobility'
        },
        {
            name: 'Equitable Opportunities',
            wikiConcepts: ['Social equity', 'Social justice', 'Social privilege'],
            openAlexCategory: 'Equal opportunity'
        },
        {
            name: 'Migrants & Refugees',
            wikiConcepts: ['Migrant', 'Refugee', 'Diaspora', 'Asylum seeker'],
            openAlexCategory: 'Migration studies'
        },
        {
            name: 'Developmental Disability',
            wikiConcepts: ['Disability', 'Assistive technology', 'Parents with disabilities', 'Developmental disability'],
            openAlexCategory: 'Disability discremination'
        },
        {
            name: 'Global Citizenship',
            wikiConcepts: ['Global citizenship', 'Transnationality', 'Transnationalism', 'Globalization'],
            openAlexCategory: 'Global citizenship'
        },
        {
            name: 'Fair Trade',
            wikiConcepts: ['Fair trade', 'Fairtrade International', 'Alter-globalization'],
            openAlexCategory: 'Fair trade'
        },
        {
            name: 'Distribution of Wealth',
            wikiConcepts: ['Social inequality', 'Gini coefficient', 'Distribution of wealth'],
            openAlexCategory: 'Distribution of wealth'
        }
    ]
};
