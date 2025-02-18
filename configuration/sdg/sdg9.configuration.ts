import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG9_CONFIGURATION: SdgConfiguration = {
    id: 9,
    color: '#4CAE50',
    topics: [
        {
            name: 'Infrastructure',
            wikiConcepts: ['Infrastructure', 'IT infrastructure', 'Data center', 'Business continuity planning'],
        },
        {
            name: 'Industrialization',
            wikiConcepts: ['Industrialisation', 'Manufacturing', 'Technology life cycle'],
        },
        {
            name: 'Research & Development',
            wikiConcepts: ['Research and development', 'Technology demonstration', 'Prototype'],
        },
        {
            name: 'Open Innovation',
            wikiConcepts: ['Innovation', 'Lean project management', 'Intellectual property', 'Open innovation'],
        },
        {
            name: 'Sustainable industries',
            wikiConcepts: ['Sustainable industries', 'Green infrastructure', 'Sustainable energy'],
        },
        {
            name: 'Technology Resilience',
            wikiConcepts: ['Cyber Resilience Act', 'Computer security', 'Cyber resilience'],
        },
        {
            name: 'Industrial Policy',
            wikiConcepts: ['Software standard', 'Industrial Policy', 'Communication protocol'],
        },
        {
            name: 'NaTech Accidents',
            wikiConcepts: ['Domino effect accident', 'Process safety', 'Transdisciplinarity'],
        },
        {
            name: 'Green Economy',
            wikiConcepts: ['Green economy', 'Ecological economics', 'Environmental economics'],
        },
        {
            name: 'Digital Transformation',
            wikiConcepts: ['Artificial Intelligence', 'Digital transformation', 'Discovery-driven planning'],
        }
    ]
};
