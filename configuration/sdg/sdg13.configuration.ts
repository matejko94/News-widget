import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG13_CONFIGURATION: SdgConfiguration = {
    id: 13,
    color: '#4CAE50',
    topics: [
        {
            name: 'Climate Change',
            wikiConcepts: ['Climate Change', 'Climate variability and change', 'United Nations Framework Convention on Climate Change'],
        },
        {
            name: 'Carbon Footprint',
            wikiConcepts: ['Carbon Footprint', 'Greenhouse gas emissions', 'Carbon dioxide in Earth\'s atmosphere'],
        },
        {
            name: 'Climate Justice',
            wikiConcepts: ['Climate justice', 'Environmental justice', 'Environmental degradation'],
        },
        {
            name: 'Mitigation & Adaptation',
            wikiConcepts: ['Climate change adaptation', 'Effects of climate change', 'Environmental issues', 'Renewable Energy', 'Climate change mitigation'],
        },
        {
            name: 'Climate Resilience',
            wikiConcepts: ['Climate resilience', 'Environmental protection', 'Ecological resilience'],
        },
        {
            name: 'Global Warming',
            wikiConcepts: ['Global warming', 'Global surface temperature', 'Temperature anomaly'],
        },
        {
            name: 'Climate Risk',
            wikiConcepts: ['Climate risk', 'Effects of climate change'],
        },
        {
            name: 'Climate Crisis',
            wikiConcepts: ['Climate crisis', 'Climate movement', 'Climate action'],
        },
        {
            name: 'Climate Policy',
            wikiConcepts: ['European Green Deal', 'Paris Agreement', 'Conference of the parties'],
        },
        {
            name: 'Disaster Risk Reduction',
            wikiConcepts: ['Drought', 'Disaster risk reduction', 'Flood', 'Extreme weather'],
        }
    ]
};
