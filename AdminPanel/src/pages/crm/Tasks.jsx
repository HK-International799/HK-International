import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Badge, Button, Modal, Input, Select, EmptyState, Textarea,
} from "../../components/ui";
import { getTasks, createTask, updateTask, deleteTask } from "../../services/crmService";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

const PRIORITY_COLOR = { low: "default", medium: "warning", high: "danger" };
const STATUS_COLOR   = { open: "default", in_progress: "primary", completed: "success", cancelled: "danger" };

const EMPTY_FORM = { title: "", assignedTo: "", dueDate: "", priority: "medium", description: "" };

export default function Tasks() {
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [statusFilter,setStatusFilter]= useState("all");
  const [form,        setForm]        = useState(EMPTY_FORM);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await getTasks(params);
      setTasks(res.tasks || []);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleCreate = async () => {
    try {
      await createTask(form);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleComplete = async (id) => {
    try { await updateTask(id, { status: "completed" }); load(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try { await deleteTask(id); load(); } catch {}
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const columns = [
    { key: "title",     label: "Task",    render: (r) => <p className="font-medium text-gray-800">{r.title}</p> },
    { key: "lead",      label: "Lead",    render: (r) => r.lead?.fullName || "—" },
    { key: "assignedTo",label: "Assigned",render: (r) => r.assignedTo?.name || "—" },
    {
      key: "dueDate", label: "Due",
      render: (r) => {
        if (!r.dueDate) return "—";
        const overdue = r.status !== "completed" && new Date(r.dueDate) < new Date();
        return (
          <span className={overdue ? "text-red-600 font-medium" : "text-gray-600"}>
            {new Date(r.dueDate).toLocaleDateString()}
          </span>
        );
      },
    },
    { key: "priority", label: "Priority", render: (r) => <Badge variant={PRIORITY_COLOR[r.priority]}>{r.priority}</Badge> },
    { key: "status",   label: "Status",   render: (r) => <Badge variant={STATUS_COLOR[r.status]}>{r.status?.replace("_"," ")}</Badge> },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex gap-2">
          {r.status !== "completed" && (
            <button onClick={(e) => { e.stopPropagation(); handleComplete(r._id); }}
              className="p-2 rounded-lg hover:bg-emerald-50">
              <CheckCircle2 size={15} className="text-emerald-600"/>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
            className="p-2 rounded-lg hover:bg-red-50">
            <Trash2 size={15} className="text-red-500"/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <PageHeader
          title="Tasks"
          subtitle={`${tasks.length} tasks`}
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={15} /> New Task
            </Button>
          }
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "all",         label: "All"          },
            { value: "open",        label: "Open"         },
            { value: "in_progress", label: "In Progress"  },
            { value: "completed",   label: "Completed"    },
            { value: "cancelled",   label: "Cancelled"    },
          ]}
          className="max-w-xs"
        />

        {loading
          ? <EmptyState title="Loading tasks..." />
          : <DataTable columns={columns} data={tasks} emptyMessage="No tasks found" />
        }

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
          <div className="space-y-4">
            <Input   label="Task Title *"          value={form.title}      onChange={f("title")}      />
            <Input   label="Assign To (User ID)"   value={form.assignedTo} onChange={f("assignedTo")} />
            <Input   label="Due Date" type="date"  value={form.dueDate}    onChange={f("dueDate")}    />
            <Select  label="Priority" value={form.priority} onChange={f("priority")}
              options={[
                { value: "low",    label: "Low"    },
                { value: "medium", label: "Medium" },
                { value: "high",   label: "High"   },
              ]}
            />
            <Textarea label="Description" value={form.description} onChange={f("description")} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Task</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

