import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';

/**
 * Obtiene la URL base de la API según el entorno configurado
 */
export function obtenerUrlBase(this: IExecuteFunctions): string {
	const credenciales = this.getCredentials('victoriaOsApi') as IDataObject;
	const entorno = credenciales.entorno as string;

	return entorno === 'desarrollo'
		? 'http://localhost:3000/api/v1'
		: 'https://app.victoriaos.com/api/v1';
}

/**
 * Construye la URL completa para un endpoint específico
 */
export function construirUrl(this: IExecuteFunctions, ruta: string): string {
	const urlBase = obtenerUrlBase.call(this);
	// Asegurar que la ruta comienza con /
	const rutaLimpia = ruta.startsWith('/') ? ruta : `/${ruta}`;
	return `${urlBase}${rutaLimpia}`;
}

/**
 * Construye parámetros de consulta (query string) desde un objeto
 */
export function construirParametrosConsulta(parametros: IDataObject): string {
	const params = new URLSearchParams();

	for (const [clave, valor] of Object.entries(parametros)) {
		if (valor !== undefined && valor !== null && valor !== '') {
			params.append(clave, String(valor));
		}
	}

	const queryString = params.toString();
	return queryString ? `?${queryString}` : '';
}

/**
 * Maneja errores de la API y los formatea para n8n
 */
export function manejarErrorApi(error: any): never {
	if (error.response?.body?.error) {
		const errorApi = error.response.body.error;
		throw new Error(
			`Error de VictoriaOS [${errorApi.code}]: ${errorApi.message}${
				errorApi.details ? ` - Detalles: ${JSON.stringify(errorApi.details)}` : ''
			}`,
		);
	}

	if (error.message) {
		throw new Error(`Error al comunicarse con VictoriaOS: ${error.message}`);
	}

	throw new Error('Error desconocido al comunicarse con VictoriaOS');
}

/**
 * Limpia un objeto eliminando propiedades undefined, null o vacías
 */
export function limpiarObjeto(objeto: IDataObject): IDataObject {
	const objetoLimpio: IDataObject = {};

	for (const [clave, valor] of Object.entries(objeto)) {
		if (valor !== undefined && valor !== null && valor !== '') {
			objetoLimpio[clave] = valor;
		}
	}

	return objetoLimpio;
}

/**
 * Valida si una cadena es un UUID válido
 */
export function esUuidValido(uuid: string): boolean {
	const regexUuid =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return regexUuid.test(uuid);
}

/**
 * Formatea una fecha para la API (ISO 8601)
 */
export function formatearFecha(fecha: Date | string): string {
	if (typeof fecha === 'string') {
		return new Date(fecha).toISOString();
	}
	return fecha.toISOString();
}

/**
 * Extrae los encabezados de límite de velocidad de la respuesta
 */
export function extraerLimitesVelocidad(encabezados: any): IDataObject {
	return {
		limite: encabezados['x-ratelimit-limit'],
		restante: encabezados['x-ratelimit-remaining'],
		reinicio: encabezados['x-ratelimit-reset'],
	};
}
