/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
      public: '/',
      src: '/_dist_',
    },
    plugins: [
      '@snowpack/plugin-react-refresh',
      '@snowpack/plugin-dotenv',
      '@snowpack/plugin-typescript',
      ['@snowpack/plugin-sass'],
      // ["@snowpack/plugin-webpack", {
      //   outputPattern: {css: 'index.css', js: 'index.js', assets: '[name].[ext]'},
      //   manifest: true
      // }],
      ["@snowpack/plugin-optimize", {
        minifyJS: true,
        minifyCSS: true,
        minifyHTML: true,
        preloadModules: true,
        preloadCSS: true,
        target: 'es2015'
      }],
    ],
    install: [
      /* ... */
    ],
    // https://www.snowpack.dev/#config.installoptions
    installOptions: {
      // Default:false, or true when run with snowpack build
      // treeshake: true
      /* ... */
    },
    devOptions: {
      /* ... */
    },
    buildOptions: {
      out: 'build',
      clean: true,
      sourceMaps: true,
      /* ... */
    },
    proxy: {
      /* ... */
    },
    alias: {
      /* ... */
    },
};
