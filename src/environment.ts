export const environment = {
    api: {
        news: {
            url:'https://midas.ijs.si/elasticsearch-sgd/media/_search',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        science: {
            url:'https://midas.ijs.si/elasticsearch-sgd/science/_search',
            auth: btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ')
        },
        googleMaps: {
            // TODO: change this to your own API key
            apiKey: 'AIzaSyB1zNBJl3y5xfGP5wJ8ZSfrbvj8cX6FkEc'
        },
        cloudTag: {
            url: 'https://news-widget.pages.dev/tags'
        }
    }
}
