import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG7_CONFIGURATION: SdgConfiguration = {
    id: 7,
    color: '#4CAE50',
    topics: [
        {
            name: 'Renewable Energy',
            wikiConcepts: ['Renewable energy', 'Solar power', 'Wind energy'],
            openAlexCategory: 'Renewable energy'
        },
        {
            name: 'Energy Access',
            wikiConcepts: ['Energy poverty', 'Energy for All', 'SolarAid', 'Sustainable Energy for All', 'Household energy insecurity'],
            openAlexCategory: 'Energy poverty'
        },
        {
            name: 'Clean Energy',
            wikiConcepts: ['Sustainable energy', 'Energy poverty and cooking', 'Clean Energy Regulator'],
            openAlexCategory: 'Clean energy'
        },
        {
            name: 'Energy Efficiency',
            wikiConcepts: ['Energy efficiency', 'Energy efficiency implementation', 'Energy efficiency gap'],
            openAlexCategory: 'Energy resources'
        },
        {
            name: 'Energy Conservation',
            wikiConcepts: ['Energy conservation', 'Energy storage', 'Electric potential energy', 'Thermal energy storage'],
            openAlexCategory: 'Energy conservation'
        },
        {
            name: 'Energy Recycling',
            wikiConcepts: ['Energy recycling', 'Energy recovery', 'Waste-to-energy', 'Waste heat'],
            openAlexCategory: 'Energy recovery'
        },
        {
            name: 'Sustainable Energy',
            wikiConcepts: ['Sustainable energy', 'Carbon capture and storage', 'Energy transition'],
            openAlexCategory: 'Sustainable energy'
        },
        {
            name: 'Energy Infrastructure',
            wikiConcepts: ['Energy development', 'Energy demand management', 'Electric energy consumption'],
            openAlexCategory: 'Energy development'
        },
        {
            name: 'Energy Policy',
            wikiConcepts: ['World energy resources', 'World energy supply and consumption', 'Energy policy'],
            openAlexCategory: 'Energy policy'
        },
        {
            name: 'Nuclear Energy',
            wikiConcepts: ['Nuclear power', 'Potential energy', 'Nuclear reactor', 'Nuclear energy policy'],
            openAlexCategory: 'Nuclear energy policy'
        }
    ]
};
