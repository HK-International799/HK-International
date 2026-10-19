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
    "Oil leaks from machinery onto the floor. Which action is a corrective action rather than a correction?",
  options: [
    "Mopping up the oil",
    "Placing a warning sign on the wet floor",
    "Investigating why the leak occurred and addressing the cause, such as a worn seal or missed maintenance",
    "Sending the injured worker for first aid",
  ],
  correctAnswer:
    "Investigating why the leak occurred and addressing the cause, such as a worn seal or missed maintenance",
  marks: 1,
},
{
  type: "mcq",
  prompt:
    "A forklift strikes a rack and no one is injured. Investigation finds poor visibility, congested storage and weak supervision. What approach is appropriate?",
  options: [
    "Focus only on the forklift operator",
    "Close the case because nobody was hurt",
    "Look at underlying system causes as well as the operator, to support learning and prevention rather than blame",
    "Discipline the operator and the supervisor",
  ],
  correctAnswer:
    "Look at underlying system causes as well as the operator, to support learning and prevention rather than blame",
  marks: 1,
},
{
  type: "mcq",
  prompt:
    "Workers keep bypassing a newly installed safety device. Can the corrective action be considered effective?",
  options: [
    "Yes, because the device was installed",
    "Yes, because the action log is closed",
    "No, completing an action does not prove it works; effectiveness must be verified with evidence",
    "No, but verification is optional",
  ],
  correctAnswer:
    "No, completing an action does not prove it works; effectiveness must be verified with evidence",
  marks: 1,
},
{
  type: "mcq",
  prompt:
    "The same incomplete risk assessments are found in audits two years running. What should the organisation do?",
  options: [
    "Ask HSE to update the documents again",
    "Investigate underlying system weaknesses such as unclear responsibilities, insufficient training or inadequate resources",
    "Reduce the number of audits",
    "Accept the finding as normal",
  ],
  correctAnswer:
    "Investigate underlying system weaknesses such as unclear responsibilities, insufficient training or inadequate resources",
  marks: 1,
},
{
  type: "mcq",
  prompt:
    "Which statement about new technology as an improvement opportunity is correct?",
  options: [
    "New technology is automatically safer",
    "New technology should be evaluated for hazards it may introduce",
    "New technology removes the need for risk assessment",
    "New technology cannot be an improvement opportunity",
  ],
  correctAnswer: "New technology should be evaluated for hazards it may introduce",
  marks: 1,
},
];

// ================= QUIZ ID =================

// Existing quiz where questions should be inserted
const QUIZ_ID = "6ad660371716beaee2bbd692";

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
