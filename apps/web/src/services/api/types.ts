export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dataInicio?: string;
  dataFim?: string;
}

export type UserRole = 'morador' | 'admin' | 'porteiro' | 'superadmin';

export interface PermissoesPorteiro {
  encomendas: boolean;
  visitantes: boolean;
  comida: boolean;
  comunicados: boolean;
}

export interface UserResponse {
  id: string;
  email: string | null;
  username: string;
  nome: string;
  role: UserRole;
  condominioId: string | null;
  apto: string | null;
  telefone: string | null;
  mustChangePassword: boolean;
  // presente só quando role === 'porteiro' — ver Fatia 5 (RBAC).
  permissoesPorteiro?: PermissoesPorteiro;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponse;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginPayload {
  identificador: string;
  senha: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  tokenHash: string;
  novaSenha: string;
}

export interface ChangePasswordPayload {
  novaSenha: string;
}

export type SolicitacaoCategoria = 'manutencao' | 'seguranca' | 'animal' | 'outra';
export type SolicitacaoStatus = 'aberto' | 'em-progresso' | 'resolvido';
export type SolicitacaoPrioridade = 'baixa' | 'media' | 'alta';

export interface SolicitacaoResponse {
  id: string;
  condominioId: string;
  moradorId: string;
  assignedTo: string | null;
  categoria: SolicitacaoCategoria;
  titulo: string;
  descricao: string;
  status: SolicitacaoStatus;
  prioridade: SolicitacaoPrioridade;
  dataCriacao: string;
  dataResolvimento: string | null;
}

export interface CreateSolicitacaoPayload {
  categoria: SolicitacaoCategoria;
  titulo: string;
  descricao: string;
}

export interface SolicitacaoListParams extends ListParams {
  sortBy?: 'dataCriacao' | 'prioridade' | 'status';
  status?: SolicitacaoStatus;
  categoria?: SolicitacaoCategoria;
}

export interface UpdateSolicitacaoPayload {
  status?: SolicitacaoStatus;
  prioridade?: SolicitacaoPrioridade;
}

export type EncomendaStatus = 'aguardando' | 'retirada';

export interface EncomendaResponse {
  id: string;
  condominioId: string;
  moradorId: string;
  porteiroId: string;
  descricao: string | null;
  horarioChegada: string;
  fotoUrl: string | null;
  assinado: boolean;
  dataAssinatura: string | null;
  status: EncomendaStatus;
}

export interface CreateEncomendaPayload {
  moradorId: string;
  descricao?: string;
  fotoUrl?: string;
}

export interface EncomendaListParams extends ListParams {
  sortBy?: 'horarioChegada' | 'status';
  status?: EncomendaStatus;
}

export interface ComunicadoResponse {
  id: string;
  condominioId: string;
  adminId: string;
  titulo: string;
  conteudo: string;
  dataCriacao: string;
  lido: boolean;
}

export interface CreateComunicadoPayload {
  titulo: string;
  conteudo: string;
}

export interface ChatResponse {
  id: string;
  condominioId: string;
  moradorId: string;
  autorId: string;
  mensagem: string;
  lido: boolean;
  createdAt: string;
}

export interface CreateChatPayload {
  moradorId?: string;
  mensagem: string;
}

export interface DashboardSummaryResponse {
  solicitacoes: {
    abertas: number;
    emProgresso: number;
  };
  encomendas: {
    aguardandoRetirada: number;
    chegaramHoje: number;
  };
  comunicados: {
    recentes: { id: string; titulo: string; dataCriacao: string }[];
  };
}

export type TipoResidencia = 'apartamento' | 'casa';

export interface CondominioResponse {
  id: string;
  nome: string;
  slug: string;
  endereco: string | null;
  contatoNome: string | null;
  contatoEmail: string | null;
  contatoTelefone: string | null;
  tipoResidencia: TipoResidencia;
  permissoesPorteiro: PermissoesPorteiro;
  createdAt: string;
  totalUsuarios: number;
}

export interface CreateCondominioPayload {
  nome: string;
  slug: string;
  tipoResidencia: TipoResidencia;
  endereco?: string;
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  adminNome: string;
  adminUsername: string;
  adminEmail?: string;
}

export interface CreateCondominioResponse extends CondominioResponse {
  admin: {
    username: string;
    email: string | null;
    senhaTemporaria: string;
  };
}

export interface UpdateCondominioPayload {
  nome: string;
}

// GET /api/condominios/me — só os campos que telas de admin precisam pra decidir comportamento
// condicional (ex.: Residências mostrar "Bloco" ou "Rua", Permissões mostrar os toggles atuais).
export interface CondominioAtualResponse {
  id: string;
  nome: string;
  slug: string;
  tipoResidencia: TipoResidencia;
  permissoesPorteiro: PermissoesPorteiro;
}

export type UpdatePermissoesPorteiroPayload = PermissoesPorteiro;

export type SetorTipo = 'bloco' | 'rua' | 'quadra' | 'torre' | 'outro';

export interface SetorResponse {
  id: string;
  condominioId: string;
  nome: string;
  tipo: SetorTipo;
  residenciasCount: number;
  moradoresCount: number;
  createdAt: string;
}

export interface CreateSetorPayload {
  nome: string;
  tipo: SetorTipo;
}

export interface UpdateSetorPayload {
  nome: string;
  tipo: SetorTipo;
}

export interface ResidenciaResponse {
  id: string;
  condominioId: string;
  setorId: string;
  numero: string;
  moradoresCount?: number;
  // presentes só na listagem achatada (sem setorId no filtro), usada pelo seletor de Moradores.
  setorNome?: string;
  setorTipo?: SetorTipo;
  createdAt: string;
}

export interface CreateResidenciaPayload {
  setorId: string;
  numero: string;
}

export interface UpdateResidenciaPayload {
  setorId: string;
  numero: string;
}

export interface ResidenciaDetalheResponse {
  residencia: ResidenciaResponse & { setorNome: string | null; setorTipo: SetorTipo | null };
  moradores: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
    apto: string | null;
  }[];
  visitantes: {
    id: string;
    nomeVisitante: string;
    dataVisita: string;
    status: VisitanteStatus;
  }[];
  encomendas: {
    id: string;
    descricao: string | null;
    horarioChegada: string;
    status: EncomendaStatus;
  }[];
  solicitacoes: {
    id: string;
    titulo: string;
    categoria: SolicitacaoCategoria;
    status: SolicitacaoStatus;
    prioridade: SolicitacaoPrioridade;
    dataCriacao: string;
  }[];
}

