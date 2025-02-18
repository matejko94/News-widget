import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG11_CONFIGURATION: SdgConfiguration = {
    id: 11,
    color: '#4CAE50',
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
    ]
};
