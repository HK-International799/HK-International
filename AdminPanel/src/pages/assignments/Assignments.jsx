import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
  EmptyState,
} from "../../components/ui";

import {
  getAllAssignments,
  createAssignment,
  deleteAssignment,
} from "../../services/assignmentService";

import { getCourses } from "../../services/courseService";

import {
  Plus,
  ClipboardList,
  Trash2,
  Eye,
  Search,
  BookOpen,
} from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    totalMarks: 100,
    isPublished: false,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const [a, c] = await Promise.all([getAllAssignments(), getCourses()]);

      setAssignments(Array.isArray(a) ? a : a.assignments || []);

      setCourses(Array.isArray(c) ? c : c.courses || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createAssignment(form);

      setShowCreate(false);

      setForm({
        title: "",
        description: "",
        courseId: "",
        dueDate: "",
        totalMarks: 100,
        isPublished: false,
      });

      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete assignment?")) return;

    try {
      await deleteAssignment(id);
      load();
    } catch {}
  };

  const filtered = assignments.filter((a) => {
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase());

    const matchCourse =
      selectedCourse === "all" || a.courseId?._id === selectedCourse;

    return matchSearch && matchCourse;
  });

  const columns = [
    {
      key: "title",
      label: "Assignment",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ClipboardList size={18} className="text-indigo-600" />
          </div>

          <div>
            <p className="font-medium text-gray-800">{r.title}</p>

            <p className="text-xs text-gray-400">
              {r.courseId?.title || "No course"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "marks",
      label: "Marks",
      render: (r) => <span className="font-medium">{r.totalMarks}</span>,
    },

    {
      key: "questions",
      label: "Questions",
      render: (r) => r.questions?.length || 0,
    },

    {
      key: "dueDate",
      label: "Due Date",
      render: (r) =>
        r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—",
    },

    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={r.isPublished ? "success" : "warning"}>
          {r.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },

    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(r);
            }}
            className="p-2 rounded-lg hover:bg-indigo-50"
          >
            <Eye size={16} className="text-indigo-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r._id);
            }}
            className="p-2 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader
          title="Assignments"
          subtitle={`${assignments.length} total assignments`}
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Create Assignment
            </Button>
          }
        />

        {/* Course Cards */}

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => setSelectedCourse("all")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              selectedCourse === "all"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-100 bg-white"
            }`}
          >
            <p className="font-medium">All Courses</p>
            <p className="text-sm text-gray-400">
              {assignments.length} assignments
            </p>
          </div>

          {courses.map((c) => (
            <div
              key={c._id}
              onClick={() => setSelectedCourse(c._id)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                selectedCourse === c._id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-orange-500" />
                <p className="font-medium">{c.title}</p>
              </div>

              <p className="text-sm text-gray-400">
                {assignments.filter((a) => a.courseId?._id === c._id).length}{" "}
                assignments
              </p>
            </div>
          ))}
        </div>

        {/* Search */}

        <div className="mb-4 relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Table */}

        {loading ? (
          <EmptyState title="Loading assignments..." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No assignments found"
          />
        )}

        {/* Create Modal */}

        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create Assignment"
          size="lg"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              className="md:col-span-2"
            />

            <Select
              label="Course"
              value={form.courseId}
              onChange={(e) =>
                setForm({
                  ...form,
                  courseId: e.target.value,
                })
              }
              options={[
                {
                  value: "",
                  label: "Select Course",
                },
                ...courses.map((c) => ({
                  value: c._id,
                  label: c.title,
                })),
              ]}
            />

            <Input
              label="Total Marks"
              type="number"
              value={form.totalMarks}
              onChange={(e) =>
                setForm({
                  ...form,
                  totalMarks: e.target.value,
                })
              }
            />

            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  dueDate: e.target.value,
                })
              }
            />

            <Select
              label="Status"
              value={form.isPublished}
              onChange={(e) =>
                setForm({
                  ...form,
                  isPublished: e.target.value === "true",
                })
              }
              options={[
                {
                  value: "false",
                  label: "Draft",
                },
                {
                  value: "true",
                  label: "Published",
                },
              ]}
            />

            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="md:col-span-2"
            />

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>

              <Button onClick={handleCreate}>Create Assignment</Button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}

        <Modal
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
          title={showDetail?.title}
          size="lg"
        >
          {showDetail && (
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-gray-700">{showDetail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Course</p>
                  <p className="font-medium">{showDetail.courseId?.title}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Marks</p>
                  <p className="font-medium">{showDetail.totalMarks}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Due Date</p>
                  <p className="font-medium">
                    {new Date(showDetail.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <Badge
                    variant={showDetail.isPublished ? "success" : "warning"}
                  >
                    {showDetail.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
