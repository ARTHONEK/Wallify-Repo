/*
  colorUtils.js
  Небольшие цветовые утилиты, общие для index.html и settings/index.html.
  Без зависимостей, работают с hex-строками ("#RRGGBB").
*/
(function (global) {
  "use strict";

  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16)
    ];
  }

  function rgbToHex(r, g, b) {
    function c(v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      var s = v.toString(16);
      return s.length === 1 ? "0" + s : s;
    }
    return "#" + c(r) + c(g) + c(b);
  }

  function luminance(hex) {
    var rgb = hexToRgb(hex);
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  }

  function mix(hexA, hexB, t) {
    var a = hexToRgb(hexA), b = hexToRgb(hexB);
    return rgbToHex(
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    );
  }

  function lighten(hex, amount) { return mix(hex, "#FFFFFF", amount); }
  function darken(hex, amount) { return mix(hex, "#000000", amount); }

  /* Раздвигает яркость цвета в диапазон [min, max] (0..1),
     сохраняя оттенок — используется, чтобы смягчить слишком
     тёмные/контрастные системные (Monet) тона. */
  function clampLuminance(hex, min, max) {
    var lum = luminance(hex);
    if (lum < min) {
      var t = min <= 0 ? 1 : Math.min(1, (min - lum) / Math.max(0.001, 1 - lum));
      return lighten(hex, t);
    }
    if (lum > max) {
      var t2 = Math.min(1, (lum - max) / Math.max(0.001, lum));
      return darken(hex, t2);
    }
    return hex;
  }

  function contrastOn(hex) {
    return luminance(hex) > 0.55 ? "#1B1C18" : "#FFFFFF";
  }

  global.ColorUtils = {
    hexToRgb: hexToRgb,
    rgbToHex: rgbToHex,
    luminance: luminance,
    mix: mix,
    lighten: lighten,
    darken: darken,
    clampLuminance: clampLuminance,
    contrastOn: contrastOn
  };
})(window);
