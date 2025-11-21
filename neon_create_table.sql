-- Tabla de historial clínico
CREATE TABLE historial_clinico (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    alergias TEXT
);
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    fecha_hora_ingreso TIMESTAMP NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rh VARCHAR(10) NOT NULL,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    causa_emergencia TEXT NOT NULL
);