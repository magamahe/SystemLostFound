# 🔍 Lost & Found API - Sistema de Objetos Perdidos

Trabajo Final para el Módulo de Backend con Node.js y TypeScript. Esta aplicación permite a los usuarios reportar objetos perdidos o encontrados, con un sistema de moderación para administradores.

## 🌙 Interfaz y Diseño
- **Tema Oscuro por Defecto:** Siguiendo las preferencias de diseño moderno, la aplicación utiliza una paleta de colores oscuros (`#121212`) para reducir la fatiga visual, con acentos en colores neón para destacar elementos importantes.
- **Responsivo:** Diseño pensado para ser consultado desde dispositivos móviles y escritorio.

## 🛠️ Tecnologías Utilizadas
- **Backend:** Node.js, Express, TypeScript.
- **Seguridad:** JSON Web Tokens (JWT) para sesiones y BcryptJS para el hasheo de contraseñas.
- **Gestión de Archivos:** Multer para la subida y almacenamiento de imágenes.
- **Base de Datos:** Persistencia en archivos JSON (FileSystem) para cumplir con los requerimientos del módulo.

## 🚀 Instalación y Configuración

1. **Clonar el repositorio y entrar a la carpeta del backend:**
   ```bash
   cd backend
Instalar dependencias:

Bash

npm install
Configurar variables de entorno: Crea un archivo .env en la raíz de la carpeta /backend:

Fragmento de código

PORT=3000
JWT_SECRET=tu_clave_secreta_aqui
Iniciar en modo desarrollo:

Bash

npm run dev
🔑 Gestión de Roles (Admin vs User)
El sistema cuenta con una distinción clara de permisos:

Usuario: Puede registrarse, iniciar sesión, subir objetos y editar sus propias publicaciones.

Admin: Posee permisos exclusivos para aprobar o rechazar publicaciones (Endpoint PATCH /items/:id/status).

Instrucciones para la corrección: Para probar las funcionalidades de administrador, registre un usuario normalmente y luego modifique manualmente el archivo backend/data/users.json, cambiando el valor "role": "user" por "role": "admin" en su registro.

🛣️ API Endpoints
Usuarios
POST /users/register: Registro de nuevos usuarios (Case-insensitive).

POST /users/login: Inicio de sesión y entrega de Token JWT.

Objetos (Items)
GET /items: Lista todos los objetos (Público).

POST /items: Publicar un objeto (Requiere Token + Imagen).

PUT /items/:id: Editar datos de un objeto propio.

PATCH /items/:id/status: Moderación de estado (Solo Admin).

DELETE /items/:id: Eliminar una publicación.

📁 Estructura del Proyecto
/backend/src: Código fuente en TypeScript.

/backend/data: Almacenamiento de archivos JSON.

/public/uploads: Repositorio de imágenes subidas por los usuarios.