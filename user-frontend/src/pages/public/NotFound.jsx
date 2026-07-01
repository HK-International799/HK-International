import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import SEO from "../../components/SEO";

export default function NotFound() {
  return (
    <MainLayout>
      <SEO
        title="Page Not Found | 1A HK International"
        description="The page you are looking for doesn't exist or has been moved. Browse our accredited IOSH, OTHM, OSHA, ISO and CIEH health & safety courses."
        url="https://hkinternational.uk/404"
        noIndex={true}
      />
      <div className="text-center py-40 px-6">
        <p className="text-indigo-600 font-semibold mb-2">404 Error</p>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Page not found
        </h1>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </Link>
          <Link
            to="/courses"
            className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
