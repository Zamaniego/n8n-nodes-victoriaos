# n8n-nodes-victoriaos

![Banner VictoriaOS](https://via.placeholder.com/1200x300/6366f1/ffffff?text=VictoriaOS+para+n8n)

[![npm version](https://img.shields.io/npm/v/n8n-nodes-victoriaos.svg)](https://www.npmjs.com/package/n8n-nodes-victoriaos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Nodos personalizados de n8n para integrar **VictoriaOS**, la plataforma de gestión de tareas y productividad. Este paquete te permite automatizar completamente tu flujo de trabajo con VictoriaOS directamente desde n8n.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Nodos Disponibles](#-nodos-disponibles)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Desarrollo](#-desarrollo)
- [Publicación](#-publicación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

Este paquete incluye **3 nodos principales** para interactuar con la API de VictoriaOS:

### 🎯 Nodo de Tareas
- ✅ **Listar** tareas con filtros avanzados (estado, proyecto, importancia, urgencia)
- ✅ **Obtener** una tarea específica por ID
- ✅ **Crear** nuevas tareas con todos los campos disponibles
- ✅ **Actualizar** tareas existentes (parcial o completa)
- ✅ **Eliminar** tareas permanentemente

### 🔗 Nodo de Webhooks
- ✅ **Listar** todos los webhooks configurados
- ✅ **Obtener** detalles de un webhook específico
- ✅ **Crear** nuevos webhooks con eventos personalizados
- ✅ **Actualizar** configuración de webhooks existentes
- ✅ **Eliminar** webhooks
- ✅ **Obtener estadísticas** de entregas de webhooks

### 👤 Nodo de Usuario
- ✅ **Obtener información** del usuario autenticado
- ✅ Ver **plan de suscripción** actual
- ✅ Consultar **límites de velocidad** (rate limits)
- ✅ Revisar **estadísticas de uso**

## 📦 Instalación

### Opción 1: Instalación desde npm (Recomendado)

Para instalar este paquete en tu instancia de n8n, ejecuta:

```bash
npm install n8n-nodes-victoriaos
```

### Opción 2: Instalación Manual (Para desarrollo)

1. Clona este repositorio:
```bash
git clone https://github.com/Zamaniego/n8n-nodes-victoriaos.git
cd n8n-nodes-victoriaos
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el proyecto:
```bash
npm run build
```

4. Vincula el paquete localmente:
```bash
npm link
```

5. En tu instalación de n8n, ejecuta:
```bash
npm link n8n-nodes-victoriaos
```

### Opción 3: Instalación en n8n con Docker

Si usas n8n con Docker, agrega la variable de entorno:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_CUSTOM_EXTENSIONS="/home/node/.n8n/custom" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Luego, dentro del contenedor:
```bash
cd /home/node/.n8n/custom
npm install n8n-nodes-victoriaos
```

## 🔧 Configuración

### 1. Obtener tu Clave API de VictoriaOS

1. Inicia sesión en [VictoriaOS](https://app.victoriaos.com)
2. Ve a **Configuración** → **API**
3. Genera una nueva clave API
4. Copia la clave que comienza con `sk_live_...`

⚠️ **Importante**: Guarda tu clave de forma segura. No la compartas públicamente.

### 2. Configurar las Credenciales en n8n

1. En n8n, ve a **Credenciales** → **Agregar Credencial**
2. Busca **"API de VictoriaOS"**
3. Completa los campos:
   - **Clave API**: Pega tu clave `sk_live_...`
   - **Entorno**: Selecciona `Producción` (o `Desarrollo` si estás probando localmente)
4. Haz clic en **Probar Credenciales** para verificar la conexión
5. Guarda las credenciales

## 🚀 Nodos Disponibles

### Nodo: Tareas de VictoriaOS

Gestiona todas tus tareas desde n8n.

#### Operaciones Disponibles:

**📋 Listar Tareas**
```
Filtros disponibles:
- Estado (todo, in_progress, waiting, scheduled, someday, completed, archived)
- ID del Proyecto
- Importancia (0-3)
- Es Urgente (sí/no)
- Límite y Desplazamiento (para paginación)
```

**🔍 Obtener Tarea**
```
Requiere: ID de la tarea (UUID)
Retorna: Objeto completo de la tarea
```

**➕ Crear Tarea**
```
Campos requeridos:
- Título

Campos opcionales:
- Descripción
- Estado
- Importancia (0-3)
- Es Urgente
- Fecha de Vencimiento
- Fecha Programada
- ID del Proyecto
- Minutos Estimados
```

**✏️ Actualizar Tarea**
```
Requiere: ID de la tarea
Actualiza: Cualquier campo de la tarea (parcial)
```

**🗑️ Eliminar Tarea**
```
Requiere: ID de la tarea
Elimina: Permanentemente la tarea
```

### Nodo: Webhooks de VictoriaOS

Gestiona webhooks para recibir notificaciones en tiempo real.

#### Operaciones Disponibles:

**📋 Listar Webhooks**
```
Retorna: Lista de todos los webhooks configurados
Incluye: Paginación (limit, offset)
```

**🔍 Obtener Webhook**
```
Requiere: ID del webhook (UUID)
Retorna: Detalles completos del webhook
```

**➕ Crear Webhook**
```
Campos requeridos:
- URL del webhook
- Eventos a escuchar

Eventos disponibles:
- task.created (Tarea creada)
- task.updated (Tarea actualizada)
- task.completed (Tarea completada)
- task.deleted (Tarea eliminada)

Campos opcionales:
- Descripción
- Activo (sí/no)
```

**✏️ Actualizar Webhook**
```
Requiere: ID del webhook
Actualiza: URL, eventos, descripción o estado activo
```

**🗑️ Eliminar Webhook**
```
Requiere: ID del webhook
Elimina: Permanentemente el webhook
```

**📊 Obtener Estadísticas**
```
Requiere: ID del webhook
Retorna:
- Total de entregas
- Entregas exitosas
- Entregas fallidas
- Última entrega
- Última entrega exitosa
- Última entrega fallida
```

### Nodo: Usuario de VictoriaOS

Obtiene información del usuario autenticado.

#### Operaciones Disponibles:

**👤 Obtener Mi Información**
```
Retorna:
- ID del usuario
- Email
- Fecha de creación
- Plan de suscripción (free, pro, enterprise)
- Estado de la suscripción (active, cancelled, expired)
- Límites de velocidad actuales y máximos
- Uso actual de la API
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear una Tarea desde un Formulario Web

```
[Webhook Trigger] → [Tareas de VictoriaOS]
                      - Operación: Crear
                      - Título: {{$json.titulo}}
                      - Descripción: {{$json.descripcion}}
                      - Importancia: 2
                      - Es Urgente: true
```

### Ejemplo 2: Listar Tareas Pendientes y Enviar Email

```
[Schedule Trigger] → [Tareas de VictoriaOS] → [Filtrar] → [Email]
  (Cada día 9am)     - Operación: Listar      (Estado = todo)
                     - Filtro Estado: todo
```

### Ejemplo 3: Sincronizar Tareas Completadas con Google Sheets

```
[Webhook VictoriaOS] → [IF] → [Google Sheets]
 (task.completed)     (Estado = completed)
                                 - Operación: Agregar Fila
                                 - Valores: {{$json.title}}, {{$json.completed_at}}
```

### Ejemplo 4: Crear Webhook y Recibir Notificaciones

```
[Manual Trigger] → [Webhooks de VictoriaOS]
                   - Operación: Crear
                   - URL: https://tu-servidor.com/webhook
                   - Eventos: task.created, task.completed
```

### Ejemplo 5: Verificar Límites de Uso de la API

```
[Schedule Trigger] → [Usuario de VictoriaOS] → [IF] → [Slack]
  (Cada hora)        - Operación: Obtener Info   (Límite < 100)
                                                   - Enviar alerta
```

## 🛠️ Desarrollo

### Requisitos Previos

- Node.js >= 18.10
- pnpm >= 9.1 (o npm)
- n8n instalado localmente (para pruebas)

### Configuración del Entorno de Desarrollo

1. **Clona el repositorio**:
```bash
git clone https://github.com/Zamaniego/n8n-nodes-victoriaos.git
cd n8n-nodes-victoriaos
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Compila en modo desarrollo** (con watch):
```bash
npm run dev
```

Esto compilará automáticamente los archivos TypeScript cada vez que guardes cambios.

### Estructura del Proyecto

```
n8n-nodes-victoriaos/
├── credentials/
│   └── VictoriaOsApi.credentials.ts    # Configuración de autenticación
├── nodes/
│   ├── Tareas/
│   │   ├── Tareas.node.ts              # Nodo de tareas
│   │   └── tareas.svg                  # Icono del nodo
│   ├── Webhooks/
│   │   ├── Webhooks.node.ts            # Nodo de webhooks
│   │   └── webhooks.svg                # Icono del nodo
│   └── Usuario/
│       ├── Usuario.node.ts             # Nodo de usuario
│       └── usuario.svg                 # Icono del nodo
├── helpers/
│   └── utils.ts                        # Funciones helper reutilizables
├── types/
│   └── index.ts                        # Tipos e interfaces TypeScript
├── package.json
├── tsconfig.json
├── gulpfile.js                         # Copia iconos a dist/
└── README.md
```

### Comandos Disponibles

```bash
# Compilar el proyecto
npm run build

# Compilar en modo watch (desarrollo)
npm run dev

# Formatear código
npm run format

# Verificar linting
npm run lint

# Corregir problemas de linting automáticamente
npm run lintfix

# Preparar para publicación
npm run prepublishOnly
```

### Probar los Nodos Localmente

1. **Vincula el paquete**:
```bash
npm link
```

2. **En tu instalación de n8n**:
```bash
cd ~/.n8n/custom    # o donde tengas n8n instalado
npm link n8n-nodes-victoriaos
```

3. **Reinicia n8n**:
```bash
n8n start
```

4. Los nodos aparecerán automáticamente en el panel de n8n.

### Agregar Nuevos Nodos

Para agregar un nuevo nodo (por ejemplo, "Proyectos"):

1. **Crea la carpeta y archivos**:
```bash
mkdir -p nodes/Proyectos
touch nodes/Proyectos/Proyectos.node.ts
touch nodes/Proyectos/proyectos.svg
```

2. **Implementa el nodo** siguiendo la estructura de los nodos existentes.

3. **Registra el nodo** en `package.json`:
```json
{
  "n8n": {
    "nodes": [
      "dist/nodes/Tareas/Tareas.node.js",
      "dist/nodes/Webhooks/Webhooks.node.js",
      "dist/nodes/Usuario/Usuario.node.js",
      "dist/nodes/Proyectos/Proyectos.node.js"  // Nuevo
    ]
  }
}
```

4. **Compila y prueba**:
```bash
npm run build
```

## 📤 Publicación

### Publicar en npm

1. **Asegúrate de estar autenticado en npm**:
```bash
npm login
```

2. **Verifica que todo esté correcto**:
```bash
npm run build
npm run lint
```

3. **Actualiza la versión** en `package.json`:
```json
{
  "version": "1.0.1"  // Incrementa según semver
}
```

4. **Publica el paquete**:
```bash
npm publish
```

### Versionado Semántico (SemVer)

Sigue estas reglas para actualizar la versión:

- **MAJOR** (1.0.0 → 2.0.0): Cambios que rompen compatibilidad
- **MINOR** (1.0.0 → 1.1.0): Nuevas características compatibles
- **PATCH** (1.0.0 → 1.0.1): Correcciones de bugs

### Checklist de Publicación

Antes de publicar, asegúrate de:

- [ ] Actualizar la versión en `package.json`
- [ ] Actualizar el `README.md` si es necesario
- [ ] Ejecutar `npm run build` sin errores
- [ ] Ejecutar `npm run lint` sin errores
- [ ] Probar los nodos en una instancia local de n8n
- [ ] Crear un tag en Git con la versión
- [ ] Hacer commit y push de todos los cambios
- [ ] Ejecutar `npm publish`

### Publicar en el Registry de n8n (Opcional)

Para que tu paquete aparezca en la [lista oficial de nodos de la comunidad](https://n8n.io/integrations):

1. Asegúrate de que el nombre del paquete comience con `n8n-nodes-`
2. Incluye el keyword `n8n-community-node-package` en `package.json`
3. Publica en npm
4. El paquete aparecerá automáticamente en el registry de n8n

## 🎯 Roadmap y Nodos Futuros

Nodos y características planificadas para futuras versiones:

### Versión 1.1.0
- [ ] **Nodo de Proyectos**: CRUD completo de proyectos
- [ ] **Nodo de Etiquetas**: Gestión de etiquetas
- [ ] **Soporte para adjuntos** en tareas

### Versión 1.2.0
- [ ] **Nodo de Búsqueda**: Búsqueda avanzada en todas las entidades
- [ ] **Nodo de Estadísticas**: Reportes y analytics
- [ ] **Operaciones en lote**: Crear/actualizar múltiples tareas a la vez

### Versión 2.0.0
- [ ] **Trigger Webhook**: Recibir eventos de VictoriaOS directamente en n8n
- [ ] **Nodo de Automatizaciones**: Gestionar automatizaciones de VictoriaOS
- [ ] **Soporte para plantillas** de tareas

¿Tienes una idea para un nuevo nodo? [Abre un issue](https://github.com/Zamaniego/n8n-nodes-victoriaos/issues) o contribuye directamente.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar este paquete:

1. **Fork** el repositorio
2. **Crea una rama** para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. **Haz commit** de tus cambios (`git commit -am 'Agrega nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Abre un Pull Request**

### Guías de Contribución

- Escribe código limpio y bien documentado
- Sigue las convenciones de estilo de TypeScript
- Agrega tests cuando sea posible
- Actualiza el README.md si agregas nuevas características
- Todos los mensajes, comentarios y documentación deben estar en español

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

- 📖 Revisa la [documentación de la API de VictoriaOS](https://app.victoriaos.com/api/v1/docs)
- 🐛 Reporta bugs en [GitHub Issues](https://github.com/Zamaniego/n8n-nodes-victoriaos/issues)
- 💬 Únete a nuestra comunidad en Discord (próximamente)
- 📧 Contacta a soporte: soporte@victoriaos.com

## 📚 Recursos Adicionales

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Guía para crear nodos personalizados](https://docs.n8n.io/integrations/creating-nodes/)
- [API de VictoriaOS](https://app.victoriaos.com/api/v1/docs)
- [Comunidad de n8n](https://community.n8n.io/)

---

**Hecho con ❤️ para la comunidad de VictoriaOS y n8n**

¿Te gusta este proyecto? Dale una ⭐ en [GitHub](https://github.com/Zamaniego/n8n-nodes-victoriaos)
