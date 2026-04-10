// home.js - Exibe o nome do usuário logado na tela home
fetch('../php/valida_sessao.php')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok' && data.data && data.data[0] && data.data[0].email) {
            // Tenta pegar o nome, se existir, senão mostra o email
            const nome = data.data[0].nome || data.data[0].email;
            const h1 = document.querySelector('.conteudo h1');
            if (h1) {
                h1.innerHTML = `Bem-vindo, <span style='color:#007bff'>${nome}</span>!`;
            }
        }
    });
