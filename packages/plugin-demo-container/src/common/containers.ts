import mdContainer from 'markdown-it-container';
import { IPluginOptions } from '../index';

type MarkdownItContainerParams = Parameters<typeof mdContainer>;

export default (options: IPluginOptions): typeof mdContainer => {
  const { component = 'demo-block' } = options;
  const componentName = component
    .replace(/^\S/, (s) => s.toLowerCase())
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase();
  return (md) => {
    md.use(mdContainer, 'demo', {
      validate(params) {
        return params.trim().match(/^demo\s*(.*)$/) || false;
      },
      render(tokens, idx) {
        const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
        if (tokens[idx].nesting === 1) {
          const description = m && m.length > 1 ? m[1] : '';
          const content = tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : '';
          const encodeOptionsStr = encodeURI(JSON.stringify(options));
          return `<${componentName} :options="JSON.parse(decodeURI('${encodeOptionsStr}'))">
            <template slot="demo"><!--pre-render-demo:${content}:pre-render-demo--></template>
            ${description ? `<div slot="description">${md.render(description)}</div>` : ''}
            <template slot="source">
          `;
        }
        return `</template></${componentName}>`;
      }
    } as MarkdownItContainerParams['2']);
  };
};
