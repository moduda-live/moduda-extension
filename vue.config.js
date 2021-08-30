/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [path.resolve(__dirname, "./src/assets/styles/variables.less")]
    });
}

module.exports = {
  pages: {
    popup: {
      template: "public/index.html",
      entry: "./src/popup/popup.ts",
      title: "Popup"
    },
    join: {
      template: "public/index.html",
      entry: "./src/join/join.ts",
      title: "Join"
    },
    sidebar: "./src/main-app/sidebar.ts"
  },
  filenameHashing: false,
  chainWebpack: config => {
    const types = ["vue-modules", "vue"];
    types.forEach(type =>
      addStyleResource(config.module.rule("less").oneOf(type))
    );

    config.devtool = "cheap-module-eval-sourcemap";
    config.productionSourceMap = true;

    // config.module
    //   .rule("worklet")
    //   .test(/Worklet.ts$/)
    //   .use("worklet-loader")
    //   .loader("worklet-loader")
    //   .end();
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.ts"
        },
        contentScripts: {
          entries: {
            "content-script": ["src/content-script.ts"]
          }
        }
      },
      artifactFilename: ({ name, version, mode }) => {
        if (mode === "production") {
          return `${name}-v${version}-${process.env.BROWSER}.zip`;
        }
        return `${name}-v${version}-${process.env.BROWSER}-${mode}.zip`;
      },
      manifestTransformer: manifest => {
        if (process.env.NODE_ENV === "production") {
          manifest.content_scripts[0] = {
            ...manifest.content_scripts[0],
            css: ["css/content-script.css"]
          };
        }
        return manifest;
      }
    }
  }
};
