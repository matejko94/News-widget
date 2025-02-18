import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG12_CONFIGURATION: SdgConfiguration = {
    id: 12,
    color: '#4CAE50',
    topics: [
        {
            name: 'Waste Reduction',
            wikiConcepts: ['Food loss and waste', 'Waste minimisation'],
        },
        {
            name: 'Recycling',
            wikiConcepts: ['Recycling', 'Reuse', 'Recycling bin', 'Materials recovery facility'],
        },
        {
            name: 'Sustainable Production',
            wikiConcepts: ['Production Patterns', 'Responsible Business'],
        },
        {
            name: 'Sustainable Consumption',
            wikiConcepts: ['Sustainable consumption', 'Anti-consumerism', 'Collaborative consumption', 'Overconsumption (economics)'],
        },
        {
            name: 'Circular Economy',
            wikiConcepts: ['Circular Economy', 'Circular procurement', 'Durable good', 'Sustainable products'],
        },
        {
            name: 'Resource Efficiency',
            wikiConcepts: ['Resource efficiency', 'Ecological efficiency', 'Efficient energy use'],
        },
        {
            name: 'Consumer Awareness',
            wikiConcepts: ['Consumer behaviour', 'Advertising management', 'Predictive buying'],
        },
        {
            name: 'Supply Chains',
            wikiConcepts: ['Supply chain', 'Logistics', 'Supply chain management', 'Supply chain attack'],
        },
        {
            name: 'Eco-friendly Products',
            wikiConcepts: ['Ecological design', 'European Ecodesign Directive', 'Eco-innovation', 'Environmental design'],
        },
        {
            name: 'Environmental Impact Assessment',
            wikiConcepts: ['Environmental impact assessment', 'Environmental issues', 'Strategic environmental assessment'],
        }
    ]
};
