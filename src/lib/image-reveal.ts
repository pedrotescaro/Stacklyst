/**
 * Platform-wide image reveal, inlined in <head> by the root layout.
 *
 * Browsers paint a downloading image progressively (top rows first, the rest
 * blank), which reads as the picture being "cut" from the top down. This hides
 * every <img> that is still downloading and fades it in, already decoded, once
 * it is complete. Images that are already cached or that fail to load are left
 * alone, so nothing can stay hidden.
 *
 * It runs before the body is parsed so server-rendered images are caught before
 * their first paint. The hide/fade uses the Web Animations API instead of
 * attributes or classes: changing the DOM before hydration would make React
 * report extra attributes on every image.
 *
 * Opt out on an image (or any ancestor) with data-image-reveal="off", e.g. for
 * sprite frames that swap src many times per second.
 */
export const imageRevealBootstrap = `
(function () {
  if (window.__stacklystImageReveal || !('animate' in Element.prototype)) return;
  window.__stacklystImageReveal = true;

  var holds = new WeakMap();
  var reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  function optedOut(img) {
    return !!(img.closest && img.closest('[data-image-reveal="off"]'));
  }

  function hide(img) {
    if (holds.has(img) || img.complete || optedOut(img)) return;
    try {
      holds.set(img, img.animate({ opacity: [0, 0] }, { duration: 1, fill: 'forwards' }));
    } catch (e) {}
    // The image may have finished between the check above and now.
    if (img.complete) reveal(img, false);
  }

  function reveal(img, animate) {
    var hold = holds.get(img);
    if (!hold) return;
    holds.delete(img);
    var show = function () {
      hold.cancel();
      if (!animate || !img.isConnected) return;
      var reduced = reducedMotion && reducedMotion.matches;
      try {
        img.animate(
          reduced
            ? { opacity: [0, 1] }
            : { opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)'] },
          { duration: reduced ? 160 : 460, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      } catch (e) {}
    };
    if (animate && img.decode && img.naturalWidth) img.decode().then(show, show);
    else show();
  }

  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') hide(node);
    else if (node.getElementsByTagName) {
      var images = node.getElementsByTagName('img');
      for (var i = 0; i < images.length; i++) hide(images[i]);
    }
  }

  // load/error do not bubble, but they can be captured at the document.
  document.addEventListener('load', function (event) {
    if (event.target && event.target.tagName === 'IMG') reveal(event.target, true);
  }, true);
  document.addEventListener('error', function (event) {
    if (event.target && event.target.tagName === 'IMG') reveal(event.target, false);
  }, true);

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      if (record.type === 'attributes') hide(record.target);
      else for (var j = 0; j < record.addedNodes.length; j++) scan(record.addedNodes[j]);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset'],
  });

  scan(document.documentElement);
})();
`;
