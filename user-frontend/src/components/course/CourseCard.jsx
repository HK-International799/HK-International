export default function CourseCard({ title, instructor, price }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">

      <div className="h-40 bg-gray-200"></div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>

        <p className="text-gray-500 text-sm mt-1">
          Instructor: {instructor}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-blue-600 font-bold">${price}</span>

          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
            View
          </button>
        </div>
      </div>

    </div>
  );
}