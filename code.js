// ====================================================
// ESTADO GLOBAL DO JOGO
// ====================================================
let jogadores = [];
let indiceJogadorAtual = 0;
let indiceImpostor = -1;
let palavraSorteada = { palavra: "", dica: "" };
let estaRevelando = false;

// ====================================================
// SISTEMA DE ALERTS (SWEETALERT2)
// ====================================================
function mostrarAlerta(mensagem, titulo = 'Atenção', icone = 'warning') {
    const isClaro = document.documentElement.getAttribute('data-tema') === 'claro';

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: titulo,
            text: mensagem,
            icon: icone,
            background: isClaro ? '#ffffff' : '#15141b',
            color: isClaro ? '#0f172a' : '#f4f4f5',
            confirmButtonColor: '#7c3aed',
            confirmButtonText: 'Entendi'
        });
    } else {
        alert(`${titulo}: ${mensagem}`);
    }
}

// ====================================================
// NAVEGAÇÃO E CONTROLE DE TEMA (APENAS TELA INICIAL)
// ====================================================
function mudarTela(idTela) {
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('ativa');
    });

    const telaDestino = document.getElementById(idTela);
    if (telaDestino) {
        telaDestino.classList.add('ativa');
    }

    const btnTema = document.getElementById('btn-tema');

    if (idTela === 'tela-config') {
        document.body.classList.add('na-tela-inicio');
        if (btnTema) btnTema.style.display = 'flex'; // Volta a mostrar o botão no menu
    } else {
        document.body.classList.remove('na-tela-inicio');
        if (btnTema) btnTema.style.display = 'none'; // Oculta o botão nos outros ecrãs
    }
}

function alternarTema() {
    const telaConfig = document.getElementById('tela-config');
    if (!telaConfig || !telaConfig.classList.contains('ativa')) return;

    const html = document.documentElement;
    const btnTema = document.getElementById('btn-tema');
    const temaAtual = html.getAttribute('data-tema');
    const novoTema = temaAtual === 'claro' ? 'escuro' : 'claro';

    html.setAttribute('data-tema', novoTema);
    if (btnTema) btnTema.textContent = novoTema === 'claro' ? '☀️' : '🌙';
    localStorage.setItem('tema_impostor', novoTema);
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema_impostor') || 'escuro';
    const html = document.documentElement;
    const btnTema = document.getElementById('btn-tema');
    
    html.setAttribute('data-tema', temaSalvo);
    if (btnTema) btnTema.textContent = temaSalvo === 'claro' ? '☀️' : '🌙';
}

// ====================================================
// GERENCIAMENTO DE JOGADORES
// ====================================================
function adicionarJogador() {
    const input = document.getElementById('input-jogador');
    if (!input) return;

    const nome = input.value.trim();

    if (!nome) {
        mostrarAlerta("Digite o nome do jogador antes de adicionar!", "Campo Vazio", "warning");
        return;
    }

    if (jogadores.includes(nome)) {
        mostrarAlerta("Este nome já está na lista!", "Nome Duplicado", "info");
        return;
    }

    jogadores.push(nome);
    input.value = "";
    input.focus();
    atualizarListaJogadores();
}

function removerJogador(index) {
    jogadores.splice(index, 1);
    atualizarListaJogadores();
}

function atualizarListaJogadores() {
    const container = document.getElementById('lista-jogadores');
    const btnIniciar = document.getElementById('btn-iniciar');

    if (!container || !btnIniciar) return;

    container.innerHTML = "";
    jogadores.forEach((nome, index) => {
        const item = document.createElement('div');
        item.className = 'item-jogador';
        item.innerHTML = `
            <span>${nome}</span>
            <button type="button" class="btn-remover" onclick="removerJogador(${index})" aria-label="Remover">✕</button>
        `;
        container.appendChild(item);
    });

    btnIniciar.disabled = jogadores.length < 3;
}

// ====================================================
// LÓGICA DO JOGO (SORTEIO & PARTIDA)
// ====================================================
function obterBancoDeDados() {
    // Agora busca corretamente pelo banco no plural
    if (typeof bancoPalavras !== 'undefined') return bancoPalavras;
    if (typeof bancoDeDados !== 'undefined') return bancoDeDados;
    if (typeof banco !== 'undefined') return banco;
    return null;
}

function iniciarJogo() {
    if (jogadores.length < 3) {
        mostrarAlerta("Adicione pelo menos 3 jogadores para começar a jogar!", "Poucos Jogadores", "warning");
        return;
    }

    const checkboxes = document.querySelectorAll('.grid-categorias input[type="checkbox"]:checked');
    const categoriasSelecionadas = Array.from(checkboxes).map(cb => cb.value);

    if (categoriasSelecionadas.length === 0) {
        mostrarAlerta("Selecione pelo menos uma categoria de palavra!", "Sem Categorias", "warning");
        return;
    }

    const bancoAtivo = obterBancoDeDados();
    if (!bancoAtivo) {
        mostrarAlerta("O arquivo banco.js não foi encontrado ou a variável 'bancoPalavras' não está definida.", "Erro de Banco", "error");
        return;
    }

    let bancoFiltrado = [];
    categoriasSelecionadas.forEach(cat => {
        if (bancoAtivo[cat] && Array.isArray(bancoAtivo[cat])) {
            bancoFiltrado = bancoFiltrado.concat(bancoAtivo[cat]);
        }
    });

    if (bancoFiltrado.length === 0) {
        mostrarAlerta("Não foram encontradas palavras para as categorias selecionadas.", "Erro de Banco", "error");
        return;
    }

    palavraSorteada = bancoFiltrado[Math.floor(Math.random() * bancoFiltrado.length)];
    indiceImpostor = Math.floor(Math.random() * jogadores.length);
    indiceJogadorAtual = 0;

    mudarTela('tela-passar');
    prepararCartaoJogador();
}

