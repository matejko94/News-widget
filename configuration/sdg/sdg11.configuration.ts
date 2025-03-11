import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG11_CONFIGURATION: SdgConfiguration = {
    id: 11,
    color: '#4CAE50',
    erId: '66f79af1-579d-405e-a480-a93bdd7d0d89',
    topics: [
        {
            name: 'Green Urban Planning',
            wikiConcepts: ['Urbanization', 'Smart Cities', 'Urban Planning', 'Green infrastructure', 'Green belt', 'Greenway (landscape)'],
        },
        {
            name: 'Affordable Housing',
            wikiConcepts: ['Affordable Housing', 'Household income', 'Housing affordability index'],
        },
        {
            name: 'Sustainable Transport',
            wikiConcepts: ['Sustainable transport', 'Cyclability', 'Environmental impact of shipping', 'Public Transport', 'Shared transport', 'Journey planner'],
        },
        {
            name: 'Resilient Infrastructure',
            wikiConcepts: ['Sustainable urban infrastructure', 'Climate Resilient Infrastructure Development Facility', 'Critical infrastructure'],
        },
        {
            name: 'Smart Cities',
            wikiConcepts: ['Smart city', 'Internet of things', 'Community-driven development', 'Community organization'],
        },
        {
            name: 'Waste Management',
            wikiConcepts: ['Waste management', 'Biomedical waste', 'Sanitary engineering'],
        },
        {
            name: 'Air Quality',
            wikiConcepts: ['Air pollution', 'Air quality index', 'Air Pollution Index'],
        },
        {
            name: 'Sustainable Communities',
            wikiConcepts: ['Sustainable community', 'Sustainable living', 'Sustainable Communities Plan', 'Green affordable housing'],
        },
        {
            name: 'Disaster Preparedness',
            wikiConcepts: ['Flood management', 'Emergency management', 'Flood risk assessment'],
        },
        {
            name: 'Sustainable Cities',
            wikiConcepts: ['Sustainable city', 'Smart city', 'Eco-cities'],
        }
    ],
    indicators: [
        {
            name: 'Air transport, freight',
        },
        {
            name: 'Air transport, passengers carried',
        },
        {
            name: 'Households and NPISHs Final consumption expenditure',
        },
        {
            name: 'Individuals using the Internet',
        },
        {
            name: 'Investment in transport with private participation',
        },
        {
            name: 'PM2.5 air pollution, mean annual exposure',
        },
        {
            name: 'PM2.5 air pollution, population exposed to levels exceeding WHO guideline value',
        },
        {
            name: 'Railways, goods transported',
        },
        {
            name: 'Railways, passengers carried',
        },
        {
            name: 'Statistical Capacity score',
        }
    ]
};
