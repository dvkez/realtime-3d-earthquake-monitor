# 🌍 Realtime 3D Earthquake Monitor

[![Next.js](https://img.shields.io/badge/Next.js-15.5.28-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.170-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Realtime 3D Earthquake Monitor** es una aplicación web interactiva de monitoreo sísmico global en tiempo real. Combina un globo terráqueo 3D acelerado por hardware con WebGL, proyección de mapa 2D cilíndrico, analítica temporal de magnitudes y el feed público en vivo del **USGS (United States Geological Survey)**.

---

## ✨ Características Principales

- **🌐 Globo Terráqueo 3D Interactivo**:
  - Renderizado con **Three.js** y **React Three Fiber (v9)**.
  - Textura fotorrealista de la Tierra con halo atmosférico y fondo estelar.
  - Marcadores esféricos con escala y código de color según la magnitud sísmica:
    - 🟢 **M < 2.5**: Leve
    - 🟡 **M 2.5 - 4.5**: Moderado
    - 🟠 **M 4.5 - 6.0**: Fuerte
    - 🔴 **M > 6.0**: Severo / Mayor (con anillo pulsante interactivo).
  - Navegación orbital suave (rotación, zoom y centrado automático de cámara al seleccionar un sismo).

- **🗺️ Modo Mapa 2D de Comando**:
  - Alternador instantáneo entre visualización 3D y proyección cilíndrica equirrectangular 2D sobre Canvas de alto rendimiento.
  - Retícula geográfica de latitud y longitud, ecuador y meridiano de referencia.

- **📊 Gráfico Cronológico de Magnitudes**:
  - Analítica interactiva con **ApexCharts**.
  - Agrupación temporal dinámica en 24 horas, 7 días, 30 días y rangos anuales.
  - Navegación entre periodos temporales (anterior / siguiente).

- **🔍 Búsqueda y Filtros en Tiempo Real**:
  - Buscador textual reactivo por ubicación (ej: *"Chile"*, *"Japan"*, *"California"*, *"Mexico"*).
  - Chips de filtrado rápido por magnitud mínima (Todos, M2.5+, M4.5+, M6.0+).

- **🌐 Soporte Bilingüe Completo (EN / ES)**:
  - Cambio de idioma instantáneo entre Español e Inglés sin recargar la página.

- **⚡ Datos Abiertos y Seguros**:
  - Conexión directa al API REST abierto de USGS sin necesidad de API keys privadas.
  - Auto-actualización periódica cada 5 minutos con indicador visual *"USGS Live Feed"*.

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología |
| :--- | :--- |
| **Framework Web** | [Next.js 15](https://nextjs.org/) (App Router, Server Components & Client Hydration) |
| **Biblioteca UI** | [React 19](https://react.dev/) |
| **Gráficos 3D / WebGL** | [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei) |
| **Estilos & Diseño** | [Tailwind CSS](https://tailwindcss.com/), Radix UI / Shadcn UI |
| **Visualización de Datos** | [ApexCharts](https://apexcharts.com/) / `react-apexcharts`, [Recharts](https://recharts.org/) |
| **Fuente de Datos** | [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/) |
| **Iconos** | [Lucide React](https://lucide.dev/) |

---

## 📁 Estructura del Proyecto

```plaintext
realtime-3-d-react-app/
├── app/
│   ├── globals.css              # Tokens de diseño, temas oscuro/claro y Tailwind
│   ├── layout.tsx               # Metadatos SEO, fuentes Inter y viewport
│   └── page.tsx                 # Tablero principal y alternador de vistas 3D/2D
├── components/
│   ├── ui/                      # Componentes accesibles base (Shadcn/Radix)
│   ├── earthquake-context.tsx   # Estado global, consumo del API USGS y filtros
│   ├── earthquake-globe.tsx     # Globo 3D con Three.js, marcadores y atmósfera
│   ├── earthquake-map-2d.tsx    # Proyección de mapa 2D equirrectangular
│   ├── earthquake-chart.tsx     # Analítica cronológica con ApexCharts
│   ├── earthquake-list.tsx      # Lista paginada con buscador y filtros
│   ├── earth.tsx                # Malla 3D reutilizable de la Tierra
│   └── header.tsx               # Barra superior, selector de vista y estado en vivo
├── public/
│   ├── assets/3d/               # Textura fotorrealista de la Tierra
│   └── icons & favicons         # Iconos de la aplicación
├── .env.example                 # Plantilla de variables de entorno (sin secretos)
├── .gitignore                   # Exclusiones de seguridad (archivos locales, temporales)
├── next.config.mjs              # Configuración optimizada de Next.js
├── package.json                 # Dependencias y scripts de ejecución
├── tailwind.config.ts           # Configuración de temas de Tailwind
└── tsconfig.json                # Configuración estricta de TypeScript
```

---

## 🚀 Inicio Rápido en Local

### 1. Requisitos Previos
- **Node.js** v18 o superior (recomendado v20+ o v24).
- **npm**, **pnpm** o **yarn**.

### 2. Clonar e Instalar Dependencias
```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/realtime-3d-earthquake-monitor.git

# Entrar a la carpeta
cd realtime-3d-earthquake-monitor

# Instalar dependencias
npm install
```

### 3. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000) para ver la aplicación en funcionamiento.

### 4. Compilar para Producción
```bash
npm run build
npm run start
```

---

## 🔒 Seguridad y Privacidad

- **Sin Claves Privadas Expuestas**: Este proyecto utiliza datos abiertos y públicos provistos por el **USGS**. No requiere ninguna clave de API obligatoria para operar.
- **`.gitignore` Reforzado**: Se han configurado reglas estrictas para evitar que archivos `.env`, `.env.local`, claves de sesión o credenciales accidentales se sincronicen con GitHub.
- Si deseas integrar proveedores adicionales (como Mapbox o análisis personalizados), utiliza `.env.example` como plantilla para crear tu propio archivo `.env.local`.

---

## 🌐 Despliegue en la Nube (Vercel)

La forma más sencilla de desplegar este proyecto es a través de **Vercel**:

1. Sube tu repositorio a GitHub.
2. Inicia sesión en [Vercel](https://vercel.com).
3. Haz clic en **"Add New Project"** e importa tu repositorio de GitHub.
4. Presiona **"Deploy"**. Vercel detectará automáticamente Next.js 15 y desplegará la aplicación en segundos.

---

## 📄 Atribución y Licencia

- **Datos Sísmicos**: Agradecimiento a [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/) por su API de datos abiertos.
- **Licencia**: Este proyecto está licenciado bajo la Licencia **MIT**. Consulta el archivo `LICENSE` o siéntete libre de utilizarlo para fines educativos, personales y comerciales.
