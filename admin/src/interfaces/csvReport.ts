export type CSVReport = {
  created: number; // Número de registros criados
  updated: number; // Número de registros atualizados
  deleted: number; // Número de registros excluidos
  wrong: number; // Número de registros com formato fora do esperado
  report: string[]; // Lista de mensagens sobre os registros
  finished: boolean; // Código conseguiu varrer todas as linhas
};
