-- ================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - HOSPITAL DE EMERGENCIAS
-- ================================================================

-- Primero eliminamos las tablas si existen (para recrearlas)
DROP TABLE IF EXISTS historial_clinico CASCADE;
DROP TABLE IF EXISTS paciente_plan CASCADE;
DROP TABLE IF EXISTS planes_tratamiento CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;

-- ================================================================
-- 1. TABLA DE PACIENTES
-- ================================================================
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    fecha_hora_ingreso TIMESTAMP NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rh VARCHAR(10) NOT NULL,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    causa_emergencia TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 2. TABLA DE PLANES DE TRATAMIENTO
-- ================================================================
CREATE TABLE planes_tratamiento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 3. TABLA DE RELACIÓN PACIENTE-PLAN (muchos a muchos)
-- ================================================================
CREATE TABLE paciente_plan (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES planes_tratamiento(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(paciente_id, plan_id)
);

-- ================================================================
-- 4. TABLA DE HISTORIAL CLÍNICO
-- ================================================================
CREATE TABLE historial_clinico (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT NOT NULL,
    alergias TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 5. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ================================================================
CREATE INDEX idx_pacientes_identificacion ON pacientes(identificacion);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre, apellido);
CREATE INDEX idx_historial_paciente_id ON historial_clinico(paciente_id);
CREATE INDEX idx_historial_fecha ON historial_clinico(fecha DESC);
CREATE INDEX idx_paciente_plan_paciente ON paciente_plan(paciente_id);
CREATE INDEX idx_paciente_plan_plan ON paciente_plan(plan_id);

-- ================================================================
-- 6. DATOS DE EJEMPLO (OPCIONAL)
-- ================================================================

-- Insertar planes de tratamiento de ejemplo
INSERT INTO planes_tratamiento (nombre, descripcion) VALUES
('Plan Básico', 'Reposo, hidratación y analgésicos según necesidad'),
('Plan Avanzado', 'Observación continua, exámenes de laboratorio y seguimiento médico'),
('Plan de Emergencia', 'Atención inmediata, estabilización y monitoreo constante'),
('Plan de Recuperación', 'Terapia física, medicación controlada y seguimiento semanal');

-- Insertar paciente de ejemplo
INSERT INTO pacientes (fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia) VALUES
('2025-01-20 14:30:00', 'Juan', 'Pérez', 'O+', '1234567890', '3001234567', 'Dolor abdominal agudo'),
('2025-01-21 09:15:00', 'María', 'González', 'A+', '0987654321', '3119876543', 'Fractura de muñeca'),
('2025-01-21 16:45:00', 'Carlos', 'Rodríguez', 'B-', '1122334455', '3201122334', 'Fiebre alta y tos');

-- Insertar historial clínico de ejemplo
INSERT INTO historial_clinico (paciente_id, notas, alergias) VALUES
(1, 'Paciente presenta dolor abdominal en cuadrante inferior derecho. Se realizaron exámenes de sangre.', 'Penicilina'),
(1, 'Resultados de laboratorio muestran valores normales. Se prescribe analgésico.', 'Penicilina'),
(2, 'Fractura simple de muñeca. Se coloca yeso y se receta analgésico.', 'No registradas'),
(3, 'Paciente con síntomas de gripe. Temperatura: 38.5°C. Se prescribe antipirético.', 'Polen');

-- Asignar planes a pacientes de ejemplo
INSERT INTO paciente_plan (paciente_id, plan_id) VALUES
(1, 2),  -- Juan tiene Plan Avanzado
(2, 1),  -- María tiene Plan Básico
(3, 4);  -- Carlos tiene Plan de Recuperación

-- ================================================================
-- 7. COMENTARIOS EN LAS TABLAS
-- ================================================================
COMMENT ON TABLE pacientes IS 'Almacena información de pacientes ingresados al hospital de emergencias';
COMMENT ON TABLE planes_tratamiento IS 'Catálogo de planes de tratamiento disponibles';
COMMENT ON TABLE paciente_plan IS 'Relación entre pacientes y sus planes de tratamiento asignados';
COMMENT ON TABLE historial_clinico IS 'Registro histórico de atención médica de cada paciente';

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
