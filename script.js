// ==========================================================
// script.js
// Lógica completa do Controle Fiscal - AguiaContab
// Lê toda a configuração do meses.js (objeto CONFIG)
// ==========================================================

const APPS_SCRIPT_URL = CONFIG.APPS_SCRIPT_URL;

let mesAtual = CONFIG.MES_PADRAO;
let categoriaAtual = CONFIG.CATEGORIAS[0].chave;
let dadosAtuais = [];
let empresaEmEdicao = null;

// ================= LOGIN =================
const telaLogin = document.getElementById("tela-login");
const app = document.getElementById("app");
const inputSenha = document.getElementById("input-senha");
const btnEntrar = document.getElementById("btn-entrar");
const erroLogin = document.getElementById("erro-login");

function verificarSessao() {
  if (sessionStorage.getItem("aguia_logado") === "true") {
    liberarAcesso();
  }
}

function liberarAcesso() {
  telaLogin.classList.add("oculto");
  app.classList.remove("oculto");
  inicializarInterface();
}

btnEntrar.addEventListener("click", tentarLogin);
inputSenha.addEventListener("keydown", (e) => { if (e.key === "Enter") tentarLogin(); });

function tentarLogin() {
  const valor = inputSenha.value.trim();
  if (valor === CONFIG.SENHA_ACESSO) {
    sessionStorage.setItem("aguia_logado", "true");
    erroLogin.textContent = "";
    liberarAcesso();
  } else {
    erroLogin.textContent = "Senha incorreta. Tente novamente.";
  }
}

document.getElementById("btn-sair").addEventListener("click", () => {
  sessionStorage.removeItem("aguia_logado");
  location.reload();
});

// ================= INICIALIZAÇÃO DA INTERFACE =================
function inicializarInterface() {
  montarNavMeses();
  montarNavCategorias();
  document.getElementById("btn-abrir-planilha").addEventListener("click", () => {
    window.open(CONFIG.SPREADSHEET_URL, "_blank");
  });
  document.getElementById("btn-add-empresa").addEventListener("click", abrirModalAdicionar);
  document.getElementById("btn-novo-mes").addEventListener("click", abrirModalNovoMes);
  carregarDados();
}

function montarNavMeses() {
  const nav = document.getElementById("nav-meses");
  nav.innerHTML = "";
  CONFIG.MESES.forEach(mes => {
    const btn = document.createElement("button");
    btn.className = "aba-btn" + (mes.chave === mesAtual ? " ativo" : "");
    btn.textContent = mes.label;
    btn.addEventListener("click", () => {
      mesAtual = mes.chave;
      montarNavMeses();
      carregarDados();
    });
    nav.appendChild(btn);
  });
}

function montarNavCategorias() {
  const nav = document.getElementById("nav-categorias");
  nav.innerHTML = "";
  CONFIG.CATEGORIAS.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "aba-btn" + (cat.chave === categoriaAtual ? " ativo" : "");
    btn.textContent = cat.label;
    btn.addEventListener("click", () => {
      categoriaAtual = cat.chave;
      montarNavCategorias();
      carregarDados();
    });
    nav.appendChild(btn);
  });
}

// ================= COMUNICAÇÃO COM O APPS SCRIPT =================
function chamarBackend(acao, payload) {
  mostrarStatus("Salvando...");
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ acao, ...payload })
  })
  .then(res => res.json())
  .then(resposta => {
    mostrarStatus(resposta.ok ? "Salvo ✅" : "Erro ao salvar ❌");
    return resposta;
  })
  .catch(erro => {
    mostrarStatus("Erro de conexão ❌");
    console.error(erro);
    throw erro;
  });
}

function mostrarStatus(texto) {
  const el = document.getElementById("status-salvando");
  el.textContent = texto;
  setTimeout(() => { el.textContent = ""; }, 2500);
}

function nomeAba() {
  return `${mesAtual}_${categoriaAtual}`;
}

// ================= CARREGAR DADOS =================
function carregarDados() {
  const url = `${APPS_SCRIPT_URL}?acao=listar&aba=${encodeURIComponent(nomeAba())}`;
  document.getElementById("tabela-corpo").innerHTML = `<tr><td colspan="20">Carregando...</td></tr>`;

  fetch(url, { method: "GET" })
    .then(res => res.json())
    .then(resposta => {
      dadosAtuais = resposta.dados || [];
      renderizarTabela();
    })
    .catch(erro => {
      console.error(erro);
      document.getElementById("tabela-corpo").innerHTML =
        `<tr><td colspan="20">Erro ao carregar dados. Verifique a conexão com o Apps Script.</td></tr>`;
    });
}

