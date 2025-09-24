(function () {
  try {
    if (window.__unreelSpaDetectorInstalled) return;

    let lastUrl = location.href;
    const notify = () => {
      const newUrl = location.href;
      if (newUrl !== lastUrl) {
        lastUrl = newUrl;
        const event = new CustomEvent('spa-url-change', { detail: { url: newUrl } });
        window.dispatchEvent(event);
      }
    };

    const wrap = (obj, key) => {
      const orig = obj[key].bind(obj);
      obj[key] = (...args) => {
        const ret = orig(...args);
        Promise.resolve().then(notify);
        return ret;
      };
    };

    wrap(history, 'pushState');
    wrap(history, 'replaceState');
    wrap(history, 'back');
    wrap(history, 'forward');
    wrap(history, 'go');

    window.addEventListener('popstate', notify);
    window.addEventListener('hashchange', notify);

    window.__unreelSpaDetectorInstalled = true;
  } catch (e) {
    // swallow errors; best-effort
  }
})();


