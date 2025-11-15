# Guía de Desarrollo - n8n-nodes-victoriaos

Esta guía proporciona información detallada para desarrolladores que quieran contribuir o extender este paquete.

## 🏗️ Arquitectura del Proyecto

### Principios de Diseño

1. **Separación de Responsabilidades**: Cada nodo maneja un recurso específico de la API
2. **Reutilización de Código**: Funciones helper compartidas para operaciones comunes
3. **Tipado Fuerte**: TypeScript en todas partes para prevenir errores
4. **Estilo Declarativo**: Uso del estilo declarativo recomendado por n8n para APIs HTTP

### Flujo de Ejecución

```
Usuario en n8n
    ↓
Nodo (*.node.ts)
    ↓
Credenciales (VictoriaOsApi.credentials.ts)
    ↓
Helpers (utils.ts) - Construcción de URL, parámetros, etc.
    ↓
n8n httpRequestWithAuthentication
    ↓
API de VictoriaOS
    ↓
Respuesta procesada
    ↓
Usuario recibe datos
```

## 📁 Estructura Detallada del Código

### Credenciales (`credentials/VictoriaOsApi.credentials.ts`)

```typescript
// Estructura básica
export class VictoriaOsApi implements ICredentialType {
  name = 'victoriaOsApi';           // ID único de la credencial
  displayName = 'API de VictoriaOS'; // Nombre visible en n8n

  properties: INodeProperties[] = [
    // Define los campos del formulario de credenciales
  ];

  authenticate: IAuthenticateGeneric = {
    // Configuración de autenticación (Bearer Token)
  };

  test: ICredentialTestRequest = {
    // Endpoint para probar las credenciales
  };
}
```

### Nodos (`nodes/*/*.node.ts`)

Cada nodo sigue esta estructura:

```typescript
export class NombreNodo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Nombre Visible',
    name: 'nombreInterno',
    icon: 'file:icono.svg',
    // ... configuración del nodo

    properties: [
      // Operación principal (dropdown)
      {
        displayName: 'Operación',
        name: 'operacion',
        type: 'options',
        options: [/* lista de operaciones */]
      },

      // Campos específicos por operación
      {
        displayOptions: {
          show: { operacion: ['crear'] }
        },
        // ... configuración del campo
      }
    ]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Lógica de ejecución
    // 1. Obtener parámetros del usuario
    // 2. Construir petición HTTP
    // 3. Ejecutar petición con autenticación
    // 4. Retornar resultados
  }
}
```

### Helpers (`helpers/utils.ts`)

Funciones reutilizables:

- **obtenerUrlBase()**: Determina la URL base según el entorno
- **construirUrl()**: Construye la URL completa para un endpoint
- **construirParametrosConsulta()**: Convierte objeto a query string
- **manejarErrorApi()**: Procesa y formatea errores de la API
- **limpiarObjeto()**: Elimina campos vacíos/undefined
- **esUuidValido()**: Valida formato UUID
- **formatearFecha()**: Convierte fechas a ISO 8601
- **extraerLimitesVelocidad()**: Extrae headers de rate limiting

### Tipos (`types/index.ts`)

Todas las interfaces de datos de la API:

- **Tipos Generales**: RespuestaApi, ErrorApi, MetadataPaginacion
- **Tipos de Tareas**: Tarea, SolicitudCrearTarea, EstadoTarea, etc.
- **Tipos de Webhooks**: Webhook, EventoWebhook, EstadisticasWebhook, etc.
- **Tipos de Usuario**: Usuario, Suscripcion, LimitesVelocidad, etc.

## 🔨 Creación de un Nuevo Nodo

### Paso 1: Planificación

Antes de crear un nodo, responde:

1. ¿Qué recurso de la API maneja? (ej: Proyectos, Etiquetas)
2. ¿Qué operaciones soporta? (listar, obtener, crear, actualizar, eliminar)
3. ¿Qué parámetros requiere cada operación?
4. ¿Qué tipos de datos necesitas definir?

### Paso 2: Crear Tipos

Agrega las interfaces en `types/index.ts`:

```typescript
// Ejemplo: Nodo de Proyectos
export interface Proyecto {
  id: string;
  user_id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface SolicitudCrearProyecto {
  nombre: string;
  descripcion?: string;
  color?: string;
}
```

### Paso 3: Crear Estructura del Nodo

```bash
mkdir -p nodes/Proyectos
touch nodes/Proyectos/Proyectos.node.ts
touch nodes/Proyectos/proyectos.svg
```

### Paso 4: Implementar el Nodo

Usa un nodo existente como plantilla:

```typescript
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

export class Proyectos implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Proyectos de VictoriaOS',
    name: 'proyectos',
    icon: 'file:proyectos.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operacion"]}}',
    description: 'Gestiona proyectos en VictoriaOS',
    defaults: {
      name: 'Proyectos',
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
      baseURL: '={{$credentials.entorno === "desarrollo" ? "http://localhost:3000/api/v1" : "https://app.victoriaos.com/api/v1"}}',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      // Define operaciones y campos aquí
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operacion = this.getNodeParameter('operacion', i) as string;

        // Implementa la lógica por operación

        const respuesta = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'victoriaOsApi',
          requestOptions,
        );

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(respuesta as IDataObject),
          { itemData: { item: i } },
        );

        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
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
```

### Paso 5: Crear Icono SVG

Crea un icono simple en `nodes/Proyectos/proyectos.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Tu icono SVG aquí -->
</svg>
```

### Paso 6: Registrar el Nodo

Actualiza `package.json`:

