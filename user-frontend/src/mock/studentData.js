/**
 * Mock Data for Student Dashboard
 * This file contains all the fake data for student pages
 */

// ============================================
// STUDENT PROFILE DATA
// ============================================
export const student = {
  id: "stu_101",
  name: "Anurag Pandey",
  email: "anurag@demo.com",
  phone: "+44 7700 900123",
  avatar: "https://i.pravatar.cc/150?img=12",
  role: "student",
  enrolledCourses: ["1", "2", "3"],
  joinedAt: "2024-01-15",
  address: {
    street: "123 Safety Street",
    city: "London",
    country: "United Kingdom",
    postalCode: "SW1A 1AA"
  },
  bio: "Health and Safety Professional pursuing international certifications to enhance workplace safety knowledge.",
  socialLinks: {
    linkedin: "https://linkedin.com/in/anuragpandey",
    twitter: "https://twitter.com/anuragpandey"
  },
  notifications: {
    email: true,
    push: true,
    courseUpdates: true,
    assignments: true
  }
};

// ============================================
// COURSES DATA
// ============================================
export const courses = [
  {
    id: "1",
    title: "IOSH Managing Safely",
    slug: "iosh-managing-safely",
    instructor: "HK International",
    instructorId: "ins_101",
    progress: 65,
    duration: "3 Days",
    totalLessons: 12,
    completedLessons: 8,
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
    category: "Health & Safety",
    level: "Intermediate",
    rating: 4.8,
    totalStudents: 1250,
    description: "Globally recognized training for managers and supervisors to manage workplace health and safety effectively.",
    enrolledAt: "2024-02-01",
    lastAccessed: "2024-02-20",
    status: "in_progress",
    certificate: null,
    price: 450,
    currency: "GBP"
  },
  {
    id: "2",
    title: "Display Screen Equipment",
    slug: "display-screen-equipment",
    instructor: "HK International",
    instructorId: "ins_101",
    progress: 30,
    duration: "1 Day",
    totalLessons: 6,
    completedLessons: 2,
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
    category: "Ergonomics",
    level: "Beginner",
    rating: 4.5,
    totalStudents: 890,
    description: "Learn about proper display screen equipment setup and ergonomic practices for workplace safety.",
    enrolledAt: "2024-02-10",
    lastAccessed: "2024-02-18",
    status: "in_progress",
    certificate: null,
    price: 150,
    currency: "GBP"
  },
  {
    id: "3",
    title: "OTHM Level 6 Diploma in Occupational Health & Safety",
    slug: "othm-level-6-diploma",
    instructor: "Dr. Sarah Johnson",
    instructorId: "ins_102",
    progress: 100,
    duration: "6 Months",
    totalLessons: 24,
    completedLessons: 24,
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    category: "Professional Diploma",
    level: "Advanced",
    rating: 4.9,
    totalStudents: 450,
    description: "Professional diploma regulated in the UK for advanced occupational safety management.",
    enrolledAt: "2023-08-01",
    lastAccessed: "2024-01-15",
    status: "completed",
    certificate: {
      id: "cert1",
      issuedAt: "2024-01-20",
      credentialId: "OTHM-2024-STU101"
    },
    price: 2500,
    currency: "GBP"
  }
];

