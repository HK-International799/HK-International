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
  getAllBatches,
  createBatch,
  deleteBatch,
} from "../../services/batchService";

import { getCourses } from "../../services/courseService";
import { getAllUsers } from "../../services/adminService";

import {
  Plus,
  Layers,
  Trash2,
  Eye,
  Search,
} from "lucide-react";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] =
    useState(false);
  const [showDetail, setShowDetail] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    courseId: "",
    tutorId: "",
    startDate: "",
    endDate: "",
    maxStudents: 50,
    status: "upcoming",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const [b, c, u] =
        await Promise.all([
          getAllBatches(),
          getCourses(),
          getAllUsers(),
        ]);

      setBatches(
        Array.isArray(b) ? b : []
      );

      setCourses(
        Array.isArray(c)
          ? c
          : c.courses || []
      );

      const userList =
        Array.isArray(u)
          ? u
          : u.users || [];

      setTutors(
        userList.filter(
          (x) => x.role === "tutor"
        )
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createBatch(form);

      setShowCreate(false);

      setForm({
        name: "",
        description: "",
        courseId: "",
        tutorId: "",
        startDate: "",
        endDate: "",
        maxStudents: 50,
        status: "upcoming",
      });

      load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error creating batch"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this batch?"))
      return;

    try {
      await deleteBatch(id);
      load();
    } catch {}
  };

  const filtered = batches.filter(
    (b) =>
      b.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const statusColor = {
    upcoming: "accent",
    active: "success",
    completed: "default",
  };

  const columns = [
    {
      key: "name",
      label: "Batch",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Layers
              size={18}
              className="text-orange-500"
            />
          </div>

          <div>
            <p className="font-medium text-gray-800">
              {r.name}
            </p>

            <p className="text-xs text-gray-400">
              {r.courseId?.title ||
                "No course"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "tutor",
      label: "Tutor",
      render: (r) =>
        r.tutorId?.name || "—",
    },

    {
      key: "students",
      label: "Students",
      render: (r) => (
        <span>
          {r.students?.length || 0} /{" "}
          {r.maxStudents}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge
          variant={
            statusColor[r.status]
          }
        >
          {r.status}
        </Badge>
      ),
    },

    {
      key: "period",
      label: "Period",
      render: (r) => (
        <span className="text-xs text-gray-500">
          {r.startDate
            ? new Date(
                r.startDate
              ).toLocaleDateString()
            : "—"}{" "}
          →{" "}
          {r.endDate
            ? new Date(
                r.endDate
              ).toLocaleDateString()
            : "—"}
        </span>
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
            <Eye
              size={16}
              className="text-indigo-600"
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r._id);
            }}
            className="p-2 rounded-lg hover:bg-red-50"
          >
            <Trash2
              size={16}
              className="text-red-500"
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">

        <PageHeader
          title="Batches"
          subtitle={`${batches.length} total batches`}
          actions={
            <Button
              onClick={() =>
                setShowCreate(true)
              }
            >
              <Plus size={16} />
              Create Batch
            </Button>
          }
        />

        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Search batches..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        {loading ? (
          <EmptyState title="Loading batches..." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No batches available"
          />
        )}

        {/* Create Modal */}

        <Modal
          open={showCreate}
          onClose={() =>
            setShowCreate(false)
          }
          title="Create Batch"
          size="lg"
        >
          <div className="grid md:grid-cols-2 gap-4">

            <Input
              label="Batch Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
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
                  courseId:
                    e.target.value,
                })
              }
              options={[
                {
                  value: "",
                  label:
                    "Select Course",
                },
                ...courses.map(
                  (c) => ({
                    value: c._id,
                    label: c.title,
                  })
                ),
              ]}
            />

            <Select
              label="Tutor"
              value={form.tutorId}
              onChange={(e) =>
                setForm({
                  ...form,
                  tutorId:
                    e.target.value,
                })
              }
              options={[
                {
                  value: "",
                  label:
                    "Select Tutor",
                },
                ...tutors.map(
                  (t) => ({
                    value: t._id,
                    label: t.name,
                  })
                ),
              ]}
            />

            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  startDate:
                    e.target.value,
                })
              }
            />

            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  endDate:
                    e.target.value,
                })
              }
            />

            <Input
              label="Max Students"
              type="number"
              value={form.maxStudents}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxStudents:
                    e.target.value,
                })
              }
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status:
                    e.target.value,
                })
              }
              options={[
                {
                  value:
                    "upcoming",
                  label:
                    "Upcoming",
                },
                {
                  value: "active",
                  label:
                    "Active",
                },
                {
                  value:
                    "completed",
                  label:
                    "Completed",
                },
              ]}
            />

            <Textarea
              label="Description"
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              className="md:col-span-2"
            />

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                onClick={
                  handleCreate
                }
              >
                Create Batch
              </Button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}

        <Modal
          open={!!showDetail}
          onClose={() =>
            setShowDetail(null)
          }
          title={
            showDetail?.name
          }
          size="lg"
        >
          {showDetail && (
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-gray-400">
                    Course
                  </p>
                  <p className="font-medium">
                    {
                      showDetail
                        .courseId
                        ?.title
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Tutor
                  </p>
                  <p className="font-medium">
                    {
                      showDetail
                        .tutorId
                        ?.name
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Status
                  </p>
                  <Badge
                    variant={
                      statusColor[
                        showDetail
                          .status
                      ]
                    }
                  >
                    {
                      showDetail
                        .status
                    }
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Capacity
                  </p>
                  <p className="font-medium">
                    {
                      showDetail
                        .students
                        ?.length
                    }{" "}
                    /{" "}
                    {
                      showDetail.maxStudents
                    }
                  </p>
                </div>
              </div>

            </div>
          )}
        </Modal>

      </div>
    </AdminLayout>
  );
}