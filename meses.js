// ============================================================
// LISTA DE MESES DISPONÍVEIS
// ============================================================
// Cada mês corresponde a um GRUPO DE ABAS dentro da MESMA planilha.
// As abas devem se chamar: MES_SERV, MES_COMIND, MES_ASSOC, MES_SM
// Exemplo: JULHO_SERV, JULHO_COMIND, JULHO_ASSOC, JULHO_SM
//
// Para adicionar um novo mês, basta:
//   1) Usar o botão "Criar Novo Mês" no site (cria as abas automaticamente), OU
//   2) Duplicar manualmente as abas modelo na planilha e renomear, e
//      adicionar o nome do mês na lista abaixo.
// ============================================================

const MESES_DISPONIVEIS = [
  "AGOSTO"
  // "AGOSTO",
  // "SETEMBRO",
];

// ID da planilha ÚNICA do Google Sheets (a mesma para todos os meses)
const SPREADSHEET_ID = "1JTpQkMEXkth95AgbPmyJBFlzIpWtNThFot9jYGF7Tsw";

// URL do Web App do Google Apps Script (gerada ao publicar o Code.gs)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyTL7JZCq2oMG69agLIgjj2N7ZOapcAT87wvjN154Rod_DDI8nbkbc67siul9IABvDW/exec";
