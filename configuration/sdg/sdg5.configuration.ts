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
    ],
    indicators: [
        {
            name: 'Firms with female top manager',
        },
        {
            name: 'Firms with female participation in ownership',
        },
        {
            name: 'Female share of employment in senior and middle management',
        },
        {
            name: 'Demand for family planning satisfied by modern methods',
        },
        {
            name: 'Nondiscrimination clause mentions gender in the constitution',
        },
        {
            name: 'Proportion of women subjected to physical/sexual violence (last 12 months)',
        },
        {
            name: 'Women Business and the Law Index Score',
        },
        {
            name: 'Women own decisions on sexual relations, contraceptive use and reproductive health',
        },
        {
            name: 'Women who were first married by age 15',
        },
        {
            name: 'Women who were first married by age 18',
        },
    ]
};
