// ==========================================================
// CONFIGURAÇÃO CENTRAL DO SISTEMA - CONTROLE FISCAL
// ==========================================================
// Edite apenas os valores abaixo quando precisar atualizar algo.
// Não é necessário mexer no script.js.

const CONFIG = {
  // Senha de acesso ao site
  SENHA_ACESSO: "Aguia2025@",

  // Link direto para abrir a planilha no Google Sheets
  SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw/edit?gid=0#gid=0",

  // ID da planilha (extraído do link acima)
  SPREADSHEET_ID: "1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw",

  // URL do Web App do Apps Script (termina em /exec)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyTL7JZCq2oMG69agLIgjj2N7ZOapcAT87wvjN154Rod_DDI8nbkbc67siul9IABvDW/exec",

  // Mês que abre por padrão ao entrar no site
  MES_PADRAO: "AGOSTO",

  // Categorias (abas) dentro de cada mês - NÃO ALTERAR os "sufixo"
  // pois eles precisam bater com o nome das abas na planilha (MES_SUFIXO)
  CATEGORIAS: [
    { nome: "Serviços", sufixo: "SERV" },
    { nome: "Comércio & Indústria", sufixo: "COMIND" },
    { nome: "Associações", sufixo: "ASSOC" },
    { nome: "SM", sufixo: "SM" }
  ]
};
