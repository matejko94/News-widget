import { Topic } from './topic.interface';

export interface SdgConfiguration {
    id: number;
    color: string;
    topics: Topic[];
}
