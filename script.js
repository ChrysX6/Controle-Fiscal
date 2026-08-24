// ============================================================
// CONTROLE FISCAL - AGUIA CONTAB
// Front-end: login, navegação de meses/categorias e integração
// com o Google Apps Script (planilha única)
// ============================================================

const SENHA_ACESSO = "Aguia2025@";

let estado = {
  mes: null,
  categoria: "SERV",
  cabecalho: [],
  linhas: [],
  colunaEmpresa: 0
};

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
const loginOverlay = document.getElementById("loginOverlay");
const app = document.getElementById("app");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

function verificarLoginSalvo() {
  if (sessionStorage.getItem("aguia_auth") === "1") {
    liberarAcesso();
  }
}

function liberarAcesso() {
  loginOverlay.style.display = "none";
  app.classList.remove("app-hidden");
  iniciarApp();
}

loginBtn.addEventListener("click", tentarLogin);
passwordInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") tentarLogin();
});

function tentarLogin() {
  const valor = passwordInput.value.trim();
  if (valor === SENHA_ACESSO) {
    sessionStorage.setItem("aguia_auth", "1");
    loginError.textContent = "";
    liberarAcesso();
  } else {
    loginError.textContent = "Senha incorreta. Tente novamente.";
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("aguia_auth");
  location.reload();
});

verificarLoginSalvo();

// ------------------------------------------------------------
// INICIALIZAÇÃO DO APP
// ------------------------------------------------------------
function iniciarApp() {
  montarAbasDeMes();
  montarAbasDeCategoria();
  document.getElementById("openSheetBtn").addEventListener("click", abrirPlanilha);
  document.getElementById("refreshBtn").addEventListener("click", carregarDados);
  document.getElementById("addCompanyBtn").addEventListener("click", abrirModalAdicionar);
  document.getElementById("createMonthBtn").addEventListener("click", abrirModalMes);

  if (MESES_DISPONIVEIS.length > 0) {
    estado.mes = MESES_DISPONIVEIS[0];
  }
  carregarDados();
}

function montarAbasDeMes() {
  const container = document.getElementById("monthTabs");
  container.innerHTML = "";
  MESES_DISPONIVEIS.forEach((mes) => {
    const btn = document.createElement("button");
    btn.className = "month-btn" + (mes === estado.mes ? " active" : "");
    btn.textContent = mes;
    btn.addEventListener("click", () => {
      estado.mes = mes;
      document.querySelectorAll(".month-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      carregarDados();
    });
    container.appendChild(btn);
  });
}

function montarAbasDeCategoria() {
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      estado.categoria = btn.dataset.cat;
      carregarDados();
    });
  });
}

