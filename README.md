<p align="center">
  <img src="https://raw.githubusercontent.com/moduda-live/moduda-extension/master/public/icons/128.png" alt="moduda" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/moduda-live/moduda-extension/master/docs/img/sneak-1.png" alt="sneak_one" />
</p>

Chrome extension that sychronizes video playback between multiple parties, allowing you to watch your favorite stream, movie or just about any video on the internet with your mates in real time.

Code for the Node Websocket server (deployed on AWS ECS) can be found [here](https://github.com/moduda-app/moduda-server).

### Set up development locally

To start developing locally, first install the npm dependencies and start the project in development mode:

```bash
npm install
npm run dev
```

This will set up hot reloading so you will not have to compile after saving. To streamline development further, install [Extension Loader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en). Once you unpack the extension in `chrome://extensions`, saving any changes will automatically update the extension on your browser.

### Build for production

To bundle and minify code for production, simply run:

```bash
npm run build
```

...and the output will be available in the `dist` folder.

### Running tests

To run unit tests, simply run:

```bash
npm run test:unit
```

Similarly, to run `e2e` tests with `cypress`, run:

```bash
npm run test:e2e
```
