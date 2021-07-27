import { globby, path } from '@vuepress/shared-utils';
//@ts-ignore
import fileListPugin from '@winning-plugin/webpack-filelist-export';
import PluginAutoMaterialDoc from '@winfe/plugin-auto-material-doc';
import PluginRegistryMaterialComponents from '@winfe/plugin-registry-material-components';
// import PluginDemoContainer from '@winfe/plugin-demo-container';

// eslint-disable-next-line node/no-missing-import
import type { PluginFunction } from 'vuepress-types/types/plugin';
import setupProxyFeature from './proxy';

const options = {
  extract: false,
  jsExternals: [],
  cssExternals: ['/winex/lib/finance-theme/index.css']
};

export default (): ReturnType<PluginFunction<void>> => ({
  name: '@winfe/plugin-modify-config',
  plugins: [
    [
      PluginRegistryMaterialComponents,
      {
        componentsDir: path.resolve(process.cwd(), './components')
      }
    ],
    [
      PluginAutoMaterialDoc,
      {
        sourceDir: process.cwd(),
        patterns: ['components/*/README.md', 'scaffolds/*/README.md']
      }
    ]
    // [PluginDemoContainer]
  ],
  chainWebpack: (config) => {
    config
      .plugin('filePlugin')
      .after('html')
      .use(fileListPugin, [
        {
          ...options
        }
      ]);

    const componentPath = globby.sync(['components/*/node_modules'], {
      cwd: process.cwd(),
      onlyFiles: false,
      absolute: true
    });
    componentPath.forEach((compath) => config.resolve.modules.add(compath));

    config.devServer.proxy({
      '/dsxdsx': {
        target: 'http://172.16.6.201',
        changeOrigin: true
      }
    });
  },

  beforeDevServer(app, server) {
    //@ts-ignore
    console.log('server', server.compiler.hooks);
  }
});