// ============================================
// LESSONS DATA
// ============================================
export const lessons = {
  "1": [
    {
      id: "l1",
      courseId: "1",
      sectionId: "s1",
      title: "Introduction to IOSH",
      description: "Learn about the Institution of Occupational Safety and Health and its importance in workplace safety.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "8:30",
      order: 1,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: [
        { name: "Introduction Slides", type: "pdf", url: "#" },
        { name: "IOSH Overview Document", type: "doc", url: "#" }
      ]
    },
    {
      id: "l2",
      courseId: "1",
      sectionId: "s1",
      title: "Risk Assessment Basics",
      description: "Understanding the fundamentals of risk assessment in the workplace.",
      video: "https://www.youtube.com/embed/jNQXAC9IVRw",
      duration: "10:00",
      order: 2,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l3",
      courseId: "1",
      sectionId: "s1",
      title: "Hazard Identification",
      description: "Learn how to identify various types of workplace hazards.",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "12:45",
      order: 3,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: [
        { name: "Hazard Checklist", type: "pdf", url: "#" }
      ]
    },
    {
      id: "l4",
      courseId: "1",
      sectionId: "s2",
      title: "Controlling Workplace Hazards",
      description: "Methods and strategies for controlling identified hazards.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "15:00",
      order: 4,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l5",
      courseId: "1",
      sectionId: "s2",
      title: "Safety Management Systems",
      description: "Introduction to safety management systems and their implementation.",
      video: "https://www.youtube.com/embed/jNQXAC9IVRw",
      duration: "18:30",
      order: 5,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l6",
      courseId: "1",
      sectionId: "s2",
      title: "Measuring Safety Performance",
      description: "How to measure and evaluate safety performance in organizations.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "14:20",
      order: 6,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l7",
      courseId: "1",
      sectionId: "s3",
      title: "Fire Safety Fundamentals",
      description: "Understanding fire safety principles and prevention.",
      video: "https://www.youtube.com/embed/jNQXAC9IVRw",
      duration: "16:00",
      order: 7,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l8",
      courseId: "1",
      sectionId: "s3",
      title: "Emergency Procedures",
      description: "Developing and implementing emergency response procedures.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "11:45",
      order: 8,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l9",
      courseId: "1",
      sectionId: "s3",
      title: "Workplace Environment",
      description: "Managing workplace environment factors affecting health and safety.",
      video: "https://www.youtube.com/embed/jNQXAC9IVRw",
      duration: "13:30",
      order: 9,
      isCompleted: false,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l10",
      courseId: "1",
      sectionId: "s4",
      title: "Module 4 Quiz",
      description: "Test your knowledge on fire safety and emergency procedures.",
      duration: "20:00",
      order: 10,
      isCompleted: false,
      isLocked: false,
      type: "quiz",
      totalQuestions: 10,
      passingScore: 70
    },
    {
      id: "l11",
      courseId: "1",
      sectionId: "s4",
      title: "Final Assessment",
      description: "Comprehensive assessment covering all course modules.",
      duration: "45:00",
      order: 11,
      isCompleted: false,
      isLocked: true,
      type: "assignment"
    },
    {
      id: "l12",
      courseId: "1",
      sectionId: "s4",
      title: "Course Conclusion",
      description: "Summary and next steps after completing the course.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "5:00",
      order: 12,
      isCompleted: false,
      isLocked: true,
      type: "video",
      resources: []
    }
  ],
  "2": [
    {
      id: "l21",
      courseId: "2",
      sectionId: "s1",
      title: "Introduction to DSE",
      description: "Understanding Display Screen Equipment and its importance.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "6:30",
      order: 1,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l22",
      courseId: "2",
      sectionId: "s1",
      title: "Ergonomic Setup",
      description: "Learn the correct ergonomic setup for your workstation.",
      video: "https://www.youtube.com/embed/jNQXAC9IVRw",
      duration: "9:00",
      order: 2,
      isCompleted: true,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l23",
      courseId: "2",
      sectionId: "s1",
      title: "Health Risks and Prevention",
      description: "Common health risks associated with DSE and prevention strategies.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "8:45",
      order: 3,
      isCompleted: false,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l24",
      courseId: "2",
      sectionId: "s2",
      title: "Workstation Assessment",
      description: "How to conduct a proper workstation assessment.",
      video: "https://www.youtube.com/embed/jNQXAC9IVRw",
      duration: "10:15",
      order: 4,
      isCompleted: false,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l25",
      courseId: "2",
      sectionId: "s2",
      title: "Eye Care and Breaks",
      description: "Importance of regular breaks and eye care practices.",
      video: "https://www.youtube.com/embed/ysz5S6PUM-U",
      duration: "7:30",
      order: 5,
      isCompleted: false,
      isLocked: false,
      type: "video",
      resources: []
    },
    {
      id: "l26",
      courseId: "2",
      sectionId: "s2",
      title: "Final Quiz",
      description: "Test your knowledge on Display Screen Equipment.",
      duration: "15:00",
      order: 6,
      isCompleted: false,
      isLocked: false,
      type: "quiz",
      totalQuestions: 8,
      passingScore: 75
    }
  ]
};

