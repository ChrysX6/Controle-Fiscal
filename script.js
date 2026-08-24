// ==========================================================
// CONTROLE FISCAL - SCRIPT PRINCIPAL
// ==========================================================

const APPS_SCRIPT_URL = CONFIG.APPS_SCRIPT_URL;

let mesAtual = null;
let categoriaAtual = null;
let mesesDisponiveis = [];
let headersAtuais = [];
let linhasAtuais = [];

// ---------------------------------------------------------
// LOGIN
// ---------------------------------------------------------

function verificarLogin() {
  const logado = sessionStorage.getItem("logado");
  if (logado === "true") {
    document.getElementById("tela-login").style.display = "none";
    document.getElementById("app").style.display = "block";
    iniciarApp();
  } else {
    document.getElementById("tela-login").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }
}

function fazerLogin() {
  const senha = document.getElementById("input-senha").value;
  const erroLogin = document.getElementById("erro-login");

  if (senha === CONFIG.SENHA_ACESSO) {
    sessionStorage.setItem("logado", "true");
    erroLogin.style.display = "none";
    verificarLogin();
  } else {
    erroLogin.style.display = "block";
  }
}

function sair() {
  sessionStorage.removeItem("logado");
  verificarLogin();
}

// ---------------------------------------------------------
// CHAMADAS AO APPS SCRIPT (sempre POST + text/plain para evitar CORS)
// ---------------------------------------------------------

function chamarBackend(acao, extras) {
  const corpo = Object.assign({ acao: acao }, extras || {});

  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(corpo)
  })
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (json) {
      if (!json.ok) {
        throw new Error(json.erro || "Erro desconhecido no servidor.");
      }
      return json.dados;
    });
}

// ---------------------------------------------------------
// INICIALIZAÇÃO DO APP
// ---------------------------------------------------------

function iniciarApp() {
  document.getElementById("logo-empresa").src = "https://chrysx6.github.io/LinksAguiaContab/links/img/logo1.jpg";
  document.getElementById("btn-abrir-planilha").href = CONFIG.SPREADSHEET_URL;

  carregarMeses();
  montarAbasCategorias();
}

function carregarMeses() {
  chamarBackend("listarMeses")
    .then(function (meses) {
      if (!meses || meses.length === 0) {
        meses = [CONFIG.MES_PADRAO];
      }
      mesesDisponiveis = meses;
      montarBotoesMeses();

      if (mesesDisponiveis.indexOf(CONFIG.MES_PADRAO) > -1) {
        selecionarMes(CONFIG.MES_PADRAO);
      } else {
        selecionarMes(mesesDisponiveis[0]);
      }
    })
    .catch(function (erro) {
      console.error("Erro ao carregar meses:", erro);
      mesesDisponiveis = [CONFIG.MES_PADRAO];
      montarBotoesMeses();
      selecionarMes(CONFIG.MES_PADRAO);
    });
}

function montarBotoesMeses() {
  const container = document.getElementById("botoes-meses");
  container.innerHTML = "";

  mesesDisponiveis.forEach(function (mes) {
    const btn = document.createElement("button");
    btn.className = "btn-mes" + (mes === mesAtual ? " ativo" : "");
    btn.textContent = mes.charAt(0) + mes.slice(1).toLowerCase();
    btn.onclick = function () { selecionarMes(mes); };
    container.appendChild(btn);
  });
}

function selecionarMes(mes) {
  mesAtual = mes;
  montarBotoesMeses();

  if (!categoriaAtual) {
    categoriaAtual = CONFIG.CATEGORIAS[0].sufixo;
  }
  montarAbasCategorias();
  carregarDados();
}

function montarAbasCategorias() {
  const container = document.getElementById("abas-categorias");
  container.innerHTML = "";

  CONFIG.CATEGORIAS.forEach(function (cat) {
    const btn = document.createElement("button");
    btn.className = "btn-categoria" + (cat.sufixo === categoriaAtual ? " ativo" : "");
    btn.textContent = cat.nome;
    btn.onclick = function () {
      categoriaAtual = cat.sufixo;
      montarAbasCategorias();
      carregarDados();
    };
    container.appendChild(btn);
  });
}

// ---------------------------------------------------------
// CARREGAR E RENDERIZAR DADOS DA TABELA
// ---------------------------------------------------------

function nomeAbaAtual() {
  return mesAtual + "_" + categoriaAtual;
}

function carregarDados() {
  const container = document.getElementById("tabela-container");
  container.innerHTML = "<p class='carregando'>Carregando...</p>";

  chamarBackend("getDados", { aba: nomeAbaAtual() })
    .then(function (dados) {
      headersAtuais = dados.headers || [];
      linhasAtuais = dados.linhas || [];
      renderizarTabela();
    })
    .catch(function (erro) {
      container.innerHTML = "<p class='erro-msg'>Erro ao carregar dados: " + erro.message + "</p>";
    });
}

