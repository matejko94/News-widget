import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG17_CONFIGURATION: SdgConfiguration = {
    id: 17,
    color: '#4CAE50',
    topics: [
        {
            name: 'Global Cooperation',
            wikiConcepts: [ 'International cooperation', 'Translational cooperation', 'Multilateral agreements', 'International agreements', 'Multilingual', 'Multicultural', 'Knowledge sharing', 'Public–private partnership', 'Strategic partnership' ],
        },
        {
            name: 'Financial Aid',
            wikiConcepts: ['Foreign Aid', 'Financial assistance (share purchase)', 'Funding of science'],
        },
        {
            name: 'Capacity Building',
            wikiConcepts: ['Development Cooperation', 'Capacity Building', 'Community capacity building'],
        },
        {
            name: 'Technology Transfer',
            wikiConcepts: ['Technology Transfer', 'Knowledge transfer', 'Transfer of learning'],
        },
        {
            name: 'Stakeholder Engagement',
            wikiConcepts: ['Stakeholder engagement', 'Stakeholder engagement software', 'Stakeholder management'],
        },
        {
            name: 'Trade Policies',
            wikiConcepts: ['Commercial policy', 'Common commercial policy', 'Common Commercial Policy (EU)', 'Free trade agreement'],
        },
        {
            name: 'International Partnerships',
            wikiConcepts: ['Global Partnerships', 'International development', 'International Partnership for Human Rights'],
        },
        {
            name: 'Policy Coherence',
            wikiConcepts: ['Policy coherence for development', 'Global governance'],
        },
        {
            name: 'Resource Mobilization',
            wikiConcepts: ['Resource mobilization', 'Mass mobilization', 'Social movement organization'],
        },
        {
            name: 'Multilateral Agreements',
            wikiConcepts: ['Partnerships for Goals', 'Multilateralism', 'Multilateral treaty'],
        }
    ],
    indicators: [
        {
            name: 'Average transaction cost of sending remittances from a specific country',
        },
        {
            name: 'Average transaction cost of sending remittances to a specific country',
        },
        {
            name: 'Foreign direct investment, net inflows (%GDP)',
        },
        {
            name: 'Foreign direct investment, net inflows (BoP $)',
        },
        {
            name: 'Merchandise trade',
        },
        {
            name: 'Methodology assessment of statistical capacity',
        },
        {
            name: 'Source data assessment of statistical capacity',
        }
      ]
};
