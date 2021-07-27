import { compileTemplate } from '@vue/component-compiler-utils';
import compiler from 'vue-template-compiler';

function stripScript(content: string) {
  const result = content.match(/<(script)>([\s\S]+)<\/\1>/);
  return result && result[2] ? result[2].trim() : '';
}

function stripStyle(content: string) {
  const result = content.match(/<(style)\s*>([\s\S]+)<\/\1>/);
  return result && result[2] ? result[2].trim() : '';
}

// 编写例子时不一定有 template。所以采取的方案是剔除其他的内容
function stripTemplate(content: string) {
  // eslint-disable-next-line no-param-reassign
  content = content.trim();
  if (!content) {
    return content;
  }
  return content.replace(/<(script|style)[\s\S]+<\/\1>/g, '').trim();
}

function pad(source: string) {
  return source
    .split(/\r?\n/)
    .map((line: any) => `  ${line}`)
    .join('\n');
}

function genInlineComponentText(template: any, script: string) {
  // https://github.com/vuejs/vue-loader/blob/423b8341ab368c2117931e909e2da9af74503635/lib/loaders/templateLoader.js#L46
  const finalOptions = {
    source: `<div>${template}</div>`,
    filename: 'inline-component', // TODO：这里有待调整
    compiler
  };
  //@ts-ignore
  const compiled = compileTemplate(finalOptions);
  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach((tip) => {
      console.warn(tip);
    });
  }
  // errors
  if (compiled.errors && compiled.errors.length) {
    console.error(
      `\n  Error compiling template:\n${pad(compiled.source)}\n${compiled.errors
        .map((e) => `  - ${e}`)
        .join('\n')}\n`
    );
  }
  let demoComponentContent = `
    ${compiled.code}
  `;
  // todo: 这里采用了硬编码有待改进
  // eslint-disable-next-line no-param-reassign
  script = script.trim();
  if (script) {
    // eslint-disable-next-line no-param-reassign
    script = script.replace(/export\s+default/, 'const democomponentExport =');
  } else {
    // eslint-disable-next-line no-param-reassign
    script = 'const democomponentExport = {}';
  }
  demoComponentContent = `(function() {
    ${demoComponentContent}
    ${script}
    return {
      render,
      staticRenderFns,
      ...democomponentExport
    }
  })()`;
  return demoComponentContent;
}

export { stripScript, stripStyle, stripTemplate, genInlineComponentText };
