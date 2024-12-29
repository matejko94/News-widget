import {SdgConfiguration} from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG8_CONFIGURATION: SdgConfiguration = {
    id: 8,
    color: '#4CAE50',
    topics: [
        {
            name: 'Unemployment',
            wikiConcepts: ['Unemployment', 'Self-employment', 'Workforce'],
            openAlexCategory: 'Unemployment'
        },
        {
            name: 'Economic Development',
            wikiConcepts: ['Economic Growth', 'Informal Economy', 'Globalization'],
            openAlexCategory: 'Socioeconomic development'
        },
        {
            name: 'Sustainable Tourism',
            wikiConcepts: ['Sustainability', 'Sustainable tourism', 'Ecotourism'],
            openAlexCategory: 'Sustainable tourism'
        },
        {
            name: 'Entrepreneurship',
            wikiConcepts: ['Financial models', 'Business model', 'Innovation', 'Financial support'],
            openAlexCategory: 'Entrepreneurship'
        },
        {
            name: 'Labor Rights',
            wikiConcepts: ['Worker Rights', 'Labor Right', 'Labour law'],
            openAlexCategory: 'Laour law'
        },
        {
            name: 'Decent Work',
            wikiConcepts: ['Decent Work', 'Fundamental rights', 'Dignity of labour'],
            openAlexCategory: 'Division of labour'
        },
        {
            name: 'Economic inclusivity',
            wikiConcepts: ['Inclusive Development Index', 'Inclusive growth', 'Sustainable development'],
            openAlexCategory: 'Inclusive growth'
        },
        {
            name: 'Resource Efficiency',
            wikiConcepts: ['Resource efficiency', 'Resource intensity', 'Sustainability measurement'],
            openAlexCategory: 'Resource efficiency'
        },
        {
            name: 'Youth Employment',
            wikiConcepts: ['Youth Unemployment', 'Unemployment', 'Capacity building'],
            openAlexCategory: 'Youth unemployment'
        },
        {
            name: 'Corporate Social Responsibility',
            wikiConcepts: ['Corporate Social Responsibility', 'Conscious business', 'Corporate governance'],
            openAlexCategory: 'Corporate social responsibility'
        }
    ]
};
