export const environment = {
    isProduction: true,
    api: {
        news: {
            url:'https://midas.ijs.si/elasticsearch-sgd/media/_search',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        science: {
            url:'https://midas.ijs.si/elasticsearch-sgd/science/_search',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        innovation: {
            url:'https://midas.ijs.si/elasticsearch-sgd/innovations_v2/_search',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        science_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/science/_count',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        media_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/media/_count',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        policy_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/policy/_count',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        googleMaps: {
            apiKey: 'AIzaSyCdtOGarihoROHd5RzK4jBXdr6b8g6xit4'
        },
        tags: {
            url: 'https://news-widget.pages.dev/api/news/tags'
        }
    }
}
