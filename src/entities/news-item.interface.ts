export interface NewsItem {
  _id: string;
  _ignored: string[];
  _index: string;
  _score: number;
  _source: {
    SDG: string[];
    authors: any[];
    body: string;
    categories: {
      label: string;
      uri: string;
      wgt: number;
    }[];
    concepts: {
      label: Record<string, string>;
      uri: string;
      type: string;
      score: number;
    }[];
    dataType: string;
    date: string;
    dateTime: string;
    dateTimePub: string;
    eventUri: string;
    image: string;
    isDuplicate: boolean;
    lang: string;
    relevance: number;
    sentiment: number | null;
    sim: number;
    source: {
      uri: string;
      dataType: string;
      title: string;
      location: {
        country : {
          label: Record<string, string>;
          lat: number;
          long: number;
        }
      };
    };
    time: string;
    title: string;
    uri: string;
    url: string;
    wgt: number;
    year: string;
  }
}
