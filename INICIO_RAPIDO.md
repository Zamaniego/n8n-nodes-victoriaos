# 🚀 Inicio Rápido - n8n-nodes-victoriaos

Esta guía te permitirá tener el paquete funcionando en menos de 5 minutos.

## ⚡ Instalación Rápida

### Opción 1: Instalación desde npm (Cuando esté publicado)

```bash
# En tu directorio de n8n o ~/.n8n/custom
npm install n8n-nodes-victoriaos
```

### Opción 2: Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar el proyecto
npm run build

# 3. Vincular el paquete
npm link

# 4. En tu instalación de n8n
cd ~/.n8n
npm link n8n-nodes-victoriaos

# 5. Reiniciar n8n
n8n start
```

## 🔑 Configurar Credenciales

1. **Obtén tu API Key:**
   - Ve a https://app.victoriaos.com
   - Navega a Configuración → API
   - Genera una nueva clave (formato: `sk_live_...`)

2. **En n8n:**
   - Ve a Credenciales → Nueva Credencial
   - Busca "API de VictoriaOS"
   - Pega tu clave API
   - Selecciona entorno: Producción
   - Prueba la conexión
   - Guarda

## 📝 Primer Workflow: Crear una Tarea

### Paso 1: Agregar el nodo

1. Crea un nuevo workflow en n8n
2. Busca "Tareas de VictoriaOS" en el panel de nodos
3. Arrastra el nodo al canvas

### Paso 2: Configurar el nodo

1. Selecciona las credenciales que creaste
2. Operación: **Crear**
3. Título: `Mi primera tarea desde n8n`
4. En "Campos Adicionales":
   - Descripción: `Creada automáticamente`
   - Importancia: `Alta (2)`
   - Es Urgente: `Sí`

### Paso 3: Ejecutar

1. Haz clic en "Ejecutar Nodo"
2. ¡Listo! Verás la tarea creada en la respuesta

## 🎯 Ejemplos Rápidos

### Ejemplo 1: Listar Tareas Pendientes

```
Nodo: Tareas de VictoriaOS
- Operación: Listar
- Filtros:
  - Estado: Por Hacer (todo)
  - Límite: 10
```

### Ejemplo 2: Crear Webhook

```
Nodo: Webhooks de VictoriaOS
- Operación: Crear
- URL: https://tu-servidor.com/webhook
- Eventos:
  - Tarea Creada ✓
  - Tarea Completada ✓
```

### Ejemplo 3: Ver Mi Información

```
Nodo: Usuario de VictoriaOS
- Operación: Obtener Mi Información
```

Ejecuta y verás tu plan, límites y uso de API.

## 🛠️ Comandos de Desarrollo

```bash
# Compilar en modo watch (auto-recompila)
npm run dev

# Compilar producción
npm run build

# Verificar código
npm run lint

# Formatear código
npm run format

# Corregir errores de linting
npm run lintfix
```

## 📂 Archivos Importantes

- **package.json** - Configuración del paquete
- **README.md** - Documentación completa
- **DESARROLLO.md** - Guía para desarrolladores
- **nodes/** - Código de los nodos
- **credentials/** - Configuración de autenticación
- **types/** - Tipos TypeScript
- **helpers/** - Funciones reutilizables

## 🐛 Solución de Problemas

### El nodo no aparece en n8n

```bash
# Recompila y reinicia
npm run build
# Reinicia n8n completamente
```

### Error de credenciales

```bash
# Verifica que tu clave sea válida
# Debe comenzar con: sk_live_
# Prueba las credenciales en n8n
```

### Errores de TypeScript

```bash
# Limpia y recompila
rm -rf dist/
npm run build
```

### Error "Cannot find module"

```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentación Completa

- **README.md** - Guía completa de usuario
- **DESARROLLO.md** - Guía de desarrollo y contribución
- **API VictoriaOS** - https://app.victoriaos.com/api/v1/docs
- **Docs n8n** - https://docs.n8n.io/

## 🎓 Próximos Pasos

1. ✅ Prueba los 3 nodos (Tareas, Webhooks, Usuario)
2. ✅ Crea workflows de automatización
3. ✅ Lee el README.md para casos avanzados
4. ✅ Consulta DESARROLLO.md para extender el paquete
5. ✅ Publica a npm cuando esté listo

## ✨ Tips Útiles

- Usa el modo "watch" durante desarrollo: `npm run dev`
- Todos los nodos soportan "continueOnFail" para manejo de errores
- Puedes usar expresiones de n8n en todos los campos: `{{$json.campo}}`
- Los filtros en "Listar Tareas" son todos opcionales
- Las fechas deben estar en formato ISO 8601

## 🆘 ¿Necesitas Ayuda?

- **Issues:** https://github.com/Zamaniego/n8n-nodes-victoriaos/issues
- **Email:** soporte@victoriaos.com
- **Docs API:** https://app.victoriaos.com/api/v1/docs

---

**¡Listo para comenzar! 🚀**

Recuerda: todos los textos, descripciones y campos están en español.
