import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG5_CONFIGURATION: SdgConfiguration = {
    id: 5,
    color: '#4CAE50',
    topics: [
        {
            name: 'Women\'s Empowerment',
            wikiConcepts: ['Women\'s empowerment', 'Feminism', 'Gender Equality'],
            openAlexCategory: 'Women\'s empowerment'
        },
        {
            name: 'Equal Opportunities',
            wikiConcepts: ['Equal opportunity', 'Gender and education'],
            openAlexCategory: 'Gender equality'
        },
        {
            name: 'Gender Parity',
            wikiConcepts: ['Gender parity', 'Gender parity index', 'Gender inequality', 'Gender Mainstreaming'],
            openAlexCategory: 'Gender studies'
        },
        {
            name: 'Gender-based Violence',
            wikiConcepts: ['Gender-related violence', 'Sexual violence', 'Domestic Violence'],
            openAlexCategory: 'Gender violence'
        },
        {
            name: 'Women\'s Rights',
            wikiConcepts: ['Child marriage', 'Forced marriage', 'Human rights', 'Women\'s rights'],
            openAlexCategory: 'Women\'s studies'
        },
        {
            name: 'Sex Offense',
            wikiConcepts: ['Sexual Abuse', 'Sex Offense'],
            openAlexCategory: 'Sex offense'
        },
        {
            name: 'Pay Equity',
            wikiConcepts: ['Social inequality', 'Equal opportunity', 'Equal pay for equal work', 'Equal Pay'],
            openAlexCategory: 'Pay Equity'
        },
        {
            name: 'Discrimination',
            wikiConcepts: ['Disadvantaged', 'Discrimination', 'Discrimination based on skin tone', 'Discrimination against atheists', 'Ableism'],
            openAlexCategory: 'Social discrimination'
        },
        {
            name: 'Minorities',
            wikiConcepts: ['Sexual minority', 'Minority group', 'Minority influence', 'Social vulnerability', 'Social stratification'],
            openAlexCategory: 'Underrepresented Minority'
        },
        {
            name: 'Representation',
            wikiConcepts: ['Transgender', 'Transgender inequality', 'LGBTQ', 'Lesbian', 'Gay'],
            openAlexCategory: 'Transgender'
        }
    ]
};
