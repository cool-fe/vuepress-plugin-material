// eslint-disable-next-line node/no-missing-import
import type { PluginFunction } from 'vuepress-types/types/plugin';

import { resolve } from 'path';
import genComponentsConf from './gen-components';
import generEntry from './build-entry';

interface IPluginOptions {
  componentsDir: string[];
}

let moduleId = 0;

module.exports = (options: IPluginOptions): ReturnType<PluginFunction<IPluginOptions>> => ({
  name: '@winfe/registry-components-plugin',
  multiple: true,
  alias: {
    '@com': resolve(process.cwd(), './components/')
  },
  async enhanceAppFiles() {
    const { componentsDir = [] } = options;
    const baseDirs = Array.isArray(componentsDir) ? componentsDir : [componentsDir];
    const confComponents = await genComponentsConf(baseDirs);
    const code = await generEntry(confComponents);

    return [
      {
        // eslint-disable-next-line no-plusplus
        name: `winex-components-${++moduleId}.js`,
        content: code
      }
    ];
  }
});
