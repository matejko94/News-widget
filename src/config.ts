import { InjectionToken } from '@angular/core';

export interface AppConfig {
    googleMapsApiKey: string;
    elasticSearchUrl: string
    sdg: string;
    mapHeight: string;
    topicKey: string;
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

    if (!params.has('topicKey')) {
        throw new Error('missing topicKey');
    }

    return {
        googleMapsApiKey: params.get('googleMapsApiKey') ?? "AIzaSyB1zNBJl3y5xfGP5wJ8ZSfrbvj8cX6FkEc",
        elasticSearchUrl: params.get('elasticSearchUrl') ?? "https://qmidas.quintelligence.com/elasticsearch-sgd/media/_search",
        sdg: params.get('sdg')!,
        topicKey: params.get('topicKey')!,
        mapHeight: params.get('mapHeight') ?? "auto",
        mapCircleRadiusFactor: params.has('mapCircleRadiusFactor') ? Number(params.get('mapCircleRadiusFactor')) : 1.5,
        lastDays: params.has('lastDays') ? Number(params.get('lastDays')) : 31,
        delayMs: params.has('delayMs') ? Number(params.get('delayMs')) : 1500,
        zoom: params.has('zoom') ? Number(params.get('zoom')) : 2,
        lat: params.has('lat') ? Number(params.get('lat')) : 40,
        lng: params.has('lng') ? Number(params.get('lng')) : 0
    };
}
