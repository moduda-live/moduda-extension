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
    sidebar: "./src/sidebar/sidebar.ts"
  },
  chainWebpack: config => {
    const types = ["vue-modules", "vue"];
    types.forEach(type =>
      addStyleResource(config.module.rule("less").oneOf(type))
    );

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
            "content-script": ["src/content-scripts/content-script.ts"]
          }
        }
      }
    }
  }
};