// ============================================
// SECTIONS DATA
// ============================================
export const sections = {
  "1": [
    { id: "s1", title: "Module 1: Foundations of Safety", order: 1 },
    { id: "s2", title: "Module 2: Hazard Management", order: 2 },
    { id: "s3", title: "Module 3: Fire & Emergency", order: 3 },
    { id: "s4", title: "Module 4: Assessment & Conclusion", order: 4 }
  ],
  "2": [
    { id: "s1", title: "Module 1: Introduction to DSE", order: 1 },
    { id: "s2", title: "Module 2: Assessment & Best Practices", order: 2 }
  ]
};

// ============================================
// ASSIGNMENTS DATA
// ============================================
export const assignments = [
  {
    id: "asgn1",
    courseId: "1",
    courseName: "IOSH Managing Safely",
    title: "Workplace Risk Assessment Project",
    description: "Conduct a comprehensive risk assessment of your workplace or a hypothetical work environment. Identify at least 5 potential hazards, assess their risks, and propose control measures.",
    instructions: `
      <h3>Assignment Instructions:</h3>
      <ol>
        <li>Choose a workplace area or process to assess</li>
        <li>Identify at least 5 potential hazards</li>
        <li>For each hazard, complete a risk assessment matrix</li>
        <li>Propose control measures using the hierarchy of controls</li>
        <li>Include photographic evidence or diagrams where possible</li>
        <li>Submit your assessment as a PDF document</li>
      </ol>
    `,
    type: "project",
    totalMarks: 100,
    passingMarks: 50,
    dueDate: "2024-03-15T23:59:00Z",
    assignedAt: "2024-02-20T10:00:00Z",
    status: "pending", // pending, submitted, graded, overdue
    allowLateSubmission: true,
    latePenalty: 10, // percentage
    maxAttempts: 1,
    attachments: [
      { name: "Risk Assessment Template", type: "pdf", url: "#", size: "245KB" },
      { name: "Hazard Identification Guide", type: "pdf", url: "#", size: "180KB" }
    ],
    questions: [
      {
        id: "q1",
        type: "text",
        questionText: "Describe the workplace area you have chosen for this risk assessment. Include details about the type of work performed and the typical number of employees in this area.",
        marks: 15,
        wordLimit: { min: 100, max: 300 }
      },
      {
        id: "q2",
        type: "file",
        questionText: "Upload your completed risk assessment matrix (PDF format only, max 5MB).",
        marks: 40,
        allowedFormats: [".pdf"],
        maxSize: "5MB"
      },
      {
        id: "q3",
        type: "text",
        questionText: "Explain the control measures you have proposed for the highest-risk hazard identified. Justify your choice of control measures with reference to the hierarchy of controls.",
        marks: 30,
        wordLimit: { min: 200, max: 500 }
      },
      {
        id: "q4",
        type: "file",
        questionText: "Upload photographic evidence or diagrams supporting your risk assessment (JPG, PNG, or PDF, max 10MB total).",
        marks: 15,
        allowedFormats: [".jpg", ".jpeg", ".png", ".pdf"],
        maxSize: "10MB",
        allowMultiple: true
      }
    ]
  },
  {
    id: "asgn2",
    courseId: "1",
    courseName: "IOSH Managing Safely",
    title: "Safety Management System Analysis",
    description: "Analyze the safety management system of an organization and provide recommendations for improvement.",
    instructions: "Select an organization and analyze their existing safety management system against recognized standards such as ISO 45001.",
    type: "homework",
    totalMarks: 50,
    passingMarks: 25,
    dueDate: "2024-03-20T23:59:00Z",
    assignedAt: "2024-02-25T10:00:00Z",
    status: "submitted",
    submittedAt: "2024-03-18T14:30:00Z",
    allowLateSubmission: false,
    maxAttempts: 1,
    attachments: [],
    questions: [
      {
        id: "q1",
        type: "text",
        questionText: "Describe the organization's current safety management structure.",
        marks: 20,
        wordLimit: { min: 150, max: 400 }
      },
      {
        id: "q2",
        type: "text",
        questionText: "Provide 3 recommendations for improvement.",
        marks: 30,
        wordLimit: { min: 200, max: 600 }
      }
    ]
  },
  {
    id: "asgn3",
    courseId: "2",
    courseName: "Display Screen Equipment",
    title: "Workstation Assessment Checklist",
    description: "Complete a DSE workstation assessment for your own workstation and identify areas for improvement.",
    instructions: "Use the provided checklist to assess your current workstation setup.",
    type: "practical",
    totalMarks: 30,
    passingMarks: 20,
    dueDate: "2024-02-28T23:59:00Z",
    assignedAt: "2024-02-15T10:00:00Z",
    status: "graded",
    submittedAt: "2024-02-25T16:00:00Z",
    gradedAt: "2024-02-27T10:00:00Z",
    allowLateSubmission: true,
    maxAttempts: 2,
    attachments: [
      { name: "DSE Assessment Checklist", type: "pdf", url: "#", size: "120KB" }
    ],
    result: {
      totalMarks: 28,
      percentage: 93,
      grade: "A",
      feedback: "Excellent work! Your workstation assessment was thorough and your recommendations are practical. Well done!"
    },
    questions: [
      {
        id: "q1",
        type: "file",
        questionText: "Upload your completed DSE assessment checklist.",
        marks: 15,
        allowedFormats: [".pdf"],
        maxSize: "3MB"
      },
      {
        id: "q2",
        type: "text",
        questionText: "Summarize the key improvements you plan to make to your workstation.",
        marks: 15,
        wordLimit: { min: 50, max: 200 }
      }
    ]
  },
  {
    id: "asgn4",
    courseId: "1",
    courseName: "IOSH Managing Safely",
    title: "Emergency Evacuation Plan",
    description: "Design an emergency evacuation plan for a multi-story office building.",
    type: "project",
    totalMarks: 75,
    passingMarks: 40,
    dueDate: "2024-02-10T23:59:00Z",
    assignedAt: "2024-01-20T10:00:00Z",
    status: "overdue",
    allowLateSubmission: false,
    maxAttempts: 1,
    attachments: [],
    questions: [
      {
        id: "q1",
        type: "file",
        questionText: "Upload your evacuation plan diagram.",
        marks: 40,
        allowedFormats: [".pdf", ".jpg", ".png"],
        maxSize: "10MB"
      },
      {
        id: "q2",
        type: "text",
        questionText: "Describe the evacuation procedures.",
        marks: 35,
        wordLimit: { min: 200, max: 500 }
      }
    ]
  }
];

