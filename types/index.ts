// ===============================================
// TIPOS GENERALES DE LA API
// ===============================================

export interface RespuestaApi<T = any> {
	success: boolean;
	data?: T;
	error?: ErrorApi;
}

export interface ErrorApi {
	message: string;
	code: string;
	details?: Record<string, any>;
}

export interface MetadataPaginacion {
	total: number;
	limit: number;
	offset: number;
	has_more: boolean;
}

// ===============================================
// TIPOS DE TAREAS
// ===============================================

export type EstadoTarea =
	| 'todo'
	| 'in_progress'
	| 'waiting'
	| 'scheduled'
	| 'someday'
	| 'completed'
	| 'archived';

export type FuenteCreacion = 'api' | 'web' | 'mobile';

export interface Tarea {
	id: string;
	user_id: string;
	title: string;
	description?: string;
	status: EstadoTarea;
	importance?: number; // 0-3
	is_urgent?: boolean;
	due_date?: string; // ISO 8601
	scheduled_date?: string; // ISO 8601
	project_id?: string;
	estimated_minutes?: number;
	completed_at?: string; // ISO 8601
	created_at: string; // ISO 8601
	updated_at: string; // ISO 8601
	created_via?: FuenteCreacion;
}

export interface SolicitudCrearTarea {
	title: string;
	description?: string;
	status?: EstadoTarea;
	importance?: number;
	is_urgent?: boolean;
	due_date?: string;
	scheduled_date?: string;
	project_id?: string;
	estimated_minutes?: number;
}

export interface SolicitudActualizarTarea {
	title?: string;
	description?: string;
	status?: EstadoTarea;
	importance?: number;
	is_urgent?: boolean;
	due_date?: string;
	scheduled_date?: string;
	project_id?: string;
	estimated_minutes?: number;
}

export interface FiltrosTareas {
	status?: EstadoTarea;
	project_id?: string;
	importance?: number;
	is_urgent?: boolean;
	limit?: number;
	offset?: number;
}

export interface RespuestaListaTareas {
	tasks: Tarea[];
	pagination: MetadataPaginacion;
}

// ===============================================
// TIPOS DE WEBHOOKS
// ===============================================

export type EventoWebhook =
	| 'task.created'
	| 'task.updated'
	| 'task.completed'
	| 'task.deleted';

export interface Webhook {
	id: string;
	user_id: string;
	url: string;
	events: EventoWebhook[];
	description?: string;
	active: boolean;
	secret?: string; // Solo se muestra en la creación
	created_at: string; // ISO 8601
	updated_at: string; // ISO 8601
}

export interface SolicitudCrearWebhook {
	url: string;
	events: EventoWebhook[];
	description?: string;
	active?: boolean;
}

export interface SolicitudActualizarWebhook {
	url?: string;
	events?: EventoWebhook[];
	description?: string;
	active?: boolean;
}

export interface EstadisticasWebhook {
	webhook_id: string;
	total_deliveries: number;
	successful_deliveries: number;
	failed_deliveries: number;
	last_delivery_at?: string; // ISO 8601
	last_success_at?: string; // ISO 8601
	last_failure_at?: string; // ISO 8601
}

export interface RespuestaListaWebhooks {
	webhooks: Webhook[];
	pagination: MetadataPaginacion;
}

// ===============================================
// TIPOS DE USUARIO
// ===============================================

export type PlanSuscripcion = 'free' | 'pro' | 'enterprise';
export type EstadoSuscripcion = 'active' | 'cancelled' | 'expired';

export interface Suscripcion {
	plan: PlanSuscripcion;
	status: EstadoSuscripcion;
	started_at: string; // ISO 8601
	expires_at?: string; // ISO 8601
}

export interface LimitesVelocidad {
	requests_per_minute: number;
	requests_per_day: number;
	max_requests_per_minute: number;
	max_requests_per_day: number;
}

export interface Usuario {
	id: string;
	email: string;
	created_at: string; // ISO 8601
	subscription: Suscripcion;
	rate_limits: LimitesVelocidad;
}

// ===============================================
// TIPOS DE SALUD DEL SISTEMA
// ===============================================

export interface EstadoSistema {
	status: string;
	version: string;
	timestamp: string; // ISO 8601
}

export interface MetadatosApi {
	name: string;
	version: string;
	documentation: string;
	endpoints: string[];
}
