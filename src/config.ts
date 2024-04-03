import { InjectionToken } from '@angular/core';

export interface AppConfig {
    googleMapsApiKey: string;
    uri: string;
    elasticSearchUrl: string
    tagEndpoint: string;
    apiKey: string;
    sdg: string;
    mapHeight: string;
    mapCircleRadiusFactor: number;
    lastDays: number;
    delayMs: number;
    zoom: number;
    lat: number;
    lng: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('token');

export function configFactory(): AppConfig {
    const params = new URLSearchParams(window.location.search);

    if (!params.has('sdg')) {
        throw new Error('missing sdg');
    }

    return {
        googleMapsApiKey: params.get('googleMapsApiKey') ?? "AIzaSyB1zNBJl3y5xfGP5wJ8ZSfrbvj8cX6FkEc",
        uri: params.get('uri') ?? "d2781b6e-ac05-4b9e-a4c9-ec0d1a4c2d57",
        elasticSearchUrl: params.get('elasticSearchUrl') ?? "https://qmidas.quintelligence.com/elasticsearch-sgd/media/_search",
        tagEndpoint: params.get('tagEndpoint') ?? "https://eventregistry.org/api/v1/article/getArticlesForTopicPage",
        apiKey: params.get("apiKey") ?? "f9afd6db-9425-4720-a89c-5de5af57c238",
        sdg: params.get('sdg')!,
        mapHeight: params.get('mapHeight') ?? "auto",
        mapCircleRadiusFactor: params.has('mapCircleRadiusFactor') ? Number(params.get('mapCircleRadiusFactor')) : 1.5,
        lastDays: params.has('lastDays') ? Number(params.get('lastDays')) : 31,
        delayMs: params.has('delayMs') ? Number(params.get('delayMs')) : 1500,
        zoom: params.has('zoom') ? Number(params.get('zoom')) : 2,
        lat: params.has('lat') ? Number(params.get('lat')) : 40,
        lng: params.has('lng') ? Number(params.get('lng')) : 0
    };
}
