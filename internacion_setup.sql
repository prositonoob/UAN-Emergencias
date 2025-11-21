-- Agregar columna estado a la tabla pacientes si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'estado') THEN
        ALTER TABLE pacientes ADD COLUMN estado VARCHAR(20) DEFAULT 'ingresado';
        -- Actualizar registros existentes
        UPDATE pacientes SET estado = 'ingresado' WHERE estado IS NULL;
    END IF;
END $$;
