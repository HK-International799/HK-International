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
  EmptyState,
} from "../../components/ui";

import {
  getAllUsers,
  createUser,
  deleteUser,
} from "../../services/adminService";

import {
  Plus,
  Trash2,
} from "lucide-react";

export default function Learners() {
  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(false);

  const [showCreate, setShowCreate] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "student",
    });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const data =
        await getAllUsers();

      setUsers(
        Array.isArray(data)
          ? data
          : data.users || []
      );
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createUser(form);

      setShowCreate(false);

      setForm({
        name: "",
        email: "",
        mobile: "",
        password: "",
        role: "student",
      });

      load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete user?"))
      return;

    try {
      await deleteUser(id);
      load();
    } catch {}
  };

  const filtered =
    users.filter((u) => {
      const matchSearch =
        u.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        u.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchRole =
        roleFilter === "all" ||
        u.role === roleFilter;

      return (
        matchSearch &&
        matchRole
      );
    });

  const roleColor = {
    student: "primary",
    tutor: "accent",
    admin: "danger",
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (r) => (
        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            {r.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-gray-800">
              {r.name}
            </p>

            <p className="text-xs text-gray-400">
              {r.email}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "mobile",
      label: "Mobile",
      render: (r) =>
        r.mobile || "—",
    },

    {
      key: "role",
      label: "Role",
      render: (r) => (
        <Badge
          variant={
            roleColor[r.role]
          }
        >
          {r.role}
        </Badge>
      ),
    },

    {
      key: "createdAt",
      label: "Joined",
      render: (r) =>
        new Date(
          r.createdAt
        ).toLocaleDateString(),
    },

    {
      key: "actions",
      label: "",
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(
              r._id
            );
          }}
          className="p-2 rounded-lg hover:bg-red-50"
        >
          <Trash2
            size={16}
            className="text-red-500"
          />
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>

      <div className="animate-fadeIn">

        <PageHeader
          title="Learners & Users"
          subtitle={`${users.length} total users`}
          actions={
            <Button
              onClick={() =>
                setShowCreate(true)
              }
            >
              <Plus size={16} />
              Add User
            </Button>
          }
        />

        <div className="flex gap-3 mb-4">

          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="max-w-sm"
          />

          <Select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value
              )
            }
            options={[
              {
                value: "all",
                label: "All",
              },
              {
                value:
                  "student",
                label:
                  "Students",
              },
              {
                value:
                  "tutor",
                label:
                  "Tutors",
              },
              {
                value:
                  "admin",
                label:
                  "Admins",
              },
            ]}
          />

        </div>

        {loading ? (
          <EmptyState title="Loading users..." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No users found"
          />
        )}

        <Modal
          open={showCreate}
          onClose={() =>
            setShowCreate(false)
          }
          title="Create User"
        >
          <div className="space-y-4">

            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name:
                    e.target.value,
                })
              }
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
            />

            <Input
              label="Mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile:
                    e.target.value,
                })
              }
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password:
                    e.target.value,
                })
              }
            />

            <Select
              label="Role"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role:
                    e.target.value,
                })
              }
              options={[
                {
                  value:
                    "student",
                  label:
                    "Student",
                },
                {
                  value:
                    "tutor",
                  label:
                    "Tutor",
                },
              ]}
            />

            <div className="flex justify-end gap-3 pt-2">

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
                Create User
              </Button>

            </div>

          </div>
        </Modal>

      </div>

    </AdminLayout>
  );
}