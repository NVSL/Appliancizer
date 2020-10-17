// vue.config.js
// module.exports = {
//   chainWebpack: config => {
//     config.plugins.delete("hmr");
//     // config.plugin("copy").tap(options => {
//     //   console.log(options);
//     //   // options[0][0].ignore.push({ glob: "public/userapps/**/*" });
//     //   // console.log(options[0][0].ignore);
//     //   return options;
//     // });
//   }
// };

// Remove hot reload (issue with public/userapps app reloaded when changes)
module.exports = {
  devServer: {
    watchOptions: {
      // Enable re-build when the a file changes.
      aggregateTimeout: 500, // Time between rebuilds
      poll: 1500, // Poll every second to prevent high-CPU
      ignored: ["node_modules/", "src/"]
    },
    liveReload: false // Reload the webpage manually
  }
};

// module.exports = {
//   chainWebpack: config => {
//     config.module
//       .rule('vue')
//       .use('vue-loader')
//         .loader('vue-loader')
//         .tap(options => {
//           options.hotReload = false
//           return options
//         })
//   }
// }
