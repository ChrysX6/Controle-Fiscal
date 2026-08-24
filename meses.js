// ==========================================================
// CONFIGURAÇÃO GERAL DO SITE - CONTROLE FISCAL AGUIA CONTAB
// ==========================================================

// ID da planilha única do Google Sheets (extraído do link fornecido)
const SPREADSHEET_ID = "1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw";

// Link direto para abrir a planilha no navegador (botão "Abrir Planilha")
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw/edit?gid=0#gid=0";

// URL do Web App do Google Apps Script (backend de leitura/gravação)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyTL7JZCq2oMG69agLIgjj2N7ZOapcAT87wvjN154Rod_DDI8nbkbc67siul9IABvDW/exec";

// ==========================================================
// LISTA DE MESES DISPONÍVEIS NO SITE
// ==========================================================
// Cada mês corresponde a um conjunto de 4 abas na planilha,
// seguindo o padrão de nomenclatura: MES_CATEGORIA
// Exemplo: AGOSTO_SERV, AGOSTO_COMIND, AGOSTO_ASSOC, AGOSTO_SM
//
// Para adicionar um novo mês no futuro, basta incluir um novo
// objeto neste array - não é necessário criar um site novo.
// ==========================================================

const MESES = [
  {
    id: "AGOSTO",
    nomeExibicao: "Agosto 2026",
    abas: {
      SERV: "AGOSTO_SERV",
      COMIND: "AGOSTO_COMIND",
      ASSOC: "AGOSTO_ASSOC",
      SM: "AGOSTO_SM"
    }
  }
];

// Mês selecionado por padrão ao abrir o site
const MES_PADRAO = "AGOSTO";

// ==========================================================
// ABAS MODELO (usadas para criar um novo mês automaticamente
// pelo botão "Criar Novo Mês" no site)
// ==========================================================
const TEMPLATES = {
  SERV: "TEMPLATE_SERV",
  COMIND: "TEMPLATE_COMIND",
  ASSOC: "TEMPLATE_ASSOC",
  SM: "TEMPLATE_SM"
};

// ==========================================================
// SENHA DE ACESSO AO SITE
// ==========================================================
const SENHA_ACESSO = "Aguia2025@";
