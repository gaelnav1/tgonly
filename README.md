# TGOnly — Hub de Grupos de Telegram

## Setup rápido

### Variables de servidor

Copia `.env.example` a `.env.local` para desarrollo. Configura `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` y `TELEGRAM_BOT_TOKEN`. Para `SUPABASE_SERVICE_ROLE_KEY` usa una clave **secret** nueva (`sb_secret_...`) de Settings → API Keys; el nombre de la variable se conserva por compatibilidad. No publiques sus valores en Git. Tras comprobar el despliegue, desactiva la clave legacy `service_role` expuesta.

En AWS Amplify, añade esas cuatro variables a la configuración de la rama `master` antes de desplegar. `amplify.yml` las incorpora al entorno del servidor Next.js durante el build y falla si falta alguna. Cambia las credenciales expuestas en el historial de Git antes de usarlas en producción.

### 1. Instala dependencias
```bash
npm install
```

### 2. Configura Supabase
1. Crea cuenta gratis en https://supabase.com
2. Crea un proyecto nuevo
3. Ve a SQL Editor y pega el contenido de `supabase-schema.sql`
4. Copia `.env.example` → `.env.local` y rellena tus keys

### 3. Corre en desarrollo
```bash
npm run dev
```

---

## Agregar grupos (flujo diario)

1. Abre `data/groups.csv` en Excel o Google Sheets
2. Agrega una fila por grupo
3. Guarda el archivo
4. Ejecuta:
```bash
npm run import
```

Listo — el sitio se actualiza en segundos.

---

## Columnas del CSV

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| name | Nombre del grupo | Bitcoin MX Traders |
| emoji | Ícono | ₿ |
| color | Color de la card | teal, blue, amber, red, purple |
| members | Número de miembros | 45231 |
| verified | Verificado | true / false |
| desc | Descripción corta | Señales de trading... |
| tags | Tags separados por \| | cripto\|trading\|bitcoin |
| trending | Aparece en trending | true / false |
| category | Categoría slug | cripto, tech, gaming, noticias, educacion |
| link | Link de Telegram | https://t.me/tugrupo |

---

## Estructura del proyecto

```
tgonly/
├── app/
│   ├── page.tsx          ← Homepage principal
│   └── globals.css       ← Estilos globales
├── components/
│   ├── GroupCard.tsx     ← Card de cada grupo
│   └── CategoryGrid.tsx  ← Grid de categorías
├── data/
│   ├── groups.ts         ← Datos mock (sin Supabase)
│   └── groups.csv        ← Tu base de datos en CSV
├── scripts/
│   └── import-groups.ts  ← Script de importación
├── supabase-schema.sql   ← Schema de la DB
└── .env.example          ← Variables de entorno
```

---

## Deploy en Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel

# Agrega las env vars en vercel.com → Tu proyecto → Settings → Environment Variables
```
