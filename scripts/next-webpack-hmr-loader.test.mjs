// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { act, createElement, Suspense, use } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import deferEarlyHmrRefresh from './next-webpack-hmr-loader.cjs';

const require = createRequire(import.meta.url);

describe.skipIf(require('next/package.json').version !== '16.4.6')('Next Webpack HMR', () => {
  it('waits for router mount and delivers only the latest pending refresh', async () => {
    const filename = require.resolve('next/dist/client/components/use-action-queue');
    const source = deferEarlyHmrRefresh(readFileSync(filename, 'utf8'));
    const exports = {};
    runInNewContext(source, { exports, process, window, require: createRequire(filename) });
    const dispatch = vi.fn();
    const actionQueue = { state: {}, dispatch };
    const hydration = Promise.withResolvers();
    const root = createRoot(document.createElement('div'));
    const early = { type: 'hmr-refresh', signal: new AbortController().signal };
    const duringRender = { type: 'hmr-refresh', signal: new AbortController().signal };
    const afterMount = { type: 'hmr-refresh', signal: new AbortController().signal };
    const renderRouter = vi.fn();

    function Router() {
      exports.useActionQueue(actionQueue);
      renderRouter();
      use(hydration.promise);
      return null;
    }

    try {
      exports.dispatchAppRouterAction(early);
      await act(async () => root.render(createElement(Suspense, null, createElement(Router))));
      expect(renderRouter).toHaveBeenCalled();
      await act(async () => exports.dispatchAppRouterAction(duringRender));
      expect(dispatch).not.toHaveBeenCalled();

      await act(async () => hydration.resolve());
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0]).toBe(duringRender);
      await act(async () => exports.dispatchAppRouterAction(afterMount));
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[1][0]).toBe(afterMount);
    } finally {
      await act(async () => root.unmount());
    }
  });
});
