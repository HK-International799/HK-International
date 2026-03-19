import { updateUserRole } from "../../services/userService";

const UserRoleManager = ({ user }) => {
  const handleRoleChange = async (role) => {
    await updateUserRole(user._id, role);
    alert("Role updated!");
  };

  return (
    <select
      onChange={(e) => handleRoleChange(e.target.value)}
      defaultValue={user.role}
      className="border p-1 rounded"
    >
      <option value="student">Student</option>
      <option value="tutor">Tutor</option>
      <option value="admin">Admin</option>
    </select>
  );
};

export default UserRoleManager;
