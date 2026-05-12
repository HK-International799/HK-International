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
      "A supervisor notices that workers are using a shortcut through a forklift route. Which action best reflects the main purpose of a workplace inspection?",
    options: [
      "To punish workers for unsafe behaviour",
      "To identify unsafe conditions and behaviours before harm occurs",
      "To calculate the organisation’s insurance premium",
      "To check whether employees are satisfied with their job",
    ],
    correctAnswer:
      "To identify unsafe conditions and behaviours before harm occurs",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A company reviews its safety management system, policies, legal compliance, and records. This is best described as:",
    options: [
      "Safety inspection",
      "Safety audit",
      "Toolbox talk",
      "Risk rating",
    ],
    correctAnswer: "Safety audit",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker says, “Risk means the danger itself.” Which explanation is most accurate?",
    options: [
      "Risk is the same as a hazard",
      "Risk is the likelihood and consequence of harm occurring",
      "Risk only means the number of accidents already recorded",
      "Risk means the cost of safety controls",
    ],
    correctAnswer:
      "Risk is the likelihood and consequence of harm occurring",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A cleaner uses a wet floor sign after mopping a corridor. Which type of control is this mainly?",
    options: [
      "Elimination",
      "Engineering control",
      "Administrative control",
      "Substitution",
    ],
    correctAnswer: "Administrative control",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "At home, a person replaces a damaged extension lead instead of taping it. Which hierarchy control is this closest to?",
    options: [
      "PPE",
      "Elimination of the unsafe item",
      "Training only",
      "Warning sign",
    ],
    correctAnswer: "Elimination of the unsafe item",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A kitchen worker handles strong cleaning chemicals. What should they check first to understand safe use, first aid, storage, and PPE?",
    options: [
      "Delivery note",
      "Safety Data Sheet",
      "Staff rota",
      "Customer feedback form",
    ],
    correctAnswer: "Safety Data Sheet",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Which one is the best example of substitution?",
    options: [
      "Wearing gloves when using a strong chemical",
      "Replacing a strong solvent with a less harmful water-based cleaner",
      "Displaying a warning poster about chemical burns",
      "Asking workers to be more careful",
    ],
    correctAnswer:
      "Replacing a strong solvent with a less harmful water-based cleaner",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "An office employee reports eye strain and neck pain from long computer use. What is the most suitable first action?",
    options: [
      "Tell the employee to ignore minor discomfort",
      "Carry out a workstation assessment",
      "Issue a fire extinguisher",
      "Remove the employee from all computer work permanently",
    ],
    correctAnswer: "Carry out a workstation assessment",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which situation is most likely to require a permit-to-work system?",
    options: [
      "Printing documents in an office",
      "Replacing a light bulb in a normal room",
      "Hot work near flammable material",
      "Carrying a laptop to a meeting",
    ],
    correctAnswer: "Hot work near flammable material",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "A risk assessment matrix is mainly used to:",
    options: [
      "Decide workers’ salaries",
      "Compare risks using likelihood and consequence",
      "Replace legal requirements",
      "Record attendance at training",
    ],
    correctAnswer:
      "Compare risks using likelihood and consequence",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Which statement best describes residual risk?",
    options: [
      "Risk before any control measures are applied",
      "Risk remaining after control measures are applied",
      "Risk that cannot be seen by workers",
      "Risk caused only by employee behaviour",
    ],
    correctAnswer:
      "Risk remaining after control measures are applied",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A home user stores bleach in a drink bottle to save space. What is the most important risk control?",
    options: [
      "Label it with a marker only",
      "Store it in the original labelled container",
      "Keep it near food so it is visible",
      "Dilute it without reading instructions",
    ],
    correctAnswer:
      "Store it in the original labelled container",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which fire extinguisher is generally most suitable for electrical equipment fires?",
    options: ["Water", "Foam only", "CO₂", "Wet chemical"],
    correctAnswer: "CO₂",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker is asked to lift heavy boxes repeatedly. Which control should be considered before relying on manual handling training alone?",
    options: [
      "Reduce the load weight or use mechanical assistance",
      "Tell the worker to lift faster",
      "Provide only a poster",
      "Ask the worker to sign a disclaimer",
    ],
    correctAnswer:
      "Reduce the load weight or use mechanical assistance",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "Which one best describes a hazard?",
    options: [
      "The chance of injury happening",
      "Anything with the potential to cause harm",
      "The final score in a risk matrix",
      "The amount of money spent on safety",
    ],
    correctAnswer:
      "Anything with the potential to cause harm",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A new worker does not understand the site emergency alarm. What has most likely failed?",
    options: [
      "Workplace induction",
      "Insurance procedure",
      "Purchasing process",
      "Payroll process",
    ],
    correctAnswer: "Workplace induction",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker with reduced mobility is moved closer to an accessible exit and provided adjusted duties. This is best described as:",
    options: [
      "Preferential treatment only",
      "Reasonable adjustment",
      "Disciplinary action",
      "Unsafe supervision",
    ],
    correctAnswer: "Reasonable adjustment",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which is the strongest control for preventing falls from height?",
    options: [
      "Asking workers to be careful",
      "Wearing a high-visibility vest",
      "Avoiding work at height where possible",
      "Giving workers a toolbox talk only",
    ],
    correctAnswer:
      "Avoiding work at height where possible",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A manager wants to know whether safety procedures are actually being followed on site. Which activity is most suitable?",
    options: [
      "Workplace inspection and observation",
      "Increasing overtime",
      "Reducing training time",
      "Removing safety signs",
    ],
    correctAnswer:
      "Workplace inspection and observation",
    marks: 1,
  },

  {
    type: "mcq",
    prompt: "A toolbox talk should mainly be:",
    options: [
      "Long, technical, and legalistic",
      "Short, focused, practical, and relevant to the job",
      "Only for managers",
      "Used instead of all formal training",
    ],
    correctAnswer:
      "Short, focused, practical, and relevant to the job",
    marks: 1,
  },

    {
    type: "mcq",
    prompt:
      "Which example best shows consultation with workers?",
    options: [
      "Management makes all safety decisions privately",
      "Workers are asked for views on new PPE before purchase",
      "Workers are told not to question procedures",
      "Safety rules are hidden in a file",
    ],
    correctAnswer:
      "Workers are asked for views on new PPE before purchase",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker reports a near miss where a box fell from a shelf but injured no one. What should the organisation do?",
    options: [
      "Ignore it because nobody was hurt",
      "Record and investigate it to prevent future harm",
      "Discipline the worker automatically",
      "Remove all shelves immediately",
    ],
    correctAnswer:
      "Record and investigate it to prevent future harm",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which is the best reason for investigating an accident?",
    options: [
      "To blame one person quickly",
      "To identify immediate and underlying causes",
      "To avoid keeping records",
      "To prove workers are always careless",
    ],
    correctAnswer:
      "To identify immediate and underlying causes",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which one is an example of an underlying cause of an incident?",
    options: [
      "Oil on the floor",
      "Worker slipping on oil",
      "Poor maintenance and lack of inspection system",
      "A person falling immediately after slipping",
    ],
    correctAnswer:
      "Poor maintenance and lack of inspection system",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker is using noisy machinery. Which control should come before issuing hearing protection?",
    options: [
      "Reduce noise at source where reasonably practicable",
      "Ask workers to tolerate the noise",
      "Give earplugs only after hearing damage occurs",
      "Remove all warning signs",
    ],
    correctAnswer:
      "Reduce noise at source where reasonably practicable",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which document usually explains what to do during fire, medical emergency, evacuation, and communication?",
    options: [
      "Emergency plan",
      "Purchase order",
      "Salary sheet",
      "Visitor book",
    ],
    correctAnswer: "Emergency plan",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A child at home can reach medicines kept on a low table. Which is the best safety control?",
    options: [
      "Tell the child not to touch them",
      "Store medicines in a locked or inaccessible place",
      "Place a warning label facing the child",
      "Keep medicines near sweets so they are not lost",
    ],
    correctAnswer:
      "Store medicines in a locked or inaccessible place",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which is the best example of PPE?",
    options: [
      "Guard on a machine",
      "Local exhaust ventilation",
      "Safety gloves",
      "Replacing a chemical",
    ],
    correctAnswer: "Safety gloves",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Why is PPE normally considered the last line of defence?",
    options: [
      "It removes the hazard completely",
      "It protects only the person wearing it and may fail if used incorrectly",
      "It is always more effective than engineering controls",
      "It removes the need for supervision",
    ],
    correctAnswer:
      "It protects only the person wearing it and may fail if used incorrectly",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker is asked to enter a tank that may contain toxic gas. What is the most important control approach?",
    options: [
      "Enter quickly before gas builds up",
      "Use confined space procedures, testing, supervision, rescue arrangements, and permit-to-work",
      "Wear normal shoes and continue",
      "Open a window nearby only",
    ],
    correctAnswer:
      "Use confined space procedures, testing, supervision, rescue arrangements, and permit-to-work",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which one is most likely to be a lagging safety indicator?",
    options: [
      "Number of safety inspections completed",
      "Number of accidents reported",
      "Percentage of workers trained",
      "Number of toolbox talks delivered",
    ],
    correctAnswer:
      "Number of accidents reported",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which one is most likely to be a leading safety indicator?",
    options: [
      "Number of lost-time injuries",
      "Number of workplace deaths",
      "Number of completed safety observations",
      "Number of compensation claims",
    ],
    correctAnswer:
      "Number of completed safety observations",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A company introduces a new machine. What should be done before workers start using it?",
    options: [
      "Allow only the fastest worker to try it",
      "Provide risk assessment, guarding checks, safe procedure, information, instruction, and training",
      "Wait for an accident to see what controls are needed",
      "Remove all warning labels",
    ],
    correctAnswer:
      "Provide risk assessment, guarding checks, safe procedure, information, instruction, and training",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker notices a damaged plug socket in the office. What should they do?",
    options: [
      "Continue using it carefully",
      "Report it and prevent use until repaired by a competent person",
      "Cover it with paper",
      "Pour water nearby to cool it",
    ],
    correctAnswer:
      "Report it and prevent use until repaired by a competent person",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which best describes competence in OSH?",
    options: [
      "Having confidence only",
      "Having suitable knowledge, skills, training, and experience",
      "Being the oldest worker",
      "Working quickly without supervision",
    ],
    correctAnswer:
      "Having suitable knowledge, skills, training, and experience",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A contractor arrives to carry out roof repairs. What should the organisation check before work begins?",
    options: [
      "Only whether the contractor is cheap",
      "Contractor competence, risk assessment, method statement, permits, insurance, and coordination",
      "Whether the contractor can start immediately without documents",
      "Whether the contractor brings their own tea",
    ],
    correctAnswer:
      "Contractor competence, risk assessment, method statement, permits, insurance, and coordination",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker repeatedly ignores a safe system of work. What is the best management response?",
    options: [
      "Ignore it if no accident has happened",
      "Check training, supervision, communication, workload, and apply fair enforcement if needed",
      "Remove all procedures",
      "Blame the safety officer only",
    ],
    correctAnswer:
      "Check training, supervision, communication, workload, and apply fair enforcement if needed",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which option best describes the purpose of a safe system of work?",
    options: [
      "To make work slower only",
      "To provide a planned method for doing work safely",
      "To replace all supervision",
      "To avoid the need for risk assessments",
    ],
    correctAnswer:
      "To provide a planned method for doing work safely",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A pregnant worker works with chemicals and heavy manual handling. What should the employer do?",
    options: [
      "Treat the worker exactly the same without review",
      "Carry out a specific risk assessment and make suitable adjustments",
      "Ask the worker to resign",
      "Only provide gloves",
    ],
    correctAnswer:
      "Carry out a specific risk assessment and make suitable adjustments",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A safety policy is signed by senior management but never communicated to workers. What is the main weakness?",
    options: [
      "The policy is automatically effective because it is signed",
      "Workers may not understand responsibilities, arrangements, and expectations",
      "It removes the need for training",
      "It replaces risk assessments",
    ],
    correctAnswer:
      "Workers may not understand responsibilities, arrangements, and expectations",
    marks: 1,
  },

  // QUESTIONS 41–80

  {
    type: "mcq",
    prompt:
      "A warehouse has no accidents for 18 months, but inspections repeatedly find blocked pedestrian routes. What is the most accurate interpretation?",
    options: [
      "The risk is acceptably controlled because no harm has occurred.",
      "The lagging data is positive, but proactive evidence suggests control weakness.",
      "The inspection findings are only valid if an accident later confirms them.",
      "The blocked routes are only an audit issue, not a risk management concern.",
    ],
    correctAnswer:
      "The lagging data is positive, but proactive evidence suggests control weakness.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A risk assessment records: “Hazard: serious hand injury from blade contact.” What is the most precise criticism?",
    options: [
      "It identifies the hazard correctly because injury is the main concern.",
      "It mixes consequence and event, instead of identifying the hazardous source or situation.",
      "It should be accepted if the likelihood score is low.",
      "It is correct because hazard, risk and consequence are interchangeable in practice.",
    ],
    correctAnswer:
      "It mixes consequence and event, instead of identifying the hazardous source or situation.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which statement most accurately reflects reasonable foresight?",
    options: [
      "A risk is foreseeable only if the identical accident previously happened.",
      "A risk may be foreseeable if a competent person could reasonably anticipate the harmful event.",
      "A risk is foreseeable only after a formal investigation confirms it.",
      "A risk is not foreseeable where workers have been trained.",
    ],
    correctAnswer:
      "A risk may be foreseeable if a competent person could reasonably anticipate the harmful event.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A manager rejects machine guarding because “workers can be told to keep hands away.” What is the strongest criticism?",
    options: [
      "Verbal instruction is always enough if workers are experienced.",
      "The decision over-relies on administrative control instead of considering higher-order controls.",
      "The decision is acceptable if no previous injury has occurred.",
      "The decision is acceptable if PPE is also provided.",
    ],
    correctAnswer:
      "The decision over-relies on administrative control instead of considering higher-order controls.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which wording best separates likelihood from probability in IOSH-style risk assessment?",
    options: [
      "Likelihood is always a precise mathematical probability based on accident statistics.",
      "Likelihood is a judgement made after considering relevant factors, not always an exact calculation.",
      "Likelihood is the same as consequence when the harm is serious.",
      "Likelihood is not used where hazards are controlled.",
    ],
    correctAnswer:
      "Likelihood is a judgement made after considering relevant factors, not always an exact calculation.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A contractor’s RAMS is detailed but written for another site with different access, workers and emergency arrangements. What is the best judgement?",
    options: [
      "It is acceptable because detailed documents are normally sufficient.",
      "It is weak because the content may not match the actual task, people, place and controls.",
      "It is acceptable if the contractor has a good past safety record.",
      "It is weak only if the client has already rejected it.",
    ],
    correctAnswer:
      "It is weak because the content may not match the actual task, people, place and controls.",
    marks: 1,
  },

    {
    type: "mcq",
    prompt:
      "Which statement best distinguishes risk profile from risk appetite?",
    options: [
      "Risk profile describes the threats faced; risk appetite describes what the organisation is willing to tolerate to meet objectives.",
      "Risk profile is the final risk rating; risk appetite is the number of controls selected.",
      "Risk profile is used only for audits; risk appetite is used only for inspections.",
      "Risk profile and risk appetite both mean the same as likelihood.",
    ],
    correctAnswer:
      "Risk profile describes the threats faced; risk appetite describes what the organisation is willing to tolerate to meet objectives.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A learner writes: “The risk is the forklift truck.” What is the best correction?",
    options: [
      "Correct, because the physical object is always the risk.",
      "The forklift is more likely the hazard source; the risk concerns likelihood and consequence of harm such as collision.",
      "The forklift is the consequence because it may cause injury.",
      "The forklift is only a risk if an accident has already occurred.",
    ],
    correctAnswer:
      "The forklift is more likely the hazard source; the risk concerns likelihood and consequence of harm such as collision.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which option is the most accurate example of substitution?",
    options: [
      "Replacing a solvent-based product with a less hazardous water-based product.",
      "Giving workers chemical-resistant gloves.",
      "Writing a procedure for safe chemical handling.",
      "Monitoring workers to ensure they wear respiratory protection.",
    ],
    correctAnswer:
      "Replacing a solvent-based product with a less hazardous water-based product.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A company says, “Our risk is tolerable because the control is cheap and easy.” What is the strongest correction?",
    options: [
      "Cheap and easy controls are always reasonably practicable.",
      "Tolerability depends on risk level, control effectiveness and whether further sacrifice is proportionate.",
      "If a control is cheap, no further control review is needed.",
      "Tolerability is decided only by worker acceptance.",
    ],
    correctAnswer:
      "Tolerability depends on risk level, control effectiveness and whether further sacrifice is proportionate.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which finding is written in the strongest inspection style?",
    options: [
      "Storage is unsafe and workers need to improve discipline immediately.",
      "Poor housekeeping seen near dispatch area.",
      "Three pallets obstruct marked pedestrian walkway at dispatch bay, increasing collision risk; remove and reinforce storage controls.",
      "Walkways should be better controlled because the area looks untidy.",
    ],
    correctAnswer:
      "Three pallets obstruct marked pedestrian walkway at dispatch bay, increasing collision risk; remove and reinforce storage controls.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A supervisor says, “Audit and inspection are basically the same.” What is the best correction?",
    options: [
      "Both are identical because both produce corrective actions.",
      "Inspection usually examines workplace conditions; audit evaluates evidence against criteria.",
      "Inspection is always legal; audit is always voluntary.",
      "Audit is only for finance, while inspection is only for health and safety.",
    ],
    correctAnswer:
      "Inspection usually examines workplace conditions; audit evaluates evidence against criteria.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which example is most clearly proactive monitoring?",
    options: [
      "Reviewing accident reports after a lost-time injury.",
      "Analysing near-miss reports from the previous month.",
      "Inspecting a high-risk work area before the task starts.",
      "Investigating a dangerous occurrence after equipment failure.",
    ],
    correctAnswer:
      "Inspecting a high-risk work area before the task starts.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which example is most clearly reactive monitoring?",
    options: [
      "Planned audit of the permit-to-work process.",
      "Reviewing reported near misses after they occur.",
      "Pre-use inspection of lifting equipment.",
      "Toolbox talk before a high-risk task.",
    ],
    correctAnswer:
      "Reviewing reported near misses after they occur.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A worker returns after surgery and is assigned manual handling work. What is the best risk assessment approach?",
    options: [
      "Treat the worker as fully fit if they were experienced before surgery.",
      "Consider whether temporary health status affects task suitability, exposure and controls.",
      "Exclude the worker from all work permanently.",
      "Assess only the general task and not the individual circumstances.",
    ],
    correctAnswer:
      "Consider whether temporary health status affects task suitability, exposure and controls.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which statement about competence is most defensible?",
    options: [
      "A qualification alone proves competence in all circumstances.",
      "Long service proves competence even after processes change.",
      "Competence includes knowledge, skills, experience and attributes relevant to the specific role and task.",
      "Competence removes the need for supervision, monitoring and refresher training.",
    ],
    correctAnswer:
      "Competence includes knowledge, skills, experience and attributes relevant to the specific role and task.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A centre tells learners, “Passing this qualification means automatic TechIOSH.” What is the safest correction?",
    options: [
      "Correct, because the qualification itself grants TechIOSH.",
      "Incorrect, because it meets academic requirements, but IOSH criteria such as experience, membership and CPD may still apply.",
      "Correct only if the learner passes the MCQ examination first time.",
      "Incorrect, because IOSH Level 3 has no relationship with TechIOSH academic requirements.",
    ],
    correctAnswer:
      "Incorrect, because it meets academic requirements, but IOSH criteria such as experience, membership and CPD may still apply.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which option most accurately describes an occupational health service?",
    options: [
      "A system for checking housekeeping, signage and pedestrian routes.",
      "A service that may include health surveillance, fitness-to-work assessment and rehabilitation support.",
      "A disciplinary system for workers who breach PPE rules.",
      "A method for auditing financial loss after an accident.",
    ],
    correctAnswer:
      "A service that may include health surveillance, fitness-to-work assessment and rehabilitation support.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which specialist is best matched with the issue?",
    options: [
      "Ergonomist — poor manual handling posture and workstation design.",
      "Occupational hygienist — payroll error investigation.",
      "Acoustic specialist — biological monitoring programme.",
      "Asbestos specialist — safety culture survey design.",
    ],
    correctAnswer:
      "Ergonomist — poor manual handling posture and workstation design.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A near miss is best described as:",
    options: [
      "An event that caused injury but not property damage.",
      "An event that caused property damage but not injury.",
      "An event that caused no harm on this occasion but reasonably could have done.",
      "A hazard corrected before work began.",
    ],
    correctAnswer:
      "An event that caused no harm on this occasion but reasonably could have done.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A load drops from a crane hook and lands beside a rigger; no injury occurs. Best classification?",
    options: [
      "Accident.",
      "Near miss.",
      "Occupational ill-health.",
      "Unsafe act only.",
    ],
    correctAnswer: "Near miss.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which option is most likely an immediate cause?",
    options: [
      "No effective maintenance planning system exists.",
      "A worker’s glove contacts an exposed rotating shaft.",
      "Supervisors were not trained to check guarding standards.",
      "Previous similar near misses were not reviewed.",
    ],
    correctAnswer:
      "A worker’s glove contacts an exposed rotating shaft.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which option is most likely a root cause?",
    options: [
      "A worker trips on a trailing cable.",
      "A vehicle reverses into a pedestrian route.",
      "No system exists for identifying, reporting and correcting recurring cable-management defects.",
      "A box falls from a damaged shelf.",
    ],
    correctAnswer:
      "No system exists for identifying, reporting and correcting recurring cable-management defects.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which statement best distinguishes immediate, underlying and root causes?",
    options: [
      "Immediate causes are always worker errors; root causes are always legal failures.",
      "Immediate causes are closest to the event; underlying causes explain why they existed; root causes are deeper initiating failings.",
      "Immediate and root causes are the same when harm occurs.",
      "Underlying causes are only relevant if prosecution follows.",
    ],
    correctAnswer:
      "Immediate causes are closest to the event; underlying causes explain why they existed; root causes are deeper initiating failings.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "An investigation says, “Worker did not follow procedure.” Evidence shows the procedure was outdated, unavailable at the workplace, and supervisors had not briefed it. What is the best evaluation?",
    options: [
      "The conclusion is complete because the worker failed to follow the procedure.",
      "The conclusion is too narrow because system, communication and supervision failures may be involved.",
      "The conclusion is invalid only if the worker was injured.",
      "The conclusion is acceptable if the procedure existed somewhere in the system.",
    ],
    correctAnswer:
      "The conclusion is too narrow because system, communication and supervision failures may be involved.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which investigation sequence is most reliable?",
    options: [
      "Decide root cause, collect supporting evidence, issue discipline, close report.",
      "Preserve evidence, gather information, analyse causes, recommend controls linked to findings.",
      "Interview manager only, write conclusion, ask workers to sign.",
      "Identify immediate cause, ignore underlying causes, issue PPE.",
    ],
    correctAnswer:
      "Preserve evidence, gather information, analyse causes, recommend controls linked to findings.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which evidence is weakest if used alone?",
    options: [
      "CCTV footage showing the event.",
      "Training records for persons involved.",
      "Maintenance records for failed equipment.",
      "Unverified comments from employees who did not witness the event.",
    ],
    correctAnswer:
      "Unverified comments from employees who did not witness the event.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which statement best reflects Swiss Cheese thinking?",
    options: [
      "Incidents are usually caused by a single unsafe act.",
      "Several weak defences may align, allowing the incident to occur.",
      "PPE is always the final failed barrier.",
      "Root causes are unnecessary when immediate causes are obvious.",
    ],
    correctAnswer:
      "Several weak defences may align, allowing the incident to occur.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which incident causation statement is safest for this syllabus?",
    options: [
      "Heinrich’s Accident Triangle Theory is the key assessed model.",
      "Domino and Swiss Cheese theories are included for awareness; Heinrich’s Accident Triangle Theory is not assessed.",
      "Accident Triangle Theory should replace root cause analysis.",
      "Incident causation models are not part of the syllabus.",
    ],
    correctAnswer:
      "Domino and Swiss Cheese theories are included for awareness; Heinrich’s Accident Triangle Theory is not assessed.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A recommendation after repeated hand injuries says, “Workers must be careful.” What is the strongest criticism?",
    options: [
      "It is strong because it addresses behaviour directly.",
      "It is weak because it is vague and not linked to specific controls, causes, ownership or monitoring.",
      "It is acceptable if workers sign attendance at a briefing.",
      "It is strong if written in bold in the action plan.",
    ],
    correctAnswer:
      "It is weak because it is vague and not linked to specific controls, causes, ownership or monitoring.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which option best reflects incident cost analysis?",
    options: [
      "Only hospital and first-aid costs should be counted.",
      "Direct and indirect costs may include repair, disruption, investigation time and reputation effects.",
      "Incident cost analysis applies only to fatal accidents.",
      "Costs are outside incident management because prevention is the only concern.",
    ],
    correctAnswer:
      "Direct and indirect costs may include repair, disruption, investigation time and reputation effects.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A procedure is accurate but too complex for workers to understand. What is the best judgement?",
    options: [
      "It is effective because technical accuracy is enough.",
      "It may fail because communication must be clear and suitable for the audience.",
      "It is stronger because complex language increases seriousness.",
      "It removes the need for training because it is written.",
    ],
    correctAnswer:
      "It may fail because communication must be clear and suitable for the audience.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which action best supports positive OSH culture?",
    options: [
      "Publicly naming workers who make mistakes.",
      "Combining visible leadership, consultation, clear communication and consistent follow-up.",
      "Increasing the number of policies without checking use.",
      "Measuring culture only through accident frequency rate.",
    ],
    correctAnswer:
      "Combining visible leadership, consultation, clear communication and consistent follow-up.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which statement best reflects PDCA?",
    options: [
      "Prepare, document, circulate and archive.",
      "Plan arrangements, implement them, check performance and act on findings.",
      "Plan once and continue unless an accident happens.",
      "Punish, discipline, control and accuse.",
    ],
    correctAnswer:
      "Plan arrangements, implement them, check performance and act on findings.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A company implements controls but never checks whether workers understand or use them. Which PDCA weakness is clearest?",
    options: [
      "Weakness in Check and potentially Act.",
      "Weakness only in Plan.",
      "Weakness only in Do.",
      "No weakness if accidents remain low.",
    ],
    correctAnswer:
      "Weakness in Check and potentially Act.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Workers sign a procedure but cannot explain the control measures during questioning. Best conclusion?",
    options: [
      "Communication is complete because signatures exist.",
      "Understanding and effectiveness of communication are questionable.",
      "The issue is only an HR record problem.",
      "The procedure is invalid because workers forgot the wording.",
    ],
    correctAnswer:
      "Understanding and effectiveness of communication are questionable.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which toolbox talk approach is strongest?",
    options: [
      "Read the full legal policy to workers without discussion.",
      "Use recent/repeated incidents, simple audience-suitable language and allow questions.",
      "Use technical terms to make the talk sound professional.",
      "Deliver the same generic talk to all departments.",
    ],
    correctAnswer:
      "Use recent/repeated incidents, simple audience-suitable language and allow questions.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "Which statement best describes CSR within OSH management?",
    options: [
      "Charity donations outside work.",
      "Equality, diversity, inclusion, sustainability, environmental impact and ethical business practice.",
      "A legal prosecution defence.",
      "A replacement for risk assessment.",
    ],
    correctAnswer:
      "Equality, diversity, inclusion, sustainability, environmental impact and ethical business practice.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A chemical assessment jumps straight to respirators without considering exposure route, substitution, monitoring or health surveillance. Best criticism?",
    options: [
      "It is adequate because PPE is a recognised control.",
      "It is incomplete because it bypasses full risk evaluation and higher-order control consideration.",
      "It is acceptable if workers are trained to use respirators.",
      "It only needs review after illness is reported.",
    ],
    correctAnswer:
      "It is incomplete because it bypasses full risk evaluation and higher-order control consideration.",
    marks: 1,
  },

  {
    type: "mcq",
    prompt:
      "A risk assessment says “low risk” for rare confined-space entry with possible fatal outcome. Best criticism?",
    options: [
      "Rare work is automatically low risk.",
      "Severe reasonable worst consequence may still require robust controls despite low likelihood.",
      "Confined-space risk is assessed only after an incident.",
      "Low frequency removes the need for emergency arrangements.",
    ],
    correctAnswer:
      "Severe reasonable worst consequence may still require robust controls despite low likelihood.",
    marks: 1,
  },

];

// ================= QUIZ ID =================

// Existing quiz where questions should be inserted
const QUIZ_ID = "69fed9140b75fc186fddf076";

// ================= SEED FUNCTION =================

const importQuestions = async () => {
  try {
    // Connect DB
    await connectDB();

    // Insert all questions
    const insertedQuestions = await Question.insertMany(questions);

    // Extract all inserted question IDs
    const questionIds = insertedQuestions.map(
      (question) => question._id
    );

    // Calculate total marks
    const totalMarks = insertedQuestions.reduce(
      (sum, question) => sum + (question.marks || 0),
      0
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
      { new: true }
    );

    console.log(
      `✅ ${insertedQuestions.length} questions inserted successfully`
    );

    console.log(
      `✅ Quiz updated with ${questionIds.length} question IDs`
    );

    console.log("✅ Updated Quiz:", updatedQuiz._id);

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importQuestions();