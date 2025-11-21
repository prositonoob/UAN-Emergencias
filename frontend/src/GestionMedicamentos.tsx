import { useState, useEffect } from 'react';
import axios from 'axios';

interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Medicamento {
    id: number;
    nombre: string;
    nombre_generico: string;
    categoria_id: number;
    categoria_nombre: string;
    descripcion: string;
    presentacion: string;
    stock_actual: number;
    stock_minimo: number;
    precio_unitario: number;
    requiere_receta: boolean;
}

interface Estadisticas {
    total: number;
    stock_bajo: number;
    categorias: number;
}

interface GestionMedicamentosProps {
    onVolver: () => void;
}

function GestionMedicamentos({ onVolver }: GestionMedicamentosProps) {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas>({ total: 0, stock_bajo: 0, categorias: 0 });
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [stockBajoFiltro, setStockBajoFiltro] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState<Medicamento | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        nombre_generico: '',
        categoria_id: '',
        descripcion: '',
        presentacion: '',
        stock_actual: 0,
        stock_minimo: 10,
        precio_unitario: 0,
        requiere_receta: false
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        cargarMedicamentos();
    }, [busqueda, categoriaFiltro, stockBajoFiltro]);

    const cargarDatos = async () => {
        try {
            const [categoriasRes, estadisticasRes] = await Promise.all([
                axios.get('http://localhost:3000/categorias-medicamentos'),
                axios.get('http://localhost:3000/medicamentos-estadisticas')
            ]);
            setCategorias(categoriasRes.data);
            setEstadisticas(estadisticasRes.data);
            await cargarMedicamentos();
            setLoading(false); // Mover aquí para asegurar que se ejecute
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setLoading(false); // Asegurar que deje de cargar incluso con error
            alert('Error al cargar datos. Verifique que el backend esté corriendo en puerto 3000.');
        }
    };

    const cargarMedicamentos = async () => {
        try {
            const params: any = {};
            if (busqueda) params.busqueda = busqueda;
            if (categoriaFiltro) params.categoria = categoriaFiltro;
            if (stockBajoFiltro) params.stock_bajo = 'true';

            const response = await axios.get('http://localhost:3000/medicamentos', { params });
            setMedicamentos(response.data);
        } catch (error) {
            console.error('Error al cargar medicamentos:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editando) {
                await axios.put(`http://localhost:3000/medicamentos/${editando.id}`, formData);
                alert('Medicamento actualizado exitosamente');
            } else {
                await axios.post('http://localhost:3000/medicamentos', formData);
                alert('Medicamento creado exitosamente');
            }
            resetForm();
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar medicamento:', error);
            alert('Error al guardar medicamento');
        }
    };

    const handleEdit = (medicamento: Medicamento) => {
        setEditando(medicamento);
        setFormData({
            nombre: medicamento.nombre,
            nombre_generico: medicamento.nombre_generico,
            categoria_id: medicamento.categoria_id.toString(),
            descripcion: medicamento.descripcion || '',
            presentacion: medicamento.presentacion,
            stock_actual: medicamento.stock_actual,
            stock_minimo: medicamento.stock_minimo,
            precio_unitario: medicamento.precio_unitario,
            requiere_receta: medicamento.requiere_receta
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
            try {
                await axios.delete(`http://localhost:3000/medicamentos/${id}`);
                alert('Medicamento eliminado exitosamente');
                cargarDatos();
            } catch (error) {
                console.error('Error al eliminar medicamento:', error);
                alert('Error al eliminar medicamento');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            nombre_generico: '',
            categoria_id: '',
            descripcion: '',
            presentacion: '',
            stock_actual: 0,
            stock_minimo: 10,
            precio_unitario: 0,
            requiere_receta: false
        });
        setEditando(null);
        setShowForm(false);
    };

    const getEstadoStock = (medicamento: Medicamento) => {
        if (medicamento.stock_actual === 0) return 'sin-stock';
        if (medicamento.stock_actual < medicamento.stock_minimo) return 'stock-bajo';
        return 'stock-ok';
    };

    if (loading) {
        return (
            <div className="medicamentos-container">
                <div className="loading">Cargando...</div>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="medicamentos-container">
                <div className="medicamentos-header">
                    <button onClick={resetForm} className="volver-button">← Volver</button>
                    <h1>{editando ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h1>
                </div>

                <div className="form-medicamento-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre Comercial *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nombre Genérico</label>
                                <input
                                    type="text"
                                    value={formData.nombre_generico}
                                    onChange={(e) => setFormData({ ...formData, nombre_generico: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoría *</label>
                                <select
                                    value={formData.categoria_id}
                                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                                    required
                                    className="form-input"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Presentación *</label>
                                <input
                                    type="text"
                                    value={formData.presentacion}
                                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                                    placeholder="Ej: Tabletas 500mg x 20"
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="form-textarea"
                                rows={3}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Stock Actual *</label>
                                <input
                                    type="number"
                                    value={formData.stock_actual}
                                    onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) })}
                                    min="0"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock Mínimo *</label>
                                <input
                                    type="number"
                                    value={formData.stock_minimo}
                                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })}
                                    min="0"
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio Unitario *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio_unitario}
                                    onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) })}
                                    min="0"
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.requiere_receta}
                                    onChange={(e) => setFormData({ ...formData, requiere_receta: e.target.checked })}
                                />
                                <span>Requiere receta médica</span>
                            </label>
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                {editando ? 'Actualizar' : 'Crear'} Medicamento
                            </button>
                            <button type="button" onClick={resetForm} className="cancel-button">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="medicamentos-container">
            <div className="medicamentos-header">
                <button onClick={onVolver} className="volver-button">← Volver al Dashboard</button>
                <h1>💊 Gestión de Medicamentos</h1>
            </div>

            {/* Estadísticas */}
            <div className="estadisticas-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <div className="stat-value">{estadisticas.total}</div>
                        <div className="stat-label">Total Medicamentos</div>
                    </div>
                </div>
                <div className="stat-card alert">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                        <div className="stat-value">{estadisticas.stock_bajo}</div>
                        <div className="stat-label">Stock Bajo</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-info">
                        <div className="stat-value">{estadisticas.categorias}</div>
                        <div className="stat-label">Categorías</div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="filtros-container">
                <div className="busqueda-box">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="search-input"
                    />
                </div>
                <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                </select>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={stockBajoFiltro}
                        onChange={(e) => setStockBajoFiltro(e.target.checked)}
                    />
                    <span>Solo stock bajo</span>
                </label>
                <button onClick={() => setShowForm(true)} className="agregar-button">
                    ➕ Agregar Medicamento
                </button>
            </div>

            {/* Tabla de medicamentos */}
            <div className="medicamentos-tabla-container">
                <table className="medicamentos-tabla">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Genérico</th>
                            <th>Categoría</th>
                            <th>Presentación</th>
                            <th>Stock</th>
                            <th>Precio</th>
                            <th>Receta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicamentos.length > 0 ? (
                            medicamentos.map(med => (
                                <tr key={med.id} className={getEstadoStock(med)}>
                                    <td><strong>{med.nombre}</strong></td>
                                    <td>{med.nombre_generico || '-'}</td>
                                    <td><span className="categoria-badge">{med.categoria_nombre}</span></td>
                                    <td>{med.presentacion}</td>
                                    <td>
                                        <div className="stock-info">
                                            <span className={`stock-value ${getEstadoStock(med)}`}>
                                                {med.stock_actual}
                                            </span>
                                            <span className="stock-minimo">/ {med.stock_minimo}</span>
                                        </div>
                                    </td>
                                    <td>${Number(med.precio_unitario).toFixed(2)}</td>
                                    <td>{med.requiere_receta ? '✅' : '❌'}</td>
                                    <td>
                                        <div className="acciones-buttons">
                                            <button
                                                onClick={() => handleEdit(med)}
                                                className="edit-button-small"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(med.id)}
                                                className="delete-button-small"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="no-data">
                                    No se encontraron medicamentos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GestionMedicamentos;
