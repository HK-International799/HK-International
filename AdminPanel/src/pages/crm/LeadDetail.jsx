import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  Badge,
  Button,
  Modal,
  Input,
  Select,
  EmptyState,
  Textarea,
} from "../../components/ui";
import {
  getLeadById,
  updateLead,
  convertLead,
  createFollowUp,
  updateFollowUp,
  createTask,
} from "../../services/crmService";
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Zap,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_COLORS = {
  new: "default",
  contacted: "primary",
  interested: "accent",
  proposal_sent: "warning",
  payment_pending: "warning",
  converted: "success",
  lost: "danger",
};

const FU_TYPE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFU, setShowFU] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [convertDone, setConvertDone] = useState(null);

  const [fuForm, setFuForm] = useState({
    scheduledAt: "",
    type: "call",
    remarks: "",
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    dueDate: "",
    priority: "medium",
    description: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLeadById(id);
      const d = res.data || res;
      setLead(d.lead || d);
      setFollowUps(d.followUps || []);
      setTasks(d.tasks || []);
    } catch {
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await updateLead(id, { status });
      setLead((prev) => ({ ...prev, status }));
    } catch {}
  };

  const handleAddFollowUp = async () => {
    try {
      await createFollowUp({ ...fuForm, lead: id });
      setShowFU(false);
      setFuForm({ scheduledAt: "", type: "call", remarks: "" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleCompleteFollowUp = async (fuId) => {
    try {
      await updateFollowUp(fuId, { outcome: "completed" });
      load();
    } catch {}
  };

  const handleAddTask = async () => {
    try {
      await createTask({
        ...taskForm,
        lead: id,
        assignedTo: lead?.assignedTo?._id,
      });
      setShowTask(false);
      setTaskForm({
        title: "",
        dueDate: "",
        priority: "medium",
        description: "",
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleConvert = async () => {
    try {
      const res = await convertLead(id);
      const d = res.data || res;
      setConvertDone(d.learner);
      setLead((prev) => ({ ...prev, status: "converted" }));
      setShowConvert(false);
    } catch (err) {
      alert(err.response?.data?.message || "Conversion failed");
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <EmptyState title="Loading lead..." />
      </AdminLayout>
    );
  if (!lead)
    return (
      <AdminLayout>
        <EmptyState title="Lead not found" />
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {lead.fullName}
            </h1>
            <p className="text-sm text-gray-400">Lead profile</p>
          </div>
          <div className="flex gap-2">
            {lead.status !== "converted" && lead.status !== "lost" && (
              <Button variant="success" onClick={() => setShowConvert(true)}>
                <Zap size={15} /> Convert to Learner
              </Button>
            )}
            <Select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {/* Conversion success banner */}
        {convertDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800">
            <p className="font-semibold">Lead converted successfully!</p>
            <p>
              Learner account: <strong>{convertDone.email}</strong>
            </p>
            {convertDone.credentials && (
              <p>
                Temporary password:{" "}
                <code className="bg-emerald-100 px-1 rounded">
                  {convertDone.credentials.password}
                </code>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: info card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                {lead.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{lead.fullName}</p>
                <Badge variant={STATUS_COLORS[lead.status] || "default"}>
                  {lead.status?.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {lead.email && (
                <div className="flex gap-2 items-center">
                  <Mail size={14} /> {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex gap-2 items-center">
                  <Phone size={14} /> {lead.phone}
                </div>
              )}
              {lead.country && (
                <div className="flex gap-2 items-center">
                  <Globe size={14} /> {lead.country}
                </div>
              )}
              {lead.assignedTo && (
                <div className="flex gap-2 items-center">
                  <User size={14} /> {lead.assignedTo.name}
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Calendar size={14} />
                {new Date(lead.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Probability
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${lead.probability || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {lead.probability || 0}%
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Source
              </p>
              <Badge>{lead.source}</Badge>
            </div>

            {lead.courseInterest && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Course Interest
                </p>
                <p className="text-sm text-gray-700">
                  {lead.courseInterest.title}
                </p>
              </div>
            )}

            {lead.notes && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            )}

            {lead.learnerRef && (
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">
                  Converted Learner
                </p>
                <p className="text-sm text-emerald-800">
                  {lead.learnerRef.name}
                </p>
                <p className="text-xs text-emerald-600">
                  {lead.learnerRef.email}
                </p>
              </div>
            )}
          </div>

          {/* Right: follow-ups + tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Follow-ups */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">Follow-ups</p>
                <Button size="sm" onClick={() => setShowFU(true)}>
                  <Plus size={13} /> Add
                </Button>
              </div>
              {followUps.length === 0 ? (
                <p className="text-sm text-gray-400">No follow-ups yet</p>
              ) : (
                <div className="space-y-2">
                  {followUps.map((fu) => (
                    <div
                      key={fu._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          fu.outcome === "completed"
                            ? "bg-emerald-500"
                            : fu.outcome === "pending" &&
                                new Date(fu.scheduledAt) < new Date()
                              ? "bg-red-500"
                              : "bg-amber-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          {fu.type} — {fu.remarks || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(fu.scheduledAt).toLocaleDateString()}
                          {fu.outcome !== "pending" && ` · ${fu.outcome}`}
                        </p>
                      </div>
                      {fu.outcome === "pending" && (
                        <button
                          onClick={() => handleCompleteFollowUp(fu._id)}
                          className="text-emerald-600 hover:text-emerald-700 p-1"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">Tasks</p>
                <Button size="sm" onClick={() => setShowTask(true)}>
                  <Plus size={13} /> Add
                </Button>
              </div>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-400">No tasks yet</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <Clock size={14} className="text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString()
                            : "No due date"}
                          {t.assignedTo && ` · ${t.assignedTo.name}`}
                        </p>
                      </div>
                      <Badge
                        variant={
                          t.priority === "high"
                            ? "danger"
                            : t.priority === "medium"
                              ? "warning"
                              : "default"
                        }
                      >
                        {t.priority}
                      </Badge>
                      <Badge
                        variant={
                          t.status === "completed" ? "success" : "default"
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Follow-up Modal */}
      <Modal
        open={showFU}
        onClose={() => setShowFU(false)}
        title="Schedule Follow-up"
      >
        <div className="space-y-4">
          <Input
            label="Date & Time *"
            type="datetime-local"
            value={fuForm.scheduledAt}
            onChange={(e) =>
              setFuForm({ ...fuForm, scheduledAt: e.target.value })
            }
          />
          <Select
            label="Type"
            value={fuForm.type}
            onChange={(e) => setFuForm({ ...fuForm, type: e.target.value })}
            options={FU_TYPE_OPTIONS}
          />
          <Textarea
            label="Remarks"
            value={fuForm.remarks}
            onChange={(e) => setFuForm({ ...fuForm, remarks: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowFU(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFollowUp}>Schedule</Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        open={showTask}
        onClose={() => setShowTask(false)}
        title="New Task"
      >
        <div className="space-y-4">
          <Input
            label="Task Title *"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
          />
          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) =>
              setTaskForm({ ...taskForm, dueDate: e.target.value })
            }
          />
          <Select
            label="Priority"
            value={taskForm.priority}
            onChange={(e) =>
              setTaskForm({ ...taskForm, priority: e.target.value })
            }
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowTask(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </div>
        </div>
      </Modal>

      {/* Convert Lead Modal */}
      <Modal
        open={showConvert}
        onClose={() => setShowConvert(false)}
        title="Convert Lead to Learner"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">
              This will create a new student account
            </p>
            <p>
              Email: <strong>{lead.email}</strong>
            </p>
            <p>
              A welcome email with login credentials will be sent automatically.
            </p>
            <p className="mt-2 text-xs text-amber-600">
              The lead record will be preserved with full history.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowConvert(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleConvert}>
              Convert Now
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
