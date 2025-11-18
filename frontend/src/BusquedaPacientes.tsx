import React, { useState } from 'react';


import axios from 'axios';

const BusquedaPacientes: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
  };

  const handleBuscar = async () => {
    setCargando(true);
    setError('');
    setResultados([]);
    try {
      // Cambia la URL según tu endpoint real
      const response = await axios.get(`http://localhost:3000/pacientes/buscar`, {
        params: { q: busqueda }
      });
      setResultados(response.data);
      if (response.data.length === 0) {
        setError('No se encontraron pacientes.');
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
      <ul>
        {resultados.map((paciente, idx) => (
          <li key={idx}>
            {paciente.nombre} {paciente.apellido} (Cédula: {paciente.identificacion})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusquedaPacientes;
