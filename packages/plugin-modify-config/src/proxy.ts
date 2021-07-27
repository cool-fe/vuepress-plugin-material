/* eslint-disable no-param-reassign */
//https://github.com/webpack/webpack-dev-server

import { createProxyMiddleware } from 'http-proxy-middleware';

export default function setupProxyFeature(app: any, proxy: any): void {
  /**
   * Assume a proxy configuration specified as:
   * proxy: {
   *   'context': { options }
   * }
   * OR
   * proxy: {
   *   'context': 'target'
   * }
   */
  if (!Array.isArray(proxy)) {
    if (Object.prototype.hasOwnProperty.call(proxy, 'target')) {
      proxy = [proxy];
    } else {
      proxy = Object.keys(proxy).map((context) => {
        let proxyOptions;
        // For backwards compatibility reasons.
        const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

        if (typeof proxy[context] === 'string') {
          proxyOptions = {
            context: correctedContext,
            target: proxy[context]
          };
        } else {
          proxyOptions = { ...proxy[context] };
          proxyOptions.context = correctedContext;
        }

        proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

        return proxyOptions;
      });
    }
  }

  const getProxyMiddleware = (proxyConfig: any) => {
    const context = proxyConfig.context || proxyConfig.path;

    // It is possible to use the `bypass` method without a `target`.
    // However, the proxy middleware has no use in this case, and will fail to instantiate.
    if (proxyConfig.target) {
      return createProxyMiddleware(context, proxyConfig);
    } else {
      return null;
    }
  };
  /**
   * Assume a proxy configuration specified as:
   * proxy: [
   *   {
   *     context: ...,
   *     ...options...
   *   },
   *   // or:
   *   function() {
   *     return {
   *       context: ...,
   *       ...options...
   *     };
   *   }
   * ]
   */
  proxy.forEach((proxyConfigOrCallback: () => any) => {
    let proxyMiddleware: any;

    let proxyConfig =
      typeof proxyConfigOrCallback === 'function' ? proxyConfigOrCallback() : proxyConfigOrCallback;

    proxyMiddleware = getProxyMiddleware(proxyConfig);

    // eslint-disable-next-line consistent-return
    const handle = (req: any, res: any, next: any) => {
      if (typeof proxyConfigOrCallback === 'function') {
        const newProxyConfig = proxyConfigOrCallback();

        if (newProxyConfig !== proxyConfig) {
          proxyConfig = newProxyConfig;
          proxyMiddleware = getProxyMiddleware(proxyConfig);
        }
      }

      // - Check if we have a bypass function defined
      // - In case the bypass function is defined we'll retrieve the
      // bypassUrl from it otherwise bypassUrl would be null
      const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
      const bypassUrl = isByPassFuncDefined ? proxyConfig.bypass(req, res, proxyConfig) : null;

      if (typeof bypassUrl === 'boolean') {
        // skip the proxy
        req.url = null;
        next();
      } else if (typeof bypassUrl === 'string') {
        // byPass to that url
        req.url = bypassUrl;
        next();
      } else if (proxyMiddleware) {
        return proxyMiddleware(req, res, next);
      } else {
        next();
      }
    };

    app.use(handle);
    // Also forward error requests to the proxy so it can handle them.
    app.use((error: any, req: any, res: any, next: any) => handle(req, res, next));
  });
}
