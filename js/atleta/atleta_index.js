let atletasView = [];

document.addEventListener("DOMContentLoaded", async () => {
    console.log('atleta_index: DOMContentLoaded');
    try {
        const sess = await window.atletaSessao.aplicarPermissoesTelaAtleta();
        console.log('atleta_index: sessão aplicada', sess);
        if (sess && sess.status === 'ok') {
            renderDashboardAtleta(sess.perfil || {});
        }
    } catch (err) {
        console.error('atleta_index: erro aplicarPermissoesTelaAtleta', err);
    }

    try {
        await buscarAtletas();
    } catch (err) {
        console.error('atleta_index: erro buscarAtletas', err);
        const lista = document.querySelector('.listViewAtletas');
        if (lista) {
            lista.innerHTML = '<div style="padding:1rem;background:#fff;border-radius:8px;color:#c00">Erro ao carregar atletas. Veja console para detalhes.</div>';
        }
    }
    // fallback: se não houver painel renderizado (sem sessão), use o primeiro atleta retornado
    try {
        const painelExist = document.querySelector('.painelAtleta');
        if (!painelExist && Array.isArray(atletasView) && atletasView.length > 0) {
            console.log('atleta_index: sem sessão detectada, usando primeiro atleta como fallback para gráficos');
            renderDashboardAtleta(atletasView[0]);
        }
    } catch (err) {
        console.error('atleta_index: erro fallback render', err);
    }
});

function formatarStatusAtleta(valor) {
    return String(valor || "").toLowerCase() === "inativo" ? "Inativo" : "Ativo";
}

function formatarDataAtleta(valor) {
    if (!valor) {
        return "";
    }

    const partes = String(valor).slice(0, 10).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
}

function preencherTabelaAtletas() {
    const lista = document.querySelector(".listViewAtletas");
    if (!lista) {
        console.warn('preencherTabelaAtletas: .listViewAtletas não encontrada');
        return;
    }

    let html = "";
    for (let i = 0; i < atletasView.length; i++) {
        const atleta = atletasView[i];
        html += `
            <div class="linhaAtleta">
                <a class="btnEditarAtleta" href="atleta_alterar.html?id=${atleta.id}"><i class="bi bi-pencil-square"></i></a>
                <p><b>${atleta.nome || ""}</b></p>
                <p>${formatarDataAtleta(atleta.data_nascimento)}</p>
                <p>${atleta.genero_nome || ""}</p>
                <p>${atleta.altura || ""}</p>
                <p>${atleta.peso || ""}</p>
                <p>${formatarStatusAtleta(atleta.status)}</p>
            </div>
        `;
    }

    lista.innerHTML = html;
}

function renderDashboardAtleta(perfil) {
        try {
                const container = document.querySelector('.conteudoAtleta');
                if (!container) return;

                const existing = document.querySelector('.painelAtleta');
                if (existing) existing.remove();

                const painel = document.createElement('div');
                painel.className = 'painelAtleta';
                painel.innerHTML = `
                <section class="atletaTopo">
                    <div class="atletaPerfil">
                        <span class="atletaIcon">👤</span>
                        <div>
                            <strong>${escaparHtml(perfil.nome || '')}</strong>
                            <span>${escaparHtml((perfil.equipes && perfil.equipes[0] && perfil.equipes[0].nome) || 'Sem equipe')} · Futebol</span>
                        </div>
                    </div>
                </section>
                <div class="graficosResumo">
                    <article class="cardGrafico cardGraficoBarras" id="grafPresencas">
                        <div class="graficoHeader"><h3>Presenças (últimos 6 meses)</h3></div>
                        <div class="barrasChart">Carregando...</div>
                    </article>

                    <article class="cardGrafico cardGraficoLinha" id="grafEvolucao">
                        <div class="graficoHeader"><h3>Evolução do treino</h3></div>
                        <div class="linhaWrapper">Carregando...</div>
                    </article>

                    <article class="cardGrafico" id="cardProximoTreino">
                        <div class="graficoHeader"><h3>Próximo treino</h3></div>
                        <div class="proximoConteudo">Carregando...</div>
                    </article>
                </div>
                `;

                // insert panel before headerConteudo
                const header = container.querySelector('.headerConteudo');
                if (header) container.insertBefore(painel, header);
                else container.prepend(painel);
        } catch (err) {
                console.error('renderDashboardAtleta erro', err);
        }
}

function escaparHtml(valor) {
        return String(valor ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/'/g, '&#39;');
}

async function buscarAtletas() {
    console.log('buscarAtletas: iniciando fetch');
    const retorno = await fetch("../php/atleta/atleta_get.php?status=todos");
    if (!retorno.ok) {
        throw new Error('buscarAtletas: resposta não OK ' + retorno.status);
    }
    const resposta = await retorno.json();
    console.log('buscarAtletas: resposta', resposta);
    atletasView = resposta.status === "ok" && Array.isArray(resposta.data) ? resposta.data : [];
    preencherTabelaAtletas();
    try {
        renderChartsFromAtletas(atletasView);
    } catch (err) {
        console.error('erro renderChartsFromAtletas', err);
    }
}

function renderChartsFromAtletas(atletas) {
    if (!Array.isArray(atletas)) return;
    // prepare last 6 months labels
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleString('pt-BR', { month: 'short' })
        });
    }

    const counts = months.map(() => 0);

    atletas.forEach(a => {
        const dc = a.data_cadastro || a.data_cadastro || null;
        if (!dc) return;
        const d = new Date(dc);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const idx = months.findIndex(m => m.key === key);
        if (idx >= 0) counts[idx]++;
    });

    // ensure panel exists
    const painel = document.querySelector('.painelAtleta') || (() => {
        const container = document.querySelector('.conteudoAtleta');
        if (!container) return null;
        const p = document.createElement('div');
        p.className = 'painelAtleta';
        container.insertBefore(p, container.querySelector('.headerConteudo'));
        return p;
    })();
    if (!painel) return;

    let graficos = painel.querySelector('.graficosResumo');
    if (!graficos) {
        graficos = document.createElement('div');
        graficos.className = 'graficosResumo';
        painel.appendChild(graficos);
    }

    // build bars html
    const barsHtml = months.map((m, i) => `<div><div class="bar" style="height:${Math.max(6, (counts[i] / Math.max(1, Math.max(...counts))) * 100)}%"></div><span>${m.label}</span></div>`).join('');

    graficos.innerHTML = `
        <article class="cardGrafico cardGraficoBarras">
            <div class="graficoHeader"><h3>Atletas cadastrados (últimos 6 meses)</h3></div>
            <div class="barrasChart">${barsHtml}</div>
        </article>
        <article class="cardGrafico cardGraficoLinha">
            <div class="graficoHeader"><h3>Distribuição por status</h3></div>
            <div class="statusChart"></div>
        </article>
    `;

    // status distribution
    const statusCounts = atletas.reduce((acc, a) => {
        const s = String(a.status || 'ativo').toLowerCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const statusContainer = graficos.querySelector('.statusChart');
    if (statusContainer) {
        const total = atletas.length || 1;
        statusContainer.innerHTML = Object.keys(statusCounts).map(k => {
            const v = statusCounts[k];
            const pct = Math.round((v / total) * 100);
            return `<div style="margin-bottom:0.6rem"><strong style="display:block;color:#fff">${k.toUpperCase()} — ${v} (${pct}%)</strong><div style="background:rgba(255,255,255,0.12);height:10px;border-radius:6px"><div style="width:${pct}%;height:100%;background:#5b50ff;border-radius:6px"></div></div></div>`;
        }).join('');
    }
}
