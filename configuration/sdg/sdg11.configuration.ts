import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG11_CONFIGURATION: SdgConfiguration = {
    id: 11,
    color: '#4CAE50',
    topics: [
        {
            name: 'Green Urban Planning',
            wikiConcepts: ['Urbanization', 'Smart Cities', 'Urban Planning', 'Green infrastructure', 'Green belt', 'Greenway (landscape)'],
            openAlexCategory: 'Urban Planning'
        },
        {
            name: 'Affordable Housing',
            wikiConcepts: ['Affordable Housing', 'Household income', 'Housing affordability index'],
            openAlexCategory: 'Affordable Housing'
        },
        {
            name: 'Sustainable Transport',
            wikiConcepts: ['Sustainable transport', 'Cyclability', 'Environmental impact of shipping', 'Public Transport', 'Shared transport', 'Journey planner'],
            openAlexCategory: 'Public Transport'
        },
        {
            name: 'Resilient Infrastructure',
            wikiConcepts: ['Sustainable urban infrastructure', 'Climate Resilient Infrastructure Development Facility', 'Critical infrastructure'],
            openAlexCategory: 'Critical infrastructure'
        },
        {
            name: 'Smart Cities',
            wikiConcepts: ['Smart city', 'Internet of things', 'Community-driven development', 'Community organization'],
            openAlexCategory: 'Smart city'
        },
        {
            name: 'Waste Management',
            wikiConcepts: ['Waste management', 'Biomedical waste', 'Sanitary engineering'],
            openAlexCategory: 'Solid waste management'
        },
        {
            name: 'Air Quality',
            wikiConcepts: ['Air pollution', 'Air quality index', 'Air Pollution Index'],
            openAlexCategory: 'Air quality index'
        },
        {
            name: 'Sustainable Communities',
            wikiConcepts: ['Sustainable community', 'Sustainable living', 'Sustainable Communities Plan', 'Green affordable housing'],
            openAlexCategory: 'Sustainable community'
        },
        {
            name: 'Disaster Preparedness',
            wikiConcepts: ['Flood management', 'Emergency management', 'Flood risk assessment'],
            openAlexCategory: 'Disaster preparedness'
        },
        {
            name: 'Sustainable Cities',
            wikiConcepts: ['Sustainable city', 'Smart city', 'Eco-cities'],
            openAlexCategory: 'Sustainable city'
        }
    ]
};
