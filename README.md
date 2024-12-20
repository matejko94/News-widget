## Local development
- install packages:
```bash
npm install
```
- start development server:
```bash
npm run start
```

`Do not forget about required queryParameters for each page`

### Example of news widget url
[http://localhost:4200/news?sdg=1&topicKey=d2781b6e-ac05-4b9e-a4c9-ec0d1a4c2d57](http://localhost:4200/news?sdg=1&topicKey=d2781b6e-ac05-4b9e-a4c9-ec0d1a4c2d57)

## Configuration
- to editing urls, keys etc. open [src/environment.ts](environment/environment.ts)

## Workers proxy
- currently worker caches requests for 1 day
- cache can be bypassed with hard reload `CTRL + SHIFT + R` or `CTRL + F5`
- full endpoint url with queryParameters can eb configured under `ENDPOINT` environment variable on [Cloudflare Dashboard](https://dash.cloudflare.com/79b2aa6fff4d448f6c2208509b887c37/pages/view/news-widget/settings/environment-variables)

