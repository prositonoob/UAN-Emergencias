import React, { useState } from 'react';

interface PlanTratamiento {
  id: number;
  nombre: string;
  descripcion: string;
}

interface AsignarPlanProps {
  pacienteId: number;
  planes: PlanTratamiento[];
  onAsignar: (planId: number) => void;
}

const AsignarPlan: React.FC<AsignarPlanProps> = ({ pacienteId, planes, onAsignar }) => {
  const [planId, setPlanId] = useState<number>(planes[0]?.id || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (planId) onAsignar(planId);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <select value={planId} onChange={e => setPlanId(Number(e.target.value))} style={{ marginRight: 8 }}>
        {planes.map(plan => (
          <option key={plan.id} value={plan.id}>{plan.nombre}</option>
        ))}
      </select>
      <button type="submit">Asignar Plan</button>
    </form>
  );
};

export default AsignarPlan;
