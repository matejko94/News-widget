import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG7_CONFIGURATION: SdgConfiguration = {
    id: 7,
    color: '#4CAE50',
    erId: 'cc939003-2b43-4ffc-9fd5-1dcd9eb93256',
    topics: [
        {
            name: 'Renewable Energy',
            wikiConcepts: ['Renewable energy', 'Solar power', 'Wind energy'],
        },
        {
            name: 'Energy Access',
            wikiConcepts: ['Energy poverty', 'Energy for All', 'SolarAid', 'Sustainable Energy for All', 'Household energy insecurity'],
        },
        {
            name: 'Clean Energy',
            wikiConcepts: ['Sustainable energy', 'Energy poverty and cooking', 'Clean Energy Regulator'],
        },
        {
            name: 'Energy Efficiency',
            wikiConcepts: ['Energy efficiency', 'Energy efficiency implementation', 'Energy efficiency gap'],
        },
        {
            name: 'Energy Conservation',
            wikiConcepts: ['Energy conservation', 'Energy storage', 'Electric potential energy', 'Thermal energy storage'],
        },
        {
            name: 'Energy Recycling',
            wikiConcepts: ['Energy recycling', 'Energy recovery', 'Waste-to-energy', 'Waste heat'],
        },
        {
            name: 'Sustainable Energy',
            wikiConcepts: ['Sustainable energy', 'Carbon capture and storage', 'Energy transition'],
        },
        {
            name: 'Energy Infrastructure',
            wikiConcepts: ['Energy development', 'Energy demand management', 'Electric energy consumption'],
        },
        {
            name: 'Energy Policy',
            wikiConcepts: ['World energy resources', 'World energy supply and consumption', 'Energy policy'],
        },
        {
            name: 'Nuclear Energy',
            wikiConcepts: ['Nuclear power', 'Potential energy', 'Nuclear reactor', 'Nuclear energy policy'],
        }
    ],
    indicators: [
        {
            name: 'Access to clean fuels and technologies for cooking',
        },
        {
            name: 'Access to electricity',
        },
        {
            name: 'Access to electricity, rural',
        },
        {
            name: 'Access to electricity, urban',
        },
        {
            name: 'Coal rents',
        },
        {
            name: 'Energy intensity level of primary energy',
        },
        {
            name: 'Investment in energy with private participation',
        },
        {
            name: 'Natural gas rents',
        },
        {
            name: 'Oil rents',
        },
        {
            name: 'Renewable electricity output',
        },
    ]
};
