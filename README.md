# UAN-Emergencias

Este proyecto contiene el **backend** en Node/TypeScript y el **frontend** en React con Vite.

## 🚀 Puesta en marcha

A continuación encontrarás las instrucciones para ejecutar el proyecto tanto en Windows como en Linux.

---

## 📌 **Backend (Node + TypeScript)**

### **1. Instalar dependencias**

```bash
cd backend
npm install
```

### **2. Importante en Linux — ⚠ Permisos de ejecución**

Si estás en Linux y aparece el error:

```
sh: ts-node: Permission denied
```

Ejecuta:

```bash
chmod +x node_modules/.bin/ts-node
```

O si sigue fallando:

```bash
rm -rf node_modules
npm install
```

### **3. Ejecutar el backend**

```bash
npm run dev
```

Esto iniciará el servidor en: **[http://localhost:3000](http://localhost:3000)**

---

## 🎨 **Frontend (React + Vite)**

### **1. Instalar dependencias**

```bash
cd frontend
npm install
```

### **2. Importante en Linux — ⚠ Permisos de ejecución**

Si aparece el error:

```
sh: vite: Permission denied
```

Ejecuta:

```bash
chmod +x node_modules/.bin/vite
```

O, si persiste:

```bash
rm -rf node_modules
npm install
```

### **3. Ejecutar el frontend**

```bash
npm run dev
```

La aplicación estará disponible normalmente en: **[http://localhost:5173](http://localhost:5173)**

---
