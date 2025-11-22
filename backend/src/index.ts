
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

dotenv.config();

// ==========================================================
// 1. INICIALIZACIÓN Y CONFIGURACIÓN DEL SERVIDOR
// ==========================================================
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==========================================================
// CONFIGURACIÓN DE NODEMAILER PARA GMAIL
// ==========================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
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
  estado?: 'ingresado' | 'internado' | 'alta';
  email?: string;
}

// Función para generar el HTML del plan de tratamiento
function generarHtmlPlan(paciente: Paciente, plan: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .label { font-weight: bold; color: #667eea; margin-top: 10px; }
        .value { margin: 5px 0 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #888; font-size: 12px; }
        .plan-title { color: #764ba2; font-size: 20px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 Plan de Tratamiento</h1>
        <p>Sistema de Atención Médica de Pacientes (SAMP)</p>
      </div>
      <div class="content">
        <div class="info-box">
          <div class="plan-title">${plan.nombre}</div>
          <div class="label">Paciente:</div>
          <div class="value">${paciente.nombre} ${paciente.apellido}</div>
          
          <div class="label">Identificación:</div>
          <div class="value">${paciente.identificacion}</div>
          
          <div class="label">Descripción del Plan:</div>
          <div class="value">${plan.descripcion}</div>
          
          <div class="label">Fecha de Asignación:</div>
          <div class="value">${new Date(plan.fecha_asignacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</div>
        </div>
        
        <div class="info-box" style="background: #fff9e6; border-left: 4px solid #ffc107;">
          <strong>⚠️ Importante:</strong>
          <p>Este plan de tratamiento ha sido elaborado por su médico tratante. Por favor, siga las indicaciones cuidadosamente y consulte con el personal de salud ante cualquier duda.</p>
        </div>
      </div>
      <div class="footer">
        <p>Este correo fue generado automáticamente por el SAMP</p>
        <p>Por favor, no responda a este correo electrónico</p>
      </div>
    </body>
    </html>
  `;
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

// Enviar plan de tratamiento por correo
app.post('/pacientes/:id/planes/:planId/enviar-correo', async (req, res) => {
  const pacienteId = req.params.id;
  const planId = req.params.planId;

  try {
    // Obtener información del paciente
    const pacienteResult = await pool.query(
      'SELECT * FROM pacientes WHERE id = $1',
      [pacienteId]
    );

    if (pacienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const paciente = pacienteResult.rows[0];

    // Verificar que el paciente tenga email
    if (!paciente.email) {
      return res.status(400).json({ error: 'El paciente no tiene un correo electrónico registrado' });
    }

    // Obtener información del plan
    const planResult = await pool.query(
      `SELECT pt.id, pt.nombre, pt.descripcion, pp.fecha_asignacion
       FROM paciente_plan pp
       JOIN planes_tratamiento pt ON pp.plan_id = pt.id
       WHERE pp.paciente_id = $1 AND pt.id = $2`,
      [pacienteId, planId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan de tratamiento no encontrado o no está asignado a este paciente' });
    }

    const plan = planResult.rows[0];

    // Generar HTML del correo
    const htmlContent = generarHtmlPlan(paciente, plan);

    // Enviar email
    await transporter.sendMail({
      from: `"SAMP - Hospital" <${process.env.GMAIL_USER}>`,
      to: paciente.email,
      subject: `Plan de Tratamiento: ${plan.nombre}`,
      html: htmlContent
    });

    res.json({
      success: true,
      message: `Plan de tratamiento enviado exitosamente a ${paciente.email}`
    });

  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).json({ error: 'Error al enviar el correo electrónico' });
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
  const { fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, email }: Paciente = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pacientes (fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, email]
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
  const { fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, email }: Paciente = req.body;
  try {
    const result = await pool.query(
      'UPDATE pacientes SET fecha_hora_ingreso = $1, nombre = $2, apellido = $3, rh = $4, identificacion = $5, telefono = $6, causa_emergencia = $7, email = $8 WHERE id = $9 RETURNING *',
      [fecha_hora_ingreso, nombre, apellido, rh, identificacion, telefono, causa_emergencia, email, id]
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

// Actualizar estado del paciente (Internación/Alta)
app.patch('/pacientes/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['ingresado', 'internado', 'alta'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const result = await pool.query(
      'UPDATE pacientes SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado del paciente' });
  }
});

// ==========================================================
// 5. ENDPOINTS PARA HISTORIAL CLÍNICO
// ==========================================================

// Obtener historial clínico completo de un paciente
app.get('/pacientes/:id/historial', async (req, res) => {
  const pacienteId = req.params.id;
  try {
    // Obtener información del paciente
    const pacienteResult = await pool.query(
      'SELECT * FROM pacientes WHERE id = $1',
      [pacienteId]
    );

    if (pacienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const paciente = pacienteResult.rows[0];

    // Obtener entradas del historial ordenadas por fecha descendente
    const historialResult = await pool.query(
      'SELECT * FROM historial_clinico WHERE paciente_id = $1 ORDER BY fecha DESC',
      [pacienteId]
    );

    // Obtener planes de tratamiento activos
    const planesResult = await pool.query(
      `SELECT pt.id, pt.nombre, pt.descripcion, pp.fecha_asignacion
       FROM paciente_plan pp
       JOIN planes_tratamiento pt ON pp.plan_id = pt.id
       WHERE pp.paciente_id = $1
       ORDER BY pp.fecha_asignacion DESC`,
      [pacienteId]
    );

    // Construir respuesta completa
    const historialCompleto = {
      paciente: paciente,
      entradas: historialResult.rows,
      planes_activos: planesResult.rows,
      // Extraer alergias de la entrada más reciente o consolidar
      alergias: historialResult.rows.length > 0 && historialResult.rows[0].alergias
        ? historialResult.rows[0].alergias
        : 'No registradas'
    };

    res.json(historialCompleto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial clínico' });
  }
});

// Crear nueva entrada en el historial clínico
app.post('/pacientes/:id/historial', async (req, res) => {
  const pacienteId = req.params.id;
  const { notas, alergias } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO historial_clinico (paciente_id, notas, alergias) VALUES ($1, $2, $3) RETURNING *',
      [pacienteId, notas, alergias || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear entrada en historial clínico' });
  }
});

// ==========================================================
// 6. ENDPOINTS PARA MEDICAMENTOS
// ======================================== ==================

// Listar todas las categorías de medicamentos
app.get('/categorias-medicamentos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_medicamentos ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías de medicamentos' });
  }
});

// Crear nueva categoría
app.post('/categorias-medicamentos', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias_medicamentos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Listar medicamentos con filtros opcionales
app.get('/medicamentos', async (req, res) => {
  const { categoria, busqueda, stock_bajo } = req.query;

  try {
    let query = `
      SELECT m.*, c.nombre as categoria_nombre
      FROM medicamentos m
      LEFT JOIN categorias_medicamentos c ON m.categoria_id = c.id
      WHERE m.activo = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Filtro por categoría
    if (categoria) {
      query += ` AND m.categoria_id = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    // Búsqueda por nombre
    if (busqueda) {
      query += ` AND (m.nombre ILIKE $${paramCount} OR m.nombre_generico ILIKE $${paramCount})`;
      params.push(`%${busqueda}%`);
      paramCount++;
    }

    // Filtro de stock bajo
    if (stock_bajo === 'true') {
      query += ` AND m.stock_actual < m.stock_minimo`;
    }

    query += ` ORDER BY m.nombre`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener medicamentos' });
  }
});

// Obtener un medicamento específico
app.get('/medicamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, c.nombre as categoria_nombre
       FROM medicamentos m
       LEFT JOIN categorias_medicamentos c ON m.categoria_id = c.id
       WHERE m.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener medicamento' });
  }
});

// Crear nuevo medicamento
app.post('/medicamentos', async (req, res) => {
  const {
    nombre,
    nombre_generico,
    categoria_id,
    descripcion,
    presentacion,
    stock_actual,
    stock_minimo,
    precio_unitario,
    requiere_receta
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO medicamentos 
       (nombre, nombre_generico, categoria_id, descripcion, presentacion, 
        stock_actual, stock_minimo, precio_unitario, requiere_receta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [nombre, nombre_generico, categoria_id, descripcion, presentacion,
        stock_actual, stock_minimo, precio_unitario, requiere_receta]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear medicamento' });
  }
});

// Actualizar medicamento
app.put('/medicamentos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    nombre_generico,
    categoria_id,
    descripcion,
    presentacion,
    stock_actual,
    stock_minimo,
    precio_unitario,
    requiere_receta
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE medicamentos 
       SET nombre = $1, nombre_generico = $2, categoria_id = $3, descripcion = $4,
           presentacion = $5, stock_actual = $6, stock_minimo = $7,
           precio_unitario = $8, requiere_receta = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [nombre, nombre_generico, categoria_id, descripcion, presentacion,
        stock_actual, stock_minimo, precio_unitario, requiere_receta, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar medicamento' });
  }
});

// Eliminar medicamento (marcar como inactivo)
app.delete('/medicamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE medicamentos SET activo = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json({ message: 'Medicamento desactivado', medicamento: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar medicamento' });
  }
});

// Actualizar stock de medicamento
app.patch('/medicamentos/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { stock_actual } = req.body;

  try {
    const result = await pool.query(
      'UPDATE medicamentos SET stock_actual = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [stock_actual, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
});

// Obtener estadísticas de medicamentos
app.get('/medicamentos-estadisticas', async (req, res) => {
  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM medicamentos WHERE activo = true'
    );
    const stockBajoResult = await pool.query(
      'SELECT COUNT(*) as stock_bajo FROM medicamentos WHERE activo = true AND stock_actual < stock_minimo'
    );
    const categoriasResult = await pool.query(
      'SELECT COUNT(*) as categorias FROM categorias_medicamentos'
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      stock_bajo: parseInt(stockBajoResult.rows[0].stock_bajo),
      categorias: parseInt(categoriasResult.rows[0].categorias)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ==========================================================
// 7. INICIO DEL SERVIDOR
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});