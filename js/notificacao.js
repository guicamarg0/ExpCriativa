(function () {
  const ROOT_ID = "mitra-toast-root";
  const STYLE_ID = "mitra-toast-style";
  const DEFAULT_DURATION = 3200;
  const CONFIRM_TIMEOUT = 12000;

  function toText(value) {
    if (value === null || typeof value === "undefined") {
      return "";
    }
    return String(value);
  }

  function normalizeForMatch(value) {
    return toText(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function inferType(message) {
    const text = normalizeForMatch(message);
    if (
      text.startsWith("sucesso") ||
      text.includes("com sucesso") ||
      text.includes("sucesso:")
    ) {
      return "success";
    }
    if (
      text.startsWith("erro") ||
      text.includes("falha") ||
      text.includes("inv") ||
      text.includes("nao foi possivel")
    ) {
      return "error";
    }
    if (
      text.startsWith("aviso") ||
      text.startsWith("aten") ||
      text.includes("warning") ||
      text.includes("cuidado")
    ) {
      return "warning";
    }
    return "info";
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{
        position:fixed;
        top:14px;
        right:14px;
        z-index:10000;
        display:flex;
        flex-direction:column;
        gap:8px;
        width:min(340px, calc(100vw - 20px));
        pointer-events:none;
      }
      .mitra-toast{
        pointer-events:auto;
        background:#ffffff;
        border-radius:10px;
        box-shadow:0 10px 24px rgba(8, 9, 66, 0.18);
        border:1px solid rgba(34, 28, 105, 0.2);
        border-left-width:4px;
        color:#221c69;
        padding:10px 12px;
        font:600 0.9rem/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif;
        opacity:0;
        transform:translateY(-8px);
        transition:opacity .18s ease, transform .18s ease;
        display:grid;
        gap:8px;
      }
      .mitra-toast-show{
        opacity:1;
        transform:translateY(0);
      }
      .mitra-toast-hide{
        opacity:0;
        transform:translateY(-8px);
      }
      .mitra-toast-info{ border-left-color:#3b82f6; }
      .mitra-toast-success{ border-left-color:#059669; }
      .mitra-toast-warning{ border-left-color:#d97706; }
      .mitra-toast-error{ border-left-color:#dc2626; }
      .mitra-toast-message{
        margin:0;
        word-break:break-word;
      }
      .mitra-toast-actions{
        display:flex;
        justify-content:flex-end;
        gap:8px;
      }
      .mitra-toast-btn{
        border:1px solid rgba(34, 28, 105, 0.35);
        background:#fff;
        color:#221c69;
        border-radius:6px;
        padding:4px 10px;
        font-size:0.8rem;
        font-weight:700;
        cursor:pointer;
      }
      .mitra-toast-btn-primary{
        background:#221c69;
        color:#fff;
        border-color:#221c69;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    ensureStyle();
    let root = document.getElementById(ROOT_ID);
    if (root) {
      return root;
    }

    root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-atomic", "false");
    document.body.appendChild(root);
    return root;
  }

  function removeToast(toast) {
    if (!toast || toast.dataset.closing === "1") {
      return;
    }
    toast.dataset.closing = "1";
    toast.classList.add("mitra-toast-hide");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 220);
  }

  function mountToast(message, options = {}) {
    const root = ensureRoot();
    const type = options.type || inferType(message);
    const duration =
      typeof options.duration === "number" ? options.duration : DEFAULT_DURATION;

    const toast = document.createElement("div");
    toast.className = `mitra-toast mitra-toast-${type}`;

    const p = document.createElement("p");
    p.className = "mitra-toast-message";
    p.textContent = toText(message) || "Operacao concluida.";
    toast.appendChild(p);

    root.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("mitra-toast-show"));

    let timeoutId = null;
    if (duration > 0) {
      timeoutId = setTimeout(() => removeToast(toast), duration);
    }

    return {
      element: toast,
      close: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        removeToast(toast);
      },
    };
  }

  function toastConfirm(message, options = {}) {
    return new Promise((resolve) => {
      const timeout =
        typeof options.timeout === "number" ? options.timeout : CONFIRM_TIMEOUT;

      const root = ensureRoot();
      const toast = document.createElement("div");
      toast.className = `mitra-toast mitra-toast-${options.type || "warning"}`;

      const p = document.createElement("p");
      p.className = "mitra-toast-message";
      p.textContent = toText(message) || "Tem certeza que deseja continuar?";
      toast.appendChild(p);

      const actions = document.createElement("div");
      actions.className = "mitra-toast-actions";

      const noBtn = document.createElement("button");
      noBtn.type = "button";
      noBtn.className = "mitra-toast-btn";
      noBtn.textContent = "Nao";

      const yesBtn = document.createElement("button");
      yesBtn.type = "button";
      yesBtn.className = "mitra-toast-btn mitra-toast-btn-primary";
      yesBtn.textContent = "Sim";

      actions.appendChild(noBtn);
      actions.appendChild(yesBtn);
      toast.appendChild(actions);

      root.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("mitra-toast-show"));

      let finished = false;
      const finish = (value) => {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timer);
        removeToast(toast);
        resolve(value);
      };

      const timer = setTimeout(() => finish(false), timeout);
      noBtn.addEventListener("click", () => finish(false));
      yesBtn.addEventListener("click", () => finish(true));
    });
  }

  const api = {
    show: (message, options = {}) => mountToast(message, options),
    info: (message, options = {}) =>
      mountToast(message, { ...options, type: "info" }),
    success: (message, options = {}) =>
      mountToast(message, { ...options, type: "success" }),
    warning: (message, options = {}) =>
      mountToast(message, { ...options, type: "warning" }),
    error: (message, options = {}) =>
      mountToast(message, { ...options, type: "error" }),
    confirm: (message, options = {}) => toastConfirm(message, options),
  };

  window.mitraToast = window.mitraToast || api;
  window.mostrarToast =
    window.mostrarToast ||
    function (message, type = "info", duration = DEFAULT_DURATION) {
      return window.mitraToast.show(message, { type, duration });
    };

  if (!window.__mitraAlertPatched) {
    window.alert = function (message) {
      const type = inferType(message);
      window.mitraToast.show(message, { type });
    };
    window.__mitraAlertPatched = true;
  }

  if (typeof window.confirmarModal !== "function") {
    window.confirmarModal = function (message) {
      return window.mitraToast.confirm(message);
    };
  }
})();
