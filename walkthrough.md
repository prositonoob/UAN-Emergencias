# Walkthrough - Gestión de Internación y Altas

Se ha implementado la funcionalidad para marcar pacientes como "Internados" o darles de "Alta".

## Cambios Realizados

### Base de Datos
- Se agregó la columna `estado` a la tabla `pacientes`.
- Valores permitidos: `ingresado`, `internado`, `alta`.

### Backend
- Se actualizó el archivo `index.ts` (reconstrucción completa para corregir errores previos).
- Se agregó el endpoint `PATCH /pacientes/:id/estado` para cambiar el estado.
- Se actualizó la interfaz `Paciente` para incluir el campo `estado`.

### Frontend
- **App.tsx**:
  - Se actualizó la interfaz `Paciente`.
  - Se agregaron badges visuales para mostrar el estado actual (`📥 INGRESADO`, `🏥 INTERNADO`, `🏠 DE ALTA`).
  - Se agregaron botones de acción rápida:
    - **Internar**: Visible si el paciente está ingresado.
    - **Dar de Alta**: Visible si el paciente está ingresado o internado.
  - Se implementó la función `handleCambiarEstado` con notificaciones al usuario.
- **App.css**:
  - Se agregaron estilos para los badges (colores distintivos y animación de pulso para internados).
  - Se estilizaron los botones de acción.

## Verificación

### Pasos para verificar manualmente
1. **Reiniciar el Backend**: Es necesario reiniciar el servidor backend (`npm run dev` en la carpeta backend) para que tome los cambios del archivo reconstruido.
2. **Acceder al Dashboard**: Ir a `http://localhost:5173`.
3. **Observar Estado Inicial**: Los pacientes existentes aparecerán como "INGRESADO".
4. **Probar Internación**:
   - Buscar un paciente.
   - Hacer clic en el botón rojo "🏥 Internar".
   - Verificar que el badge cambie a "INTERNADO" (rojo parpadeante) y aparezca una alerta de confirmación.
5. **Probar Alta**:
   - Hacer clic en el botón verde "🏠 Dar de Alta".
   - Verificar que el badge cambie a "DE ALTA" (verde).
