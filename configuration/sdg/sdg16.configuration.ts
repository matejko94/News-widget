import { SdgConfiguration } from '../../src/app/domain/configuration/types/sdg-configuration.interface';

export const SDG16_CONFIGURATION: SdgConfiguration = {
    id: 16,
    color: '#4CAE50',
    topics: [
        {
            name: 'Rule of Law',
            wikiConcepts: ['Rule of Law', 'Legal certainty', 'Public interest law'],
            openAlexCategory: 'Rule of law'
        },
        {
            name: 'Human Rights',
            wikiConcepts: ['Human Rights', 'Right to life', 'Freedom of speech', 'Right to education'],
            openAlexCategory: 'Human Rights'
        },
        {
            name: 'Justice',
            wikiConcepts: ['Justice', 'Court', 'Social contract'],
            openAlexCategory: 'Interactional justice'
        },
        {
            name: 'Transparency',
            wikiConcepts: ['Transparency (behavior)', 'Openness', 'Open standard'],
            openAlexCategory: 'Political culture'
        },
        {
            name: 'Anti-Corruption',
            wikiConcepts: ['Anti-Corruption', 'Regulatory compliance', 'Professional ethics', 'Bribery'],
            openAlexCategory: 'Political corruption'
        },
        {
            name: 'Strong Institutions',
            wikiConcepts: ['Strong AND Institution', 'Cultural reproduction', 'Value (ethics)'],
            openAlexCategory: 'Institutional research'
        },
        {
            name: 'Accountability',
            wikiConcepts: ['Accountability', 'Legal liability', 'Strict liability'],
            openAlexCategory: 'Accountability'
        },
        {
            name: 'Conflict Resolution',
            wikiConcepts: ['Peace', 'Conflict Resolution'],
            openAlexCategory: 'Conflict resolution'
        },
        {
            name: 'Autonomy',
            wikiConcepts: ['Freedom', 'Liberty', 'Autonomy'],
            openAlexCategory: 'Personal autonomy'
        },
        {
            name: 'Inclusivity',
            wikiConcepts: ['Social exclusion', 'Ostracism', 'Social rejection', 'Social vulnerability'],
            openAlexCategory: 'Inclusive growth'
        }
      ]
};
