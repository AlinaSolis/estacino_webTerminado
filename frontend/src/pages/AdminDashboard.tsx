import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CSS/AdminDashboard.css';
import Swal from 'sweetalert2';

interface User {
  id: number;
  username: string;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) {
      await Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos',
        icon: 'warning',
        confirmButtonColor: '#0A7764'
      });
      return;
    }
    
    if (!token) {
      await Swal.fire({
        title: 'Error de autenticación',
        text: 'No hay token de autenticación',
        icon: 'error',
        confirmButtonColor: '#0A7764'
      });
      return;
    }

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
        await Swal.fire({
          title: 'Error al crear usuario',
          text: err.message || 'Error al crear usuario',
          icon: 'error',
          confirmButtonColor: '#0A7764'
        });
        return;
      }
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
      await Swal.fire({
        title: '¡Usuario creado!',
        text: 'El usuario se ha creado exitosamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        icon: 'error',
        confirmButtonColor: '#0A7764'
      });
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
    if (!editUsername) {
      await Swal.fire({
        title: 'Campo requerido',
        text: 'El nombre de usuario es requerido',
        icon: 'warning',
        confirmButtonColor: '#0A7764'
      });
      return;
    }
    
    if (!token) {
      await Swal.fire({
        title: 'Error de autenticación',
        text: 'No hay token de autenticación',
        icon: 'error',
        confirmButtonColor: '#0A7764'
      });
      return;
    }

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
        await Swal.fire({
          title: 'Error al actualizar',
          text: err.message || 'Error al actualizar usuario',
          icon: 'error',
          confirmButtonColor: '#0A7764'
        });
        return;
      }
      cancelEdit();
      fetchUsers();
      await Swal.fire({
        title: '¡Usuario actualizado!',
        text: 'El usuario se ha actualizado exitosamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        icon: 'error',
        confirmButtonColor: '#0A7764'
      });
    }
  };

  const deleteUser = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F44336',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;
    
    if (!token) {
      await Swal.fire({
        title: 'Error de autenticación',
        text: 'No hay token de autenticación',
        icon: 'error',
        confirmButtonColor: '#0A7764'
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        await Swal.fire({
          title: 'Error al eliminar',
          text: err.message || 'Error al eliminar usuario',
          icon: 'error',
          confirmButtonColor: '#0A7764'
        });
        return;
      }
      fetchUsers();
      await Swal.fire({
        title: '¡Usuario eliminado!',
        text: 'El usuario se ha eliminado exitosamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        icon: 'error',
        confirmButtonColor: '#0A7764'
      });
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      
      <div className="create-user-section">
        <h2>Crear Usuario</h2>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handleCreateUser}>Crear Usuario</button>
      </div>

      <div className="users-list">
        <h2>Lista de Usuarios</h2>
        {users.map((user) => (
          <div key={user.id} className="user-item">
            {editId === user.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña (opcional)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <button onClick={saveEdit}>Guardar</button>
                <button onClick={cancelEdit}>Cancelar</button>
              </div>
            ) : (
              <div className="user-info">
                <span>{user.username}</span>
                <button onClick={() => startEdit(user)}>Editar</button>
                <button onClick={() => deleteUser(user.id)}>Eliminar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;