export type VisitanteStatus = 'aprovado' | 'bloqueado' | 'ativo';

export interface VisitanteResponse {
  id: string;
  condominioId: string;
  moradorId: string;
  aprovadoPor: string;
  nomeVisitante: string;
  rg: string | null;
  placaVeiculo: string | null;
  dataVisita: string;
  horaEntrada: string | null;
  horaSaida: string | null;
  status: VisitanteStatus;
}

export interface CreateVisitantePayload {
  nomeVisitante: string;
  rg?: string;
  placaVeiculo?: string;
  dataVisita: string;
  moradorId?: string;
}

export interface VisitanteListParams extends ListParams {
  sortBy?: 'dataVisita' | 'status';
  status?: VisitanteStatus;
}

export type ComidaStatus = 'pedido-feito' | 'em-caminho' | 'chegou' | 'retirada';

export interface ComidaResponse {
  id: string;
  condominioId: string;
  moradorId: string;
  restaurante: string;
  horarioChegadaEstimada: string;
  status: ComidaStatus;
  notificacaoPortariaEnviada: boolean;
}

export interface CreateComidaPayload {
  restaurante: string;
  horarioChegadaEstimada: string;
  moradorId?: string;
}

export interface ComidaListParams extends ListParams {
  sortBy?: 'horarioChegadaEstimada' | 'status';
  status?: ComidaStatus;
}

