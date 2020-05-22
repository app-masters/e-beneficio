export type FamilyItem = {
  UF: string;
  MUNICIPIO: string;
  TITULAR: string;
  DTNASCTIT: string;
  NISTITULAR: string;
  COMPETFOLHA: string;
  SITFAM: string;
  NISDEPENDEN: string;
  DEPENDENTE: string;
  IDADE: string;
  DTNASCDEP: string;
  'QTDE. MEMBROS': string;
};

export type SislameItem = {
  'nome escola': string;
  id_aluno_matricula: string;
  'nome do aluno': string;
  'data nascimento': string;
  'situacao atual': string;
  'nome responsavel': string;
  'nome mae': string;
  'nome pai': string;
  telefone: string;
  'telefone celular': string;
  cep: string;
  bairro: string;
  numero: string;
  logradouro: string;
  complemento: string;
};

export type OriginalSislameItem = {
  'NOME ESCOLA': string;
  ID_ALUNO_MATRICULA: string;
  'NOME DO ALUNO': string;
  'Data Nascimento': string;
  'Situação atual': string;
  'Nome Responsável': string;
  'Nome Mãe': string;
  'Nome Pai': string;
  Telefone: string;
  'Telefone Celular': string;
  CEP: string;
  Bairro: string;
  Número: string;
  Logradouro: string;
  Complemento: string;
};

export type OriginalNurseryItem = {
  Criança: string;
  RESPONSAVEL: string;
  Creche: string;
  ENDERECO: string;
  BAIRRO: string;
  'TELEFONE 1': string;
  'TELEFONE 2': string;
};
