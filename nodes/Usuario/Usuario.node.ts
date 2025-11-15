import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

import { manejarErrorApi } from '../../helpers/utils';

export class Usuario implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Usuario de VictoriaOS',
		name: 'usuario',
		icon: 'file:usuario.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Obtener información del usuario',
		description: 'Obtiene información del usuario autenticado en VictoriaOS',
		defaults: {
			name: 'Usuario',
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
						name: 'Obtener Mi Información',
						value: 'obtenerInfo',
						description: 'Obtiene información del usuario autenticado, incluyendo plan, límites de velocidad y uso',
						action: 'Obtener información del usuario',
					},
				],
				default: 'obtenerInfo',
			},
			{
				displayName: 'Información',
				name: 'informacion',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
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
				const requestOptions: IHttpRequestOptions = {
					method: 'GET',
					url: '/users/me',
				};

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
					returnData.push({
						json: {
							error: error.message,
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