export interface AreaComumResponse {
  id: string;
  condominioId: string;
  nome: string;
  horarioFuncionamento: string | null;
  descricao: string | null;
}

export interface CreateAreaComumPayload {
  nome: string;
  horarioFuncionamento?: string;
  descricao?: string;
}

export interface UpdateAreaComumPayload {
  nome?: string;
  horarioFuncionamento?: string;
  descricao?: string;
}

export type ReservaStatus = 'pendente' | 'aprovada' | 'cancelada';

export interface ReservaResponse {
  id: string;
  condominioId: string;
  areaComumId: string;
  moradorId: string;
  horaInicio: string;
  horaFim: string;
  status: ReservaStatus;
}

export interface CreateReservaPayload {
  areaComumId: string;
  horaInicio: string;
  horaFim: string;
}

export interface ReservaListParams extends ListParams {
  sortBy?: 'horaInicio' | 'status';
  status?: ReservaStatus;
}

export interface ResidenciaResumo {
  setorNome: string | null;
  setorTipo: SetorTipo | null;
  numero: string | null;
}

export interface MoradorResponse {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  telefone: string | null;
  role: 'morador';
  residencia: ResidenciaResumo | null;
  createdAt: string;
}

export interface StaffUserResponse {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  telefone: string | null;
  role: 'admin' | 'porteiro';
  residencia: null;
  createdAt: string;
}

export interface UserListParams extends ListParams {
  sortBy?: 'nome' | 'createdAt';
  roles?: string;
}

export interface CreateMoradorPayload {
  role: 'morador';
  nome: string;
  email: string;
  residenciaId: string;
  telefone?: string;
}

export interface CreateStaffUserPayload {
  role: 'admin' | 'porteiro';
  nome: string;
  username: string;
  email?: string;
  telefone?: string;
}

export interface CreateUserResponse {
  senhaTemporaria: string;
}

export interface UpdateMoradorPayload {
  nome?: string;
  telefone?: string;
  residenciaId?: string;
}

export interface ResetSenhaResponse {
  senhaTemporaria: string;
}

export interface MoradorDiretorioResponse {
  id: string;
  nome: string;
  residencia: ResidenciaResumo | null;
}

export type AssembleiaStatus = 'planejada' | 'em-votacao' | 'encerrada';
export type OpcaoVoto = 'sim' | 'nao' | 'abstencao';

export interface ContagemVotos {
  sim: number;
  nao: number;
  abstencao: number;
  total: number;
}

export interface AssembleiaResponse {
  id: string;
  condominioId: string;
  titulo: string;
  data: string;
  descricao: string | null;
  pauta: string | null;
  status: AssembleiaStatus;
  votos: ContagemVotos;
  // presente só pro papel morador — o próprio voto, ou null se ainda não votou.
  meuVoto?: OpcaoVoto | null;
}

export interface CreateAssembleiaPayload {
  titulo: string;
  data: string;
  descricao?: string;
  pauta?: string;
}

export interface UpdateAssembleiaStatusPayload {
  status: 'em-votacao' | 'encerrada';
}

export interface VotarPayload {
  voto: OpcaoVoto;
}

export interface ImportarErro {
  linha: number;
  motivo: string;
}

export interface ImportarResultado {
  criadas: number;
  erros: ImportarErro[];
}

export interface ImportarResidenciasPayload {
  residencias: Array<{ setor: string; numero: string }>;
}

export interface ImportarMoradoresPayload {
  moradores: Array<{
    nome: string;
    email: string;
    telefone?: string;
    setor: string;
    numero: string;
  }>;
}

export type NotificacaoTipo = 'chat' | 'comida' | 'comunicado' | 'reserva' | 'assembleia' | 'encomenda';

export interface NotificacaoResponse {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  referenciaId: string;
  lida: boolean;
  createdAt: string;
}
