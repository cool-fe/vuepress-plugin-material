import { path, globby, sort } from '@vuepress/shared-utils';

// eslint-disable-next-line node/no-missing-import
import type { PluginFunction } from 'vuepress-types/types/plugin';

const MATER_WORKSPACE_PATTERNS = [
  'components/*/README.md',
  'scaffolds/*/README.md',
  'pages/*/README.md',
  'blocks/*/README.md'
];

interface IPluginOptions {
  patterns: string[];
  sourceDir: string;
  exclude: string;
}

interface ISlider {
  title: string;
  collapsable: boolean;
  $$key: 'components';
  children: string[];
}

const resolvePages = (patterns: string[], sourceDir: string, exclude: string) => {
  // eslint-disable-next-line no-param-reassign
  patterns = patterns || MATER_WORKSPACE_PATTERNS;
  patterns.push('!.vuepress', '!node_modules');
  if (exclude) {
    const outDirRelative = path.relative(sourceDir, exclude);
    if (!outDirRelative.includes('..')) {
      patterns.push(`!${outDirRelative}`);
    }
  }
  //@ts-ignore
  const pageFiles: string[] = sort(globby.sync(patterns, { cwd: sourceDir }));
  const addPages = pageFiles.map((relative) => {
    const filePath = path.resolve(sourceDir, relative);
    return {
      filePath,
      relative
    };
  });
  return addPages;
};

export default (options: IPluginOptions): ReturnType<PluginFunction<IPluginOptions>> => {
  const pages = resolvePages(options.patterns, options.sourceDir, options.exclude);
  return {
    name: '@winfe/plugin-auto-material-doc',
    // 添加page
    additionalPages: pages,
    // 把动态生成的页面添加到对应的slider的children中
    extendPageData($page) {
      const slider: ISlider[] = $page?._context?.siteConfig?.themeConfig?.sidebar;

      if ($page.path) {
        const [, sliderName] = $page.path.split('/');
        slider.forEach((sli) => {
          if (sli.$$key === sliderName) {
            if (
              !sli.children.includes($page.path) &&
              !sli.children.includes($page.path.slice(0, -5))
            ) {
              sli.children.push($page.path);
            }
          }
        });
      }
    }
  };
};
