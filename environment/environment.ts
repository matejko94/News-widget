export const environment = {
    isProduction: false,
    api: {
        news: {
            url:'https://midas.ijs.si/elasticsearch-sgd/media_12_2024/_search',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        science: {
            url:'https://midas.ijs.si/elasticsearch-sgd/science/_search',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        innovation: {
            url:'https://midas.ijs.si/elasticsearch-sgd/innovations_v2/_search',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        science_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/science/_count',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        media_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/media_12_2024/_count',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        policy_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/policy/_count',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        googleMaps: {
            // TODO: change this to your own API key
            apiKey: 'AIzaSyCdtOGarihoROHd5RzK4jBXdr6b8g6xit4'
        },
        tags: {
            url: 'http://localhost:4000/api/news/tags'
        },
        topics: {
            url: 'http://localhost:4000/api/news/topics'
        }

    }
}