function renderizarTabela() {
  const container = document.getElementById("tabela-container");

  if (!headersAtuais || headersAtuais.length === 0) {
    container.innerHTML = "<p class='erro-msg'>Esta aba está vazia ou não foi encontrada.</p>";
    return;
  }

  let html = "<table class='tabela-dados'><thead><tr>";
  headersAtuais.forEach(function (h) {
    html += "<th>" + (h || "") + "</th>";
  });
  html += "<th>Ações</th></tr></thead><tbody>";

  if (linhasAtuais.length === 0) {
    html += "<tr><td colspan='" + (headersAtuais.length + 1) + "' class='vazio'>Nenhuma empresa cadastrada nesta aba.</td></tr>";
  }

  linhasAtuais.forEach(function (linhaObj) {
    html += "<tr>";
    linhaObj.valores.forEach(function (valor, colIndex) {
      const valorStr = (valor === null || valor === undefined) ? "" : String(valor).trim();
      const ehBinario = valorStr === "0" || valorStr === "1";

      if (ehBinario) {
        html += "<td class='celula-check'><input type='checkbox' " +
          (valorStr === "1" ? "checked" : "") +
          " onchange=\"editarCelula(" + linhaObj.linha + ", " + colIndex + ", this.checked ? '1' : '0')\"></td>";
      } else {
        html += "<td><input type='text' class='campo-texto' value=\"" + escaparHtml(valorStr) + "\" " +
          "onblur=\"editarCelula(" + linhaObj.linha + ", " + colIndex + ", this.value)\"></td>";
      }
    });

    html += "<td class='acoes'><button class='btn-remover' onclick=\"removerEmpresa(" + linhaObj.linha + ")\">🗑️</button></td>";
    html += "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------------------------------------------------------
// EDITAR / ADICIONAR / REMOVER
// ---------------------------------------------------------

function editarCelula(linha, coluna, valor) {
  mostrarStatusSalvando("Salvando...", null);

  chamarBackend("salvarCelula", {
    aba: nomeAbaAtual(),
    linha: linha,
    coluna: coluna,
    valor: valor
  })
    .then(function () {
      mostrarStatusSalvando("Salvo!", true);
    })
    .catch(function (erro) {
      mostrarStatusSalvando("Erro ao salvar: " + erro.message, false);
    });
}

function abrirModalAdicionar() {
  document.getElementById("modal-adicionar").style.display = "flex";
  const camposContainer = document.getElementById("campos-nova-empresa");
  camposContainer.innerHTML = "";

  headersAtuais.forEach(function (h, i) {
    camposContainer.innerHTML += "<label>" + (h || ("Coluna " + (i + 1))) +
      "</label><input type='text' id='novo-campo-" + i + "' class='campo-modal'>";
  });
}

function fecharModalAdicionar() {
  document.getElementById("modal-adicionar").style.display = "none";
}

function confirmarAdicionarEmpresa() {
  const dados = headersAtuais.map(function (h, i) {
    const el = document.getElementById("novo-campo-" + i);
    return el ? el.value : "";
  });

  chamarBackend("adicionarEmpresa", {
    aba: nomeAbaAtual(),
    dados: dados
  })
    .then(function () {
      fecharModalAdicionar();
      carregarDados();
    })
    .catch(function (erro) {
      alert("Erro ao adicionar empresa: " + erro.message);
    });
}

function removerEmpresa(linha) {
  if (!confirm("Tem certeza que deseja remover esta empresa?")) return;

  chamarBackend("removerEmpresa", {
    aba: nomeAbaAtual(),
    linha: linha
  })
    .then(function () {
      carregarDados();
    })
    .catch(function (erro) {
      alert("Erro ao remover empresa: " + erro.message);
    });
}

// ---------------------------------------------------------
// CRIAR NOVO MÊS
// ---------------------------------------------------------

function abrirModalNovoMes() {
  document.getElementById("modal-novo-mes").style.display = "flex";
  document.getElementById("input-novo-mes").value = "";
}

function fecharModalNovoMes() {
  document.getElementById("modal-novo-mes").style.display = "none";
}

function confirmarNovoMes() {
  const nomeMes = document.getElementById("input-novo-mes").value.trim().toUpperCase();

  if (!nomeMes) {
    alert("Digite o nome do mês.");
    return;
  }

  chamarBackend("criarMes", { mes: nomeMes })
    .then(function (resultado) {
      fecharModalNovoMes();
      alert("Mês criado com sucesso: " + resultado.abas.join(", "));
      carregarMeses();
    })
    .catch(function (erro) {
      alert("Erro ao criar o novo mês: " + erro.message);
    });
}

// ---------------------------------------------------------
// STATUS DE SALVAMENTO
// ---------------------------------------------------------

function mostrarStatusSalvando(texto, sucesso) {
  const status = document.getElementById("status-salvando");
  status.textContent = texto;
  status.className = sucesso === null ? "status-neutro" : (sucesso ? "status-sucesso" : "status-erro");
  status.style.display = "inline-block";

  if (sucesso !== null) {
    setTimeout(function () {
      status.style.display = "none";
    }, 2500);
  }
}

// ---------------------------------------------------------
// START
// ---------------------------------------------------------

window.onload = verificarLogin;
