import { generateCertificate } from "../../services/certificateService";

const Certificates = ({ studentId, courseId }) => {
  const handleGenerate = async () => {
    await generateCertificate(studentId, courseId);
    alert("Certificate generated!");
  };

  return (
    <button
      onClick={handleGenerate}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      Generate Certificate
    </button>
  );
};

export default Certificates;
