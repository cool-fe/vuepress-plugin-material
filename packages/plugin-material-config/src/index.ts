/* eslint-disable @typescript-eslint/no-var-requires */
import { globby, path } from '@vuepress/shared-utils';

import PluginAutoMaterialDoc from '@winfe/plugin-auto-material-doc';
import PluginRegistryMaterialComponents from '@winfe/plugin-registry-material-components';

// import PluginDemoContainer from '@winfe/plugin-demo-container';

// eslint-disable-next-line node/no-missing-import
import { Context, PluginFunction } from 'vuepress-types';

// import setupProxyFeature from './proxy';

const geComponentsProxy = function geComponentsProxy(): { [key: string]: string } {
  const componentConfigs = globby.sync(['components/*/winfe.config.js'], {
    cwd: process.cwd(),
    absolute: true
  });

  const proxyObj = componentConfigs
    .map((config) => {
      // eslint-disable-next-line import/no-dynamic-require
      const pck = require(config);
      return pck?.proxy;
    })
    .filter((res) => res)
    .reduce((pre, cur) => {
      const keys = Object.keys(cur);
      for (let i = 0; i < keys.length; i++) {
        pre[keys[i]] = cur[keys[i]];
      }
      return pre;
    }, {});
  return proxyObj;
};

export default (_: unknown, context: Context): ReturnType<PluginFunction<void>> => ({
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
    /**
     * 只所以要在这里修改siteConfig是因为vuepress没有api可以修改proxy
     */
    const proxy = context?.siteConfig?.devServer?.proxy;
    const comProxys = geComponentsProxy();
    if (Object.keys(comProxys).length) {
      if (proxy) {
        Object.assign(proxy, geComponentsProxy());
      } else {
        if (context?.siteConfig?.devServer)
          context.siteConfig.devServer.proxy = geComponentsProxy();
        else context.siteConfig.devServer = { proxy: geComponentsProxy() };
      }
    }

    const componentPath = globby.sync(['components/*/node_modules'], {
      cwd: process.cwd(),
      onlyFiles: false,
      absolute: true
    });
    componentPath.forEach((compath) => config.resolve.modules.add(compath));
  }
});
