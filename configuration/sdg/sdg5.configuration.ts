import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG5_CONFIGURATION: SdgConfiguration = {
    id: 5,
    color: '#4CAE50',
    topics: [
        {
            name: 'Women\'s Empowerment',
            wikiConcepts: ['Women\'s empowerment', 'Feminism', 'Gender Equality'],
        },
        {
            name: 'Equal Opportunities',
            wikiConcepts: ['Equal opportunity', 'Gender and education'],
        },
        {
            name: 'Gender Parity',
            wikiConcepts: ['Gender parity', 'Gender parity index', 'Gender inequality', 'Gender Mainstreaming'],
        },
        {
            name: 'Gender-based Violence',
            wikiConcepts: ['Gender-related violence', 'Sexual violence', 'Domestic Violence'],
        },
        {
            name: 'Women\'s Rights',
            wikiConcepts: ['Child marriage', 'Forced marriage', 'Human rights', 'Women\'s rights'],
        },
        {
            name: 'Sex Offense',
            wikiConcepts: ['Sexual Abuse', 'Sex Offense'],
        },
        {
            name: 'Pay Equity',
            wikiConcepts: ['Social inequality', 'Equal opportunity', 'Equal pay for equal work', 'Equal Pay'],
        },
        {
            name: 'Discrimination',
            wikiConcepts: ['Disadvantaged', 'Discrimination', 'Discrimination based on skin tone', 'Discrimination against atheists', 'Ableism'],
        },
        {
            name: 'Minorities',
            wikiConcepts: ['Sexual minority', 'Minority group', 'Minority influence', 'Social vulnerability', 'Social stratification'],
        },
        {
            name: 'Representation',
            wikiConcepts: ['Transgender', 'Transgender inequality', 'LGBTQ', 'Lesbian', 'Gay'],
        }
    ]
};
