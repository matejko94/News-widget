export const environment = {
    isProduction: true,
    api: {
        news: {
            url:'https://midas.ijs.si/elasticsearch-sgd/media/_search',
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
            url:'https://midas.ijs.si/elasticsearch-sgd/media/_count',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        policy_count: {
            url:'https://midas.ijs.si/elasticsearch-sgd/policy/_count',
            auth: btoa('elastic_searchpoint:dOYHbCMqM16+JKUPqFM4')
        },
        googleMaps: {
            // TODO: change this to your own API key
            apiKey: 'AIzaSyB1zNBJl3y5xfGP5wJ8ZSfrbvj8cX6FkEc'
        },
        tags: {
            url: 'https://news-widget.pages.dev/tags'
        }
    }
}
