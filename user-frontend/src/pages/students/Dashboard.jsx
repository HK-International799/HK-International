import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Award,
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  PlayCircle,
  ChevronRight,
  Bell,
  Target,
  Flame,
  Trophy
} from 'lucide-react';
import { student, courses, dashboardStats, upcomingDeadlines, notifications, leaderboard, activityLog } from '../../mock/studentData';
import { formatDistanceToNow, format, isAfter, parseISO } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className='p-3 rounded-xl'>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  </motion.div>
);

const CourseProgressCard = ({ course }) => {
  const progressColor = course.progress >= 75 ? 'bg-green-500' : course.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500';
  
  return (
    <Link to={`/student/courses/${course.id}`} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all"
      >
        <div className="relative h-32 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
           <span className={`text-xs font-medium px-2 py-1 rounded-full ${course.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>

              {course.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{course.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className='h-full rounded-full transition-all duration-500'
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <PlayCircle className="w-4 h-4" />
              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const DeadlineCard = ({ deadline }) => {
  const isUrgent = deadline.daysLeft <= 3 && deadline.status !== 'submitted';
  
  return (
    <Link
      to={`/student/assignments/${deadline.type === 'assignment' ? deadline.title.toLowerCase().replace(/\s+/g, '-') : deadline.id}`}
      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
     <div className={`p-2 rounded-lg ${
  isUrgent 
    ? 'bg-red-100' 
    : deadline.status === 'submitted' 
      ? 'bg-green-100' 
      : 'bg-orange-100'
}`}>
        <Calendar className={`w-5 h-5 ${
  isUrgent 
    ? 'text-red-600' 
    : deadline.status === 'submitted' 
      ? 'text-green-600' 
      : 'text-orange-600'
}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{deadline.title}</p>
        <p className="text-sm text-gray-500">{deadline.course}</p>
      </div>
      <div className="text-right">
       <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
          {deadline.status === 'submitted' ? 'Submitted' : `${deadline.daysLeft} days left`}
        </p>
        <p className="text-xs text-gray-500">
          {format(parseISO(deadline.dueDate), 'dd MMM yyyy')}
        </p>
      </div>
    </Link>
  );
};

const NotificationItem = ({ notification }) => {
  const typeStyles = {
    assignment: 'bg-blue-100 text-blue-600',
    deadline: 'bg-red-100 text-red-600',
    grade: 'bg-green-100 text-green-600',
    course: 'bg-purple-100 text-purple-600',
    certificate: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
  !notification.isRead ? 'bg-orange-50' : ''
}`}>
     <div className={`p-2 rounded-lg ${typeStyles[notification.type]}`}>
        <Bell className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const LeaderboardItem = ({ item }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl ${
  item.isCurrentUser 
    ? 'bg-orange-50 border border-orange-200' 
    : 'bg-gray-50'
}`}>
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
  item.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
  item.rank === 2 ? 'bg-gray-300 text-gray-700' :
  item.rank === 3 ? 'bg-orange-400 text-orange-900' :
  'bg-gray-200 text-gray-600'
}`}>
      {item.rank}
    </span>
    <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm truncate">
        {item.name}
        {item.isCurrentUser && <span className="text-orange-600 ml-1">(You)</span>}
      </p>
      <p className="text-xs text-gray-500">{item.courses} courses</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-900">{item.points}</p>
      <p className="text-xs text-gray-500">points</p>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const typeIcons = {
    lesson_completed: { icon: PlayCircle, color: 'bg-green-100 text-green-600' },
    assignment_submitted: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
    certificate_earned: { icon: Award, color: 'bg-yellow-100 text-yellow-600' },
    course_enrolled: { icon: BookOpen, color: 'bg-purple-100 text-purple-600' }
  };
  
  const { icon: Icon, color } = typeIcons[activity.type] || { icon: Target, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="flex items-start gap-3">
<div className={`p-2 rounded-lg ${color}`}>        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.course}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
      </span>
    </div>
  );
};

const Dashboard = () => {
  const inProgressCourses = courses.filter(c => c.status === 'in_progress');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-orange-500 pt-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {student.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-indigo-200 mt-1">
                  Continue your learning journey
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Streak Badge */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-white font-bold">{dashboardStats.streakDays}</p>
                  <p className="text-xs text-indigo-200">Day Streak</p>
                </div>
              </div>
              
              {/* Points Badge */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-bold">1,920</p>
                  <p className="text-xs text-indigo-200">Points</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Enrolled Courses"
            value={dashboardStats.enrolledCourses}
            color="bg-blue-500"
          />
          <StatCard
            icon={Award}
            label="Certificates"
            value={dashboardStats.certificatesEarned}
            color="bg-yellow-500"
          />
          <StatCard
            icon={Clock}
            label="Hours Learned"
            value={dashboardStats.totalHoursLearned}
            color="bg-purple-500"
          />
          <StatCard
            icon={FileText}
            label="Assignments Pending"
            value={dashboardStats.assignmentsPending}
            color="bg-orange-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                <Link
                  to="/student/courses"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {inProgressCourses.slice(0, 2).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CourseProgressCard course={course} />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Upcoming Deadlines */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
                <Link
                  to="/student/assignments"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="space-y-4">
                  {activityLog.slice(0, 4).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Notifications */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            </section>

            {/* Leaderboard */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="space-y-2">
                  {leaderboard.map((item) => (
                    <LeaderboardItem key={item.rank} item={item} />
                  ))}
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/student/courses"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Browse Courses</p>
                    <p className="text-sm text-gray-500">Explore new courses</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
                
                <Link
                  to="/student/certificates"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Certificates</p>
                    <p className="text-sm text-gray-500">View your achievements</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
                
                <Link
                  to="/student/results"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">My Results</p>
                    <p className="text-sm text-gray-500">Check your grades</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;