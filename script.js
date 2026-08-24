// ===================== CONFIGURAÇÃO ===================== //
const APPS_SCRIPT_URL = CONFIG.APPS_SCRIPT_URL;
const SENHA_ACESSO = CONFIG.SENHA_ACESSO;

let mesAtual = CONFIG.MES_PADRAO;
let categoriaAtual = "SERV";
let colunasAtuais = [];
let dadosAtuais = [];

// Colunas que devem virar CHECKBOX (checklist) em vez de campo de texto
const COLUNAS_CHECKLIST = [
  "CONC", "MOV", "SER", "COM", "CM", "ENVIO", "ENV", "RET PRES", "RET TOMA",
  "PREFEITURA", "GUIA ISS", "MIT", "EFD ICMS/IPI", "EFD REINF",
  "DIPAM / QUOTAS"
];
// Colunas que contém EFD CONTRIB e DIRBI variam de nome por causa da data (ex: "EFD CONT 06/2026")
function ehColunaChecklist(nomeColuna) {
  const nome = nomeColuna.toUpperCase().trim();
  if (COLUNAS_CHECKLIST.includes(nome)) return true;
  if (nome.startsWith("EFD CONT")) return true;
  if (nome.startsWith("DIRBI")) return true;
  return false;
}

// ===================== LOGIN ===================== //
function verificarSenha() {
  const senha = document.getElementById("input-senha").value;
  if (senha === SENHA_ACESSO) {
    sessionStorage.setItem("logado", "sim");
    document.getElementById("tela-login").style.display = "none";
    document.getElementById("app").style.display = "block";
    iniciarApp();
  } else {
    document.getElementById("erro-senha").innerText = "Senha incorreta. Tente novamente.";
  }
}

function sair() {
  sessionStorage.removeItem("logado");
  location.reload();
}

window.onload = function () {
  if (sessionStorage.getItem("logado") === "sim") {
    document.getElementById("tela-login").style.display = "none";
    document.getElementById("app").style.display = "block";
    iniciarApp();
  }
};

// ===================== INICIALIZAÇÃO ===================== //
function iniciarApp() {
  renderizarBarraMeses();
  renderizarBarraCategorias();
  carregarDados();
}

function renderizarBarraMeses() {
  const container = document.getElementById("barra-meses");
  container.innerHTML = "";
  CONFIG.MESES.forEach((mes) => {
    const btn = document.createElement("button");
    btn.className = "chip-mes" + (mes === mesAtual ? " ativo" : "");
    btn.innerText = mes;
    btn.onclick = () => {
      mesAtual = mes;
      renderizarBarraMeses();
      carregarDados();
    };
    container.appendChild(btn);
  });
}

function renderizarBarraCategorias() {
  const categorias = [
    { chave: "SERV", nome: "Serviços" },
    { chave: "COMIND", nome: "Comércio & Indústria" },
    { chave: "ASSOC", nome: "Associações" },
    { chave: "SM", nome: "SM" }
  ];
  const container = document.getElementById("barra-categorias");
  container.innerHTML = "";
  categorias.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "chip-categoria" + (cat.chave === categoriaAtual ? " ativo" : "");
    btn.innerText = cat.nome;
    btn.onclick = () => {
      categoriaAtual = cat.chave;
      renderizarBarraCategorias();
      carregarDados();
    };
    container.appendChild(btn);
  });
}

// ===================== CARREGAR DADOS ===================== //
function carregarDados() {
  document.getElementById("tabela-body").innerHTML = '<tr><td class="carregando">Carregando...</td></tr>';
  document.getElementById("tabela-head").innerHTML = "";

  const url = `${APPS_SCRIPT_URL}?action=getDados&mes=${mesAtual}&categoria=${categoriaAtual}`;

  fetch(url)
    .then((res) => res.json())
    .then((resp) => {
      if (!resp.sucesso) {
        document.getElementById("tabela-body").innerHTML =
          `<tr><td class="carregando">Erro: ${resp.mensagem || "não foi possível carregar"}</td></tr>`;
        return;
      }
      colunasAtuais = resp.colunas;
      dadosAtuais = resp.linhas;
      renderizarTabela();
    })
    .catch((err) => {
      document.getElementById("tabela-body").innerHTML =
        `<tr><td class="carregando">Erro de conexão: ${err}</td></tr>`;
    });
}

// ===================== RENDERIZAR TABELA ===================== //
function renderizarTabela() {
  const thead = document.getElementById("tabela-head");
  const tbody = document.getElementById("tabela-body");

  // Cabeçalho
  let headHtml = "<tr>";
  colunasAtuais.forEach((col) => {
    headHtml += `<th>${col}</th>`;
  });
  headHtml += "<th>Ações</th></tr>";
  thead.innerHTML = headHtml;

  if (dadosAtuais.length === 0) {
    tbody.innerHTML = `<tr><td class="carregando" colspan="${colunasAtuais.length + 1}">Nenhuma empresa cadastrada nesta aba.</td></tr>`;
    return;
  }

  // Corpo
  let bodyHtml = "";
  dadosAtuais.forEach((linha, indiceLinha) => {
    bodyHtml += "<tr>";
    colunasAtuais.forEach((col, indiceColuna) => {
      const valor = linha[indiceColuna] !== undefined ? linha[indiceColuna] : "";
      if (ehColunaChecklist(col)) {
        const marcado = valorEhVerdadeiro(valor);
        bodyHtml += `<td>
          <input type="checkbox" class="check-fiscal" ${marcado ? "checked" : ""}
            onchange="salvarCelula(${indiceLinha}, ${indiceColuna}, this.checked ? 1 : 0)">
        </td>`;
      } else {
        bodyHtml += `<td>
          <input type="text" class="input-tabela" value="${escaparHtml(valor)}"
            onblur="salvarCelula(${indiceLinha}, ${indiceColuna}, this.value)">
        </td>`;
      }
    });
    bodyHtml += `<td><button class="btn-remover" onclick="removerEmpresa(${indiceLinha})">🗑️</button></td>`;
    bodyHtml += "</tr>";
  });
  tbody.innerHTML = bodyHtml;
}

