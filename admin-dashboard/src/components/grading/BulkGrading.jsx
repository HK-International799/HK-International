import { bulkGrade } from "../../services/adminService";

const BulkGrading = ({ submissions }) => {
  const handleBulkGrade = async () => {
    await bulkGrade(submissions.map(s => s._id), { score: 10, feedback: "Reviewed" });
    alert("Bulk grading complete!");
  };

  return (
    
    <button
      onClick={handleBulkGrade}
      className="bg-purple-600 text-white px-4 py-2 rounded"
    >
      Bulk Grade
    </button>
  );
};

export default BulkGrading;
