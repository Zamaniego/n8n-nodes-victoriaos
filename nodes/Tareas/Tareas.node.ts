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

export class Tareas implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tareas de VictoriaOS',
		name: 'tareas',
		icon: 'file:tareas.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operacion"]}}',
		description: 'Gestiona tareas en VictoriaOS',
		defaults: {
			name: 'Tareas',
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
			// CAMPOS PARA LISTAR
			// ========================================
			{
				displayName: 'Filtros',
				name: 'filtros',
				type: 'collection',
				placeholder: 'Agregar filtro',
				default: {},
				displayOptions: {
					show: {
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
			// CAMPOS PARA OBTENER/ACTUALIZAR/ELIMINAR
			// ========================================
			{
				displayName: 'ID de la Tarea',
				name: 'idTarea',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operacion: ['obtener', 'actualizar', 'eliminar'],
					},
				},
				default: '',
				placeholder: 'ej: 550e8400-e29b-41d4-a716-446655440000',
				description: 'El ID único de la tarea',
			},

			// ========================================
			// CAMPOS PARA CREAR
			// ========================================
			{
				displayName: 'Título',
				name: 'titulo',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
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
					const filtros = this.getNodeParameter('filtros', i, {}) as IDataObject;
					const parametrosConsulta = construirParametrosConsulta(limpiarObjeto(filtros));

					requestOptions = {
						method: 'GET',
						url: `/tasks${parametrosConsulta}`,
					};
				}

				// ========================================
				// OPERACIÓN: OBTENER
				// ========================================
				else if (operacion === 'obtener') {
					const idTarea = this.getNodeParameter('idTarea', i) as string;

					requestOptions = {
						method: 'GET',
						url: `/tasks/${idTarea}`,
					};
				}

				// ========================================
				// OPERACIÓN: CREAR
				// ========================================
				else if (operacion === 'crear') {
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
				}

				// ========================================
				// OPERACIÓN: ACTUALIZAR
				// ========================================
				else if (operacion === 'actualizar') {
					const idTarea = this.getNodeParameter('idTarea', i) as string;
					const camposActualizar = this.getNodeParameter('camposActualizar', i, {}) as IDataObject;

					const cuerpo = limpiarObjeto(camposActualizar);

					requestOptions = {
						method: 'PATCH',
						url: `/tasks/${idTarea}`,
						body: cuerpo,
					};
				}

				// ========================================
				// OPERACIÓN: ELIMINAR
				// ========================================
				else if (operacion === 'eliminar') {
					const idTarea = this.getNodeParameter('idTarea', i) as string;

					requestOptions = {
						method: 'DELETE',
						url: `/tasks/${idTarea}`,
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