```json
{
  "n8n": {
    "nodes": [
      "dist/nodes/Tareas/Tareas.node.js",
      "dist/nodes/Webhooks/Webhooks.node.js",
      "dist/nodes/Usuario/Usuario.node.js",
      "dist/nodes/Proyectos/Proyectos.node.js"  // ← Nuevo
    ]
  }
}
```

### Paso 7: Compilar y Probar

```bash
npm run build
npm link
# En n8n: npm link n8n-nodes-victoriaos
# Reinicia n8n y prueba el nuevo nodo
```

## 🧪 Testing

### Testing Manual

1. Inicia n8n localmente
2. Crea un workflow con el nodo
3. Prueba cada operación
4. Verifica:
   - Parámetros requeridos funcionan
   - Parámetros opcionales funcionan
   - Manejo de errores
   - Formato de respuesta

### Testing con Datos Reales

Crea un archivo `.env.test` (no comitear):

```bash
VICTORIA_API_KEY=sk_live_tu_clave_de_prueba
```

## 🐛 Debugging

### Logs en n8n

```typescript
// Agregar logs temporales
console.log('Parámetros recibidos:', parametros);
console.log('URL construida:', requestOptions.url);
console.log('Respuesta de API:', respuesta);
```

### Inspeccionar Peticiones HTTP

En el nodo, antes de ejecutar:

```typescript
console.log('Request Options:', JSON.stringify(requestOptions, null, 2));
```

### Errores Comunes

1. **"Cannot find module"**: Ejecuta `npm run build`
2. **"Credential not found"**: Verifica el nombre en `credentials`
3. **"Invalid authentication"**: Revisa la clave API
4. **"Unexpected token"**: Error de sintaxis TypeScript, revisa el código

## 📊 Mejores Prácticas

### 1. Nomenclatura en Español

✅ **Correcto:**
```typescript
{
  displayName: 'Título de la Tarea',
  name: 'titulo',
  description: 'El título de la tarea',
}
```

❌ **Incorrecto:**
```typescript
{
  displayName: 'Task Title',
  name: 'taskTitle',
  description: 'The task title',
}
```

### 2. Validación de Parámetros

Usa `required: true` para campos obligatorios:

```typescript
{
  displayName: 'Título',
  name: 'titulo',
  type: 'string',
  required: true,  // ← Importante
  default: '',
}
```

### 3. Manejo de Errores

Siempre usa try-catch y `continueOnFail()`:

```typescript
try {
  // lógica
} catch (error) {
  if (this.continueOnFail()) {
    returnData.push({
      json: { error: error.message },
      pairedItem: { item: i },
    });
    continue;
  }
  manejarErrorApi(error);
}
```

### 4. Limpieza de Datos

Elimina campos vacíos antes de enviar:

```typescript
const cuerpo = limpiarObjeto({
  title: titulo,
  description: descripcion,  // Se elimina si está vacío
  importance: importancia,
});
```

### 5. Paginación

Siempre incluye opciones de paginación en operaciones de listado:

```typescript
{
  displayName: 'Límite',
  name: 'limit',
  type: 'number',
  default: 50,
  description: 'Número máximo de resultados',
},
{
  displayName: 'Desplazamiento',
  name: 'offset',
  type: 'number',
  default: 0,
  description: 'Número de resultados a omitir',
}
```

## 🚀 Optimizaciones

### Performance

- Usa `noDataExpression: true` en opciones estáticas
- Evita operaciones costosas en el loop principal
- Reutiliza helpers en lugar de duplicar código

### UX en n8n

- Usa `placeholder` para ejemplos claros
- Agrupa campos relacionados en `collection`
- Usa `displayOptions` para mostrar campos condicionalmente
- Proporciona valores `default` sensatos

## 📝 Documentación de Código

### Comentarios en TypeScript

```typescript
/**
 * Obtiene la lista de tareas filtradas por parámetros
 * @param filtros - Objeto con filtros opcionales (estado, proyecto, etc)
 * @returns Promise con la lista de tareas y metadatos de paginación
 */
async function obtenerTareas(filtros: FiltrosTareas): Promise<RespuestaListaTareas> {
  // Implementación
}
```

### README del Nodo

Si creas un nodo complejo, documenta:

1. Propósito del nodo
2. Operaciones disponibles
3. Parámetros de cada operación
4. Ejemplos de uso
5. Casos de uso comunes

## 🔄 Workflow de Contribución

1. Fork del repositorio
2. Crea rama: `git checkout -b feature/nuevo-nodo-proyectos`
3. Desarrolla siguiendo esta guía
4. Prueba exhaustivamente
5. Actualiza documentación (README.md, DESARROLLO.md)
6. Commit: `git commit -m "Agrega nodo de Proyectos con CRUD completo"`
7. Push: `git push origin feature/nuevo-nodo-proyectos`
8. Abre Pull Request

## 📚 Recursos

- [Documentación de n8n para crear nodos](https://docs.n8n.io/integrations/creating-nodes/)
- [API Reference de n8n](https://docs.n8n.io/integrations/creating-nodes/code/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [API de VictoriaOS](https://app.victoriaos.com/api/v1/docs)

## ❓ Preguntas Frecuentes

### ¿Cómo manejo campos opcionales en la API?

Usa el helper `limpiarObjeto()` que elimina campos undefined/null/vacíos.

### ¿Cómo pruebo sin publicar a npm?

Usa `npm link` para vincular el paquete localmente.

### ¿Cómo manejar múltiples entornos?

Ya está implementado en las credenciales con el campo "Entorno".

### ¿Puedo agregar campos personalizados?

Sí, pero asegúrate de que la API los soporte primero.

---

**¿Tienes más preguntas?** Abre un issue en GitHub o contacta al equipo de desarrollo.
