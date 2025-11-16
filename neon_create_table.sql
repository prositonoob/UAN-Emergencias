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