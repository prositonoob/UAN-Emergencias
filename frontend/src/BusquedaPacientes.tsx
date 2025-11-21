import React, { useState } from 'react';


import axios from 'axios';

const BusquedaPacientes: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [pacienteExacto, setPacienteExacto] = useState<any|null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  const handleBuscar = async () => {
    setCargando(true);
    setError('');
    setResultados([]);
    setPacienteExacto(null);
    try {
      const response = await axios.get(`http://localhost:3000/pacientes/buscar`, {
        params: { q: busqueda }
      });
      const data = response.data;
      // Buscar coincidencia exacta
      const exacto = data.find((p: any) =>
        p.identificacion?.toLowerCase() === busqueda.toLowerCase() ||
        p.nombre?.toLowerCase() === busqueda.toLowerCase() ||
        p.apellido?.toLowerCase() === busqueda.toLowerCase()
      );
      if (exacto) {
        setPacienteExacto(exacto);
        setResultados([]);
      } else {
        setResultados(data);
        if (data.length === 0) {
          setError('No se encontraron pacientes.');
        }
      }
    } catch (err) {
      setError('Error al buscar pacientes.');
    }
    setCargando(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Búsqueda de Pacientes</h2>
      <input
        type="text"
        placeholder="Cédula o nombre"
        value={busqueda}
        onChange={handleInputChange}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button onClick={handleBuscar} style={{ width: '100%', padding: 8 }}>
        Buscar
      </button>
      {cargando && <p>Buscando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {pacienteExacto ? (
        <div style={{ marginTop: 16, border: '1px solid #007bff', borderRadius: 8, padding: 16, background: '#f4faff' }}>
          <h3>Ficha del Paciente</h3>
          <p><b>Nombre:</b> {pacienteExacto.nombre} {pacienteExacto.apellido}</p>
          <p><b>Cédula:</b> {pacienteExacto.identificacion}</p>
          <p><b>RH:</b> {pacienteExacto.rh}</p>
          <p><b>Teléfono:</b> {pacienteExacto.telefono}</p>
          <p><b>Ingreso:</b> {new Date(pacienteExacto.fecha_hora_ingreso).toLocaleString()}</p>
          <p><b>Causa:</b> {pacienteExacto.causa_emergencia}</p>
        </div>
      ) : (
        <ul>
          {resultados.map((paciente, idx) => (
            <li key={idx}>
              {paciente.nombre} {paciente.apellido} (Cédula: {paciente.identificacion})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BusquedaPacientes;
