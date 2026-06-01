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
      "What is one of the main responsibilities of a manager regarding workplace safety?",
    options: [
      "Ignore safety concerns",
      "Manage risks and ensure safe working conditions",
      "Focus only on production targets",
      "Delegate all safety responsibilities",
    ],
    correctAnswer: "Manage risks and ensure safe working conditions",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the first step in the risk assessment process?",
    options: [
      "Review controls",
      "Identify hazards",
      "Investigate incidents",
      "Provide PPE",
    ],
    correctAnswer: "Identify hazards",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "A hazard is best defined as:",
    options: [
      "An accident that has occurred",
      "Anything with the potential to cause harm",
      "The likelihood of injury",
      "A control measure",
    ],
    correctAnswer: "Anything with the potential to cause harm",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Risk is the combination of:",
    options: [
      "Training and supervision",
      "Hazard and cost",
      "Likelihood and consequence",
      "Inspection and audit",
    ],
    correctAnswer: "Likelihood and consequence",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which control measure is highest in the hierarchy of controls?",
    options: ["PPE", "Administrative controls", "Elimination", "Warning signs"],
    correctAnswer: "Elimination",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What does PPE stand for?",
    options: [
      "Personal Protective Equipment",
      "Personal Prevention Equipment",
      "Practical Protection Equipment",
      "Protective Process Equipment",
    ],
    correctAnswer: "Personal Protective Equipment",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why should risk assessments be reviewed regularly?",
    options: [
      "To increase paperwork",
      "To ensure they remain effective and relevant",
      "To reduce training",
      "To replace inspections",
    ],
    correctAnswer: "To ensure they remain effective and relevant",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the purpose of workplace inspections?",
    options: [
      "To identify hazards and unsafe conditions",
      "To calculate profits",
      "To monitor attendance",
      "To assess salaries",
    ],
    correctAnswer: "To identify hazards and unsafe conditions",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which of the following is a proactive safety measure?",
    options: [
      "Accident investigation",
      "Safety inspection",
      "Insurance claim",
      "Compensation payment",
    ],
    correctAnswer: "Safety inspection",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What should managers encourage workers to report?",
    options: [
      "Only injuries",
      "Only property damage",
      "Near misses and hazards",
      "Only serious incidents",
    ],
    correctAnswer: "Near misses and hazards",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is a near miss?",
    options: [
      "An accident causing injury",
      "An event causing property damage",
      "An event that could have caused harm but did not",
      "A completed risk assessment",
    ],
    correctAnswer: "An event that could have caused harm but did not",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why should near misses be investigated?",
    options: [
      "To assign blame",
      "To prevent future incidents",
      "To reduce training",
      "To avoid inspections",
    ],
    correctAnswer: "To prevent future incidents",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the immediate cause of an accident?",
    options: [
      "A system failure",
      "An unsafe act or condition present at the time",
      "Management culture",
      "Company policy",
    ],
    correctAnswer: "An unsafe act or condition present at the time",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "An underlying cause of an accident is:",
    options: [
      "The injury itself",
      "A factor that allowed the unsafe act or condition",
      "The emergency response",
      "The insurance claim",
    ],
    correctAnswer: "A factor that allowed the unsafe act or condition",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is a root cause?",
    options: [
      "The deepest systemic reason an incident occurred",
      "The first aid treatment provided",
      "The immediate injury",
      "The cost of the incident",
    ],
    correctAnswer: "The deepest systemic reason an incident occurred",
    marks: 2,
  },

  {
    type: "mcq",
    prompt:
      "What should be done immediately after making an injured person safe?",
    options: [
      "Interview witnesses",
      "Preserve the scene",
      "Review policies",
      "Write the final report",
    ],
    correctAnswer: "Preserve the scene",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why is preserving the scene important after an accident?",
    options: [
      "To improve productivity",
      "To protect evidence",
      "To reduce costs",
      "To avoid reporting",
    ],
    correctAnswer: "To protect evidence",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What should investigators collect during an investigation?",
    options: [
      "Rumours",
      "Evidence and witness information",
      "Personal opinions only",
      "Marketing reports",
    ],
    correctAnswer: "Evidence and witness information",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "RIDDOR stands for:",
    options: [
      "Reporting of Injuries, Diseases and Dangerous Occurrences Regulations",
      "Risk Identification and Duty of Reporting",
      "Regulations for Industrial Damage and Operations",
      "Recording Incidents and Dangerous Operations Register",
    ],
    correctAnswer:
      "Reporting of Injuries, Diseases and Dangerous Occurrences Regulations",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "A work-related fatality must be reported under:",
    options: ["COSHH", "RIDDOR", "PPE Regulations", "HASAWA only"],
    correctAnswer: "RIDDOR",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the most common cause of major workplace injuries?",
    options: ["Fire", "Electrical shock", "Slips, trips and falls", "Noise"],
    correctAnswer: "Slips, trips and falls",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which is a common cause of slips and trips?",
    options: [
      "Clean walkways",
      "Good lighting",
      "Trailing cables",
      "Safety signs",
    ],
    correctAnswer: "Trailing cables",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What should be done after a spill occurs?",
    options: [
      "Ignore it",
      "Clean it immediately and use warning signs",
      "Cover it with paper",
      "Wait for maintenance",
    ],
    correctAnswer: "Clean it immediately and use warning signs",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "How many elements are needed for a fire to continue burning?",
    options: ["One", "Two", "Three", "Four"],
    correctAnswer: "Three",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which element is NOT part of the fire triangle?",
    options: ["Fuel", "Oxygen", "Heat", "Water"],
    correctAnswer: "Water",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Removing fuel from a work area helps to:",
    options: [
      "Increase fire risk",
      "Prevent fires",
      "Increase oxygen",
      "Reduce inspections",
    ],
    correctAnswer: "Prevent fires",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Work-related stress can lead to:",
    options: [
      "Improved concentration",
      "Anxiety and ill health",
      "Higher productivity only",
      "Reduced training needs",
    ],
    correctAnswer: "Anxiety and ill health",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which is a common sign of work-related stress?",
    options: [
      "Improved attendance",
      "Increased absence",
      "Better sleep",
      "Fewer mistakes",
    ],
    correctAnswer: "Increased absence",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "A manager can help reduce stress by:",
    options: [
      "Ignoring concerns",
      "Keeping workloads manageable",
      "Increasing pressure",
      "Removing breaks",
    ],
    correctAnswer: "Keeping workloads manageable",
    marks: 2,
  },

  {
    type: "mcq",
    prompt:
      "Exposure above what noise level requires action according to the course?",
    options: ["60 dB(A)", "75 dB(A)", "85 dB(A)", "100 dB(A)"],
    correctAnswer: "85 dB(A)",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Hearing damage caused by excessive noise is generally:",
    options: ["Temporary", "Permanent", "Minor", "Predictable"],
    correctAnswer: "Permanent",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "COSHH relates to:",
    options: [
      "Fire prevention",
      "Control of Substances Hazardous to Health",
      "Manual handling",
      "Environmental protection",
    ],
    correctAnswer: "Control of Substances Hazardous to Health",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Before using a chemical, workers should check the:",
    options: [
      "Payroll record",
      "Safety Data Sheet",
      "Attendance register",
      "Training certificate",
    ],
    correctAnswer: "Safety Data Sheet",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which is a preferred control for hazardous chemicals?",
    options: [
      "Substitution",
      "Ignoring the hazard",
      "Increasing exposure",
      "Removing labels",
    ],
    correctAnswer: "Substitution",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Local Exhaust Ventilation (LEV) is used to:",
    options: [
      "Increase temperature",
      "Control airborne contaminants",
      "Reduce lighting",
      "Improve payroll",
    ],
    correctAnswer: "Control airborne contaminants",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Extreme temperatures can affect:",
    options: [
      "Only machinery",
      "Concentration and health",
      "Company profits only",
      "Training records",
    ],
    correctAnswer: "Concentration and health",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which is an example of a proactive indicator?",
    options: [
      "Number of accidents",
      "Number of safety inspections completed",
      "Compensation claims",
      "Lost workdays",
    ],
    correctAnswer: "Number of safety inspections completed",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which is an example of a reactive indicator?",
    options: [
      "Toolbox talks delivered",
      "Training completion rate",
      "Number of accidents reported",
      "Risk assessments completed",
    ],
    correctAnswer: "Number of accidents reported",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What do proactive indicators help organisations do?",
    options: [
      "Identify problems before accidents occur",
      "Record past injuries only",
      "Calculate salaries",
      "Avoid inspections",
    ],
    correctAnswer: "Identify problems before accidents occur",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "An audit is mainly used to:",
    options: [
      "Check whether the safety management system is working",
      "Train new employees",
      "Calculate profits",
      "Issue penalties",
    ],
    correctAnswer: "Check whether the safety management system is working",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "An internal audit is carried out by:",
    options: [
      "External regulators",
      "Independent consultants only",
      "Staff within the organisation",
      "Customers",
    ],
    correctAnswer: "Staff within the organisation",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "A major advantage of an external audit is:",
    options: [
      "Lower cost",
      "Independence and objectivity",
      "Faster recruitment",
      "Reduced training",
    ],
    correctAnswer: "Independence and objectivity",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Strong and active leadership means managers should:",
    options: [
      "Avoid discussing safety",
      "Visibly support and promote safety",
      "Leave safety to workers",
      "Focus only on production",
    ],
    correctAnswer: "Visibly support and promote safety",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why is worker involvement important?",
    options: [
      "Workers understand the real risks",
      "It reduces inspections",
      "It removes legal duties",
      "It replaces training",
    ],
    correctAnswer: "Workers understand the real risks",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Workers should be involved in:",
    options: [
      "Risk assessments and inspections",
      "Payroll processing only",
      "Marketing activities",
      "Sales meetings",
    ],
    correctAnswer: "Risk assessments and inspections",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Assessment and review help organisations:",
    options: [
      "Hide problems",
      "Identify and improve weaknesses",
      "Reduce communication",
      "Avoid audits",
    ],
    correctAnswer: "Identify and improve weaknesses",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What gets measured gets:",
    options: ["Ignored", "Managed", "Delayed", "Cancelled"],
    correctAnswer: "Managed",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Near miss reporting is considered a:",
    options: [
      "Reactive measure only",
      "Proactive indicator",
      "Legal penalty",
      "Root cause",
    ],
    correctAnswer: "Proactive indicator",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "The IOSH Managing Safely course encourages managers to:",
    options: [
      "React only after accidents",
      "Manage safety proactively",
      "Avoid worker consultation",
      "Focus only on compliance",
    ],
    correctAnswer: "Manage safety proactively",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which statement best reflects good health and safety management?",
    options: [
      "Safety is everyone's responsibility",
      "Only the safety officer is responsible",
      "Workers manage safety alone",
      "Managers are not involved",
    ],
    correctAnswer: "Safety is everyone's responsibility",
    marks: 2,
  },
];

// ================= QUIZ ID =================

// Existing quiz where questions should be inserted
const QUIZ_ID = "6a1a8b652167ae49b44aa6a9";

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
