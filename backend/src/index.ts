
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    res.status(500).json({ error: 'Error al buscar pacientes' });
  }
});

app.get('/', (req, res) => {
  res.send('API de Emergencias');
});

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

app.get('/pacientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

app.post('/pacientes', async (req, res) => {
  const { fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia }: Paciente = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pacientes (fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear paciente' });
  }
});

app.put('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia }: Paciente = req.body;
  try {
    const result = await pool.query(
      'UPDATE pacientes SET fecha_hora_ingreso = $1, nombre = $2, apellido = $3, rh = $4, identificacion = $5, telefono = $6, causa_emergencia = $7 WHERE id = $8 RETURNING *',
      [fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
});

app.delete('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
