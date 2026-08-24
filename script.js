// ==========================================================
// SCRIPT.JS - Painel de Controle Fiscal AguiaContab
// ==========================================================
// IMPORTANTE: Este arquivo NÃO tem mais URL própria.
// A URL do Apps Script e o ID da planilha vêm TODOS do meses.js
// (arquivo CONFIG). Assim você só precisa atualizar em UM lugar
// caso a URL do script mude no futuro.
// ==========================================================

// Pega a URL e o ID direto da configuração central (meses.js)
const APPS_SCRIPT_URL = CONFIG.APPS_SCRIPT_URL;
const SPREADSHEET_ID = CONFIG.SPREADSHEET_ID;
const SPREADSHEET_URL = CONFIG.SPREADSHEET_URL;
const SENHA_ACESSO = CONFIG.SENHA_ACESSO;

let mesAtual = CONFIG.MES_PADRAO;
let categoriaAtual = "SERV";

// ==========================================================
// LOGIN
// ==========================================================
function verificarSenha() {
  const senhaDigitada = document.getElementById("inputSenha").value;
  if (senhaDigitada === SENHA_ACESSO) {
    sessionStorage.setItem("acessoLiberado", "true");
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("telaPrincipal").style.display = "block";
    inicializarPainel();
  } else {
    document.getElementById("erroSenha").innerText = "Senha incorreta. Tente novamente.";
  }
}

function verificarSessao() {
  if (sessionStorage.getItem("acessoLiberado") === "true") {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("telaPrincipal").style.display = "block";
    inicializarPainel();
  }
}

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================
function inicializarPainel() {
  montarAbasMeses();
  montarAbasCategorias();
  carregarDados();
}

function montarAbasMeses() {
  const container = document.getElementById("abasMeses");
  container.innerHTML = "";
  CONFIG.MESES_DISPONIVEIS.forEach(mes => {
    const btn = document.createElement("button");
    btn.innerText = mes;
    btn.className = "aba-mes" + (mes === mesAtual ? " ativa" : "");
    btn.onclick = () => {
      mesAtual = mes;
      montarAbasMeses();
      carregarDados();
    };
    container.appendChild(btn);
  });
}

function montarAbasCategorias() {
  const container = document.getElementById("abasCategorias");
  container.innerHTML = "";
  const categorias = [
    { chave: "SERV", label: "Serviços" },
    { chave: "COMIND", label: "Comércio/Indústria" },
    { chave: "ASSOC", label: "Associações" },
    { chave: "SM", label: "SM" }
  ];
  categorias.forEach(cat => {
    const btn = document.createElement("button");
    btn.innerText = cat.label;
    btn.className = "aba-categoria" + (cat.chave === categoriaAtual ? " ativa" : "");
    btn.onclick = () => {
      categoriaAtual = cat.chave;
      montarAbasCategorias();
      carregarDados();
    };
    container.appendChild(btn);
  });
}

// ==========================================================
// COMUNICAÇÃO COM O APPS SCRIPT (SEM CORS - usando text/plain)
// ==========================================================
function chamarBackend(acao, dados) {
  const payload = JSON.stringify({ acao, mes: mesAtual, categoria: categoriaAtual, dados });

  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: payload
  }).then(res => res.json());
}

function carregarDados() {
  document.getElementById("tabelaEmpresas").innerHTML = "<tr><td>Carregando...</td></tr>";
  chamarBackend("listar", {})
    .then(resp => renderizarTabela(resp.empresas || []))
    .catch(err => {
      console.error(err);
      document.getElementById("tabelaEmpresas").innerHTML =
        "<tr><td>Erro ao carregar dados. Verifique a URL do Apps Script no meses.js.</td></tr>";
    });
}

// ==========================================================
// RENDERIZAÇÃO DA TABELA
// ==========================================================
function renderizarTabela(empresas) {
  const colunas = [
    "MOV", "EMPRESA", "ENVIO", "RET_PRES", "RET_TOMA",
    "PREFEITURA", "GUIA_ISS", "EFD_CONTRIB", "DIRBI", "MIT", "EFD_REINF"
  ];

  let html = "<table><thead><tr>";
  colunas.forEach(c => html += `<th>${c.replace("_", " ")}</th>`);
  html += "<th>Ações</th></tr></thead><tbody>";

  empresas.forEach((emp, index) => {
    html += "<tr>";
    colunas.forEach(col => {
      if (col === "EMPRESA") {
        html += `<td>${emp.EMPRESA || ""}</td>`;
      } else {
        const checked = emp[col] == 1 ? "checked" : "";
        html += `<td><input type="checkbox" ${checked} onchange="atualizarCampo(${index}, '${col}', this.checked)"></td>`;
      }
    });
    html += `<td>
      <button onclick="editarEmpresa(${index})">✏️</button>
      <button onclick="removerEmpresa(${index})">🗑️</button>
    </td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  document.getElementById("tabelaEmpresas").innerHTML = html;
}

// ==========================================================
// AÇÕES: EDITAR / ADICIONAR / REMOVER
// ==========================================================
function atualizarCampo(index, campo, valor) {
  chamarBackend("atualizarCampo", { index, campo, valor: valor ? 1 : 0 })
    .then(() => console.log("Atualizado com sucesso"))
    .catch(err => console.error(err));
}

function adicionarEmpresa() {
  const nome = prompt("Nome da nova empresa:");
  if (!nome) return;
  chamarBackend("adicionar", { nome })
    .then(() => carregarDados())
    .catch(err => console.error(err));
}

function editarEmpresa(index) {
  const novoNome = prompt("Novo nome da empresa:");
  if (!novoNome) return;
  chamarBackend("editar", { index, nome: novoNome })
    .then(() => carregarDados())
    .catch(err => console.error(err));
}

function removerEmpresa(index) {
  if (!confirm("Tem certeza que deseja remover esta empresa?")) return;
  chamarBackend("remover", { index })
    .then(() => carregarDados())
    .catch(err => console.error(err));
}

// ==========================================================
// CRIAR NOVO MÊS (duplica as abas TEMPLATE_*)
// ==========================================================
function criarNovoMes() {
  const nomeMes = prompt("Nome do novo mês (ex: SETEMBRO):");
  if (!nomeMes) return;
  chamarBackend("criarMes", { nomeMes: nomeMes.toUpperCase() })
    .then(() => {
      alert("Mês criado! Atualize o meses.js adicionando '" + nomeMes.toUpperCase() + "' na lista de MESES_DISPONIVEIS.");
    })
    .catch(err => console.error(err));
}

function abrirPlanilha() {
  window.open(SPREADSHEET_URL, "_blank");
}

// ==========================================================
// INICIA AO CARREGAR A PÁGINA
// ==========================================================
window.onload = verificarSessao;
