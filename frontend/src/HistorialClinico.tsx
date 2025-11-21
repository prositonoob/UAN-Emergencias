import { useState, useEffect } from 'react';
import axios from 'axios';

interface Paciente {
    id: number;
    fecha_hora_ingreso: string;
    nombre: string;
    apellido: string;
    rh: string;
    identificacion: string;
    telefono: string;
    causa_emergencia: string;
}

interface EntradaHistorial {
    id: number;
    paciente_id: number;
    fecha: string;
    notas: string;
    alergias: string | null;
}

interface PlanActivo {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_asignacion: string;
}

interface HistorialCompleto {
    paciente: Paciente;
    entradas: EntradaHistorial[];
    planes_activos: PlanActivo[];
    alergias: string;
}

interface HistorialClinicoProps {
    pacienteId: number;
    modoInicial: 'ver' | 'agregar';
    onVolver: () => void;
}

function HistorialClinico({ pacienteId, modoInicial, onVolver }: HistorialClinicoProps) {
    const [historial, setHistorial] = useState<HistorialCompleto | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNuevaEntrada, setShowNuevaEntrada] = useState(modoInicial === 'agregar');
    const [nuevaNotas, setNuevaNotas] = useState('');
    const [nuevasAlergias, setNuevasAlergias] = useState('');

    useEffect(() => {
        cargarHistorial();
    }, [pacienteId]);

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/pacientes/${pacienteId}/historial`);
            setHistorial(response.data);
        } catch (error) {
            console.error('Error al cargar historial:', error);
            alert('Error al cargar el historial clínico');
        } finally {
            setLoading(false);
        }
    };

    const handleAgregarEntrada = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:3000/pacientes/${pacienteId}/historial`, {
                notas: nuevaNotas,
                alergias: nuevasAlergias || null
            });
            alert('Entrada agregada exitosamente');
            setNuevaNotas('');
            setNuevasAlergias('');
            setShowNuevaEntrada(false);
            cargarHistorial();
        } catch (error) {
            console.error('Error al agregar entrada:', error);
            alert('Error al agregar entrada al historial');
        }
    };

    if (loading) {
        return (
            <div className="historial-container">
                <div className="loading">Cargando historial clínico...</div>
            </div>
        );
    }

    if (!historial) {
        return (
            <div className="historial-container">
                <div className="error">No se pudo cargar el historial clínico</div>
                <button onClick={onVolver} className="volver-button">Volver</button>
            </div>
        );
    }

    return (
        <div className="historial-container">
            <div className="historial-header">
                <button onClick={onVolver} className="volver-button">← Volver al Dashboard</button>
                <h1>Historial Clínico</h1>
            </div>

            {/* Información del Paciente */}
            <div className="paciente-info-card">
                <h2>{historial.paciente.nombre} {historial.paciente.apellido}</h2>
                <div className="paciente-detalles">
                    <div className="detalle-item">
                        <strong>Identificación:</strong> {historial.paciente.identificacion}
                    </div>
                    <div className="detalle-item">
                        <strong>RH:</strong> {historial.paciente.rh}
                    </div>
                    <div className="detalle-item">
                        <strong>Teléfono:</strong> {historial.paciente.telefono}
                    </div>
                    <div className="detalle-item">
                        <strong>Fecha de Ingreso:</strong> {new Date(historial.paciente.fecha_hora_ingreso).toLocaleString()}
                    </div>
                    <div className="detalle-item">
                        <strong>Causa de Emergencia:</strong> {historial.paciente.causa_emergencia}
                    </div>
                </div>
            </div>

            {/* Sección de Alergias */}
            <div className="alergias-card">
                <h3>⚠️ Alergias</h3>
                <p className="alergias-texto">{historial.alergias}</p>
            </div>

            {/* Planes de Tratamiento Activos */}
            <div className="planes-activos-section">
                <h3>📋 Planes de Tratamiento Activos</h3>
                {historial.planes_activos.length > 0 ? (
                    <div className="planes-grid">
                        {historial.planes_activos.map((plan) => (
                            <div key={plan.id} className="plan-card">
                                <h4>{plan.nombre}</h4>
                                <p>{plan.descripcion}</p>
                                <small>Asignado: {new Date(plan.fecha_asignacion).toLocaleDateString()}</small>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No hay planes de tratamiento asignados</p>
                )}
            </div>

            {/* Botón para agregar nueva entrada */}
            <div className="nueva-entrada-section">
                <button
                    onClick={() => setShowNuevaEntrada(!showNuevaEntrada)}
                    className="agregar-entrada-button"
                >
                    {showNuevaEntrada ? 'Cancelar' : '+ Agregar Nueva Entrada'}
                </button>

                {showNuevaEntrada && (
                    <form onSubmit={handleAgregarEntrada} className="nueva-entrada-form">
                        <h4>Nueva Entrada al Historial</h4>
                        <textarea
                            placeholder="Notas médicas..."
                            value={nuevaNotas}
                            onChange={(e) => setNuevaNotas(e.target.value)}
                            className="form-textarea"
                            required
                            rows={4}
                        />
                        <input
                            type="text"
                            placeholder="Alergias (opcional)"
                            value={nuevasAlergias}
                            onChange={(e) => setNuevasAlergias(e.target.value)}
                            className="form-input"
                        />
                        <button type="submit" className="submit-button">Guardar Entrada</button>
                    </form>
                )}
            </div>

            {/* Historial de Entradas */}
            <div className="entradas-section">
                <h3>📝 Historial de Entradas</h3>
                {historial.entradas.length > 0 ? (
                    <div className="entradas-timeline">
                        {historial.entradas.map((entrada) => (
                            <div key={entrada.id} className="entrada-card">
                                <div className="entrada-fecha">
                                    {new Date(entrada.fecha).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                <div className="entrada-contenido">
                                    <p className="entrada-notas">{entrada.notas}</p>
                                    {entrada.alergias && (
                                        <div className="entrada-alergias">
                                            <strong>Alergias registradas:</strong> {entrada.alergias}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No hay entradas en el historial clínico</p>
                )}
            </div>
        </div>
    );
}

export default HistorialClinico;
