import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCourseById,
  addSection,
  updateSection,
  deleteSection,
} from "../../services/courseService";

const ManageSections = () => {
  const { id } = useParams(); // courseId
  const [course, setCourse] = useState(null);
  const [newSection, setNewSection] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    const data = await getCourseById(id);
    setCourse(data);
  };

  /**
   * ➕ Add Section
   */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSection.trim()) return;

    await addSection(id, { title: newSection });
    setNewSection("");
    loadCourse();
  };

  /**
   * ✏️ Update Section
   */
  const handleUpdate = async (sectionId) => {
    await updateSection(sectionId, { title: editValue });
    setEditingSection(null);
    loadCourse();
  };

  /**
   * ❌ Delete Section
   */
  const handleDelete = async (sectionId) => {
    if (!confirm("Delete this section?")) return;
    await deleteSection(sectionId);
    loadCourse();
  };

  if (!course) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">Manage Sections</h1>
        <p className="text-gray-500 text-sm">
          Course: {course.title}
        </p>
      </div>

      {/* ➕ Add Section */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="font-semibold mb-3">Add New Section</h2>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Enter section title..."
            className="flex-1 border p-2 rounded"
          />

          <button className="bg-blue-600 text-white px-4 rounded">
            Add
          </button>
        </form>
      </div>

      {/* 📂 Section List */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="font-semibold mb-4">All Sections</h2>

        <div className="space-y-3">
          {course.sections?.length === 0 && (
            <p className="text-gray-400 text-sm">
              No sections added yet
            </p>
          )}

          {course.sections?.map((section) => (
            <div
              key={section._id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              {/* ✏️ Editing Mode */}
              {editingSection === section._id ? (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border p-1 rounded w-full mr-2"
                />
              ) : (
                <span>{section.title}</span>
              )}

              {/* Actions */}
              <div className="flex gap-2 ml-3">
                {editingSection === section._id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(section._id)}
                      className="text-green-600 text-sm"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditingSection(null)}
                      className="text-gray-500 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingSection(section._id);
                        setEditValue(section.title);
                      }}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(section._id)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageSections;