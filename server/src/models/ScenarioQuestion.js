import mongoose from "mongoose";

/**
 * A ScenarioQuestion represents one "scenario block":
 *   - One PDF (uploaded to Cloudinary)
 *   - One or more sub-questions the student must answer
 *
 * NO scenarioText field — the scenario lives ONLY inside the PDF.
 */

const subQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    maxMarks: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const scenarioQuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScenarioExam",
      required: true,
      index: true,
    },
    questionNumber: { type: Number, required: true },

    // ── PDF (scenario lives here only) ──────────────────────────────
    scenarioPdfUrl: { type: String, required: true, trim: true },
    cloudinaryPublicId: { type: String, default: "", trim: true },

    // ── Sub-questions tied to this scenario PDF ─────────────────────
    subQuestions: { type: [subQuestionSchema], default: [] },

    // Overall marks for the entire scenario block (optional convenience)
    maxMarks: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

scenarioQuestionSchema.index({ examId: 1, questionNumber: 1 });

export default mongoose.model("ScenarioQuestion", scenarioQuestionSchema);