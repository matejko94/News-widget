export const environment = {
    isProduction: true,
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
            apiKey: 'AIzaSyCdtOGarihoROHd5RzK4jBXdr6b8g6xit4'
        },
        tags: {
            url: 'https://news-widget.pages.dev/api/news/tags'
        }
    }
}
