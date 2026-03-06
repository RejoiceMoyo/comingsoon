(function () {
  try {
    var s = document.createElement('style');
    s.textContent =
      'body::before{'
      + 'content:"";'
      + 'position:fixed;top:0;left:0;width:100%;height:100%;'
      + 'pointer-events:none;z-index:9999;'
      + 'background-image:url("/images/parchpaper.jpg");'
      + 'background-size:cover;'
      + 'opacity:0.22;'
      + 'mix-blend-mode:multiply;'
      + '}';
    document.head.appendChild(s);
  } catch (e) {}
})();
