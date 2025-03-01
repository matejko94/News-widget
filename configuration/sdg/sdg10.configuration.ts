import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG10_CONFIGURATION: SdgConfiguration = {
    id: 10,
    color: '#4CAE50',
    topics: [
        {
            name: 'Social Exclusion',
            wikiConcepts: [ 'Inclusive growth', 'Smart growth', 'Social exclusion' ],
        },
        {
            name: 'Discrimination',
            wikiConcepts: [ 'Discrimination', 'Antisemitism', 'Anti-Catholicism', 'Anti-Arabism' ],
        },
        {
            name: 'Income Inequality',
            wikiConcepts: [ 'Income distribution', 'Economic inequality', 'Distribution of wealth' ],
        },
        {
            name: 'Social Mobility',
            wikiConcepts: [ 'Social mobility', 'Social stigma', 'Spatial inequality' ],
        },
        {
            name: 'Equitable Opportunities',
            wikiConcepts: [ 'Social equity', 'Social justice', 'Social privilege' ],
        },
        {
            name: 'Migrants & Refugees',
            wikiConcepts: [ 'Migrant', 'Refugee', 'Diaspora', 'Asylum seeker' ],
        },
        {
            name: 'Developmental Disability',
            wikiConcepts: [ 'Disability', 'Assistive technology', 'Parents with disabilities', 'Developmental disability' ],
        },
        {
            name: 'Global Citizenship',
            wikiConcepts: [ 'Global citizenship', 'Transnationality', 'Transnationalism', 'Globalization' ],
        },
        {
            name: 'Fair Trade',
            wikiConcepts: [ 'Fair trade', 'Fairtrade International', 'Alter-globalization' ],
        },
        {
            name: 'Distribution of Wealth',
            wikiConcepts: [ 'Social inequality', 'Gini coefficient', 'Distribution of wealth' ],
        }
    ],
    indicators: [
        {
            name: 'Children in employment, female'
        },
        {
            name: 'Children in employment, male'
        },
        {
            name: 'Children in employment, total'
        },
        {
            name: 'Physicians'
        },
        {
            name: 'Proportion of people living below 50 percent of median income'
        },
        {
            name: 'Population spending above 10% of household consumption on healthcare'
        },
        {
            name: 'Population spending above 25% of household consumption on healthcare'
        },
        {
            name: 'Proportion of seats held by women in national parliaments'
        },
        {
            name: 'Proportion of time spent on unpaid domestic and care work, female'
        },
        {
            name: 'Proportion of time spent on unpaid domestic and care work, male'
        },
        {
            name: 'Tariff rate, applied, simple mean, all products'
        },
        {
            name: 'Tariff rate, applied, simple mean, manufactured products'
        },
        {
            name: 'Tariff rate, applied, simple mean, primary products'
        },
        {
            name: 'Tariff rate, applied, weighted mean, all products'
        },
        {
            name: 'Tariff rate, applied, weighted mean, manufactured products'
        },
        {
            name: 'Tariff rate, applied, weighted mean, primary products'
        },
        {
            name: 'Tax revenue (% GDP)'
        },
        {
            name: 'Tax revenue (LCU)'
        }
    ]
};
