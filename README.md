# 🏥 UAN-Emergencias

**UAN-Emergencias** es una aplicación web integral diseñada para la gestión eficiente de emergencias hospitalarias. Permite administrar pacientes, controlar el inventario de medicamentos, gestionar historiales clínicos y enviar planes de tratamiento por correo electrónico.

El proyecto está dividido en dos partes principales:
- **Backend**: API RESTful construida con Node.js, Express y TypeScript.
- **Frontend**: Interfaz de usuario moderna y reactiva construida con React, Vite y TypeScript.

---

## ✨ Características Principales

- **Gestión de Pacientes**:
  - Registro de nuevos pacientes.
  - Actualización de estado (Ingresado, Internado, Alta).
  - Edición de información personal.
- **Gestión de Medicamentos**:
  - Control de inventario.
  - Asignación de medicamentos a pacientes.
- **Historial Clínico**:
  - Visualización detallada de antecedentes y evoluciones.
  - Registro de alergias y notas médicas.
- **Planes de Tratamiento**:
  - Creación y gestión de planes personalizados.
  - **Envío por Correo**: Funcionalidad para enviar planes de tratamiento directamente al correo del paciente.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React**: Biblioteca para construir interfaces de usuario.
- **Vite**: Entorno de desarrollo rápido.
- **TypeScript**: Superset de JavaScript con tipado estático.
- **Axios**: Cliente HTTP para consumir la API.
- **CSS Modules / Vanilla CSS**: Estilos personalizados.

### Backend
- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework web para Node.js.
- **TypeScript**: Para un código más robusto y mantenible.
- **PostgreSQL**: Base de datos relacional.
- **Nodemailer**: Módulo para el envío de correos electrónicos.

---

## 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente antes de comenzar:
- [Node.js](https://nodejs.org/) (v16 o superior)
- [PostgreSQL](https://www.postgresql.org/)
- Un gestor de paquetes como `npm` (incluido con Node.js).

---

## 🚀 Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto localmente.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd UAN-Emergencias
```

### 2. Configuración del Backend

Navega al directorio del backend e instala las dependencias:

```bash
cd backend
npm install
```

#### Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `backend` y configura las siguientes variables (ajusta los valores según tu entorno):

```env
# Configuración de la Base de Datos
DB_USER=tu_usuario_postgres
DB_HOST=localhost
DB_NAME=uan_emergencias_db
DB_PASSWORD=tu_contraseña_postgres
DB_PORT=5432

# Configuración del Servidor
PORT=3000

# Configuración de Correo (Gmail SMTP)
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicación
```

> **Nota**: Para `GMAIL_APP_PASSWORD`, debes generar una "Contraseña de aplicación" desde la configuración de seguridad de tu cuenta de Google.

#### Ejecutar el Backend

Para desarrollo:
```bash
npm run dev
```
El servidor iniciará en `http://localhost:3000`.

### 3. Configuración del Frontend

Abre una nueva terminal, navega al directorio del frontend e instala las dependencias:

```bash
cd frontend
npm install
```

#### Ejecutar el Frontend

Para desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 💡 Uso

1.  Asegúrate de que tanto el backend como el frontend estén ejecutándose.
2.  Abre tu navegador y ve a `http://localhost:5173`.
3.  Navega por las diferentes secciones para gestionar pacientes, medicamentos y ver historiales.

---

## 🐛 Solución de Problemas Comunes

### Permisos en Linux
Si encuentras errores de permisos (`Permission denied`) al ejecutar scripts:

```bash
chmod +x node_modules/.bin/vite
chmod +x node_modules/.bin/ts-node
```
O intenta reinstalar las dependencias:
```bash
rm -rf node_modules
npm install
```

---

Hecho con ❤️ por el equipo de UAN-Emergencias.
