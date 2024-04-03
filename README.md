## Configuration
- open [src/config.ts](./src/config.ts) and check the configuration default values
- currently next queryParameters are supported:

```
googleMapsApiKey - google maps api key
elasticSearchUrl - elasticsearch url
sdg - sdg number (required)
mapHeight - map height
mapCircleRadiusFactor - map circle radius factor
lastDays - last days
delayMs - delay ms
zoom - initial map zoom
lat - initial map lat
lng - initial map lng
```

## Workers proxy
- currently worker caches requests for 1 day
- cache can be bypassed with hard reload `CTRL + SHIFT + R` or `CTRL + F5`
- full endpoint url with queryParameters can eb configured under `ENDPOINT` environment variable on [Cloudflare Dashboard](https://dash.cloudflare.com/79b2aa6fff4d448f6c2208509b887c37/pages/view/news-widget/settings/environment-variables)
