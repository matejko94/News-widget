import {SdgConfiguration} from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG8_CONFIGURATION: SdgConfiguration = {
    id: 8,
    color: '#4CAE50',
    topics: [
        {
            name: 'Unemployment',
            wikiConcepts: ['Unemployment', 'Self-employment', 'Workforce'],
        },
        {
            name: 'Economic Development',
            wikiConcepts: ['Economic Growth', 'Informal Economy', 'Globalization'],
        },
        {
            name: 'Sustainable Tourism',
            wikiConcepts: ['Sustainability', 'Sustainable tourism', 'Ecotourism'],
        },
        {
            name: 'Entrepreneurship',
            wikiConcepts: ['Financial models', 'Business model', 'Innovation', 'Financial support'],
        },
        {
            name: 'Labor Rights',
            wikiConcepts: ['Worker Rights', 'Labor Right', 'Labour law'],
        },
        {
            name: 'Decent Work',
            wikiConcepts: ['Decent Work', 'Fundamental rights', 'Dignity of labour'],
        },
        {
            name: 'Economic inclusivity',
            wikiConcepts: ['Inclusive Development Index', 'Inclusive growth', 'Sustainable development'],
        },
        {
            name: 'Resource Efficiency',
            wikiConcepts: ['Resource efficiency', 'Resource intensity', 'Sustainability measurement'],
        },
        {
            name: 'Youth Employment',
            wikiConcepts: ['Youth Unemployment', 'Unemployment', 'Capacity building'],
        },
        {
            name: 'Corporate Social Responsibility',
            wikiConcepts: ['Corporate Social Responsibility', 'Conscious business', 'Corporate governance'],
        }
    ]
};
