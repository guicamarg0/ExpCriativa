(function () {
  function noop() {}

  window.mitraToast = {
    show: noop,
    info: noop,
    success: noop,
    warning: noop,
    error: noop,
    confirm: async function () {
      return true;
    }
  };

  window.mostrarToast = noop;
  window.confirmarModal = async function () {
    return true;
  };
})();
