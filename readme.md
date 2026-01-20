
---
<div align="center">

  <img src="./public/uploads/presentacion.webp" alt="Logo Perdidos y Encontrados" width="100%">

  <h1>🐾 Perdidos & Encontrados</h1>
  <h2>— API Backend / Frontend —</h2>
  
  <p>
    <i>"Publicá lo que perdiste o encontraste y ayudá a que todo vuelva a su lugar."</i>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Backend-Node.js-green" alt="Node.js">
    <img src="https://img.shields.io/badge/Language-TypeScript-blue" alt="TypeScript">
    <img src="https://img.shields.io/badge/Database-JSON-yellow" alt="JSON">
    <img src="https://img.shields.io/badge/Deploy-Render-orange" alt="Render">
  </p>

  <h4>
    🚀 <a href="https://systemlostfound.onrender.com">Ver Demo en Vivo</a>
  </h4>

</div>

---
Trabajo Final del ***Módulo III Backend*** con Node.js y TypeScript.  
Este proyecto es el núcleo de una plataforma de reportes comunitarios para la búsqueda de **objetos perdidos y encontrados**, con autenticación, roles, moderación de publicaciones y gestión de imágenes.

Está diseñado para ser **rápido, seguro y liviano**, ideal para desplegarse en servicios como **Render, Vercel o Railway**.

---

