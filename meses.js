// ==========================================================
// meses.js
// Configuração central do sistema de Controle Fiscal
// AguiaContab - Todos os outros arquivos leem daqui
// ==========================================================

const CONFIG = {
  // Senha de acesso ao site
  SENHA_ACESSO: "Aguia2025@",

  // ID da planilha única do Google Sheets
  SPREADSHEET_ID: "1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw",

  // Link direto para abrir a planilha no navegador
  SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw/edit?gid=0#gid=0",

  // URL do Web App do Google Apps Script (deve terminar em /exec)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyTL7JZCq2oMG69agLIgjj2N7ZOapcAT87wvjN154Rod_DDI8nbkbc67siul9IABvDW/exec",

  // Link da logo da empresa
  LOGO_URL: "https://chrysx6.github.io/LinksAguiaContab/links/img/logo1.jpg",

  // Mês que abre automaticamente ao carregar o site
  MES_PADRAO: "AGOSTO",

  // Lista de meses disponíveis (adicione novos meses aqui conforme forem criados)
  MESES: [
    { chave: "AGOSTO", label: "Agosto" }
  ],

  // Categorias/abas de cada mês (usadas para montar o nome real da aba: MES_CATEGORIA)
  CATEGORIAS: [
    { chave: "SERV",   label: "Serviços" },
    { chave: "COMIND", label: "Comércio & Indústria" },
    { chave: "ASSOC",  label: "Associações" },
    { chave: "SM",     label: "SM" }
  ],

  // Nomes das abas modelo, usadas para criar um novo mês automaticamente
  TEMPLATES: {
    SERV: "TEMPLATE_SERV",
    COMIND: "TEMPLATE_COMIND",
    ASSOC: "TEMPLATE_ASSOC",
    SM: "TEMPLATE_SM"
  },

  // Definição das colunas por categoria (nome exibido + chave da coluna real na planilha)
  COLUNAS: {
    SERV: [
      { chave: "CONC", label: "Conc.", tipo: "checkbox" },
      { chave: "MOV", label: "Mov.", tipo: "checkbox" },
      { chave: "EMPRESAS", label: "Empresa", tipo: "texto" },
      { chave: "ENVIO", label: "Envio", tipo: "checkbox" },
      { chave: "RET_PRES", label: "Ret. Prest.", tipo: "checkbox" },
      { chave: "RET_TOMA", label: "Ret. Tomados", tipo: "checkbox" },
      { chave: "PREFEITURA", label: "Prefeitura", tipo: "checkbox" },
      { chave: "GUIA_ISS", label: "Guia ISS", tipo: "checkbox" },
      { chave: "EFD_CONTRIB", label: "EFD Contrib.", tipo: "checkbox" },
      { chave: "DIRBI", label: "DIRBI", tipo: "checkbox" },
      { chave: "MIT", label: "MIT", tipo: "checkbox" },
      { chave: "EFD_REINF", label: "EFD Reinf", tipo: "checkbox" },
      { chave: "OBS", label: "Observações", tipo: "texto" }
    ],
    COMIND: [
      { chave: "CONC", label: "Conc.", tipo: "checkbox" },
      { chave: "SER", label: "Ser.", tipo: "checkbox" },
      { chave: "CM", label: "CM", tipo: "checkbox" },
      { chave: "MOV", label: "Mov.", tipo: "checkbox" },
      { chave: "EMPRESAS", label: "Empresa", tipo: "texto" },
      { chave: "ENV", label: "Envio", tipo: "checkbox" },
      { chave: "RET_PRES", label: "Ret. Prest.", tipo: "checkbox" },
      { chave: "RET_TOMA", label: "Ret. Tomados", tipo: "checkbox" },
      { chave: "PREFEITURA", label: "Prefeitura", tipo: "checkbox" },
      { chave: "GUIA_ISS", label: "Guia ISS", tipo: "checkbox" },
      { chave: "EFD_CONTRIB", label: "EFD Contrib.", tipo: "checkbox" },
      { chave: "DIRBI", label: "DIRBI", tipo: "checkbox" },
      { chave: "EFD_ICMS_IPI", label: "EFD ICMS/IPI", tipo: "checkbox" },
      { chave: "MIT", label: "MIT", tipo: "checkbox" },
      { chave: "EFD_REINF", label: "EFD Reinf", tipo: "checkbox" },
      { chave: "OBS", label: "Observações", tipo: "texto" }
    ],
    ASSOC: [
      { chave: "CONC", label: "Conc.", tipo: "checkbox" },
      { chave: "MOV", label: "Mov.", tipo: "checkbox" },
      { chave: "EMPRESAS", label: "Empresa", tipo: "texto" },
      { chave: "ENVIO", label: "Envio", tipo: "checkbox" },
      { chave: "RET_PRES", label: "Ret. Prest.", tipo: "checkbox" },
      { chave: "RET_TOMA", label: "Ret. Tomados", tipo: "checkbox" },
      { chave: "PREFEITURA", label: "Prefeitura", tipo: "checkbox" },
      { chave: "GUIA_ISS", label: "Guia ISS", tipo: "checkbox" },
      { chave: "EFD_CONTRIB", label: "EFD Contrib.", tipo: "checkbox" },
      { chave: "DIRBI", label: "DIRBI", tipo: "checkbox" },
      { chave: "MIT", label: "MIT", tipo: "checkbox" },
      { chave: "EFD_REINF", label: "EFD Reinf", tipo: "checkbox" },
      { chave: "OBS", label: "Observações", tipo: "texto" }
    ],
    SM: [
      { chave: "CONC", label: "Conc.", tipo: "checkbox" },
      { chave: "SER", label: "Ser.", tipo: "checkbox" },
      { chave: "COM", label: "Com.", tipo: "checkbox" },
      { chave: "EMPRESAS", label: "Empresa", tipo: "texto" },
      { chave: "ENVIO", label: "Envio", tipo: "checkbox" },
      { chave: "RET_PRES", label: "Ret. Prest.", tipo: "checkbox" },
      { chave: "RET_TOMA", label: "Ret. Tomados", tipo: "checkbox" },
      { chave: "PREFEITURA", label: "Prefeitura", tipo: "checkbox" },
      { chave: "GUIA_ISS", label: "Guia ISS", tipo: "checkbox" },
      { chave: "EFD_CONTRIB", label: "EFD Contrib.", tipo: "checkbox" },
      { chave: "DIRBI", label: "DIRBI", tipo: "checkbox" },
      { chave: "EFD_ICMS_IPI", label: "EFD ICMS/IPI", tipo: "checkbox" },
      { chave: "MIT", label: "MIT", tipo: "checkbox" },
      { chave: "EFD_REINF", label: "EFD Reinf", tipo: "checkbox" },
      { chave: "OBS", label: "Observações", tipo: "texto" }
    ]
  }
};
