export type UserRole = 'morador' | 'admin' | 'porteiro' | 'superadmin';

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