<a name="indice"></a>
## 📍 Índice
- [📍 Índice](#-índice)
- [🧱 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Arquitectura del Backend](#-arquitectura-del-backend)
- [📁 Persistencia de Datos](#-persistencia-de-datos)
- [🖼️ Gestión de Imágenes](#️-gestión-de-imágenes)
- [🔐 Seguridad](#-seguridad)
- [⚙️ Variables de Entorno](#️-variables-de-entorno)
- [🛠️ Instalación](#️-instalación)
- [🛣️ API](#️-api)
  - [Auth](#auth)
  - [Items](#items)
  - [Usuarios (solo ADMIN)](#usuarios-solo-admin)
    - [*📋 Ejemplo de Respuesta (POST /api/users/login)*](#-ejemplo-de-respuesta-post-apiuserslogin)
- [👩‍💻 Autora](#-autora)

---
---

## 🧱 Estructura del Proyecto

```
🗂️TRABAJO_FINAL_M3/
│
├── 📁backend/                    → Backend en Node.js + TypeScript
│   ├── 📁dist/                   → Código compilado a JavaScript (build)
│   ├── 📁node_modules/           → Dependencias del proyecto
│   ├── 📁src/
│   │   ├── 📁controllers/        → Lógica de negocio de cada recurso
│   │   │   ├── 📄itemController.ts   → Controlador de publicaciones (items)
│   │   │   └── 📄userController.ts   → Controlador de usuarios y auth
│   │   │
│   │   ├── 📁data/               → Persistencia en archivos JSON
│   │   │   ├── 📄items.json      → Publicaciones (objetos perdidos/encontrados)
│   │   │   └── 📄users.json      → Usuarios, roles, estado de baneo
│   │   │
│   │   ├── 📁middlewares/        → Middlewares de seguridad y control
│   │   │   ├── 📄authMiddleware.ts   → Verificación de JWT
│   │   │   ├── 📄roleMiddleware.ts   → Control de permisos por rol
│   │   │   ├── 📄errorHandler.ts     → Manejo centralizado de errores
│   │   │   └── 📄upload.ts           → Configuración de Multer para subida de imágenes
│   │   │
│   │   ├── 📁models/             → Interfaces y tipos de datos
│   │   │   ├── 📄item.ts         → Modelo de publicación
│   │   │   └── 📄user.ts         → Modelo de usuario
│   │   │
│   │   ├── 📁routes/             → Definición de endpoints
│   │   │   ├── 📄itemRoutes.ts   → Rutas de publicaciones
│   │   │   └── 📄userRoutes.ts   → Rutas de usuarios y auth
│   │   │
│   │   ├── 📁services/           → Servicios reutilizables
│   │   │   └── 📄dataService.ts  → Acceso seguro a archivos JSON
│   │   │
│   │   └── 📄index.ts            → Punto de entrada del servidor
│   │
│   ├── .env                    → Variables de entorno
│   ├── .gitignore              → Archivos ignorados por Git
│   ├── package.json            → Dependencias y scripts
│   ├── package-lock.json       → Versionado exacto de dependencias
│   └── tsconfig.json           → Configuración de TypeScript
│
├── 📁public/                     → Frontend (cliente)
│   ├── 📁css/                    → Estilos
│   ├── 📁js/                     → Lógica del frontend
│   │   ├── 📄api.js              → Conexión con la API
│   │   ├── 📄app.js              → Inicialización general
│   │   ├── 📄auth.js             → Login y registro
│   │   ├── 📄items.js            → Gestión de publicaciones
│   │   └── 📄ui.js               → Interfaz de usuario
│   │
│   ├── 📁uploads/                → (Opcional) imágenes locales si no se usa Cloudinary
│   └── 📄index.html              → Interfaz principal
│
└── 📝README.md                   → Documentación del proyecto
```

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## 🚀 Arquitectura del Backend

Backend construido con:
- Node.js
- TypeScript
- Express

Persistencia mediante archivos JSON usando un **Data Service** centralizado.

Ventajas:
- Simple de mantener
- Portable
- Ideal para proyectos educativos y de portfolio
- Muy eficiente en despliegues cloud

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## 📁 Persistencia de Datos

Archivos:
- **users.json** → usuarios, roles, password hasheada, estado de baneo
- **items.json** → publicaciones vinculadas al userId


Gestionado por `dataService.ts` con escritura segura.

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## 🖼️ Gestión de Imágenes

Flujo:
1. **Multer** recibe la imagen en memoria  
2. **Sharp**:
   - Resize máx 800px
   - Conversión a .webp
   - Reducción de peso hasta 80%
3. **Cloudinary** sube la imagen
4. Eliminación automática de imágenes viejas

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## 🔐 Seguridad

- **JWT** para autenticación
- **BCryptJS** para contraseñas
- Sistema de roles (user / admin)
- Sistema de baneo inteligente

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## ⚙️ Variables de Entorno

```env
PORT=3000
JWT_SECRET=tu_secreto_super_seguro
CLOUDINARY_CLOUD_NAME=tu_nombre
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
```

---

## 🛠️ Instalación

```bash
cd backend
npm install
npm run dev
```

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## 🛣️ API

Header:
```
Authorization: Bearer <token>
```

### Auth
- POST /api/users/register  
- POST /api/users/login  

### Items
- GET /api/items  
- POST /api/items  
- PUT /api/items/:id  
- PATCH /api/items/:id/status  
- DELETE /api/items/:id  

### Usuarios (solo ADMIN)
- GET /api/users  
- PATCH /api/users/:id/ban  
- DELETE /api/users/:id  


#### *📋 Ejemplo de Respuesta (POST /api/users/login)*

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "36bbf3cd-9f99-417a-90cc-9b008307a6f1",
        "username": "gabriela",
        "role": "user"
    }
}
```

<p align="right"><a href="#-índice">volver arriba ↑</a></p>
<!-- omit from toc -->

---

## 👩‍💻 Autora
* **MARTINEZ HERRERO, Maria Gabriela**
* Data Analyst | Frontend & Backend Developer 
<p>
  <a href="https://github.com/magamahe" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="32"/>
  </a>
  &nbsp;
  <a href="https://linkedin.com/in/magamahe" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" width="32"/>
  </a>
  &nbsp;
  <a href="mailto:magamahe@gmail.com">
    <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="32"/>
  </a>
</p>
 
---

⭐ Si te gusta el proyecto, ¡no olvides dejar una estrella!