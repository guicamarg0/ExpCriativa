(function () {
  function montarQueryEquipe(params = {}) {
    const query = new URLSearchParams();

    if (params.id) {
      query.set("id", String(params.id));
    }
    if (params.status) {
      query.set("status", String(params.status));
    }

    const textoQuery = query.toString();
    return textoQuery ? `?${textoQuery}` : "";
  }

  // ver
  async function listarEquipes(status = "ativa") {
    const query = montarQueryEquipe({ status });
    const retorno = await fetch(`../php/equipe/equipe_get.php${query}`);
    return retorno.json();
  }

  // ver
  async function buscarEquipePorId(id, status = "todos") {
    const query = montarQueryEquipe({ id, status });
    const retorno = await fetch(`../php/equipe/equipe_get.php${query}`);
    return retorno.json();
  }

  // criar
  async function criarEquipe(formData) {
    const retorno = await fetch("../php/equipe/equipe_novo.php", {
      method: "POST",
      body: formData,
    });
    return retorno.json();
  }

  // editar
  async function editarEquipe(formData) {
    const retorno = await fetch("../php/equipe/equipe_alterar.php", {
      method: "POST",
      body: formData,
    });
    return retorno.json();
  }

  // inativar
  async function alternarStatusEquipe(id, status) {
    const formData = new FormData();
    formData.append("id", String(id || ""));
    formData.append("status", String(status || "inativa"));
    return editarEquipe(formData);
  }

  // editar
  async function vincularAtletasEquipe(idEquipe, idsAtletas, forcarVinculo = false) {
    const ids = Array.isArray(idsAtletas)
      ? idsAtletas.join(",")
      : String(idsAtletas || "");

    const formData = new FormData();
    formData.append("id_equipe", String(idEquipe || ""));
    formData.append("atletas_ids", ids);
    formData.append("forcar_vinculo", forcarVinculo ? "1" : "0");

    const retorno = await fetch("../php/equipe/equipe_vincular_atletas.php", {
      method: "POST",
      body: formData,
    });
    return retorno.json();
  }

  window.equipeCRUD = {
    listarEquipes,
    buscarEquipePorId,
    criarEquipe,
    editarEquipe,
    alternarStatusEquipe,
    vincularAtletasEquipe,
  };
})();