// ============================================
// SUBMISSIONS DATA
// ============================================
export const submissions = [
  {
    id: "sub1",
    assignmentId: "asgn2",
    studentId: "stu_101",
    attemptNumber: 1,
    submittedAt: "2024-03-18T14:30:00Z",
    status: "submitted", // draft, submitted, grading, graded, returned
    answers: [
      {
        questionId: "q1",
        textAnswer: "The organization has a dedicated Health and Safety department headed by a Safety Manager who reports directly to the Operations Director. The structure includes safety representatives in each department who conduct regular inspections and report hazards. The safety committee meets monthly to review incidents and discuss improvements..."
      },
      {
        questionId: "q2",
        textAnswer: "Recommendations:\n\n1. Implement a digital incident reporting system to improve tracking and analysis of safety data. This would enable real-time monitoring and faster response to emerging trends.\n\n2. Enhance employee safety training by introducing refresher courses every six months and developing role-specific safety modules.\n\n3. Establish key performance indicators (KPIs) for safety performance and integrate these into departmental objectives with management accountability..."
      }
    ],
    totalMarks: null,
    gradedBy: null,
    gradedAt: null,
    feedback: null
  },
  {
    id: "sub2",
    assignmentId: "asgn3",
    studentId: "stu_101",
    attemptNumber: 1,
    submittedAt: "2024-02-25T16:00:00Z",
    status: "graded",
    answers: [
      {
        questionId: "q1",
        fileAnswer: {
          name: "DSE_Assessment_Checklist_Anurag.pdf",
          url: "#",
          size: "1.2MB"
        },
        marks: 14,
        feedback: "Well completed checklist with detailed notes."
      },
      {
        questionId: "q2",
        textAnswer: "Key improvements I plan to make:\n\n1. Adjust monitor height to eye level using a monitor stand\n2. Get an ergonomic chair with better lumbar support\n3. Position keyboard at elbow height\n4. Improve lighting to reduce screen glare\n5. Take regular breaks using the 20-20-20 rule",
        marks: 14,
        feedback: "Practical and achievable improvements identified."
      }
    ],
    totalMarks: 28,
    percentage: 93,
    grade: "A",
    gradedBy: {
      id: "ins_101",
      name: "HK International"
    },
    gradedAt: "2024-02-27T10:00:00Z",
    feedback: "Excellent work! Your workstation assessment was thorough and your recommendations are practical. Well done!"
  }
];