function abrirPlanilha() {
  window.open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`, "_blank");
}

// ------------------------------------------------------------
// CARREGAR DADOS DA PLANILHA
// ------------------------------------------------------------
function carregarDados() {
  if (!estado.mes) {
    alert("Nenhum mês configurado em meses.js");
    return;
  }
  document.getElementById("loadingIndicator").style.display = "block";
  document.getElementById("tableBody").innerHTML = "";

  const url = `${APPS_SCRIPT_URL}?action=getData&mes=${encodeURIComponent(estado.mes)}&categoria=${encodeURIComponent(estado.categoria)}`;

  fetch(url)
    .then(res => res.json())
    .then(json => {
      document.getElementById("loadingIndicator").style.display = "none";
      if (!json.success) {
        alert("Erro ao carregar dados: " + json.message);
        return;
      }
      const [cabecalho, ...linhas] = json.data;
      estado.cabecalho = cabecalho;
      estado.linhas = linhas;
      renderizarTabela();
      atualizarResumo();
    })
    .catch(err => {
      document.getElementById("loadingIndicator").style.display = "none";
      alert("Erro de conexão com a planilha: " + err);
    });
}

// ------------------------------------------------------------
// RENDERIZAR TABELA
// ------------------------------------------------------------
function ehColunaCheckbox(nomeColuna) {
  const nome = (nomeColuna || "").toUpperCase();
  const chaves = ["MOV", "ENV", "RET", "PREFEITURA", "GUIA", "EFD", "DIRBI", "MIT", "REINF", "CONC", "SER", "CM"];
  return chaves.some(k => nome.includes(k)) && !nome.includes("EMPRESA");
}

function renderizarTabela() {
  const head = document.getElementById("tableHead");
  const body = document.getElementById("tableBody");
  head.innerHTML = "";
  body.innerHTML = "";

  // Cabeçalho
  const trHead = document.createElement("tr");
  estado.cabecalho.forEach((col, idx) => {
    if ((col || "").toUpperCase().includes("EMPRESA")) estado.colunaEmpresa = idx;
    const th = document.createElement("th");
    th.textContent = col || "-";
    trHead.appendChild(th);
  });
  const thAcoes = document.createElement("th");
  thAcoes.textContent = "AÇÕES";
  trHead.appendChild(thAcoes);
  head.appendChild(trHead);

  // Linhas
  estado.linhas.forEach((linha, rowIdx) => {
    if (!linha[estado.colunaEmpresa]) return; // pula linhas vazias/observações finais
    const tr = document.createElement("tr");

    estado.cabecalho.forEach((col, colIdx) => {
      const td = document.createElement("td");
      const valor = linha[colIdx];

      if (colIdx === estado.colunaEmpresa) {
        td.textContent = valor;
        td.classList.add("empresa-col");
      } else if (ehColunaCheckbox(col)) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = valor === 1 || valor === "1" || valor === true;
        checkbox.addEventListener("change", () => {
          atualizarCelula(rowIdx + 2, colIdx + 1, checkbox.checked ? 1 : 0);
        });
        td.appendChild(checkbox);
      } else {
        td.textContent = valor !== undefined ? valor : "";
      }
      tr.appendChild(td);
    });

    const tdAcoes = document.createElement("td");
    tdAcoes.innerHTML = `
      <div class="action-icons">
        <button class="icon-btn" title="Editar">✏️</button>
        <button class="icon-btn" title="Remover">🗑️</button>
      </div>`;
    tdAcoes.querySelector("[title='Editar']").addEventListener("click", () => abrirModalEditar(rowIdx));
    tdAcoes.querySelector("[title='Remover']").addEventListener("click", () => removerEmpresa(rowIdx));
    tr.appendChild(tdAcoes);

    body.appendChild(tr);
  });
}

function atualizarResumo() {
  const total = estado.linhas.filter(l => l[estado.colunaEmpresa]).length;
  document.getElementById("summary").textContent = `Total de empresas: ${total}`;
}

// ------------------------------------------------------------
// ATUALIZAR CÉLULA (checkbox)
// ------------------------------------------------------------
function atualizarCelula(row, col, valor) {
  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "updateCell",
      mes: estado.mes,
      categoria: estado.categoria,
      row: row,
      col: col,
      value: valor
    })
  })
  .then(res => res.json())
  .then(json => {
    if (!json.success) alert("Erro ao salvar: " + json.message);
  })
  .catch(err => alert("Erro de conexão: " + err));
}

// ------------------------------------------------------------
// MODAL ADICIONAR / EDITAR EMPRESA
// ------------------------------------------------------------
const companyModal = document.getElementById("companyModal");
const modalFields = document.getElementById("modalFields");
const modalTitle = document.getElementById("modalTitle");
let linhaEmEdicao = null;

function abrirModalAdicionar() {
  linhaEmEdicao = null;
  modalTitle.textContent = "Adicionar Empresa";
  montarCamposModal(estado.cabecalho.map(() => ""));
  companyModal.style.display = "flex";
}

function abrirModalEditar(rowIdx) {
  linhaEmEdicao = rowIdx;
  modalTitle.textContent = "Editar Empresa";
  montarCamposModal(estado.linhas[rowIdx]);
  companyModal.style.display = "flex";
}

function montarCamposModal(valores) {
  modalFields.innerHTML = "";
  estado.cabecalho.forEach((col, idx) => {
    const label = document.createElement("label");
    label.textContent = col || `Coluna ${idx + 1}`;
    const input = document.createElement("input");
    input.type = "text";
    input.value = valores[idx] !== undefined ? valores[idx] : "";
    input.dataset.idx = idx;
    modalFields.appendChild(label);
    modalFields.appendChild(input);
  });
}

document.getElementById("modalCancelBtn").addEventListener("click", () => {
  companyModal.style.display = "none";
});

document.getElementById("modalSaveBtn").addEventListener("click", () => {
  const inputs = modalFields.querySelectorAll("input");
  const valores = Array.from(inputs).map(i => {
    const v = i.value.trim();
    if (v === "0" || v === "1") return Number(v);
    return v;
  });

  if (linhaEmEdicao === null) {
    // Adicionar
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addRow",
        mes: estado.mes,
        categoria: estado.categoria,
        values: valores
      })
    })
    .then(res => res.json())
    .then(json => {
      if (json.success) {
        companyModal.style.display = "none";
        carregarDados();
      } else {
        alert("Erro: " + json.message);
      }
    });
  } else {
    // Editar
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateRow",
        mes: estado.mes,
        categoria: estado.categoria,
        row: linhaEmEdicao + 2,
        values: valores
      })
    })
    .then(res => res.json())
    .then(json => {
      if (json.success) {
        companyModal.style.display = "none";
        carregarDados();
      } else {
        alert("Erro: " + json.message);
      }
    });
  }
});

function removerEmpresa(rowIdx) {
  const nome = estado.linhas[rowIdx][estado.colunaEmpresa];
  if (!confirm(`Remover a empresa "${nome}"?`)) return;

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "deleteRow",
      mes: estado.mes,
      categoria: estado.categoria,
      row: rowIdx + 2
    })
  })
  .then(res => res.json())
  .then(json => {
    if (json.success) {
      carregarDados();
    } else {
      alert("Erro: " + json.message);
    }
  });
}

// ------------------------------------------------------------
// MODAL CRIAR NOVO MÊS
// ------------------------------------------------------------
const monthModal = document.getElementById("monthModal");

function abrirModalMes() {
  document.getElementById("newMonthName").value = "";
  monthModal.style.display = "flex";
}

document.getElementById("monthCancelBtn").addEventListener("click", () => {
  monthModal.style.display = "none";
});

document.getElementById("monthSaveBtn").addEventListener("click", () => {
  const nome = document.getElementById("newMonthName").value.trim().toUpperCase();
  if (!nome) {
    alert("Digite o nome do mês.");
    return;
  }

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "createMonth",
      mes: nome
    })
  })
  .then(res => res.json())
  .then(json => {
    if (json.success) {
      alert(`Mês "${nome}" criado com sucesso! Adicione "${nome}" na lista MESES_DISPONIVEIS do arquivo meses.js.`);
      monthModal.style.display = "none";
    } else {
      alert("Erro: " + json.message);
    }
  });
});
