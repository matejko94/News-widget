import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG9_CONFIGURATION: SdgConfiguration = {
    id: 9,
    color: '#4CAE50',
    topics: [
        {
            name: 'Infrastructure',
            wikiConcepts: ['Infrastructure', 'IT infrastructure', 'Data center', 'Business continuity planning'],
            openAlexCategory: 'Infrastructure planning'
        },
        {
            name: 'Industrialization',
            wikiConcepts: ['Industrialisation', 'Manufacturing', 'Technology life cycle'],
            openAlexCategory: 'Deindustrialization'
        },
        {
            name: 'Research & Development',
            wikiConcepts: ['Research and development', 'Technology demonstration', 'Prototype'],
            openAlexCategory: 'Research policy'
        },
        {
            name: 'Open Innovation',
            wikiConcepts: ['Innovation', 'Lean project management', 'Intellectual property', 'Open innovation'],
            openAlexCategory: 'Open innovation'
        },
        {
            name: 'Sustainable industries',
            wikiConcepts: ['Sustainable industries', 'Green infrastructure', 'Sustainable energy'],
            openAlexCategory: 'Green infrastructure'
        },
        {
            name: 'Technology Resilience',
            wikiConcepts: ['Cyber Resilience Act', 'Computer security', 'Cyber resilience'],
            openAlexCategory: 'Critical infrastructure protection'
        },
        {
            name: 'Industrial Policy',
            wikiConcepts: ['Software standard', 'Industrial Policy', 'Communication protocol'],
            openAlexCategory: 'Industrial policy'
        },
        {
            name: 'NaTech Accidents',
            wikiConcepts: ['Domino effect accident', 'Process safety', 'Transdisciplinarity'],
            openAlexCategory: 'Domino effect'
        },
        {
            name: 'Green Economy',
            wikiConcepts: ['Green economy', 'Ecological economics', 'Environmental economics'],
            openAlexCategory: 'Green economy'
        },
        {
            name: 'Digital Transformation',
            wikiConcepts: ['Artificial Intelligence', 'Digital transformation', 'Discovery-driven planning'],
            openAlexCategory: 'Digital transformation'
        }
    ]
};
