document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAtletaNovo");
  if (!form) {
    return;
  }

  await popularSelect("id_genero", "../php/genero_get.php", "Selecione um genero");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    await fetch("../php/atleta/atleta_novo.php", {
      method: "POST",
      body: formData
    });

    window.location.href = "atleta.html";
  });
});

async function popularSelect(selectId, url, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">${placeholder}</option>`;
  const retorno = await fetch(url);
  const resposta = await retorno.json();

  for (let i = 0; i < (resposta.data || []).length; i++) {
    const registro = resposta.data[i];
    const option = document.createElement("option");
    option.value = String(registro.id ?? "");
    option.textContent = String(registro.nome ?? "");
    select.appendChild(option);
  }
}
