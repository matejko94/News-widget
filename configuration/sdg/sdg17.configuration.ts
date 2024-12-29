import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG17_CONFIGURATION: SdgConfiguration = {
    id: 17,
    color: '#4CAE50',
    topics: [
        {
            name: 'Global Cooperation',
            wikiConcepts: [ 'International cooperation', 'Translational cooperation', 'Multilateral agreements', 'International agreements', 'Multilingual', 'Multicultural', 'Knowledge sharing', 'Public–private partnership', 'Strategic partnership' ],
            openAlexCategory: 'Cross-border cooperation'
        },
        {
            name: 'Financial Aid',
            wikiConcepts: ['Foreign Aid', 'Financial assistance (share purchase)', 'Funding of science'],
            openAlexCategory: 'Scholarship'
        },
        {
            name: 'Capacity Building',
            wikiConcepts: ['Development Cooperation', 'Capacity Building', 'Community capacity building'],
            openAlexCategory: 'Capacity building'
        },
        {
            name: 'Technology Transfer',
            wikiConcepts: ['Technology Transfer', 'Knowledge transfer', 'Transfer of learning'],
            openAlexCategory: 'Technology transfer'
        },
        {
            name: 'Stakeholder Engagement',
            wikiConcepts: ['Stakeholder engagement', 'Stakeholder engagement software', 'Stakeholder management'],
            openAlexCategory: 'Stakeholder engagement'
        },
        {
            name: 'Trade Policies',
            wikiConcepts: ['Commercial policy', 'Common commercial policy', 'Common Commercial Policy (EU)', 'Free trade agreement'],
            openAlexCategory: 'Trademark'
        },
        {
            name: 'International Partnerships',
            wikiConcepts: ['Global Partnerships', 'International development', 'International Partnership for Human Rights'],
            openAlexCategory: 'International investment'
        },
        {
            name: 'Policy Coherence',
            wikiConcepts: ['Policy coherence for development', 'Global governance'],
            openAlexCategory: 'Policy transfer'
        },
        {
            name: 'Resource Mobilization',
            wikiConcepts: ['Resource mobilization', 'Mass mobilization', 'Social movement organization'],
            openAlexCategory: 'Resource mobilization'
        },
        {
            name: 'Multilateral Agreements',
            wikiConcepts: ['Partnerships for Goals', 'Multilateralism', 'Multilateral treaty'],
            openAlexCategory: 'Multilateral trade negotiations'
        }
      ]
};
