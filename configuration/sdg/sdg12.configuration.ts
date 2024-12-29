import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG12_CONFIGURATION: SdgConfiguration = {
    id: 12,
    color: '#4CAE50',
    topics: [
        {
            name: 'Waste Reduction',
            wikiConcepts: ['Food loss and waste', 'Waste minimisation'],
            openAlexCategory: 'Waste treatment'
        },
        {
            name: 'Recycling',
            wikiConcepts: ['Recycling', 'Reuse', 'Recycling bin', 'Materials recovery facility'],
            openAlexCategory: 'Waste recycling'
        },
        {
            name: 'Sustainable Production',
            wikiConcepts: ['Production Patterns', 'Responsible Business'],
            openAlexCategory: 'Sustainable production'
        },
        {
            name: 'Sustainable Consumption',
            wikiConcepts: ['Sustainable consumption', 'Anti-consumerism', 'Collaborative consumption', 'Overconsumption (economics)'],
            openAlexCategory: 'Sustainable consumption'
        },
        {
            name: 'Circular Economy',
            wikiConcepts: ['Circular Economy', 'Circular procurement', 'Durable good', 'Sustainable products'],
            openAlexCategory: 'Circular economy'
        },
        {
            name: 'Resource Efficiency',
            wikiConcepts: ['Resource efficiency', 'Ecological efficiency', 'Efficient energy use'],
            openAlexCategory: 'Environmental resource management'
        },
        {
            name: 'Consumer Awareness',
            wikiConcepts: ['Consumer behaviour', 'Advertising management', 'Predictive buying'],
            openAlexCategory: 'Sustainable community'
        },
        {
            name: 'Supply Chains',
            wikiConcepts: ['Supply chain', 'Logistics', 'Supply chain management', 'Supply chain attack'],
            openAlexCategory: 'Supply chain management'
        },
        {
            name: 'Eco-friendly Products',
            wikiConcepts: ['Ecological design', 'European Ecodesign Directive', 'Eco-innovation', 'Environmental design'],
            openAlexCategory: 'Ecodesign'
        },
        {
            name: 'Environmental Impact Assessment',
            wikiConcepts: ['Environmental impact assessment', 'Environmental issues', 'Strategic environmental assessment'],
            openAlexCategory: 'Environmental impact assessment'
        }
    ]
};
