/**
 * Carrega um select por GET e monta as opcoes usando id/nome.
 */
async function carregarOpcoesSelect({
  selectId,
  url,
  placeholder = "Selecione",
  valueKey = "id",
  labelKey = "nome",
  selectedValue = "",
}) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${placeholder}</option>`;

  const resposta = await (await fetch(url)).json();

  for (let i = 0; i < resposta.data.length; i++) {
    const item = resposta.data[i];
    const option = document.createElement("option");
    option.value = String(item[valueKey] ?? "");
    option.textContent = String(item[labelKey] ?? "");
    select.appendChild(option);
  }

  select.value = String(selectedValue);
}

/**
 * Carrega varios selects em sequencia.
 */
async function carregarSelectsEmLote(configuracoes) {
  for (let i = 0; i < configuracoes.length; i++) {
    await carregarOpcoesSelect(configuracoes[i]);
  }
}
