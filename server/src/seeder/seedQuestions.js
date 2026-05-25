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
    prompt: "Damaged tools should be:",
    options: [
      "Used carefully",
      "Ignored",
      "Repaired or replaced",
      "Stored only",
    ],
    correctAnswer: "Repaired or replaced",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Which of the following is a hand tool?",
    options: ["Drill machine", "Hammer", "Crane", "Conveyor"],
    correctAnswer: "Hammer",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Power tools are operated by:",
    options: ["Hand only", "Electricity or air", "Water only", "Manual force"],
    correctAnswer: "Electricity or air",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "One major hazard of tools is:",
    options: ["Noise only", "Cuts and injuries", "Light", "Air"],
    correctAnswer: "Cuts and injuries",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "PPE for tool use includes:",
    options: [
      "Helmet only",
      "Gloves and eye protection",
      "Shoes only",
      "Mask only",
    ],
    correctAnswer: "Gloves and eye protection",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Tools should be stored:",
    options: ["Anywhere", "Properly and safely", "On floor", "In pockets"],
    correctAnswer: "Properly and safely",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Loose clothing near tools can:",
    options: [
      "Improve safety",
      "Cause accidents",
      "Increase speed",
      "Reduce risk",
    ],
    correctAnswer: "Cause accidents",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Electrical tools must be:",
    options: ["Wet", "Damaged", "Properly grounded", "Open"],
    correctAnswer: "Properly grounded",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Guards on machines are used to:",
    options: [
      "Increase speed",
      "Prevent contact with moving parts",
      "Reduce noise",
      "Improve design",
    ],
    correctAnswer: "Prevent contact with moving parts",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Only trained workers should:",
    options: [
      "Watch work",
      "Use tools and equipment",
      "Clean floor",
      "Take breaks",
    ],
    correctAnswer: "Use tools and equipment",
    marks: 1,
  },
];

// ================= QUIZ ID =================

// Existing quiz where questions should be inserted
const QUIZ_ID = "6a119811e2b2760b2bef6ddc";

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
