import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/userService";
import UserRoleManager from "./UserRoleManager";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    setUsers(users.filter(u => u._id !== id));
  };

  return (
    
    <div className="p-6">
      <h1 className="text-xl font-bold">Manage Users</h1>
      {users.map((u) => (
        <div key={u._id} className="border p-4 mb-2 flex justify-between items-center">
          <div>
            <p>{u.name} ({u.role})</p>
            <p>{u.email}</p>
          </div>
          <div className="flex gap-2">
            <UserRoleManager user={u} />
            <button
              onClick={() => handleDelete(u._id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManageUsers;
