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
    prompt: "What is the primary mission of OSHA?",
    options: [
      "Maximizing production efficiency",
      "Prioritizing financial gains",
      "Ensuring safe and healthful working conditions",
      "Minimizing operational costs",
    ],
    correctAnswer: "Ensuring safe and healthful working conditions",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What does OSHA stand for?",
    options: [
      "Occupational Safety and Health Act",
      "Office of Safety and Hazard Assessment",
      "Organization for Safety and Health Advocacy",
      "Occupational Safety and Health Administration",
    ],
    correctAnswer: "Occupational Safety and Health Administration",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "When is fall protection required in construction?",
    options: [
      "Only for workers at significant heights",
      "Whenever a worker is at a height of 6 feet or more",
      "Only for specific trades",
      "When convenient for the worker",
    ],
    correctAnswer: "Whenever a worker is at a height of 6 feet or more",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Which of the following is a fall protection system?",
    options: ["Hard hat", "Safety glasses", "Guardrails", "Work boots"],
    correctAnswer: "Guardrails",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the purpose of a personal fall arrest system?",
    options: [
      "Minimizing safety incidents",
      "Preventing falls",
      "Limiting worker mobility",
      "Ignoring safety regulations",
    ],
    correctAnswer: "Preventing falls",
    marks: 2,
  },

  {
    type: "mcq",
    prompt:
      "What is the correct procedure for using a ladder as a fall protection device?",
    options: [
      "Tie-off to the ladder",
      "Extend the ladder 3 feet above the landing surface",
      "Ignore ladder use for fall protection",
      "Use the ladder horizontally",
    ],
    correctAnswer: "Extend the ladder 3 feet above the landing surface",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why is it important to identify and label electrical hazards?",
    options: [
      "To expedite operations",
      "To maximize financial gains",
      "To prioritize regulatory compliance",
      "To prevent accidents and injuries",
    ],
    correctAnswer: "To prevent accidents and injuries",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "When should electrical equipment be inspected?",
    options: [
      "Only if it malfunctions",
      "Regularly, as part of a preventive maintenance program",
      "Whenever convenient for the worker",
      "When regulatory authorities request it",
    ],
    correctAnswer: "Regularly, as part of a preventive maintenance program",
    marks: 2,
  },

  {
    type: "mcq",
    prompt:
      "What is the minimum safe distance for equipment working near power lines?",
    options: ["5 feet", "10 feet", "15 feet", "20 feet"],
    correctAnswer: "10 feet",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What should be inspected before using a scaffold?",
    options: [
      "Only the top platform",
      "Only the guardrails",
      "All components of the scaffold",
      "Nothing, scaffolds don't need inspection",
    ],
    correctAnswer: "All components of the scaffold",
    marks: 2,
  },
  {
    type: "mcq",
    prompt: "How should ladders be positioned for use?",
    options: [
      "At any angle that is comfortable for the worker",
      "Against a structure at a 45-degree angle",
      "Straight up and down, perpendicular to the surface",
      "Leaning on another ladder for support",
    ],
    correctAnswer: "Against a structure at a 45-degree angle",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the maximum allowable gap between the planks?",
    options: ["1 inches", "2 inches", "12 inches", "6 inches"],
    correctAnswer: "1 inches",
    marks: 2,
  },

  {
    type: "mcq",
    prompt:
      "What is the primary hazard associated with excavations and trenches?",
    options: [
      "Falling objects",
      "Cave-ins",
      "Electrical shocks",
      "Confined spaces",
    ],
    correctAnswer: "Cave-ins",
    marks: 2,
  },

  {
    type: "mcq",
    prompt:
      "What is the minimum slope required for a stable excavation in soil?",
    options: ["1:1", "2:1", "3:1", "4:1"],
    correctAnswer: "1:1",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "When is a protective system required for excavations?",
    options: [
      "Only for deep excavations",
      "When soil conditions pose a cave-in hazard",
      "Only for excavations near structures",
      "Never, protective systems are optional",
    ],
    correctAnswer: "When soil conditions pose a cave-in hazard",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is a common protective system for trenching?",
    options: [
      "Ignoring safety regulations",
      "Sloping or benching",
      "Using the same trench for multiple workers",
      "No protective system is needed",
    ],
    correctAnswer: "Sloping or benching",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why is soil classification important in excavation safety?",
    options: [
      "To prioritize financial gains",
      "To expedite operations",
      "To determine appropriate protective measures",
      "To minimize safety incidents",
    ],
    correctAnswer: "To determine appropriate protective measures",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What defines a confined space?",
    options: [
      "Any enclosed area with limited access",
      "A space with sufficient ventilation",
      "Open areas without any barriers",
      "Spaces with unlimited entry points",
    ],
    correctAnswer: "Any enclosed area with limited access",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why is it crucial to have a permit for confined space entry?",
    options: [
      "To maximize operational speed",
      "To expedite operations",
      "To ensure proper safety measures are in place",
      "Permits are not necessary for confined spaces",
    ],
    correctAnswer: "To ensure proper safety measures are in place",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is a key consideration during confined space entry?",
    options: [
      "Ignoring safety regulations",
      "Continuous ventilation",
      "Limited communication",
      "Fast entry and exit",
    ],
    correctAnswer: "Continuous ventilation",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "When is atmospheric testing necessary in confined spaces?",
    options: [
      "Only if the space is completely sealed",
      "Never, atmospheric testing is optional",
      "Before entry and periodically during work",
      "Only if the space is poorly ventilated",
    ],
    correctAnswer: "Before entry and periodically during work",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the primary hazard in confined spaces?",
    options: ["Falls", "Fire hazards", "Respiratory hazards", "Noise hazards"],
    correctAnswer: "Respiratory hazards",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "How can electrical fires be prevented on a construction site?",
    options: [
      "Overloading circuits",
      "Ignoring electrical safety guidelines",
      "Regularly inspecting and maintaining equipment",
      "Using damaged electrical cords",
    ],
    correctAnswer: "Regularly inspecting and maintaining equipment",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "What is the purpose of a fire extinguisher?",
    options: [
      "Ignoring safety regulations",
      "To be used as a temporary lighting source",
      "To extinguish small fires",
      "To provide ventilation in case of fire",
    ],
    correctAnswer: "To extinguish small fires",
    marks: 2,
  },

  {
    type: "mcq",
    prompt: "Why is regular inspection of tools and equipment important?",
    options: [
      "To maximize operational speed",
      "To expedite operations",
      "To prevent accidents and ensure proper functioning",
      "Ignoring safety regulations",
    ],
    correctAnswer: "To prevent accidents and ensure proper functioning",
    marks: 2,
  },
];

// ================= QUIZ ID =================

// Existing quiz where questions should be inserted
const QUIZ_ID = "6a35726c130a0e0175577477";

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
