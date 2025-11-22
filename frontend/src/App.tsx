

import { useState } from 'react';
import axios from 'axios';
import './App.css';
import BusquedaPacientes from './BusquedaPacientes';
import PlanTratamientoForm from './PlanTratamientoForm';
import AsignarPlan from './AsignarPlan';
import HistorialClinico from './HistorialClinico';
import GestionMedicamentos from './GestionMedicamentos';

interface Paciente {
  id?: number;
  fecha_hora_ingreso: string;
  nombre: string;
  apellido: string;
  rh: string;
  identificacion: string;
  telefono: string;
  causa_emergencia: string;
  estado?: 'ingresado' | 'internado' | 'alta';
  email?: string;
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [formData, setFormData] = useState<Paciente>({
    fecha_hora_ingreso: '',
    nombre: '',
    apellido: '',
    rh: '',
    identificacion: '',
    telefono: '',
    causa_emergencia: '',
    email: ''
  });
  // Simulación de planes de tratamiento y asignaciones (en un sistema real, esto vendría del backend)
  const [planes, setPlanes] = useState<{ id: number; nombre: string; descripcion: string }[]>([
    { id: 1, nombre: 'Plan Básico', descripcion: 'Reposo y analgésicos.' },
    { id: 2, nombre: 'Plan Avanzado', descripcion: 'Observación y exámenes de laboratorio.' }
  ]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlocked, setLoginBlocked] = useState(false);
  const [asignaciones, setAsignaciones] = useState<{ [pacienteId: number]: number[] }>({});
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<number | null>(null);
  const [modoHistorial, setModoHistorial] = useState<'ver' | 'agregar' | null>(null);
  const [showMedicamentos, setShowMedicamentos] = useState(false);

  const handleLogin = () => {
    if (loginBlocked) return;
    if (username === import.meta.env.VITE_ADMIN_USER && password === import.meta.env.VITE_ADMIN_PASS) {
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginAttempts(0);
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        setLoginBlocked(true);
        alert('Demasiados intentos fallidos. El acceso ha sido bloqueado hasta recargar la página.');
      } else {
        alert(`Credenciales incorrectas. Intento ${attempts} de 5.`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaciente) {
        await axios.put(`http://localhost:3000/pacientes/${editingPaciente.id}`, formData);
        alert('Paciente actualizado exitosamente');
      } else {
        await axios.post('http://localhost:3000/pacientes', formData);
        alert('Paciente registrado exitosamente');
      }
      setFormData({
        fecha_hora_ingreso: '',
        nombre: '',
        apellido: '',
        rh: '',
        identificacion: '',
        telefono: '',
        causa_emergencia: '',
        email: ''
      });
      setShowForm(false);
      setEditingPaciente(null);
      cargarPacientes();
    } catch (error) {
      alert(editingPaciente ? 'Error al actualizar paciente' : 'Error al registrar paciente');
    }
  };

  const handleCambiarEstado = async (pacienteId: number, nuevoEstado: string, nombrePaciente: string) => {
    try {
      const response = await axios.patch(`http://localhost:3000/pacientes/${pacienteId}/estado`, {
        estado: nuevoEstado
      });

      if (response.status === 200) {
        // Actualizar lista local
        setPacientes(prev => prev.map(p =>
          p.id === pacienteId ? { ...p, estado: nuevoEstado as any } : p
        ));

        const mensaje = nuevoEstado === 'internado'
          ? `Paciente ${nombrePaciente} ha sido INTERNADO. Se ha notificado al personal de planta.`
          : `Paciente ${nombrePaciente} ha sido dado de ALTA. Se ha generado la orden de salida.`;

        alert(mensaje);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al actualizar el estado del paciente.');
    }
  };

  const cargarPacientes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/pacientes');
      setPacientes(response.data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const handleEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setFormData(paciente);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      try {
        await axios.delete(`http://localhost:3000/pacientes/${id}`);
        alert('Paciente eliminado exitosamente');
        cargarPacientes();
      } catch (error) {
        alert('Error al eliminar paciente');
      }
    }
  };

