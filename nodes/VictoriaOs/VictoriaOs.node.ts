import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

import {
	construirParametrosConsulta,
	manejarErrorApi,
	limpiarObjeto,
} from '../../helpers/utils';

export class VictoriaOs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VictoriaOS',
		name: 'victoriaOs',
		icon: 'file:victoriaos.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["recurso"] + ": " + $parameter["operacion"]}}',
		description: 'Interactúa con la API de VictoriaOS - Gestión de tareas, webhooks y más',
		defaults: {
			name: 'VictoriaOS',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'victoriaOsApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL:
				'={{$credentials.entorno === "desarrollo" ? "http://localhost:3000/api/v1" : "https://app.victoriaos.com/api/v1"}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ========================================
			// SELECTOR DE RECURSO
			// ========================================
			{
				displayName: 'Recurso',
				name: 'recurso',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tareas',
						value: 'tareas',
						description: 'Gestiona tareas en VictoriaOS',
					},
					{
						name: 'Webhooks',
						value: 'webhooks',
						description: 'Gestiona webhooks para recibir notificaciones',
					},
					{
						name: 'Usuario',
						value: 'usuario',
						description: 'Obtiene información del usuario autenticado',
					},
				],
				default: 'tareas',
			},

			// ========================================
			// OPERACIONES DE TAREAS
			// ========================================
			{
				displayName: 'Operación',
				name: 'operacion',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						recurso: ['tareas'],
					},
				},
				options: [
					{
						name: 'Listar',
						value: 'listar',
						description: 'Obtiene una lista de tareas con filtros opcionales',
						action: 'Listar tareas',
					},
					{
						name: 'Obtener',
						value: 'obtener',
						description: 'Obtiene una tarea específica por su ID',
						action: 'Obtener una tarea',
					},
					{
						name: 'Crear',
						value: 'crear',
						description: 'Crea una nueva tarea',
						action: 'Crear una tarea',
					},
					{
						name: 'Actualizar',
						value: 'actualizar',
						description: 'Actualiza una tarea existente',
						action: 'Actualizar una tarea',
					},
					{
						name: 'Eliminar',
						value: 'eliminar',
						description: 'Elimina una tarea permanentemente',
						action: 'Eliminar una tarea',
					},
				],
				default: 'listar',
			},

			// ========================================
			// OPERACIONES DE WEBHOOKS
			// ========================================
			{
				displayName: 'Operación',
				name: 'operacion',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						recurso: ['webhooks'],
					},
				},
				options: [
					{
						name: 'Listar',
						value: 'listar',
						description: 'Obtiene una lista de todos los webhooks',
						action: 'Listar webhooks',
					},
					{
						name: 'Obtener',
						value: 'obtener',
						description: 'Obtiene un webhook específico por su ID',
						action: 'Obtener un webhook',
					},
					{
						name: 'Crear',
						value: 'crear',
						description: 'Crea un nuevo webhook',
						action: 'Crear un webhook',
					},
					{
						name: 'Actualizar',
						value: 'actualizar',
						description: 'Actualiza un webhook existente',
						action: 'Actualizar un webhook',
					},
					{
						name: 'Eliminar',
						value: 'eliminar',
						description: 'Elimina un webhook permanentemente',
						action: 'Eliminar un webhook',
					},
					{
						name: 'Obtener Estadísticas',
						value: 'estadisticas',
						description: 'Obtiene estadísticas de entregas de un webhook',
						action: 'Obtener estadísticas de un webhook',
					},
				],
				default: 'listar',
			},

			// ========================================
			// OPERACIONES DE USUARIO
			// ========================================
			{
				displayName: 'Operación',
				name: 'operacion',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						recurso: ['usuario'],
					},
				},
				options: [
					{
						name: 'Obtener Mi Información',
						value: 'obtenerInfo',
						description: 'Obtiene información del usuario autenticado, incluyendo plan, límites de velocidad y uso',
						action: 'Obtener información del usuario',
					},
				],
				default: 'obtenerInfo',
			},

			// ========================================
			// CAMPOS PARA TAREAS - LISTAR
			// ========================================
			{
				displayName: 'Filtros',
				name: 'filtros',
				type: 'collection',
				placeholder: 'Agregar filtro',
				default: {},
				displayOptions: {
					show: {
						recurso: ['tareas'],
						operacion: ['listar'],
					},
				},
				options: [
					{
						displayName: 'Estado',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Por Hacer', value: 'todo' },
							{ name: 'En Progreso', value: 'in_progress' },
							{ name: 'En Espera', value: 'waiting' },
							{ name: 'Programada', value: 'scheduled' },
							{ name: 'Algún Día', value: 'someday' },
							{ name: 'Completada', value: 'completed' },
							{ name: 'Archivada', value: 'archived' },
						],
						default: '',
						description: 'Filtrar por estado de la tarea',
					},
					{
						displayName: 'ID del Proyecto',
						name: 'project_id',
						type: 'string',
						default: '',
						description: 'Filtrar tareas por ID de proyecto',
					},
					{
						displayName: 'Importancia',
						name: 'importance',
						type: 'options',
						options: [
							{ name: 'Baja (0)', value: 0 },
							{ name: 'Normal (1)', value: 1 },
							{ name: 'Alta (2)', value: 2 },
							{ name: 'Crítica (3)', value: 3 },
						],
						default: '',
						description: 'Filtrar por nivel de importancia',
					},
					{
						displayName: 'Es Urgente',
						name: 'is_urgent',
						type: 'boolean',
						default: false,
						description: 'Filtrar solo tareas urgentes',
					},
					{
						displayName: 'Límite',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Número máximo de tareas a retornar',
					},
					{
						displayName: 'Desplazamiento',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Número de tareas a omitir (para paginación)',
					},
				],
			},

			// ========================================
			// CAMPOS PARA TAREAS - OBTENER/ACTUALIZAR/ELIMINAR
			// ========================================
			{
				displayName: 'ID de la Tarea',
				name: 'idTarea',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						recurso: ['tareas'],
						operacion: ['obtener', 'actualizar', 'eliminar'],
					},
				},
				default: '',
				placeholder: 'ej: 550e8400-e29b-41d4-a716-446655440000',
				description: 'El ID único de la tarea',
			},

			// ========================================
			// CAMPOS PARA TAREAS - CREAR
			// ========================================
			{
				displayName: 'Título',
				name: 'titulo',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						recurso: ['tareas'],
						operacion: ['crear'],
					},
				},
				default: '',
				description: 'El título de la tarea',
			},
			{
				displayName: 'Campos Adicionales',
				name: 'camposAdicionales',
				type: 'collection',
				placeholder: 'Agregar campo',
				default: {},
				displayOptions: {
					show: {
						recurso: ['tareas'],
						operacion: ['crear'],
					},
				},
				options: [
					{
						displayName: 'Descripción',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Descripción detallada de la tarea',
					},
					{
						displayName: 'Estado',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Por Hacer', value: 'todo' },
							{ name: 'En Progreso', value: 'in_progress' },
							{ name: 'En Espera', value: 'waiting' },
							{ name: 'Programada', value: 'scheduled' },
							{ name: 'Algún Día', value: 'someday' },
						],
						default: 'todo',
						description: 'Estado inicial de la tarea',
					},
					{
						displayName: 'Importancia',
						name: 'importance',
						type: 'options',
						options: [
							{ name: 'Baja (0)', value: 0 },
							{ name: 'Normal (1)', value: 1 },
							{ name: 'Alta (2)', value: 2 },
							{ name: 'Crítica (3)', value: 3 },
						],
						default: 1,
						description: 'Nivel de importancia de la tarea',
					},
					{
						displayName: 'Es Urgente',
						name: 'is_urgent',
						type: 'boolean',
						default: false,
						description: 'Si la tarea es urgente',
					},
					{
						displayName: 'Fecha de Vencimiento',
						name: 'due_date',
						type: 'dateTime',
						default: '',
						description: 'Fecha límite para completar la tarea',
					},
					{
						displayName: 'Fecha Programada',
						name: 'scheduled_date',
						type: 'dateTime',
						default: '',
						description: 'Fecha programada para trabajar en la tarea',
					},
					{
						displayName: 'ID del Proyecto',
						name: 'project_id',
						type: 'string',
						default: '',
						description: 'ID del proyecto al que pertenece la tarea',
					},
					{
						displayName: 'Minutos Estimados',
						name: 'estimated_minutes',
						type: 'number',
						default: '',
						description: 'Tiempo estimado para completar la tarea (en minutos)',
					},
				],
			},

			// ========================================
			// CAMPOS PARA TAREAS - ACTUALIZAR
			// ========================================
			{
				displayName: 'Campos a Actualizar',
				name: 'camposActualizar',
				type: 'collection',
				placeholder: 'Agregar campo',
				default: {},
				displayOptions: {
					show: {
						recurso: ['tareas'],
						operacion: ['actualizar'],
					},
				},
				options: [
					{
						displayName: 'Título',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Nuevo título de la tarea',
					},
					{
						displayName: 'Descripción',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Nueva descripción de la tarea',
					},
					{
						displayName: 'Estado',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Por Hacer', value: 'todo' },
							{ name: 'En Progreso', value: 'in_progress' },
							{ name: 'En Espera', value: 'waiting' },
							{ name: 'Programada', value: 'scheduled' },
							{ name: 'Algún Día', value: 'someday' },
							{ name: 'Completada', value: 'completed' },
							{ name: 'Archivada', value: 'archived' },
						],
						default: '',
						description: 'Nuevo estado de la tarea',
					},
					{
						displayName: 'Importancia',
						name: 'importance',
						type: 'options',
						options: [
							{ name: 'Baja (0)', value: 0 },
							{ name: 'Normal (1)', value: 1 },
							{ name: 'Alta (2)', value: 2 },
							{ name: 'Crítica (3)', value: 3 },
						],
						default: '',
						description: 'Nuevo nivel de importancia',
					},
					{
						displayName: 'Es Urgente',
						name: 'is_urgent',
						type: 'boolean',
						default: false,
						description: 'Actualizar si la tarea es urgente',
					},
					{
						displayName: 'Fecha de Vencimiento',
						name: 'due_date',
						type: 'dateTime',
						default: '',
						description: 'Nueva fecha de vencimiento',
					},
					{
						displayName: 'Fecha Programada',
						name: 'scheduled_date',
						type: 'dateTime',
						default: '',
						description: 'Nueva fecha programada',
					},
					{
						displayName: 'ID del Proyecto',
						name: 'project_id',
						type: 'string',
						default: '',
						description: 'Nuevo ID del proyecto',
					},
					{
						displayName: 'Minutos Estimados',
						name: 'estimated_minutes',
						type: 'number',
						default: '',
						description: 'Nuevo tiempo estimado (en minutos)',
					},
				],
			},

			// ========================================
			// CAMPOS PARA WEBHOOKS - LISTAR
			// ========================================
			{
				displayName: 'Opciones',
				name: 'opciones',
				type: 'collection',
				placeholder: 'Agregar opción',
				default: {},
				displayOptions: {
					show: {
						recurso: ['webhooks'],
						operacion: ['listar'],
					},
				},
				options: [
					{
						displayName: 'Límite',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Número máximo de webhooks a retornar',
					},
					{
						displayName: 'Desplazamiento',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Número de webhooks a omitir (para paginación)',
					},
				],
			},

			// ========================================
			// CAMPOS PARA WEBHOOKS - OBTENER/ACTUALIZAR/ELIMINAR/ESTADÍSTICAS
			// ========================================
			{
				displayName: 'ID del Webhook',
				name: 'idWebhook',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						recurso: ['webhooks'],
						operacion: ['obtener', 'actualizar', 'eliminar', 'estadisticas'],
					},
				},
				default: '',
				placeholder: 'ej: 550e8400-e29b-41d4-a716-446655440000',
				description: 'El ID único del webhook',
			},

			// ========================================
			// CAMPOS PARA WEBHOOKS - CREAR
			// ========================================
			{
				displayName: 'URL del Webhook',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						recurso: ['webhooks'],
						operacion: ['crear'],
					},
				},
				default: '',
				placeholder: 'https://tu-servidor.com/webhook',
				description: 'La URL donde se enviarán las notificaciones del webhook',
			},
			{
				displayName: 'Eventos',
				name: 'eventos',
				type: 'multiOptions',
				required: true,
				displayOptions: {
					show: {
						recurso: ['webhooks'],
						operacion: ['crear'],
					},
				},
				options: [
					{
						name: 'Tarea Creada',
						value: 'task.created',
						description: 'Se dispara cuando se crea una nueva tarea',
					},
					{
						name: 'Tarea Actualizada',
						value: 'task.updated',
						description: 'Se dispara cuando se actualiza una tarea',
					},
					{
						name: 'Tarea Completada',
						value: 'task.completed',
						description: 'Se dispara cuando se completa una tarea',
					},
					{
						name: 'Tarea Eliminada',
						value: 'task.deleted',
						description: 'Se dispara cuando se elimina una tarea',
					},
				],
				default: [],
				description: 'Los eventos que dispararán este webhook',
			},
			{
				displayName: 'Campos Adicionales',
				name: 'camposAdicionalesWebhook',
				type: 'collection',
				placeholder: 'Agregar campo',
				default: {},
				displayOptions: {
					show: {
						recurso: ['webhooks'],
						operacion: ['crear'],
					},
				},
				options: [
					{
						displayName: 'Descripción',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Descripción del webhook',
					},
					{
						displayName: 'Activo',
						name: 'active',
						type: 'boolean',
						default: true,
						description: 'Si el webhook está activo o no',
					},
				],
			},

			// ========================================
			// CAMPOS PARA WEBHOOKS - ACTUALIZAR
			// ========================================
			{
				displayName: 'Campos a Actualizar',
				name: 'camposActualizarWebhook',
				type: 'collection',
				placeholder: 'Agregar campo',
				default: {},
				displayOptions: {
					show: {
						recurso: ['webhooks'],
						operacion: ['actualizar'],
					},
				},
				options: [
					{
						displayName: 'URL del Webhook',
						name: 'url',
						type: 'string',
						default: '',
						placeholder: 'https://tu-servidor.com/webhook',
						description: 'Nueva URL del webhook',
					},
					{
						displayName: 'Eventos',
						name: 'events',
						type: 'multiOptions',
						options: [
							{
								name: 'Tarea Creada',
								value: 'task.created',
							},
							{
								name: 'Tarea Actualizada',
								value: 'task.updated',
							},
							{
								name: 'Tarea Completada',
								value: 'task.completed',
							},
							{
								name: 'Tarea Eliminada',
								value: 'task.deleted',
							},
						],
						default: [],
						description: 'Nuevos eventos que dispararán este webhook',
					},
					{
						displayName: 'Descripción',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Nueva descripción del webhook',
					},
					{
						displayName: 'Activo',
						name: 'active',
						type: 'boolean',
						default: true,
						description: 'Actualizar si el webhook está activo',
					},
				],
			},

			// ========================================
			// CAMPOS PARA USUARIO
			// ========================================
			{
				displayName: 'Información',
				name: 'informacion',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						recurso: ['usuario'],
						operacion: ['obtenerInfo'],
					},
				},
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder:
					'Esta operación retorna:\n• Información del usuario (ID, email)\n• Detalles del plan de suscripción\n• Límites de velocidad (rate limits)\n• Estadísticas de uso actual',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const recurso = this.getNodeParameter('recurso', i) as string;
				const operacion = this.getNodeParameter('operacion', i) as string;

				let requestOptions: IHttpRequestOptions = {
					method: 'GET',
					url: '',
					headers: {},
					body: {},
				};

				// ========================================
				// RECURSO: TAREAS
				// ========================================
				if (recurso === 'tareas') {
					if (operacion === 'listar') {
						const filtros = this.getNodeParameter('filtros', i, {}) as IDataObject;
						const parametrosConsulta = construirParametrosConsulta(limpiarObjeto(filtros));

						requestOptions = {
							method: 'GET',
							url: `/tasks${parametrosConsulta}`,
						};
					} else if (operacion === 'obtener') {
						const idTarea = this.getNodeParameter('idTarea', i) as string;

						requestOptions = {
							method: 'GET',
							url: `/tasks/${idTarea}`,
						};
					} else if (operacion === 'crear') {
						const titulo = this.getNodeParameter('titulo', i) as string;
						const camposAdicionales = this.getNodeParameter('camposAdicionales', i, {}) as IDataObject;

						const cuerpo = limpiarObjeto({
							title: titulo,
							...camposAdicionales,
						});

						requestOptions = {
							method: 'POST',
							url: '/tasks',
							body: cuerpo,
						};
					} else if (operacion === 'actualizar') {
						const idTarea = this.getNodeParameter('idTarea', i) as string;
						const camposActualizar = this.getNodeParameter('camposActualizar', i, {}) as IDataObject;

						const cuerpo = limpiarObjeto(camposActualizar);

						requestOptions = {
							method: 'PATCH',
							url: `/tasks/${idTarea}`,
							body: cuerpo,
						};
					} else if (operacion === 'eliminar') {
						const idTarea = this.getNodeParameter('idTarea', i) as string;

						requestOptions = {
							method: 'DELETE',
							url: `/tasks/${idTarea}`,
						};
					}
				}

				// ========================================
				// RECURSO: WEBHOOKS
				// ========================================
				else if (recurso === 'webhooks') {
					if (operacion === 'listar') {
						const opciones = this.getNodeParameter('opciones', i, {}) as IDataObject;
						const parametrosConsulta = construirParametrosConsulta(limpiarObjeto(opciones));

						requestOptions = {
							method: 'GET',
							url: `/webhooks${parametrosConsulta}`,
						};
					} else if (operacion === 'obtener') {
						const idWebhook = this.getNodeParameter('idWebhook', i) as string;

						requestOptions = {
							method: 'GET',
							url: `/webhooks/${idWebhook}`,
						};
					} else if (operacion === 'crear') {
						const url = this.getNodeParameter('url', i) as string;
						const eventos = this.getNodeParameter('eventos', i) as string[];
						const camposAdicionales = this.getNodeParameter('camposAdicionalesWebhook', i, {}) as IDataObject;

						const cuerpo = limpiarObjeto({
							url,
							events: eventos,
							...camposAdicionales,
						});

						requestOptions = {
							method: 'POST',
							url: '/webhooks',
							body: cuerpo,
						};
					} else if (operacion === 'actualizar') {
						const idWebhook = this.getNodeParameter('idWebhook', i) as string;
						const camposActualizar = this.getNodeParameter('camposActualizarWebhook', i, {}) as IDataObject;

						const cuerpo = limpiarObjeto(camposActualizar);

						requestOptions = {
							method: 'PATCH',
							url: `/webhooks/${idWebhook}`,
							body: cuerpo,
						};
					} else if (operacion === 'eliminar') {
						const idWebhook = this.getNodeParameter('idWebhook', i) as string;

						requestOptions = {
							method: 'DELETE',
							url: `/webhooks/${idWebhook}`,
						};
					} else if (operacion === 'estadisticas') {
						const idWebhook = this.getNodeParameter('idWebhook', i) as string;

						requestOptions = {
							method: 'GET',
							url: `/webhooks/${idWebhook}/stats`,
						};
					}
				}

				// ========================================
				// RECURSO: USUARIO
				// ========================================
				else if (recurso === 'usuario') {
					if (operacion === 'obtenerInfo') {
						requestOptions = {
							method: 'GET',
							url: '/users/me',
						};
					}
				}

				// Ejecutar la petición HTTP
				const respuesta = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'victoriaOsApi',
					requestOptions,
				);

				// Agregar la respuesta a los datos de retorno
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(respuesta as IDataObject),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const err = error as Error;
					returnData.push({
						json: {
							error: err.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				manejarErrorApi(error);
			}
		}

		return [returnData];
	}
}
