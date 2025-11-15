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

export class Webhooks implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Webhooks de VictoriaOS',
		name: 'webhooks',
		icon: 'file:webhooks.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operacion"]}}',
		description: 'Gestiona webhooks en VictoriaOS',
		defaults: {
			name: 'Webhooks',
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
			{
				displayName: 'Operación',
				name: 'operacion',
				type: 'options',
				noDataExpression: true,
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
			// CAMPOS PARA LISTAR
			// ========================================
			{
				displayName: 'Opciones',
				name: 'opciones',
				type: 'collection',
				placeholder: 'Agregar opción',
				default: {},
				displayOptions: {
					show: {
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
			// CAMPOS PARA OBTENER/ACTUALIZAR/ELIMINAR/ESTADÍSTICAS
			// ========================================
			{
				displayName: 'ID del Webhook',
				name: 'idWebhook',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operacion: ['obtener', 'actualizar', 'eliminar', 'estadisticas'],
					},
				},
				default: '',
				placeholder: 'ej: 550e8400-e29b-41d4-a716-446655440000',
				description: 'El ID único del webhook',
			},

			// ========================================
			// CAMPOS PARA CREAR
			// ========================================
			{
				displayName: 'URL del Webhook',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
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
				name: 'camposAdicionales',
				type: 'collection',
				placeholder: 'Agregar campo',
				default: {},
				displayOptions: {
					show: {
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
			// CAMPOS PARA ACTUALIZAR
			// ========================================
			{
				displayName: 'Campos a Actualizar',
				name: 'camposActualizar',
				type: 'collection',
				placeholder: 'Agregar campo',
				default: {},
				displayOptions: {
					show: {
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operacion = this.getNodeParameter('operacion', i) as string;

				let requestOptions: IHttpRequestOptions = {
					method: 'GET',
					url: '',
					headers: {},
					body: {},
				};

				// ========================================
				// OPERACIÓN: LISTAR
				// ========================================
				if (operacion === 'listar') {
					const opciones = this.getNodeParameter('opciones', i, {}) as IDataObject;
					const parametrosConsulta = construirParametrosConsulta(limpiarObjeto(opciones));

					requestOptions = {
						method: 'GET',
						url: `/webhooks${parametrosConsulta}`,
					};
				}

				// ========================================
				// OPERACIÓN: OBTENER
				// ========================================
				else if (operacion === 'obtener') {
					const idWebhook = this.getNodeParameter('idWebhook', i) as string;

					requestOptions = {
						method: 'GET',
						url: `/webhooks/${idWebhook}`,
					};
				}

				// ========================================
				// OPERACIÓN: CREAR
				// ========================================
				else if (operacion === 'crear') {
					const url = this.getNodeParameter('url', i) as string;
					const eventos = this.getNodeParameter('eventos', i) as string[];
					const camposAdicionales = this.getNodeParameter('camposAdicionales', i, {}) as IDataObject;

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
				}

				// ========================================
				// OPERACIÓN: ACTUALIZAR
				// ========================================
				else if (operacion === 'actualizar') {
					const idWebhook = this.getNodeParameter('idWebhook', i) as string;
					const camposActualizar = this.getNodeParameter('camposActualizar', i, {}) as IDataObject;

					const cuerpo = limpiarObjeto(camposActualizar);

					requestOptions = {
						method: 'PATCH',
						url: `/webhooks/${idWebhook}`,
						body: cuerpo,
					};
				}

				// ========================================
				// OPERACIÓN: ELIMINAR
				// ========================================
				else if (operacion === 'eliminar') {
					const idWebhook = this.getNodeParameter('idWebhook', i) as string;

					requestOptions = {
						method: 'DELETE',
						url: `/webhooks/${idWebhook}`,
					};
				}

				// ========================================
				// OPERACIÓN: ESTADÍSTICAS
				// ========================================
				else if (operacion === 'estadisticas') {
					const idWebhook = this.getNodeParameter('idWebhook', i) as string;

					requestOptions = {
						method: 'GET',
						url: `/webhooks/${idWebhook}/stats`,
					};
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
