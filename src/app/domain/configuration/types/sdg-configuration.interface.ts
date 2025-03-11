import { Topic } from './topic.interface';

export interface SdgConfiguration {
    id: number;
    color: string;
    erId: string;
    topics: Topic[];
    indicators: { name: string }[];
}
