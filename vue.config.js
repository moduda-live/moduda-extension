/* eslint-disable prettier/prettier */
module.exports = {
  pages: {
    popup: {
      template: "public/index.html",
      entry: "./src/popup/main.ts",
      title: "Popup",
    },
    sidebar: "./src/sidebar/main.ts",
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.ts",
        },
        contentScripts: {
          entries: {
            "content-script": ["src/content-scripts/content-script.ts"],
          },
        },
      },
    },
  },
  configureWebpack: {
    entry: {
      styles: "./src/assets/styles/sidebar_wrapper.less",
    },
  },
};