  const handleEnviarCorreo = async (pacienteId: number, planId: number, pacienteEmail: string | undefined) => {
    if (!pacienteEmail) {
      alert('Este paciente no tiene un correo electrónico registrado. Por favor, actualiza su información primero.');
      return;
    }

    if (!window.confirm(`¿Enviar plan de tratamiento a ${pacienteEmail}?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/pacientes/${pacienteId}/planes/${planId}/enviar-correo`
      );

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Error al enviar correo:', error);
      const mensajeError = error.response?.data?.error || 'Error al enviar el correo electrónico';
      alert(`❌ ${mensajeError}`);
    }
  };

  if (isLoggedIn) {
    // Mostrar gestión de medicamentos si está activo
    if (showMedicamentos) {
      return (
        <GestionMedicamentos
          onVolver={() => setShowMedicamentos(false)}
        />
      );
    }

    // Mostrar historial clínico si está activo
    if (showHistorial && pacienteSeleccionado) {
      return (
        <HistorialClinico
          pacienteId={pacienteSeleccionado}
          modoInicial={modoHistorial || 'ver'}
          onVolver={() => {
            setShowHistorial(false);
            setPacienteSeleccionado(null);
            setModoHistorial(null);
          }}
        />
      );
    }

    if (showForm) {
      return (
        <div className="form-container">
          <div className="form-box">
            <h2>{editingPaciente ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="datetime-local"
                name="fecha_hora_ingreso"
                value={formData.fecha_hora_ingreso}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input
                type="text"
                name="rh"
                placeholder="RH"
                value={formData.rh}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input
                type="text"
                name="identificacion"
                placeholder="Identificación"
                value={formData.identificacion}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
              <textarea
                name="causa_emergencia"
                placeholder="Causa de la emergencia"
                value={formData.causa_emergencia}
                onChange={handleInputChange}
                className="form-textarea"
                required
              />
              <div className="form-buttons">
                <button type="submit" className="submit-button">{editingPaciente ? 'Actualizar' : 'Registrar'}</button>
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingPaciente(null);
                  setFormData({
                    fecha_hora_ingreso: '',
                    nombre: '',
                    apellido: '',
                    rh: '',
                    identificacion: '',
                    telefono: '',
                    causa_emergencia: ''
                  });
                }} className="cancel-button">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <img
            src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.aprendemas.com%2Fmx%2Fblog%2Forientacion-academica%2Fcarrera-de-medicina-todo-lo-que-necesitas-saber-para-convertirte-en-medico-88262&psig=AOvVaw092oo73Xi3nG1i0y5iLhra&ust=1763270161322000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCJj7mK2z85ADFQAAAAAdAAAAABAE"
            alt="Medical Emergency"
            className="header-image"
          />
          <h1>Hospital de Emergencias - Panel Administrativo</h1>
          <button onClick={() => setIsLoggedIn(false)} className="logout-button">Cerrar Sesión</button>
        </header>

        <main className="dashboard-main">
          <button onClick={() => setShowForm(true)} className="register-button">
            Registrar Nuevo Paciente
          </button>
          <button onClick={cargarPacientes} className="refresh-button">
            Actualizar Lista
          </button>
          <button onClick={() => setShowPlanForm(true)} className="register-button">
            Crear Plan de Tratamiento
          </button>
          <button onClick={() => setShowMedicamentos(true)} className="medicamentos-button">
            💊 Gestionar Medicamentos
          </button>

          {/* Formulario para crear/editar planes de tratamiento */}
          {showPlanForm && (
            <PlanTratamientoForm
              onSubmit={async plan => {
                try {
                  const response = await fetch('http://localhost:3000/planes', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(plan),
                  });
                  if (!response.ok) {
                    throw new Error('Error al crear el plan');
                  }
                  const nuevoPlan = await response.json();
                  setPlanes(prev => [...prev, nuevoPlan]);
                  setShowPlanForm(false);
                } catch (error) {
                  alert('No se pudo crear el plan de tratamiento.');
                  console.error(error);
                }
              }}
            />
          )}

          {/* Componente de búsqueda de pacientes */}
          <BusquedaPacientes />

          {/* Modal para opciones de historial clínico */}
          {showHistorialModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h2>📋 Historial Clínico</h2>
                <p>¿Qué desea hacer con el historial del paciente?</p>
                <div className="modal-buttons">
                  <button
                    onClick={() => {
                      setModoHistorial('ver');
                      setShowHistorialModal(false);
                      setShowHistorial(true);
                    }}
                    className="modal-primary-button"
                  >
                    👁️ Ver Historial Completo
                  </button>
                  <button
                    onClick={() => {
                      setModoHistorial('agregar');
                      setShowHistorialModal(false);
                      setShowHistorial(true);
                    }}
                    className="modal-secondary-button"
                  >
                    ➕ Agregar Nueva Entrada
                  </button>
                  <button
                    onClick={() => {
                      setShowHistorialModal(false);
                      setPacienteSeleccionado(null);
                    }}
                    className="modal-cancel-button"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pacientes-list">
            <h2>Pacientes Registrados</h2>
            {pacientes.map((paciente) => (
              <div key={paciente.id} className="paciente-card">
                <h3>{paciente.nombre} {paciente.apellido}</h3>
                <p><strong>ID:</strong> {paciente.identificacion}</p>
                <p><strong>RH:</strong> {paciente.rh}</p>
                <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                <p><strong>Ingreso:</strong> {new Date(paciente.fecha_hora_ingreso).toLocaleString()}</p>
                <p><strong>Causa:</strong> {paciente.causa_emergencia}</p>
                <div className={`estado-badge estado-${paciente.estado || 'ingresado'}`}>
                  {paciente.estado === 'internado' ? '🏥 INTERNADO' :
                    paciente.estado === 'alta' ? '🏠 DE ALTA' : '📥 INGRESADO'}
                </div>

                <div className="estado-actions">
                  {(paciente.estado === undefined || paciente.estado === 'ingresado') && (
                    <button
                      className="btn-internar"
                      onClick={() => handleCambiarEstado(paciente.id!, 'internado', paciente.nombre)}
                    >
                      🏥 Internar
                    </button>
                  )}

                  {(paciente.estado === 'ingresado' || paciente.estado === 'internado') && (
                    <button
                      className="btn-alta"
                      onClick={() => handleCambiarEstado(paciente.id!, 'alta', paciente.nombre)}
                    >
                      🏠 Dar de Alta
                    </button>
                  )}
                </div>

                {/* Botón para asignar plan */}
                <AsignarPlan
                  pacienteId={paciente.id!}
                  planes={planes}
                  onAsignar={async (planId) => {
                    try {
                      // Guardar en la base de datos
                      await axios.post(`http://localhost:3000/pacientes/${paciente.id}/asignar-plan`, {
                        plan_id: planId
                      });

                      // Actualizar estado local
                      setAsignaciones(prev => ({
                        ...prev,
                        [paciente.id!]: [...(prev[paciente.id!] || []), planId]
                      }));

                      alert('✅ Plan asignado exitosamente al paciente');
                    } catch (error) {
                      console.error('Error al asignar plan:', error);
                      alert('❌ Error al asignar plan al paciente');
                    }
                  }}
                />
                {/* Mostrar lista de planes asignados */}
                <div style={{ marginTop: 8 }}>
                  <strong>Planes asignados:</strong>
                  <ul>
                    {(asignaciones[paciente.id!] || []).map(pid => {
                      const plan = planes.find(p => p.id === pid);
                      return plan ? (
                        <li key={pid} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span><b>{plan.nombre}</b>: {plan.descripcion}</span>
                          <button
                            onClick={() => handleEnviarCorreo(paciente.id!, plan.id, paciente.email)}
                            className="email-button"
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={paciente.email ? `Enviar a ${paciente.email}` : 'No hay email registrado'}
                          >
                            📧 Enviar
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
                <div className="paciente-actions">
                  <button
                    onClick={() => {
                      setPacienteSeleccionado(paciente.id!);
                      setShowHistorialModal(true);
                    }}
                    className="historial-button"
                  >
                    Ver Historial
                  </button>
                  <button onClick={() => handleEdit(paciente)} className="edit-button">Editar</button>
                  <button onClick={() => handleDelete(paciente.id!)} className="delete-button">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </main >
      </div >
    );
  }

  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Acceso Administrativo</h2>
          <h3>Personal de Enfermería</h3>
          <div className="login-form">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button onClick={handleLogin} className="login-button" disabled={loginBlocked}>
              {loginBlocked ? 'Bloqueado' : 'Ingresar'}
            </button>
            {loginBlocked && (
              <div style={{ color: 'red', marginTop: 10 }}>
                Acceso bloqueado por demasiados intentos fallidos.<br />Recarga la página para intentarlo de nuevo.
              </div>
            )}
            <button onClick={() => setShowLogin(false)} className="cancel-button">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <img
            src="https://www.uhipocrates.edu.mx/wp-content/uploads/2022/07/estudia-el-arte-de-la-medicina.jpg"
            alt="Hospital Front"
            className="hospital-header-image"
          />
          <div className="header-text">
            <h1>Hospital de Emergencias UAN</h1>
            <p>Profesionales comprometidos con la salud de nuestra comunidad</p>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <img
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
              alt="Emergency Medical Team"
              className="hero-image"
            />
            <div className="hero-text">
              <h2>Atención de Emergencias 24/7</h2>
              <p>Nuestro equipo médico especializado está disponible las 24 horas para brindar la mejor atención en situaciones de emergencia. Con tecnología de vanguardia y personal altamente capacitado, garantizamos atención médica de calidad cuando más la necesitas.</p>
            </div>
          </div>
        </section>

        <section className="services-section">
          <h2>Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Emergency Care"
                className="service-image"
              />
              <h3>Atención de Emergencias</h3>
              <p>Servicio de urgencias disponible las 24 horas con médicos especialistas en emergencias médicas.</p>
            </div>

            <div className="service-card">
              <img
                src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Medical Equipment"
                className="service-image"
              />
              <h3>Diagnóstico Avanzado</h3>
              <p>Tecnología de última generación para diagnósticos precisos y tratamientos efectivos.</p>
            </div>

            <div className="service-card">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Medical Team"
                className="service-image"
              />
              <h3>Equipo Especializado</h3>
              <p>Médicos, enfermeras y personal técnico altamente capacitado y comprometido con la excelencia.</p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>24/7</h3>
              <p>Atención Continua</p>
            </div>
            <div className="stat-card">
              <h3>100+</h3>
              <p>Médicos Especialistas</p>
            </div>
            <div className="stat-card">
              <h3>50,000+</h3>
              <p>Pacientes Atendidos</p>
            </div>
            <div className="stat-card">
              <h3>15+</h3>
              <p>Años de Experiencia</p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Contáctanos</h2>
              <div className="contact-item">
                <strong>📍 Dirección:</strong>
                <p>Calle 123 #45-67, Ciudad, País</p>
              </div>
              <div className="contact-item">
                <strong>📞 Teléfono:</strong>
                <p>+57 123 456 7890</p>
              </div>
              <div className="contact-item">
                <strong>🚨 Emergencias:</strong>
                <p>Línea Directa: 123</p>
              </div>
              <div className="contact-item">
                <strong>✉️ Email:</strong>
                <p>info@hospitaluan.edu.co</p>
              </div>
            </div>
            <div className="contact-image">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Hospital Building"
              />
            </div>
          </div>
        </section>

        <section className="admin-access-section">
          <div className="admin-access-content">
            <h2>Acceso Administrativo</h2>
            <p>Para personal de enfermería y médicos autorizados</p>
            <button onClick={() => setShowLogin(true)} className="admin-access-button">
              Ingresar al Sistema
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 Hospital de Emergencias UAN. Todos los derechos reservados.</p>
        <p>Comprometidos con la salud y bienestar de nuestra comunidad.</p>
      </footer>
    </div>
  );
}

export default App;
