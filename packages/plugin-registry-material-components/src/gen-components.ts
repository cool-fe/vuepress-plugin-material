import { fs, globby, datatypes } from '@vuepress/shared-utils';

const { isString } = datatypes;

async function resolveComponents(componentDir: string): Promise<string[]> {
  if (!fs.existsSync(componentDir)) {
    return [];
  }
  const files: string[] = await globby(['*/index.js'], { cwd: componentDir, matchBase: true });
  return files.map((file) => file.slice(0, -9));
}

export default async function genComponentsConf(baseDirs: string[]): Promise<Map<string, string>> {
  const conf = new Map();
  // eslint-disable-next-line no-restricted-syntax
  for (const baseDir of baseDirs) {
    if (!isString(baseDir)) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const files = (await resolveComponents(baseDir)) || [];
    files.forEach((componentName: string | number) => {
      conf[componentName] = `${baseDir}/${componentName}`;
    });
  }
  return conf;
}
