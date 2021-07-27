/**
 * 提供 ::: demo xxx ::: 语法，用于构建 markdown 中的示例
 */

import path from 'path';
// eslint-disable-next-line node/no-missing-import
import type { PluginFunction } from 'vuepress-types/types/plugin';
import renderDemoBlock from './common/render';
import demoBlockContainers from './common/containers';

export interface IPluginOptions {
  component: string;
  [key: string]: any;
}

module.exports = (
  options: IPluginOptions = { component: 'demo-block' }
): ReturnType<PluginFunction<IPluginOptions>> => ({
  name: '@winfe/plugin-demo-container',
  enhanceAppFiles: path.resolve(__dirname, 'enhanceAppFile.js'),
  chainMarkdown(config) {
    config.plugin('containers').use(demoBlockContainers(options)).end();
  },
  extendMarkdown: (md) => {
    const id = setInterval(() => {
      const render = md.render;
      if (typeof render.call(md, '') === 'object') {
        md.render = (...args) => {
          const result = render.call(md, ...args);
          const { template, script, style } = renderDemoBlock(result.html);
          result.html = template;
          result.dataBlockString = `${script}\n${style}\n${result.dataBlockString}`;
          return result;
        };
        clearInterval(id);
      }
    }, 10);
  }
});
