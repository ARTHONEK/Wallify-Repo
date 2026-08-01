/*
  wallify-m3.js
  Локальная реализация поведения M3-слайдера для тестирования
  вне приложения Wallify (заливка трека по значению). Сам halo
  теперь на чистом CSS (:active), тут только подстраховка от
  зависшего фокуса на некоторых WebView.
*/
(function () {
  "use strict";

  function updateSliderFill(input) {
    var min = parseFloat(input.min || "0");
    var max = parseFloat(input.max || "100");
    var val = parseFloat(input.value || "0");
    var pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
    input.style.setProperty("--wallify-m3-percent", pct + "%");
  }

  function wireSlider(input) {
    if (input.__wallifyWired) return;
    input.__wallifyWired = true;
    updateSliderFill(input);

    // Defensive: on some WebViews the focus ring/glow persists after
    // release until the element loses focus. Blurring right after
    // release makes sure it clears immediately instead of lingering
    // until the settings screen is reopened.
    function release() { input.blur(); }
    input.addEventListener("pointerup", release);
    input.addEventListener("pointercancel", release);
    input.addEventListener("touchend", release);
  }

  document.addEventListener("input", function (e) {
    if (e.target && e.target.getAttribute && e.target.getAttribute("data-wallify-m3") === "slider") {
      updateSliderFill(e.target);
    }
  });

  function initAll() {
    var sliders = document.querySelectorAll('[data-wallify-m3="slider"]');
    for (var i = 0; i < sliders.length; i++) wireSlider(sliders[i]);
  }

  document.addEventListener("DOMContentLoaded", initAll);
  if (document.readyState !== "loading") initAll();
})();
