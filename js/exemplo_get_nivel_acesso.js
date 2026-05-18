const chaveSessao = localStorage.getItem("mitraSessionKey") || "";

if (!chaveSessao) {
  window.location.href = "../login/index.html";
}

fetch("../php/valida_sessao.php", {
  cache: "no-store",
  headers: {
    "X-Session-Key": chaveSessao
  }
})
  .then((response) => response.json())
  .then((data) => {
    if (data.status !== "ok") {
      window.location.href = "../login/index.html";
      return;
    }

    if (String(data.id_nivel || "") !== "1") {
      window.location.href = "../home/home.html";
    }
  })
  .catch(() => {
    window.location.href = "../login/index.html";
  });
