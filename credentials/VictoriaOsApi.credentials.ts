import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class VictoriaOsApi implements ICredentialType {
	name = 'victoriaOsApi';
	displayName = 'API de VictoriaOS';
	documentationUrl = 'https://app.victoriaos.com/api/v1/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'Clave API',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'sk_live_...',
			description: 'La clave API de VictoriaOS. Obtenla desde tu panel de control en VictoriaOS.',
		},
		{
			displayName: 'Entorno',
			name: 'entorno',
			type: 'options',
			options: [
				{
					name: 'Producción',
					value: 'produccion',
				},
				{
					name: 'Desarrollo',
					value: 'desarrollo',
				},
			],
			default: 'produccion',
			description: 'Selecciona el entorno a utilizar',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.entorno === "desarrollo" ? "http://localhost:3000/api/v1" : "https://app.victoriaos.com/api/v1"}}',
			url: '/users/me',
		},
	};
}
