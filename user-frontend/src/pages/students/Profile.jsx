import { student } from "../../mock/studentData";

export default function Profile() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-lg">

        <img
          src={student.avatar}
          alt={student.name}
          className="w-24 h-24 rounded-full mb-4"
        />

        <h2 className="text-xl font-semibold">{student.name}</h2>

        <p className="text-gray-500">{student.email}</p>

      </div>

    </div>
  );
}