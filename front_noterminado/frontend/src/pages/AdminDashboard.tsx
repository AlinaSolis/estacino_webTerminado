import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CSS/AdminDashboard.css';

interface User {
  id: number;
  username: string;
}

const AdminDashboard: React.FC = () => {
  const { isLoggedIn, token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const [searchTerm, setSearchTerm] = useState(''); 

  const fetchUsers = async () => {
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn, token]);

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return alert('Completa todos los campos');
    if (!token) return alert('No hay token de autenticación');

    try {
      const res = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message || 'Error al crear usuario');
      }
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
      alert('Usuario creado');
    } catch {
      alert('Error en la conexión');
    }
  };

  const startEdit = (user: User) => {
    setEditId(user.id);
    setEditUsername(user.username);
    setEditPassword('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditUsername('');
    setEditPassword('');
  };

  const saveEdit = async () => {
    if (!editUsername) return alert('Nombre requerido');
    if (!token) return alert('No hay token de autenticación');

    try {
      const res = await fetch(`http://localhost:4000/api/users/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          password: editPassword || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message || 'Error al actualizar');
      }
      cancelEdit();
      fetchUsers();
      alert('Usuario actualizado');
    } catch {
      alert('Error en la conexión');
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    if (!token) return alert('No hay token de autenticación');

    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message || 'Error al eliminar');
      }
      fetchUsers();
      alert('Usuario eliminado');
    } catch {
      alert('Error en la conexión');
    }
  };

  //filtrar por nombre
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn)
    return (
      <p className="error" style={{ textAlign: 'center', marginTop: '40px' }}>
        Acceso denegado. Inicia sesión.
      </p>
    );

  return (
    <div className="container scrollContainer">
      <h1 className="sectionTitle">Dashboard Admin - Usuarios</h1>

      <div className="card">
        <h2 className="sectionTitle">Crear Nuevo Usuario</h2>
        <div className="formRow">
          <input
            className="input"
            type="text"
            placeholder="Usuario"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreateUser}>
            Crear
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="sectionTitle">Usuarios Registrados</h2>

        {/* barra de busqueda */}
        <input
          type="text"
          className="input"
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '20px' }}
        />

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p>No hay usuarios.</p>
        ) : (
          <table className="userTable">
            <thead>
              <tr className="tableHeader">
                <th>ID</th>
                <th>Usuario</th>
                <th>Contraseña (Editar)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) =>
                editId === u.id ? (
                  <tr key={u.id} className="editingRow">
                    <td>{u.id}</td>
                    <td>
                      <input
                        className="input"
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        type="password"
                        placeholder="Nueva contraseña (opcional)"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                    </td>
                    <td className="actionsCell">
                      <button className="btn btn-success" onClick={saveEdit}>
                        Guardar
                      </button>
                      <button className="btn btn-danger" onClick={cancelEdit}>
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>******</td>
                    <td className="actionsCell">
                      <button className="btn btn-primary" onClick={() => startEdit(u)}>
                        Editar
                      </button>
                      <button className="btn btn-danger" onClick={() => deleteUser(u.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
