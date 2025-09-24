// spa-url-detector.js
(function () {
  const handleUrlChange = (url) => {
    window.dispatchEvent(new CustomEvent("spa-url-change", { detail: url }));
  };

  const pushState = history.pushState;
  const replaceState = history.replaceState;

  history.pushState = function (...args) {
    pushState.apply(this, args);
    handleUrlChange(window.location.href);
  };

  history.replaceState = function (...args) {
    replaceState.apply(this, args);
    handleUrlChange(window.location.href);
  };

  window.addEventListener("popstate", () => {
    handleUrlChange(window.location.href);
  });

  handleUrlChange(window.location.href);
})();
