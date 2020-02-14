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
    hot: false,
    liveReload: false
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
