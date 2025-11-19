import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// ==========================================================
// 1. INICIALIZACIÓN Y CONFIGURACIÓN DEL SERVIDOR
// (Se mueve a la parte superior para que 'app' esté disponible)
// ==========================================================
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Definición de la interfaz para el tipado de datos del paciente
interface Paciente {
  id?: number;
  fecha_hora_ingreso: string;
  nombre: string;
  apellido: string;
  rh: string;
  identificacion: string;
  telefono?: string;
  causa_emergencia: string;
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Emergencias');
});

// ==========================================================
// 2. ENDPOINTS PARA PLANES DE TRATAMIENTO
// ==========================================================

// Crear un plan de tratamiento
app.post('/planes', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO planes_tratamiento (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear plan de tratamiento' });
  }
});

// Listar todos los planes de tratamiento
app.get('/planes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM planes_tratamiento');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener planes de tratamiento' });
  }
});

// ==========================================================
// 3. ENDPOINTS PARA ASIGNAR PLANES A PACIENTES
// ==========================================================

// Asignar un plan a un paciente
app.post('/pacientes/:id/asignar-plan', async (req, res) => {
  const pacienteId = req.params.id;
  const { plan_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO paciente_plan (paciente_id, plan_id) VALUES ($1, $2) RETURNING *',
      [pacienteId, plan_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar plan al paciente' });
  }
});

// Listar los planes asignados a un paciente
app.get('/pacientes/:id/planes', async (req, res) => {
  const pacienteId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT pt.id, pt.nombre, pt.descripcion, pp.fecha_asignacion
       FROM paciente_plan pp
       JOIN planes_tratamiento pt ON pp.plan_id = pt.id
       WHERE pp.paciente_id = $1`,
      [pacienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener planes del paciente' });
  }
});

// ==========================================================
// 4. ENDPOINTS PARA PACIENTES
// ==========================================================

// Listar todos los pacientes
app.get('/pacientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// Crear un nuevo paciente
app.post('/pacientes', async (req, res) => {
  const { fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia }: Paciente = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pacientes (fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
});

// Actualizar un paciente por ID
app.put('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia }: Paciente = req.body;
  try {
    const result = await pool.query(
      'UPDATE pacientes SET fecha_hora_ingreso = $1, nombre = $2, apellido = $3, rh = $4, identificacion = $5, telefono = $6, causa_emergencia = $7 WHERE id = $8 RETURNING *',
      [fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, id]
    );
    // Verifica si se encontró y actualizó el paciente
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
});

// Eliminar un paciente por ID
app.delete('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
    // Verifica si se eliminó alguna fila
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
});

// Buscar pacientes por cédula o nombre
app.get('/pacientes/buscar', async (req, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q) {
    return res.status(400).json({ error: 'Debe proporcionar un parámetro de búsqueda (q)' });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM pacientes WHERE identificacion ILIKE $1 OR nombre ILIKE $1 OR apellido ILIKE $1`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar pacientes' });
  }
});

// ==========================================================
// 5. INICIO DEL SERVIDOR
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});