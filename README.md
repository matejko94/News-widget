Run locally on http://172.17.0.2:3000/?SDG=1:
```shell
docker build -t news-widget .
```

```shell
docker run -d -p 3000:3000 news-widget
```

To build polyfills.js and main.js files:

first install dependencies:
```shell
  npm install
```

then build:
```shell
  npm run build
```

Go to /dist/news-widget
