// Change theme plugin

// import MergeLessPlugin from "antd-pro-merge-less";
// import AntDesignThemePlugin from "antd-theme-webpack-plugin";
import path from "path";

function getModulePackageName(module) {
  if (!module.context) return null;

  const nodeModulesPath = path.join(__dirname, "../node_modules/");
  if (module.context.substring(0, nodeModulesPath.length) !== nodeModulesPath) {
    return null;
  }

  const moduleRelativePath = module.context.substring(nodeModulesPath.length);
  const [moduleDirName] = moduleRelativePath.split(path.sep);
  let packageName = moduleDirName;
  // handle tree shaking
  if (packageName.match("^_")) {
    // eslint-disable-next-line prefer-destructuring
    packageName = packageName.match(/^_(@?[^@]+)/)[1];
  }
  return packageName;
}

export default config => {
  // pro 和 开发环境再添加这个插件
  // if (process.env.APP_TYPE === 'site' || process.env.NODE_ENV !== 'production') {
  //   // 将所有 less 合并为一个供 themePlugin使用
  //   const outFile = path.join(__dirname, '../.temp/xiaoyuanhao-manage-x.less');
  //   const stylesDir = path.join(__dirname, '../src/');

  //   config.plugin('merge-less').use(MergeLessPlugin, [
  //     {
  //       stylesDir,
  //       outFile,
  //     },
  //   ]);

  //   config.plugin('ant-design-theme').use(AntDesignThemePlugin, [
  //     {
  //       antDir: path.join(__dirname, '../node_modules/antd'),
  //       stylesDir,
  //       varFile: path.join(__dirname, '../node_modules/antd/lib/style/themes/default.less'),
  //       mainLessFile: outFile, //     themeVariables: ['@primary-color'],
  //       indexFileName: 'index.html',
  //       generateOne: true,
  //       lessUrl: 'https://gw.alipayobjects.com/os/lib/less.js/3.8.1/less.min.js',
  //     },
  //   ]);
  // }
  // optimize chunks
  if (process.env.APP_TYPE === 'site' || process.env.NODE_ENV !== 'production') {
    config.optimization
    .runtimeChunk(false) // share the same chunks across different modules
    .splitChunks({
      chunks: "async",
      maxInitialRequests: Infinity,
      minSize: 30000,
      minChunks: 2,
      cacheGroups: {
        vendors: {
          // 基本框架
          name: "vendors",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
       
      
      }
    });
    config.plugin("replace")
    .use(require("webpack").ContextReplacementPlugin)
    .tap(() => {
      return [/moment[/\\]locale$/, /zh-cn/];
    });
  } else {
    // share the same chunks across different modules
  
    config.optimization.runtimeChunk(false)
      .splitChunks({
        chunks: "async",
        name: "vendors",
        maxInitialRequests: Infinity,
        minSize: 30000,
        minChunks: 2,
        cacheGroups: {
        
        
          vendors: {
            // 基本框架
            name: "vendors",
            test: /[\\/]node_modules[\\/]/,
            chunks: "all",
            priority: 10
          },

          antdesigns: {
            name: "antdesigns",
            chunks: "all",
            test: /[\\/]node_modules[\\/](@ant-design|antd|antd-mobile)[\\/]/,
            priority: 11
          },
          "async-commons": {
            // 其余异步加载包
            chunks: "async",
            minChunks: 2,
            name: "async-commons",
            priority: 9,
            reuseExistingChunk: true,
          },
        }
      });
    config
      .plugin("replace")
      .use(require("webpack").ContextReplacementPlugin)
      .tap(() => {
        return [/moment[/\\]locale$/, /zh-cn/];
      });
  }
};