// ================= RENDERIZAR TABELA =================
function renderizarTabela() {
  const colunas = CONFIG.COLUNAS[categoriaAtual];
  const thead = document.getElementById("tabela-cabecalho");
  const tbody = document.getElementById("tabela-corpo");

  thead.innerHTML = "<tr>" + colunas.map(c => `<th>${c.label}</th>`).join("") + "<th>Ações</th></tr>";

  if (!dadosAtuais.length) {
    tbody.innerHTML = `<tr><td colspan="${colunas.length + 1}">Nenhuma empresa cadastrada nesta aba.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  dadosAtuais.forEach((linha, indice) => {
    const tr = document.createElement("tr");

    colunas.forEach(col => {
      const td = document.createElement("td");
      const valor = linha[col.chave];

      if (col.tipo === "checkbox") {
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = valor === 1 || valor === "1" || valor === true;
        check.addEventListener("change", () => {
          linha[col.chave] = check.checked ? 1 : 0;
          salvarLinha(indice, linha);
        });
        td.appendChild(check);
      } else {
        td.textContent = valor || "";
        if (col.chave === "EMPRESAS") td.classList.add("texto-empresa");
      }
      tr.appendChild(td);
    });

    const tdAcoes = document.createElement("td");
    tdAcoes.innerHTML = `
      <span class="acao-icone" title="Editar">✏️</span>
      <span class="acao-icone" title="Remover">🗑️</span>
    `;
    tdAcoes.children[0].addEventListener("click", () => abrirModalEditar(indice));
    tdAcoes.children[1].addEventListener("click", () => removerEmpresa(indice));
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);
  });
}

// ================= SALVAR LINHA (checkbox) =================
function salvarLinha(indice, linha) {
  chamarBackend("atualizarLinha", {
    aba: nomeAba(),
    indice,
    linha
  });
}

// ================= MODAL ADICIONAR / EDITAR =================
const modalEmpresa = document.getElementById("modal-empresa");
const modalTitulo = document.getElementById("modal-titulo");
const modalCampos = document.getElementById("modal-campos");

function abrirModalAdicionar() {
  empresaEmEdicao = null;
  modalTitulo.textContent = "Adicionar Empresa";
  montarCamposModal({});
  modalEmpresa.classList.remove("oculto");
}

function abrirModalEditar(indice) {
  empresaEmEdicao = indice;
  modalTitulo.textContent = "Editar Empresa";
  montarCamposModal(dadosAtuais[indice]);
  modalEmpresa.classList.remove("oculto");
}

function montarCamposModal(dados) {
  const colunas = CONFIG.COLUNAS[categoriaAtual];
  modalCampos.innerHTML = "";
  colunas.forEach(col => {
    const div = document.createElement("div");
    div.className = "campo-modal";
    const label = document.createElement("label");
    label.textContent = col.label;
    div.appendChild(label);

    if (col.tipo === "checkbox") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.chave = col.chave;
      input.checked = dados[col.chave] === 1 || dados[col.chave] === "1";
      div.appendChild(input);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.dataset.chave = col.chave;
      input.value = dados[col.chave] || "";
      div.appendChild(input);
    }
    modalCampos.appendChild(div);
  });
}

document.getElementById("btn-modal-cancelar").addEventListener("click", () => {
  modalEmpresa.classList.add("oculto");
});

document.getElementById("btn-modal-salvar").addEventListener("click", () => {
  const inputs = modalCampos.querySelectorAll("input");
  const novaLinha = {};
  inputs.forEach(input => {
    if (input.type === "checkbox") {
      novaLinha[input.dataset.chave] = input.checked ? 1 : 0;
    } else {
      novaLinha[input.dataset.chave] = input.value;
    }
  });

  if (empresaEmEdicao === null) {
    chamarBackend("adicionarLinha", { aba: nomeAba(), linha: novaLinha })
      .then(() => { modalEmpresa.classList.add("oculto"); carregarDados(); });
  } else {
    chamarBackend("atualizarLinha", { aba: nomeAba(), indice: empresaEmEdicao, linha: novaLinha })
      .then(() => { modalEmpresa.classList.add("oculto"); carregarDados(); });
  }
});

// ================= REMOVER EMPRESA =================
function removerEmpresa(indice) {
  const nomeEmpresa = dadosAtuais[indice].EMPRESAS || "esta empresa";
  if (!confirm(`Tem certeza que deseja remover "${nomeEmpresa}"?`)) return;

  chamarBackend("removerLinha", { aba: nomeAba(), indice })
    .then(() => carregarDados());
}

// ================= CRIAR NOVO MÊS =================
const modalNovoMes = document.getElementById("modal-novo-mes");

function abrirModalNovoMes() {
  document.getElementById("input-novo-mes").value = "";
  modalNovoMes.classList.remove("oculto");
}

document.getElementById("btn-criar-mes-cancelar").addEventListener("click", () => {
  modalNovoMes.classList.add("oculto");
});

document.getElementById("btn-criar-mes-confirmar").addEventListener("click", () => {
  const nomeMes = document.getElementById("input-novo-mes").value.trim().toUpperCase();
  if (!nomeMes) return alert("Digite o nome do mês.");

  chamarBackend("criarMes", { mes: nomeMes, templates: CONFIG.TEMPLATES })
    .then(resposta => {
      if (resposta.ok) {
        alert(`Mês ${nomeMes} criado com sucesso! Adicione-o manualmente na lista MESES do arquivo meses.js para que apareça na navegação.`);
        modalNovoMes.classList.add("oculto");
      } else {
        alert("Erro ao criar o novo mês: " + (resposta.erro || "desconhecido"));
      }
    });
});

// ================= START =================
verificarSessao();