function valorEhVerdadeiro(valor) {
  if (valor === true) return true;
  const texto = String(valor).trim().toUpperCase();
  return texto === "1" || texto === "SIM" || texto === "TRUE" || texto === "X";
}

function escaparHtml(valor) {
  return String(valor).replace(/"/g, "&quot;");
}

// ===================== SALVAR CÉLULA ===================== //
function salvarCelula(indiceLinha, indiceColuna, novoValor) {
  mostrarStatus("Salvando...", "");

  const corpo = {
    action: "salvarCelula",
    mes: mesAtual,
    categoria: categoriaAtual,
    linha: indiceLinha,
    coluna: indiceColuna,
    valor: novoValor
  };

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(corpo)
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.sucesso) {
        dadosAtuais[indiceLinha][indiceColuna] = novoValor;
        mostrarStatus("✔ Salvo", "ok");
      } else {
        mostrarStatus("Erro ao salvar", "erro");
      }
    })
    .catch(() => mostrarStatus("Erro de conexão", "erro"));
}

function mostrarStatus(texto, classe) {
  const el = document.getElementById("status-salvamento");
  el.innerText = texto;
  el.className = "status-salvamento " + classe;
  if (classe === "ok") {
    setTimeout(() => { el.innerText = ""; }, 2000);
  }
}

// ===================== ADICIONAR EMPRESA ===================== //
function mostrarModalAdicionar() {
  const container = document.getElementById("form-adicionar-campos");
  container.innerHTML = "";
  colunasAtuais.forEach((col, i) => {
    if (ehColunaChecklist(col)) {
      container.innerHTML += `
        <div class="campo-checkbox">
          <input type="checkbox" id="novo-campo-${i}">
          <label for="novo-campo-${i}">${col}</label>
        </div>`;
    } else {
      container.innerHTML += `
        <div>
          <label>${col}</label>
          <input type="text" id="novo-campo-${i}" placeholder="${col}">
        </div>`;
    }
  });
  document.getElementById("modal-adicionar").style.display = "flex";
}

function fecharModalAdicionar() {
  document.getElementById("modal-adicionar").style.display = "none";
}

function confirmarAdicionarEmpresa() {
  const novaLinha = colunasAtuais.map((col, i) => {
    const campo = document.getElementById(`novo-campo-${i}`);
    if (ehColunaChecklist(col)) {
      return campo.checked ? 1 : 0;
    }
    return campo.value;
  });

  const corpo = {
    action: "adicionarEmpresa",
    mes: mesAtual,
    categoria: categoriaAtual,
    linha: novaLinha
  };

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(corpo)
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.sucesso) {
        fecharModalAdicionar();
        carregarDados();
      } else {
        alert("Erro ao adicionar empresa: " + (resp.mensagem || "desconhecido"));
      }
    })
    .catch((err) => alert("Erro de conexão: " + err));
}

// ===================== REMOVER EMPRESA ===================== //
function removerEmpresa(indiceLinha) {
  if (!confirm("Tem certeza que deseja remover esta empresa?")) return;

  const corpo = {
    action: "removerEmpresa",
    mes: mesAtual,
    categoria: categoriaAtual,
    linha: indiceLinha
  };

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(corpo)
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.sucesso) {
        carregarDados();
      } else {
        alert("Erro ao remover empresa: " + (resp.mensagem || "desconhecido"));
      }
    })
    .catch((err) => alert("Erro de conexão: " + err));
}

// ===================== CRIAR NOVO MÊS ===================== //
function mostrarModalNovoMes() {
  document.getElementById("input-novo-mes").value = "";
  document.getElementById("modal-novo-mes").style.display = "flex";
}

function fecharModalNovoMes() {
  document.getElementById("modal-novo-mes").style.display = "none";
}

function confirmarNovoMes() {
  const nomeMes = document.getElementById("input-novo-mes").value.trim().toUpperCase();
  if (!nomeMes) {
    alert("Digite um nome válido para o mês.");
    return;
  }

  const corpo = {
    action: "criarMes",
    mes: nomeMes
  };

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(corpo)
  })
    .then((res) => res.json())
    .then((resp) => {
      if (resp.sucesso) {
        fecharModalNovoMes();
        if (!CONFIG.MESES.includes(nomeMes)) {
          CONFIG.MESES.push(nomeMes);
        }
        mesAtual = nomeMes;
        renderizarBarraMeses();
        carregarDados();
        alert("Mês criado com sucesso! Lembre-se de adicionar '" + nomeMes + "' na lista MESES do arquivo meses.js para ele continuar aparecendo nas próximas visitas.");
      } else {
        alert("Erro ao criar o novo mês: " + (resp.mensagem || "desconhecido"));
      }
    })
    .catch((err) => alert("Erro de conexão: " + err));
}

// ===================== ABRIR PLANILHA ===================== //
function abrirPlanilha() {
  window.open(CONFIG.SPREADSHEET_URL, "_blank");
}