// ============================================
// QUIZ DATA
// ============================================
export const quizzes = [
  {
    id: "quiz1",
    lessonId: "l10",
    courseId: "1",
    title: "Fire Safety and Emergency Procedures Quiz",
    description: "Test your knowledge on fire safety principles and emergency response procedures.",
    duration: 20, // minutes
    totalQuestions: 10,
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: true,
    showResults: "after_submission", // immediately, after_submission, after_due
    status: "available", // available, completed, locked
    attempts: 0,
    bestScore: null,
    questions: [
      {
        id: "qz1_1",
        type: "mcq",
        question: "What is the first action you should take upon discovering a fire?",
        options: [
          "Try to extinguish the fire",
          "Raise the alarm and alert others",
          "Collect your personal belongings",
          "Continue working if the fire is small"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz1_2",
        type: "mcq",
        question: "What does the acronym PASS stand for in fire extinguisher use?",
        options: [
          "Pull, Aim, Squeeze, Sweep",
          "Point, Activate, Spray, Stop",
          "Push, Angle, Shoot, Spread",
          "Press, Aim, Shoot, Sweep"
        ],
        correctAnswer: 0,
        marks: 1
      },
      {
        id: "qz1_3",
        type: "mcq",
        question: "Which type of fire extinguisher is suitable for electrical fires?",
        options: [
          "Water (Red)",
          "Foam (Cream)",
          "CO2 (Black)",
          "Wet Chemical (Yellow)"
        ],
        correctAnswer: 2,
        marks: 1
      },
      {
        id: "qz1_4",
        type: "mcq",
        question: "In an emergency evacuation, what should you do if you encounter smoke?",
        options: [
          "Run through it quickly",
          "Stay upright and cover your nose",
          "Crawl low under the smoke",
          "Wait for the smoke to clear"
        ],
        correctAnswer: 2,
        marks: 1
      },
      {
        id: "qz1_5",
        type: "mcq",
        question: "How often should fire drills be conducted in most workplaces?",
        options: [
          "Monthly",
          "Quarterly",
          "Annually",
          "Only when required by law"
        ],
        correctAnswer: 2,
        marks: 1
      },
      {
        id: "qz1_6",
        type: "mcq",
        question: "What is a fire assembly point?",
        options: [
          "A location where fire extinguishers are stored",
          "A designated safe area where people gather after evacuation",
          "The location of the fire alarm panel",
          "A meeting room for fire safety training"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz1_7",
        type: "mcq",
        question: "What is the primary purpose of a fire risk assessment?",
        options: [
          "To identify who is responsible for fire safety",
          "To identify fire hazards and people at risk",
          "To calculate the cost of fire equipment",
          "To satisfy insurance requirements only"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz1_8",
        type: "mcq",
        question: "Which of the following is NOT a class of fire?",
        options: [
          "Class A (Solid materials)",
          "Class B (Flammable liquids)",
          "Class E (Electrical)",
          "Class F (Cooking oils)"
        ],
        correctAnswer: 2,
        marks: 1,
        explanation: "Electrical fires are not given a specific class in the UK system; they are treated based on the fuel source once the electricity is isolated."
      },
      {
        id: "qz1_9",
        type: "mcq",
        question: "What should you do if your clothing catches fire?",
        options: [
          "Run to find water",
          "Stop, Drop, and Roll",
          "Try to pat it out with your hands",
          "Remove the burning clothing immediately"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz1_10",
        type: "mcq",
        question: "What information should be included in a fire action notice?",
        options: [
          "Only the fire brigade phone number",
          "Evacuation procedures and assembly point location",
          "Names of all fire wardens",
          "Cost of fire equipment"
        ],
        correctAnswer: 1,
        marks: 1
      }
    ]
  },
  {
    id: "quiz2",
    lessonId: "l26",
    courseId: "2",
    title: "Display Screen Equipment Quiz",
    description: "Test your knowledge on DSE setup and ergonomics.",
    duration: 15,
    totalQuestions: 8,
    passingScore: 75,
    maxAttempts: 2,
    shuffleQuestions: true,
    showResults: "after_submission",
    status: "available",
    attempts: 0,
    bestScore: null,
    questions: [
      {
        id: "qz2_1",
        type: "mcq",
        question: "What is the ideal distance between your eyes and the computer screen?",
        options: [
          "20-30 cm",
          "40-60 cm",
          "50-70 cm",
          "80-100 cm"
        ],
        correctAnswer: 2,
        marks: 1
      },
      {
        id: "qz2_2",
        type: "mcq",
        question: "The top of your monitor should be positioned:",
        options: [
          "Below eye level",
          "At eye level or slightly below",
          "Above eye level",
          "Position doesn't matter"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz2_3",
        type: "mcq",
        question: "What is the recommended duration for DSE work before taking a break?",
        options: [
          "30 minutes",
          "45 minutes",
          "60 minutes",
          "90 minutes"
        ],
        correctAnswer: 2,
        marks: 1
      },
      {
        id: "qz2_4",
        type: "mcq",
        question: "What does the 20-20-20 rule suggest?",
        options: [
          "Work for 20 minutes, take 20 seconds break, look 20 feet away",
          "Work for 20 hours, take 20 minutes break, 20 times a week",
          "20 exercises, 20 reps, 20 sets",
          "Work 20 feet from screen, 20 inches from keyboard, 20 cm from mouse"
        ],
        correctAnswer: 0,
        marks: 1
      },
      {
        id: "qz2_5",
        type: "mcq",
        question: "Your keyboard should be positioned so that your elbows are at approximately:",
        options: [
          "180 degrees (straight)",
          "90-110 degrees",
          "45 degrees",
          "Position doesn't matter"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz2_6",
        type: "mcq",
        question: "Which of the following is a common health issue associated with poor DSE setup?",
        options: [
          "Diabetes",
          "Repetitive Strain Injury (RSI)",
          "Hypertension",
          "Asthma"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz2_7",
        type: "mcq",
        question: "Your chair height should be adjusted so that:",
        options: [
          "Your feet dangle slightly",
          "Your feet are flat on the floor or on a footrest",
          "Your knees are higher than your hips",
          "Your legs are fully extended"
        ],
        correctAnswer: 1,
        marks: 1
      },
      {
        id: "qz2_8",
        type: "mcq",
        question: "Screen glare can be reduced by:",
        options: [
          "Increasing screen brightness",
          "Positioning the screen perpendicular to windows",
          "Working in complete darkness",
          "Using a larger monitor"
        ],
        correctAnswer: 1,
        marks: 1
      }
    ]
  }
];

// ============================================
// CERTIFICATES DATA
// ============================================
export const certificates = [
  {
    id: "cert1",
    studentId: "stu_101",
    courseId: "3",
    courseName: "OTHM Level 6 Diploma in Occupational Health & Safety",
    credentialId: "OTHM-2024-STU101",
    issuedAt: "2024-01-20",
    validUntil: null, // Lifetime validity
    grade: "Distinction",
    percentage: 92,
    instructor: "Dr. Sarah Johnson",
    verificationUrl: "https://verify.othm.org.uk/OTHM-2024-STU101",
    downloadUrl: "#",
    certificateImage: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800"
  }
];

// ============================================
// RESULTS DATA
// ============================================
export const results = [
  {
    id: "res1",
    type: "assignment",
    assignmentId: "asgn3",
    courseId: "2",
    courseName: "Display Screen Equipment",
    title: "Workstation Assessment Checklist",
    totalMarks: 30,
    obtainedMarks: 28,
    percentage: 93,
    grade: "A",
    status: "passed",
    submittedAt: "2024-02-25T16:00:00Z",
    gradedAt: "2024-02-27T10:00:00Z",
    feedback: "Excellent work! Your workstation assessment was thorough and your recommendations are practical."
  },
  {
    id: "res2",
    type: "assignment",
    assignmentId: "asgn2",
    courseId: "1",
    courseName: "IOSH Managing Safely",
    title: "Safety Management System Analysis",
    status: "pending",
    submittedAt: "2024-03-18T14:30:00Z"
  }
];

// ============================================
// NOTIFICATIONS DATA
// ============================================
export const notifications = [
  {
    id: "notif1",
    type: "assignment",
    title: "New Assignment Assigned",
    message: "Workplace Risk Assessment Project has been assigned in IOSH Managing Safely",
    isRead: false,
    createdAt: "2024-02-20T10:00:00Z",
    link: "/student/assignments/asgn1"
  },
  {
    id: "notif2",
    type: "deadline",
    title: "Assignment Due Soon",
    message: "Workstation Assessment Checklist is due in 3 days",
    isRead: true,
    createdAt: "2024-02-22T10:00:00Z",
    link: "/student/assignments/asgn3"
  },
  {
    id: "notif3",
    type: "grade",
    title: "Assignment Graded",
    message: "Your Workstation Assessment Checklist has been graded. You scored 28/30",
    isRead: true,
    createdAt: "2024-02-27T10:00:00Z",
    link: "/student/assignments/asgn3"
  },
  {
    id: "notif4",
    type: "course",
    title: "New Course Content",
    message: "New lesson 'Emergency Procedures' has been added to IOSH Managing Safely",
    isRead: false,
    createdAt: "2024-02-18T10:00:00Z",
    link: "/student/courses/1/lessons/l8"
  },
  {
    id: "notif5",
    type: "certificate",
    title: "Certificate Issued",
    message: "Congratulations! Your certificate for OTHM Level 6 Diploma has been issued",
    isRead: true,
    createdAt: "2024-01-20T10:00:00Z",
    link: "/student/certificates/cert1"
  }
];

// ============================================
// DASHBOARD STATS
// ============================================
export const dashboardStats = {
  enrolledCourses: 3,
  completedCourses: 1,
  inProgressCourses: 2,
  totalHoursLearned: 24,
  certificatesEarned: 1,
  assignmentsPending: 2,
  assignmentsSubmitted: 1,
  assignmentsGraded: 1,
  averageScore: 93,
  streakDays: 5,
  upcomingDeadlines: 2
};

// ============================================
// UPCOMING DEADLINES
// ============================================
export const upcomingDeadlines = [
  {
    id: "deadline1",
    type: "assignment",
    title: "Workplace Risk Assessment Project",
    course: "IOSH Managing Safely",
    dueDate: "2024-03-15T23:59:00Z",
    daysLeft: 24,
    status: "pending"
  },
  {
    id: "deadline2",
    type: "assignment",
    title: "Safety Management System Analysis",
    course: "IOSH Managing Safely",
    dueDate: "2024-03-20T23:59:00Z",
    daysLeft: 29,
    status: "submitted"
  }
];

// ============================================
// LEADERBOARD DATA
// ============================================
export const leaderboard = [
  { rank: 1, name: "Sarah Johnson", points: 2450, avatar: "https://i.pravatar.cc/150?img=1", courses: 8 },
  { rank: 2, name: "Michael Chen", points: 2380, avatar: "https://i.pravatar.cc/150?img=2", courses: 7 },
  { rank: 3, name: "Emma Wilson", points: 2150, avatar: "https://i.pravatar.cc/150?img=3", courses: 6 },
  { rank: 4, name: "Anurag Pandey", points: 1920, avatar: "https://i.pravatar.cc/150?img=12", courses: 3, isCurrentUser: true },
  { rank: 5, name: "James Brown", points: 1850, avatar: "https://i.pravatar.cc/150?img=5", courses: 5 }
];

// ============================================
// ACTIVITY LOG
// ============================================
export const activityLog = [
  {
    id: "act1",
    type: "lesson_completed",
    title: "Completed 'Emergency Procedures'",
    course: "IOSH Managing Safely",
    timestamp: "2024-02-20T15:30:00Z"
  },
  {
    id: "act2",
    type: "assignment_submitted",
    title: "Submitted 'Safety Management System Analysis'",
    course: "IOSH Managing Safely",
    timestamp: "2024-03-18T14:30:00Z"
  },
  {
    id: "act3",
    type: "certificate_earned",
    title: "Earned certificate for OTHM Level 6 Diploma",
    course: "OTHM Level 6 Diploma",
    timestamp: "2024-01-20T10:00:00Z"
  },
  {
    id: "act4",
    type: "course_enrolled",
    title: "Enrolled in Display Screen Equipment",
    course: "Display Screen Equipment",
    timestamp: "2024-02-10T10:00:00Z"
  }
];
