import React, { useState } from 'react';

interface PlanTratamientoFormProps {
  onSubmit: (plan: { nombre: string; descripcion: string }) => void;
  initialData?: { nombre: string; descripcion: string };
}

const PlanTratamientoForm: React.FC<PlanTratamientoFormProps> = ({ onSubmit, initialData }) => {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, descripcion });
    setNombre('');
    setDescripcion('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '1rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>{initialData ? 'Editar' : 'Crear'} Plan de Tratamiento</h3>
      <input
        type="text"
        placeholder="Nombre del plan"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button type="submit" style={{ width: '100%', padding: 8 }}>
        {initialData ? 'Guardar Cambios' : 'Crear Plan'}
      </button>
    </form>
  );
};

export default PlanTratamientoForm;