function prepararCartaoJogador() {
    estaRevelando = false;
    const cartao = document.getElementById('cartao-touch');
    const padrao = document.getElementById('conteudo-cartao-padrao');
    const secreto = document.getElementById('conteudo-cartao-secreto');
    const nomeVez = document.getElementById('nome-jogador-vez');

    if (!cartao || !padrao || !secreto || !nomeVez) return;

    const corClasse = indiceJogadorAtual % 8;
    cartao.className = `cartao-revelar-total dinamico cor-player-${corClasse}`;
    
    padrao.style.display = 'block';
    secreto.style.display = 'none';
    nomeVez.textContent = jogadores[indiceJogadorAtual];
}

function revelarInicio() {
    if (estaRevelando) return;
    estaRevelando = true;

    const padrao = document.getElementById('conteudo-cartao-padrao');
    const secreto = document.getElementById('conteudo-cartao-secreto');
    const chkDicas = document.getElementById('chk-dicas');
    const querDica = chkDicas ? chkDicas.checked : true;

    if (!padrao || !secreto) return;

    padrao.style.display = 'none';
    secreto.style.display = 'block';

    if (indiceJogadorAtual === indiceImpostor) {
        let htmlImpostor = `<div class="alerta-impostor">Você é o Impostor!</div>`;
        if (querDica && palavraSorteada.dica) {
            htmlImpostor += `<div class="dica-texto">Dica: <strong>${palavraSorteada.dica}</strong></div>`;
        }
        secreto.innerHTML = htmlImpostor;
    } else {
        secreto.innerHTML = `
            <div class="secret-word-container">
                <span class="secret-word-title">A palavra é:</span>
                <span class="secret-word-value">${palavraSorteada.palavra}</span>
            </div>
        `;
    }
}

function revelarFim() {
    if (!estaRevelando) return;
    estaRevelando = false;

    const padrao = document.getElementById('conteudo-cartao-padrao');
    const secreto = document.getElementById('conteudo-cartao-secreto');

    if (padrao && secreto) {
        padrao.style.display = 'block';
        secreto.style.display = 'none';
    }
}

function proximoJogador() {
    indiceJogadorAtual++;
    if (indiceJogadorAtual < jogadores.length) {
        prepararCartaoJogador();
    } else {
        const jogadorInicial = jogadores[Math.floor(Math.random() * jogadores.length)];
        const elInicial = document.getElementById('jogador-inicial');
        if (elInicial) elInicial.textContent = jogadorInicial;
        mudarTela('tela-discussao');
    }
}

function encerrarERevelar() {
    const elImpostor = document.getElementById('revelacao-impostor');
    const elPalavra = document.getElementById('revelacao-palavra');
    const elDica = document.getElementById('revelacao-dica');
    const containerDicaFinal = document.getElementById('container-dica-final');
    const chkDicas = document.getElementById('chk-dicas');
    
    const querDica = chkDicas ? chkDicas.checked : true;

    if (elImpostor) elImpostor.textContent = jogadores[indiceImpostor] || "N/A";
    if (elPalavra) elPalavra.textContent = palavraSorteada.palavra || "N/A";
    
    if (querDica && palavraSorteada.dica) {
        if (elDica) elDica.textContent = palavraSorteada.dica;
        if (containerDicaFinal) containerDicaFinal.style.display = ''; 
    } else {
        if (containerDicaFinal) containerDicaFinal.style.display = 'none'; 
    }

    mudarTela('tela-fim');
}

// ====================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
    carregarTemaSalvo();
    mudarTela('tela-config');

    const btnTema = document.getElementById('btn-tema');
    if (btnTema) btnTema.addEventListener('click', alternarTema);

    const btnAdd = document.getElementById('btn-add-jogador');
    if (btnAdd) btnAdd.addEventListener('click', adicionarJogador);
    
    const inputJogador = document.getElementById('input-jogador');
    if (inputJogador) {
        inputJogador.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                adicionarJogador();
            }
        });
    }

    const btnIniciar = document.getElementById('btn-iniciar');
    if (btnIniciar) btnIniciar.addEventListener('click', iniciarJogo);

    const btnProximo = document.getElementById('btn-proximo');
    if (btnProximo) btnProximo.addEventListener('click', proximoJogador);

    const btnEncerrar = document.getElementById('btn-encerrar-rodada');
    if (btnEncerrar) btnEncerrar.addEventListener('click', encerrarERevelar);

    const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
    if (btnJogarNovamente) btnJogarNovamente.addEventListener('click', iniciarJogo);

    const btnVoltarMenu = document.getElementById('btn-voltar-menu');
    if (btnVoltarMenu) btnVoltarMenu.addEventListener('click', () => mudarTela('tela-config'));

    // Cartão Pass-and-Play
    const cartaoTouch = document.getElementById('cartao-touch');
    if (cartaoTouch) {
        cartaoTouch.addEventListener('mousedown', revelarInicio);
        cartaoTouch.addEventListener('mouseup', revelarFim);
        cartaoTouch.addEventListener('mouseleave', revelarFim);

        cartaoTouch.addEventListener('touchstart', (e) => {
            e.preventDefault();
            revelarInicio();
        });
        cartaoTouch.addEventListener('touchend', (e) => {
            e.preventDefault();
            revelarFim();
        });
    }
});