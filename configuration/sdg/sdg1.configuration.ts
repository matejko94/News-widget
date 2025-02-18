import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG1_CONFIGURATION: SdgConfiguration = {
    id: 1,
    color: '#E5243B',
    topics: [
        {
            name: 'Microfinance',
            wikiConcepts: [ 'Microfinance', 'Microcredit', 'Small business' ],
        },
        {
            name: 'Child Labour',
            wikiConcepts: [ 'Child labour', 'Child Labor Law', 'Child Support Grant', 'Child Welfare', 'Child Labor Regulations' ],
        },
        {
            name: 'Social Protection',
            wikiConcepts: [ 'Social protection', 'Social safety net', 'Welfare', 'Welfare spending', 'Social Exclusion' ],
        },
        {
            name: 'Financial Inclusion',
            wikiConcepts: [ 'Financial inclusion', 'Conditional Cash Transfer', 'Poverty Alleviation', 'Economic Resource AND Access', 'Inclusive Growth' ],
        },
        {
            name: 'Vulnerable Population',
            wikiConcepts: [ 'Third World', 'Low Income', 'Low Income Population', 'Vulnerable adult' ],
        },
        {
            name: 'Development Aid',
            wikiConcepts: [ 'Third World', 'Development Assistance Committee', 'Development Aid', 'Official Development Assistance', 'International Development', 'Human Development Index' ],
        },
        {
            name: 'Multidimensional Poverty',
            wikiConcepts: [ 'Economic inequality', 'Income inequality metrics', 'Multidimensional Poverty Index', 'Rural poverty', 'Energy poverty', 'Culture of poverty' ],
        },
        {
            name: 'Cost of Poverty',
            wikiConcepts: [ 'Cost of poverty', 'Social insurance', 'Social inequality', 'Poverty reduction' ],
        },
        {
            name: 'Poverty Line',
            wikiConcepts: [ 'Poverty Line', 'Poverty threshold', 'Gini index', 'Universal Basic Income', 'Global Poverty Line' ],
        },
    ]
}
