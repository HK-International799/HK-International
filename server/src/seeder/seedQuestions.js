import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";

dotenv.config();

// ================= QUESTIONS =================

const questions = [
{
  type: "mcq",
  prompt:
    "Which ergonomic discipline primarily focuses on reducing musculoskeletal disorders caused by lifting, posture, and repetitive work?",
  options: [
    "Organisational ergonomics",
    "Physical ergonomics",
    "Cognitive ergonomics",
    "Environmental ergonomics",
  ],
  correctAnswer: "Physical ergonomics",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "What is a common consequence of poorly designed manual handling tasks?",
  options: [
    "Improved productivity",
    "Musculoskeletal disorders",
    "Lower equipment costs",
    "Reduced training needs",
  ],
  correctAnswer: "Musculoskeletal disorders",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Poor workstation design is most likely to result in:",
  options: [
    "Higher employee motivation",
    "Discomfort, fatigue, and chronic injury",
    "Reduced maintenance costs",
    "Improved production speed",
  ],
  correctAnswer: "Discomfort, fatigue, and chronic injury",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Which control is most effective for reducing injuries caused by repetitive work?",
  options: [
    "Ignoring the issue",
    "Task rotation, mechanisation, and redesign",
    "Increasing overtime",
    "Reducing break times",
  ],
  correctAnswer: "Task rotation, mechanisation, and redesign",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Cognitive ergonomics is mainly concerned with:",
  options: [
    "Machine maintenance schedules",
    "How people process information and make decisions",
    "Fire evacuation procedures",
    "Building construction methods",
  ],
  correctAnswer: "How people process information and make decisions",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Poor cognitive design can lead to:",
  options: [
    "Improved concentration",
    "Systematic human error",
    "Reduced workload",
    "Better communication",
  ],
  correctAnswer: "Systematic human error",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "According to cognitive ergonomics, human error is often caused by:",
  options: [
    "Worker laziness",
    "Poorly designed systems",
    "Excessive supervision",
    "High salaries",
  ],
  correctAnswer: "Poorly designed systems",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Which feature improves the usability of workplace controls?",
  options: [
    "Hidden labels",
    "Clearly labelled and colour-coded controls",
    "Complex operating procedures",
    "Random control layouts",
  ],
  correctAnswer: "Clearly labelled and colour-coded controls",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Safe work procedures should be:",
  options: [
    "Written in technical language only",
    "Based on the logical sequence of the task",
    "Created without consulting workers",
    "Changed daily",
  ],
  correctAnswer: "Based on the logical sequence of the task",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Accessible workplace information should be:",
  options: [
    "Available only in English",
    "Suitable for workers' language and reading ability",
    "Restricted to supervisors",
    "Stored only electronically",
  ],
  correctAnswer: "Suitable for workers' language and reading ability",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Effective ergonomic design recognises that workers differ in:",
  options: [
    "Body size, capability, language, and experience",
    "Only their age",
    "Only their physical strength",
    "Only their qualifications",
  ],
  correctAnswer: "Body size, capability, language, and experience",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Designing work for an 'average worker' may:",
  options: [
    "Improve safety for everyone",
    "Exclude many members of the workforce",
    "Eliminate all ergonomic risks",
    "Reduce training requirements",
  ],
  correctAnswer: "Exclude many members of the workforce",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "In the manual handling example, what engineering solution provided the greatest improvement?",
  options: [
    "Additional lifting training",
    "Mechanical handling equipment such as a lift table",
    "Longer working hours",
    "More warning signs",
  ],
  correctAnswer: "Mechanical handling equipment such as a lift table",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Why is logistics safety important to an organisation?",
  options: [
    "It only protects warehouse workers",
    "It supports customer satisfaction, business continuity, and reputation",
    "It eliminates the need for transport planning",
    "It only reduces insurance costs",
  ],
  correctAnswer: "It supports customer satisfaction, business continuity, and reputation",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Which of the following is a common warehouse OSH risk?",
  options: [
    "Sunburn",
    "Racking collapse and forklift interaction",
    "Food contamination",
    "Noise from aircraft",
  ],
  correctAnswer: "Racking collapse and forklift interaction",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "The supply chain includes:",
  options: [
    "Only the manufacturer",
    "Every organisation contributing materials, products, or services",
    "Only transport companies",
    "Only suppliers within the same country",
  ],
  correctAnswer: "Every organisation contributing materials, products, or services",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "A serious incident at a key supplier may cause:",
  options: [
    "Improved productivity",
    "Production interruption",
    "Lower customer demand",
    "Reduced legal obligations",
  ],
  correctAnswer: "Production interruption",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "When selecting a contractor, organisations should assess:",
  options: [
    "Only the lowest quotation",
    "Competence, experience, OSH systems, and supervision",
    "The contractor's office location only",
    "How quickly the work can begin",
  ],
  correctAnswer: "Competence, experience, OSH systems, and supervision",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "Contractor management should be viewed as:",
  options: [
    "A one-time prequalification exercise",
    "An ongoing process from selection to post-work review",
    "Only a legal requirement before work starts",
    "The contractor's responsibility only",
  ],
  correctAnswer: "An ongoing process from selection to post-work review",
  marks: 2,
},

{
  type: "mcq",
  prompt:
    "The level of supply-chain OSH control should be based on:",
  options: [
    "The contract value only",
    "The level of risk involved",
    "The supplier's location",
    "The organisation's annual profit",
  ],
  correctAnswer: "The level of risk involved",
  marks: 2,
},
];

// ================= QUIZ ID =================

// Existing quiz where questions should be inserted
const QUIZ_ID = "6a5ca123697b98d1a5f9bd8f";

// ================= SEED FUNCTION =================

const importQuestions = async () => {
  try {
    // Connect DB
    await connectDB();

    // Insert all questions
    const insertedQuestions = await Question.insertMany(questions);

    // Extract all inserted question IDs
    const questionIds = insertedQuestions.map((question) => question._id);

    // Calculate total marks
    const totalMarks = insertedQuestions.reduce(
      (sum, question) => sum + (question.marks || 0),
      0,
    );

    // Update Quiz document
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      QUIZ_ID,
      {
        $push: {
          questions: { $each: questionIds },
        },
        $set: {
          totalMarks,
        },
      },
      { new: true },
    );

    console.log(
      `✅ ${insertedQuestions.length} questions inserted successfully`,
    );

    console.log(`✅ Quiz updated with ${questionIds.length} question IDs`);

    console.log("✅ Updated Quiz:", updatedQuiz._id);

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importQuestions();
