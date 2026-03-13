import { certificates } from "../../mock/studentData";

export default function Certificates() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Certificates</h1>

      <div className="grid md:grid-cols-3 gap-6">

        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white p-6 rounded-xl shadow">

            <h3 className="font-semibold text-lg">
              {cert.course}
            </h3>

            <p className="text-gray-500 mb-4">
              Issued: {cert.date}
            </p>

            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
              Download
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}