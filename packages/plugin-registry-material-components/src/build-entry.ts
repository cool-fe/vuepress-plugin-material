// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="json-templater.d.ts" />;
import render from 'json-templater/string';
import uppercamelcase from 'uppercamelcase';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const endOfLine = require('os').EOL;
//由于在不同的操作系统上换行符代表的ASCLL码不同，所以这里引用endOfLine

const IMPORT_TEMPLATE = "import {{name}} from '@com/{{package}}/index.js'"; // import导入template
const INSTALL_COMPONENT_TEMPLATE = '  {{name}}';
const MAIN_TEMPLATE = `
import Vue from 'vue'\n
{{include}}

const components = [
{{install}}
]

const install = function (Vue, opts = {}) {
  components.forEach(component => {
    if (component.notVueObj) {
      return
    }
    Vue.component(component.name, component)
  })
}

Vue.use({
  install,
{{list}}
})`;

export default async function generEntry(components: Map<string, string>): Promise<string> {
  const ComponentNames = Object.keys(components);
  const includeComponentTemplate: string[] = [];
  const installTemplate: string[] = [];
  const listTemplate: string[] = [];

  ComponentNames.forEach((name) => {
    const componentName = uppercamelcase(name);

    includeComponentTemplate.push(
      render(IMPORT_TEMPLATE, {
        name: componentName,
        package: name
      })
    );
    // 挂载到api上的方式不需要注册组件
    if ([''].indexOf(componentName) === -1) {
      installTemplate.push(
        render(INSTALL_COMPONENT_TEMPLATE, {
          name: componentName,
          component: name
        })
      );
    }
    listTemplate.push(`${componentName}`);
  });
  const template = render(MAIN_TEMPLATE, {
    include: includeComponentTemplate.join(endOfLine),
    install: installTemplate.join(`,${endOfLine}`),
    list: listTemplate.join(`,${endOfLine}`)
  });
  return template;
}
