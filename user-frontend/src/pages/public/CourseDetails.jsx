import { useParams } from "react-router-dom";
import { Star, Users, Clock, Award } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";

const coursesData = [
  {
    id: 1,
    title: "IOSH Managing Safely",
    category: "Management",
    level: "Intermediate",
    duration: "3 Days",
    students: 1200,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    description:
      "IOSH Managing Safely is designed for managers and supervisors to help them manage health and safety effectively in the workplace.",
    outcomes: [
      "Understand responsibilities for workplace health & safety",
      "Learn risk assessment and hazard identification",
      "Investigate workplace incidents effectively",
      "Measure and improve safety performance",
    ],
  },
  {
    id: 2,
    title: "Display Screen Equipment (DSE)",
    category: "Workplace Safety",
    level: "Beginner",
    duration: "1 Day",
    students: 900,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    description:
      "Learn how to safely work with display screen equipment and reduce workplace ergonomic risks.",
    outcomes: [
      "Understand ergonomic hazards",
      "Improve workstation setup",
      "Reduce posture related injuries",
      "Improve workplace comfort and productivity",
    ],
  },
  {
    id: 3,
    title: "Workstation Risk Assessment",
    category: "Risk Assessment",
    level: "Intermediate",
    duration: "2 Days",
    students: 600,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    description:
      "Learn how to conduct workstation risk assessments and improve workplace safety standards.",
    outcomes: [
      "Identify workstation hazards",
      "Conduct structured risk assessments",
      "Improve employee workplace safety",
      "Reduce workplace injuries",
    ],
  },
];

export default function CourseDetails() {
  const { id } = useParams();

  const course = coursesData.find((c) => c.id === Number(id));

  if (!course) return <div className="p-20 text-center">Course not found</div>;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* HERO */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm">
                {course.category}
              </span>

              <h1 className="text-4xl font-bold mt-4 mb-4">{course.title}</h1>

              <p className="text-lg mb-6">{course.description}</p>

              {/* STATS */}
              <div className="flex flex-wrap gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  {course.duration}
                </span>

                <span className="flex items-center gap-2">
                  <Users size={18} />
                  {course.students} Students
                </span>

                <span className="flex items-center gap-2">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  {course.rating} Rating
                </span>
              </div>
            </div>

            {/* IMAGE */}
            <img src={course.image} className="rounded-xl shadow-xl" />
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
          {/* LEFT CONTENT */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">What You'll Learn</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {course.outcomes.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-lg shadow-sm border"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ENROLL CARD */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-fit sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Course Information</h3>

            <div className="space-y-3 text-gray-600">
              <p className="flex justify-between">
                <span>Level</span>
                <span className="font-medium">{course.level}</span>
              </p>

              <p className="flex justify-between">
                <span>Duration</span>
                <span className="font-medium">{course.duration}</span>
              </p>

              <p className="flex justify-between">
                <span>Certificate</span>
                <span className="flex items-center gap-1">
                  <Award size={16} />
                  Included
                </span>
              </p>
            </div>

            <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
              Enroll Now
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
