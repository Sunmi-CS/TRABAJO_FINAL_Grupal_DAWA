# 🐾 PetCare - Sistema de Gestión de Guardería para Mascotas

PetCare es una aplicación web full-stack diseñada para la gestión integral de una guardería para mascotas. Permite a los dueños registrar a sus animales, solicitar servicios (guardería, paseos, baño, etc.), y a los administradores gestionar todos estos procesos mediante un dashboard con estadísticas.

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 15 (App Router)**
- **TypeScript**
- **TailwindCSS** (Estilos personalizados, animaciones y diseño responsive)
- **Axios**
- **Recharts** (Gráficos interactivos)
- **React Hook Form + Zod** (Validaciones de formularios)
- **@react-oauth/google** (Autenticación OAuth)

### Backend
- **Express.js** con **TypeScript**
- **Prisma ORM**
- **PostgreSQL** alojado en Supabase
- **Supabase Storage** (Almacenamiento de fotos)
- **JWT** (Autenticación basada en tokens)
- **Bcrypt.js** (Hash de contraseñas)
- **Zod** (Validación de esquemas API)

---

## 💻 Requisitos Previos

1. Node.js (v18 o superior)
2. Proyecto en [Supabase](https://supabase.com) (Database + Storage)
3. Proyecto en [Google Cloud Console](https://console.cloud.google.com) para OAuth 2.0 Client ID

---

## ⚙️ Configuración y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd TRABAJO_FINAL_Grupal
```

### 2. Configurar Base de Datos y Storage en Supabase
1. Crea un nuevo proyecto en Supabase.
2. Obtén la URL de conexión de la base de datos (Session y Transaction pooler).
3. Ve a la sección **Storage** y crea un nuevo *Bucket* público llamado `pets-images`.
4. Obtén tu `service_role_key` desde Project Settings -> API.

### 3. Configurar Backend
```bash
cd backend
npm install
```

Crea un archivo `.env` basado en `.env.example`:
```env
# ── Base de Datos (Supabase PostgreSQL) ──────────────────────────────────────
DATABASE_URL="postgresql://usuario:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:password@host:5432/postgres"

# ── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET="una_clave_larga_y_segura"
JWT_EXPIRES_IN="7d"

# ── Google OAuth ─────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID="tu_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# ── Supabase Storage ─────────────────────────────────────────────────────────
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"
SUPABASE_BUCKET_PETS="pets-images"

# ── Servidor ─────────────────────────────────────────────────────────────────
PORT=4000
NODE_ENV="development"

# ── Upload Config ────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB=5
ALLOWED_MIME_TYPES="image/jpeg,image/jpg,image/png,image/webp"

# ── CORS ─────────────────────────────────────────────────────────────────────
FRONTEND_URL="http://localhost:3000"

```

Generar esquema Prisma y hacer push a la base de datos:
```bash
npx prisma generate
npx prisma db push
```

Poblar la base de datos con datos semilla (usuarios, servicios, mascotas, reservas):
```bash
npm run prisma:seed
```

Iniciar servidor de desarrollo:
```bash
npm run dev
```
*(El backend correrá en http://localhost:4000)*

### 4. Configurar Frontend
En otra terminal:
```bash
cd frontend
npm install --legacy-peer-deps
```

Crea un archivo `.env.local` basado en `.env.example`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="tu_google_client_id.apps.googleusercontent.com"
```

Iniciar servidor de desarrollo:
```bash
npm run dev
```
*(El frontend correrá en http://localhost:3000)*

---

## 🌐 Credenciales de Prueba (Generadas por el Seed)

**Administrador:**
- Email: `admin@petcare.com`
- Password: `petcare123`

**Clientes de prueba:**
- Email: `maria@example.com` / `carlos@example.com`
- Password: `petcare123`

---

## 🚢 Despliegue en Render

El repositorio cuenta con dos archivos `render.yaml` (uno en `backend/` y otro en `frontend/`) listos para el despliegue automático mediante Render's Blueprint.

### Pasos para Despliegue:
1. Conecta tu repositorio de GitHub a Render.
2. Selecciona la opción **Blueprints** en Render.
3. Elige este repositorio. Render detectará los dos servicios (`petcare-backend` y `petcare-frontend`).
4. Ingresa las variables de entorno sensibles cuando el dashboard de Render te lo solicite.
5. Haz clic en **Apply** y espera a que ambos servicios finalicen el build.

*(Nota: Recuerda actualizar `FRONTEND_URL` en el backend y configurar el dominio de Render en los orígenes autorizados de Google Cloud Console)*

---

## ✨ Características y Renderizado

- **SSR (Server-Side Rendering):** Utilizado en el detalle de mascota (`/pets/[id]`) para garantizar información actualizada y SEO-friendly. Lee el token JWT directo de las cookies.
- **ISR (Incremental Static Regeneration):** Utilizado en el listado de servicios (`/services`) con un `revalidate` de 1 hora, ideal para catálogos que cambian poco.
- **CSR (Client-Side Rendering):** Paneles administrativos y flujos interactivos de creación de registros.
- **RSC (React Server Components):** Consultas directas de datos como el historial de reservas de un usuario (`/reservations`).
