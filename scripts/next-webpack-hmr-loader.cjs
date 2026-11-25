// Next 16.4.6 opens the HMR socket before the App Router commits. Keep the
// latest refresh until the router mounts so it can update React safely.
module.exports = function deferEarlyHmrRefresh(source) {
  const dispatch = 'function dispatchAppRouterAction(action) {';
  const indicator = 'const appDevRenderingIndicator = useAppDevRenderingIndicator();';

  if (!source.includes(dispatch) || !source.includes(indicator)) {
    throw new Error('The Next.js 16.4.6 Webpack HMR workaround no longer matches the router.');
  }

  return source
    .replace(
      dispatch,
      `let routerHasMounted = false;
let pendingHmrRefresh = null;
${dispatch}
    if (action.type === _routerreducertypes.ACTION_HMR_REFRESH && !routerHasMounted) {
        pendingHmrRefresh = action;
        return;
    }`
    )
    .replace(
      indicator,
      `${indicator}
        (0, _react.useEffect)(() => {
            routerHasMounted = true;
            const action = pendingHmrRefresh;
            pendingHmrRefresh = null;
            if (action) (0, _react.startTransition)(() => dispatchAppRouterAction(action));
            return () => { routerHasMounted = false; };
        }, []);`
    );
};
