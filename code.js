// ESTADO INTERNO DO JOGO
let jogadores = [];
let categoriasSelecionadas = [];
let ativarDicas = true;

let palavraSorteada = null;
let dicaSorteada = "";
let impostor = "";
let jogadorInicialRodada = ""; 
let indiceJogadorAtual = 0;

// MAPEAMENTO DO DOM
const inputs = {
    jogador: document.getElementById('input-jogador'),
    chkDicas: document.getElementById('chk-dicas')
};

const botoes = {
    addJogador: document.getElementById('btn-add-jogador'),
    iniciar: document.getElementById('btn-iniciar'),
    proximo: document.getElementById('btn-proximo'),
    encerrar: document.getElementById('btn-encerrar-rodada'),
    jogarDeNovo: document.getElementById('btn-jogar-novamente'),
    voltarMenu: document.getElementById('btn-voltar-menu')
};

const telas = {
    config: document.getElementById('tela-config'),
    passar: document.getElementById('tela-passar'),
    discussao: document.getElementById('tela-discussao'),
    fim: document.getElementById('tela-fim')
};

const listas = {
    jogadores: document.getElementById('lista-jogadores'),
    categorias: document.getElementById('container-categorias')
};

const cartaoTouch = document.getElementById('cartao-touch');
const conteudoPadrao = document.getElementById('conteudo-cartao-padrao');
const conteudoSecreto = document.getElementById('conteudo-cartao-secreto');

// CONFIGURAÇÃO INICIAL
window.addEventListener('load', () => {
    renderizarCategorias();
    verificarCondicoesInicio();
    configurarEventosTouch();
});

function renderizarCategorias() {
    listas.categorias.innerHTML = '';
    Object.keys(bancoPalavras).forEach(chave => {
        const label = document.createElement('label');
        label.className = 'opcao-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${chave}" checked class="chk-categoria">
            <span>${nomesExibicaoCategorias[chave]}</span>
        `;
        listas.categorias.appendChild(label);

        label.querySelector('input').addEventListener('change', () => {
            atualizarCategoriasSelecionadas();
            verificarCondicoesInicio();
        });
    });
    atualizarCategoriasSelecionadas();
}

function atualizarCategoriasSelecionadas() {
    const checkboxes = document.querySelectorAll('.chk-categoria:checked');
    categoriasSelecionadas = Array.from(checkboxes).map(cb => cb.value);
}

botoes.addJogador.addEventListener('click', adicionarJogador);
inputs.jogador.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarJogador();
});

function adicionarJogador() {
    const nome = inputs.jogador.value.trim();
    if (nome === "") return;
    
    if (jogadores.includes(nome)) {
        alert("Este nome já está na lista!");
        return;
    }

    jogadores.push(nome);
    inputs.jogador.value = "";
    renderizarJogadores();
    verificarCondicoesInicio();
}

window.removerJogador = function(nome) {
    jogadores = jogadores.filter(j => j !== nome);
    renderizarJogadores();
    verificarCondicoesInicio();
};

function renderizarJogadores() {
    listas.jogadores.innerHTML = '';
    jogadores.forEach(nome => {
        const div = document.createElement('div');
        div.className = 'item-jogador';
        div.innerHTML = `
            <span>${nome}</span>
            <button class="btn-remover" onclick="removerJogador('${nome}')"><i class="ph ph-trash"></i></button>
        `;
        listas.jogadores.appendChild(div);
    });
}

function verificarCondicoesInicio() {
    const temMinimoJogadores = jogadores.length >= 3;
    const temCategoriaSelecionada = categoriasSelecionadas.length > 0;
    botoes.iniciar.disabled = !(temMinimoJogadores && temCategoriaSelecionada);
}

function irParaTela(telaAlvo) {
    Object.values(telas).forEach(t => t.classList.remove('ativa'));
    telaAlvo.classList.add('ativa');
}

botoes.iniciar.addEventListener('click', iniciarJogo);
botoes.jogarDeNovo.addEventListener('click', iniciarJogo);

function iniciarJogo() {
    ativarDicas = inputs.chkDicas.checked;

    const categoriaAleatoria = categoriasSelecionadas[Math.floor(Math.random() * categoriasSelecionadas.length)];
    const listaPalavras = bancoPalavras[categoriaAleatoria];
    const objetoPalavra = listaPalavras[Math.floor(Math.random() * listaPalavras.length)];
    
    palavraSorteada = objetoPalavra.palavra;
    dicaSorteada = objetoPalavra.dica;

    impostor = jogadores[Math.floor(Math.random() * jogadores.length)];
    jogadorInicialRodada = jogadores[Math.floor(Math.random() * jogadores.length)];

    indiceJogadorAtual = 0;
    configurarFasePassarCelular();
    irParaTela(telas.passar);
}

// TELA 2: MECÂNICA DE REVELAÇÃO INTEGRAL DO CARTÃO
function configurarFasePassarCelular() {
    // O botão Próximo Jogador agora SEMPRE inicia visível nesta tela
    botoes.proximo.style.display = 'flex'; 
    
    conteudoPadrao.style.display = 'block';
    conteudoSecreto.style.display = 'none';
    
    document.getElementById('nome-jogador-vez').innerText = jogadores[indiceJogadorAtual];
    prepararConteudoSecreto();
}

function prepararConteudoSecreto() {
    const jogadorAtual = jogadores[indiceJogadorAtual];

    if (jogadorAtual === impostor) {
        if (ativarDicas) {
            conteudoSecreto.innerHTML = `
                <span class="alerta-impostor">Você é o Camaleão</span>
                <div><span class="dica-texto">Dica: <strong>${dicaSorteada}</strong></span></div>
            `;
        } else {
            conteudoSecreto.innerHTML = `<span class="alerta-impostor">Você é o Camaleão</span>`;
        }
    } else {
        conteudoSecreto.innerHTML = `
            <div class="secret-word-container">
                <span class="secret-word-title">Palavra Secreta</span>
                <span class="secret-word-value">${palavraSorteada}</span>
            </div>
        `;
    }
}

function mostrarPalavra() {
    conteudoPadrao.style.display = 'none';
    conteudoSecreto.style.display = 'block';
}

function esconderPalavra() {
    conteudoPadrao.style.display = 'block';
    conteudoSecreto.style.display = 'none';
}

function configurarEventosTouch() {
    // Mobile Touch
    cartaoTouch.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        mostrarPalavra();
    });
    cartaoTouch.addEventListener('touchend', esconderPalavra);
    cartaoTouch.addEventListener('touchcancel', esconderPalavra);

    // Desktop Mouse Fallback
    cartaoTouch.addEventListener('mousedown', mostrarPalavra);
    cartaoTouch.addEventListener('mouseup', esconderPalavra);
    cartaoTouch.addEventListener('mouseleave', esconderPalavra);
}

botoes.proximo.addEventListener('click', () => {
    indiceJogadorAtual++;
    if (indiceJogadorAtual < jogadores.length) {
        configurarFasePassarCelular();
    } else {
        document.getElementById('jogador-inicial').innerText = jogadorInicialRodada;
        irParaTela(telas.discussao);
    }
});

botoes.encerrar.addEventListener('click', () => {
    document.getElementById('revelacao-impostor').innerText = impostor;
    document.getElementById('revelacao-palavra').innerText = palavraSorteada;
    irParaTela(telas.fim);
});

botoes.voltarMenu.addEventListener('click', () => {
    irParaTela(telas.config);
    verificarCondicoesInicio();
});