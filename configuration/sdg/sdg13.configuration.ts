import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG13_CONFIGURATION: SdgConfiguration = {
    id: 13,
    color: '#4CAE50',
    topics: [
        {
            name: 'Climate Change',
            wikiConcepts: ['Climate Change', 'Climate variability and change', 'United Nations Framework Convention on Climate Change'],
            openAlexCategory: 'Climate change'
        },
        {
            name: 'Carbon Footprint',
            wikiConcepts: ['Carbon Footprint', 'Greenhouse gas emissions', 'Carbon dioxide in Earth\'s atmosphere'],
            openAlexCategory: 'Carbon footprint'
        },
        {
            name: 'Climate Justice',
            wikiConcepts: ['Climate justice', 'Environmental justice', 'Environmental degradation'],
            openAlexCategory: 'Climate justice'
        },
        {
            name: 'Mitigation & Adaptation',
            wikiConcepts: ['Climate change adaptation', 'Effects of climate change', 'Environmental issues', 'Renewable Energy', 'Climate change mitigation'],
            openAlexCategory: 'Climate change adaptation'
        },
        {
            name: 'Climate Resilience',
            wikiConcepts: ['Climate resilience', 'Environmental protection', 'Ecological resilience'],
            openAlexCategory: 'Climate resilience'
        },
        {
            name: 'Global Warming',
            wikiConcepts: ['Global warming', 'Global surface temperature', 'Temperature anomaly'],
            openAlexCategory: 'Global warming'
        },
        {
            name: 'Climate Risk',
            wikiConcepts: ['Climate risk', 'Effects of climate change'],
            openAlexCategory: 'Climate risk'
        },
        {
            name: 'Climate Crisis',
            wikiConcepts: ['Climate crisis', 'Climate movement', 'Climate action'],
            openAlexCategory: 'Abrupt climate change'
        },
        {
            name: 'Climate Policy',
            wikiConcepts: ['European Green Deal', 'Paris Agreement', 'Conference of the parties'],
            openAlexCategory: 'Climate policy'
        },
        {
            name: 'Disaster Risk Reduction',
            wikiConcepts: ['Drought', 'Disaster risk reduction', 'Flood', 'Extreme weather'],
            openAlexCategory: 'Disaster risk reduction'
        }
    ]
};
