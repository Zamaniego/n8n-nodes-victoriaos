import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

import { limpiarObjeto } from '../../helpers/utils';

export class VictoriaOsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VictoriaOS Trigger',
		name: 'victoriaOsTrigger',
		icon: 'file:victoriaos.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventos"].join(", ")}}',
		description: 'Escucha eventos de VictoriaOS para iniciar flujos de trabajo',
		defaults: {
			name: 'VictoriaOS Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'victoriaOsApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Eventos',
				name: 'eventos',
				type: 'multiOptions',
				required: true,
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
				description: 'Los eventos que dispararán este trigger',
			},
			{
				displayName: 'Descripción del Webhook',
				name: 'descripcion',
				type: 'string',
				default: '',
				placeholder: 'Webhook para n8n',
				description: 'Descripción opcional para identificar este webhook en VictoriaOS',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					return false;
				}

				const credentials = await this.getCredentials('victoriaOsApi');
				const baseURL = credentials.entorno === 'desarrollo'
					? 'http://localhost:3000/api/v1'
					: 'https://app.victoriaos.com/api/v1';

				try {
					const requestOptions: IHttpRequestOptions = {
						method: 'GET',
						url: `${baseURL}/webhooks/${webhookData.webhookId}`,
						headers: {
							Accept: 'application/json',
						},
					};

					await this.helpers.httpRequestWithAuthentication.call(
						this,
						'victoriaOsApi',
						requestOptions,
					);

					return true;
				} catch (error) {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const eventos = this.getNodeParameter('eventos') as string[];
				const descripcion = this.getNodeParameter('descripcion', '') as string;

				const credentials = await this.getCredentials('victoriaOsApi');
				const baseURL = credentials.entorno === 'desarrollo'
					? 'http://localhost:3000/api/v1'
					: 'https://app.victoriaos.com/api/v1';

				const body = limpiarObjeto({
					url: webhookUrl,
					events: eventos,
					description: descripcion || `n8n Trigger - ${this.getWorkflow().name}`,
					active: true,
				});

				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: `${baseURL}/webhooks`,
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body,
				};

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'victoriaOsApi',
					requestOptions,
				) as IDataObject;

				if (responseData.id === undefined) {
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = responseData.id as string;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					const credentials = await this.getCredentials('victoriaOsApi');
					const baseURL = credentials.entorno === 'desarrollo'
						? 'http://localhost:3000/api/v1'
						: 'https://app.victoriaos.com/api/v1';

					try {
						const requestOptions: IHttpRequestOptions = {
							method: 'DELETE',
							url: `${baseURL}/webhooks/${webhookData.webhookId}`,
							headers: {
								Accept: 'application/json',
							},
						};

						await this.helpers.httpRequestWithAuthentication.call(
							this,
							'victoriaOsApi',
							requestOptions,
						);
					} catch (error) {
						return false;
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();

		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
