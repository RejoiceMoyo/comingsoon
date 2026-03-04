(function () {
  try {
    var canvas = document.createElement('canvas');
    canvas.width = 250; canvas.height = 250;
    var ctx = canvas.getContext('2d');
    var img = ctx.createImageData(250, 250);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.floor(Math.random() * 255);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = Math.floor(Math.random() * 18) + 2;
    }
    ctx.putImageData(img, 0, 0);
    var s = document.createElement('style');
    s.textContent =
      'body::before{content:"";position:fixed;top:0;left:0;width:100%;height:100%;'
      + 'pointer-events:none;z-index:9999;'
      + 'background-image:url(' + canvas.toDataURL() + ');'
      + 'background-size:250px 250px;'
      + 'opacity:0.55;}';
    document.head.appendChild(s);
  } catch (e) {}
})();
