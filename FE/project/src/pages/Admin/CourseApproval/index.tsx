import { useState, useEffect } from 'react';
import { adminApi, PendingCourse, CourseDetail } from '@/queries/admin-api';
import { CourseList } from './components/course-list';
import { CourseDetailModal } from './components/course-detail-modal';
import { Filters } from './components/filters';
import { Pagination } from './components/pagination';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CheckCircle2, Filter, BookOpen } from 'lucide-react';

// ============================================================================
// MOCK DATA - Remove when backend is ready
// ============================================================================
const MOCK_COURSES_WITH_SECTIONS: CourseDetail[] = [
  {
    id: '1',
    courseId: 'course-1',
    title: 'Complete IELTS Preparation Course',
    description: 'Comprehensive IELTS prep covering all four bands with practice tests and expert tips.',
    category_id: 'ielts',
    category: { id: 'ielts', name: 'IELTS' },
    tutor_id: 'tutor-1',
    tutor: { id: 'tutor-1', name: 'John Smith', email: 'john@example.com' },
    status: 'pending',
    thumbnail: 'https://images.unsplash.com/photo-1522869635100-ce89f6b7cccf?w=400&h=300&fit=crop',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 40,
    price_vnd: 1500000,
    languages: ['English'],
    sections: [
      {
        id: 'sec-1-1',
        title: 'Module 1: Listening Basics',
        description: 'Introduction to IELTS listening section format and strategies',
        order_index: 0,
        lessons: [
          {
            id: 'les-1-1-1',
            title: 'Introduction to IELTS Listening',
            duration_minutes: 15,
            video_url: 'https://example.com/video1.mp4',
            order_index: 0,
          },
          {
            id: 'les-1-1-2',
            title: 'Understanding Question Types',
            duration_minutes: 20,
            video_url: 'https://example.com/video2.mp4',
            order_index: 1,
          },
          {
            id: 'les-1-1-3',
            title: 'Practice Exercise 1',
            duration_minutes: 30,
            video_url: 'https://example.com/video3.mp4',
            order_index: 2,
          },
        ],
      },
      {
        id: 'sec-1-2',
        title: 'Module 2: Reading Strategies',
        description: 'Advanced reading comprehension techniques',
        order_index: 1,
        lessons: [
          {
            id: 'les-1-2-1',
            title: 'Skimming and Scanning',
            duration_minutes: 25,
            video_url: 'https://example.com/video4.mp4',
            order_index: 0,
          },
          {
            id: 'les-1-2-2',
            title: 'Vocabulary Building',
            duration_minutes: 20,
            video_url: 'https://example.com/video5.mp4',
            order_index: 1,
          },
        ],
      },
      {
        id: 'sec-1-3',
        title: 'Module 3: Writing Tasks',
        description: 'IELTS writing section preparation',
        order_index: 2,
        lessons: [
          {
            id: 'les-1-3-1',
            title: 'Task 1: Academic Writing',
            duration_minutes: 35,
            video_url: 'https://example.com/video6.mp4',
            order_index: 0,
          },
          {
            id: 'les-1-3-2',
            title: 'Task 2: Essay Writing',
            duration_minutes: 40,
            video_url: 'https://example.com/video7.mp4',
            order_index: 1,
          },
          {
            id: 'les-1-3-3',
            title: 'Common Mistakes to Avoid',
            duration_minutes: 20,
            video_url: 'https://example.com/video8.mp4',
            order_index: 2,
          },
        ],
      },
    ],
  },
  {
    id: '2',
    courseId: 'course-2',
    title: 'TOPIK Master Level',
    description: 'Advanced Korean language course focused on TOPIK exam preparation and fluency.',
    category_id: 'topik',
    category: { id: 'topik', name: 'TOPIK' },
    tutor_id: 'tutor-2',
    tutor: { id: 'tutor-2', name: 'Park Min-jun', email: 'park@example.com' },
    status: 'pending',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f70a504f9?w=400&h=300&fit=crop',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 35,
    price_vnd: 1200000,
    languages: ['Korean'],
    sections: [
      {
        id: 'sec-2-1',
        title: 'Unit 1: Advanced Grammar',
        description: 'Complex Korean grammar structures for TOPIK level 5-6',
        order_index: 0,
        lessons: [
          {
            id: 'les-2-1-1',
            title: 'Passive Voice and Causative',
            duration_minutes: 30,
            video_url: 'https://example.com/video9.mp4',
            order_index: 0,
          },
          {
            id: 'les-2-1-2',
            title: 'Conditional Sentences',
            duration_minutes: 25,
            video_url: 'https://example.com/video10.mp4',
            order_index: 1,
          },
        ],
      },
      {
        id: 'sec-2-2',
        title: 'Unit 2: Listening Comprehension',
        description: 'TOPIK listening practice and strategies',
        order_index: 1,
        lessons: [
          {
            id: 'les-2-2-1',
            title: 'Conversation Practice',
            duration_minutes: 35,
            video_url: 'https://example.com/video11.mp4',
            order_index: 0,
          },
          {
            id: 'les-2-2-2',
            title: 'News and Announcements',
            duration_minutes: 30,
            video_url: 'https://example.com/video12.mp4',
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: '3',
    courseId: 'course-3',
    title: 'Business English for Professionals',
    description: 'Learn English for international business communication, negotiations, and presentations.',
    category_id: 'business-english',
    category: { id: 'business-english', name: 'Business English' },
    tutor_id: 'tutor-3',
    tutor: { id: 'tutor-3', name: 'Sarah Johnson', email: 'sarah@example.com' },
    status: 'pending',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 30,
    price_vnd: 1800000,
    languages: ['English'],
    sections: [
      {
        id: 'sec-3-1',
        title: 'Section 1: Corporate Communication',
        description: 'Professional email writing and meetings',
        order_index: 0,
        lessons: [
          {
            id: 'les-3-1-1',
            title: 'Business Email Writing',
            duration_minutes: 20,
            video_url: 'https://example.com/video13.mp4',
            order_index: 0,
          },
          {
            id: 'les-3-1-2',
            title: 'Meeting Skills and Etiquette',
            duration_minutes: 25,
            video_url: 'https://example.com/video14.mp4',
            order_index: 1,
          },
        ],
      },
      {
        id: 'sec-3-2',
        title: 'Section 2: Presentations',
        description: 'Delivering effective business presentations',
        order_index: 1,
        lessons: [
          {
            id: 'les-3-2-1',
            title: 'Structuring Your Presentation',
            duration_minutes: 30,
            video_url: 'https://example.com/video15.mp4',
            order_index: 0,
          },
          {
            id: 'les-3-2-2',
            title: 'Handling Q&A Sessions',
            duration_minutes: 20,
            video_url: 'https://example.com/video16.mp4',
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: '4',
    courseId: 'course-4',
    title: 'JLPT N2 Preparation',
    description: 'Intensive Japanese language course preparing students for the JLPT N2 level exam.',
    category_id: 'jlpt',
    category: { id: 'jlpt', name: 'JLPT' },
    tutor_id: 'tutor-4',
    tutor: { id: 'tutor-4', name: 'Tanaka Yuki', email: 'tanaka@example.com' },
    status: 'pending',
    thumbnail: 'https://images.unsplash.com/photo-1453928582348-e671d7b2b89f?w=400&h=300&fit=crop',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 45,
    price_vnd: 1600000,
    languages: ['Japanese'],
    sections: [
      {
        id: 'sec-4-1',
        title: 'Kanji and Vocabulary',
        description: 'N2 level kanji (1000 characters) and vocabulary mastery',
        order_index: 0,
        lessons: [
          {
            id: 'les-4-1-1',
            title: 'Kanji Stroke Order and Reading',
            duration_minutes: 40,
            video_url: 'https://example.com/video17.mp4',
            order_index: 0,
          },
          {
            id: 'les-4-1-2',
            title: 'Context and Synonyms',
            duration_minutes: 30,
            video_url: 'https://example.com/video18.mp4',
            order_index: 1,
          },
        ],
      },
      {
        id: 'sec-4-2',
        title: 'Grammar and Reading',
        description: 'Advanced grammar patterns and reading comprehension',
        order_index: 1,
        lessons: [
          {
            id: 'les-4-2-1',
            title: 'Complex Sentence Patterns',
            duration_minutes: 35,
            video_url: 'https://example.com/video19.mp4',
            order_index: 0,
          },
          {
            id: 'les-4-2-2',
            title: 'Reading Long Texts',
            duration_minutes: 45,
            video_url: 'https://example.com/video20.mp4',
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: '5',
    courseId: 'course-5',
    title: 'HSK Level 3 Complete Guide',
    description: 'Complete Mandarin Chinese course for HSK Level 3 certification with daily practice.',
    category_id: 'hsk',
    category: { id: 'hsk', name: 'HSK' },
    tutor_id: 'tutor-5',
    tutor: { id: 'tutor-5', name: 'Li Wei', email: 'li@example.com' },
    status: 'pending',
    thumbnail: 'https://images.unsplash.com/photo-1456390033282-dc264e30b8cc?w=400&h=300&fit=crop',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_hours: 50,
    price_vnd: 1900000,
    languages: ['Mandarin'],
    sections: [
      {
        id: 'sec-5-1',
        title: 'Part 1: Pinyin and Tones',
        description: 'Mastering Chinese pronunciation and tones',
        order_index: 0,
        lessons: [
          {
            id: 'les-5-1-1',
            title: 'Four Tones of Mandarin',
            duration_minutes: 25,
            video_url: 'https://example.com/video21.mp4',
            order_index: 0,
          },
          {
            id: 'les-5-1-2',
            title: 'Tone Combinations',
            duration_minutes: 20,
            video_url: 'https://example.com/video22.mp4',
            order_index: 1,
          },
        ],
      },
      {
        id: 'sec-5-2',
        title: 'Part 2: Characters and Radicals',
        description: 'Understanding character composition and meaning',
        order_index: 1,
        lessons: [
          {
            id: 'les-5-2-1',
            title: 'Common Radicals (300)',
            duration_minutes: 40,
            video_url: 'https://example.com/video23.mp4',
            order_index: 0,
          },
          {
            id: 'les-5-2-2',
            title: 'Compound Characters',
            duration_minutes: 35,
            video_url: 'https://example.com/video24.mp4',
            order_index: 1,
          },
        ],
      },
      {
        id: 'sec-5-3',
        title: 'Part 3: Grammar Basics',
        description: 'Basic sentence structure and grammar rules',
        order_index: 2,
        lessons: [
          {
            id: 'les-5-3-1',
            title: 'Subject-Verb-Object Order',
            duration_minutes: 25,
            video_url: 'https://example.com/video25.mp4',
            order_index: 0,
          },
          {
            id: 'les-5-3-2',
            title: 'Question Formation',
            duration_minutes: 20,
            video_url: 'https://example.com/video26.mp4',
            order_index: 1,
          },
        ],
      },
    ],
  },
];

export function CourseApprovalPage() {
  // ========================================================================
  // STATE
  // ========================================================================

  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<PendingCourse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // ========================================================================
  // FUNCTIONS
  // ========================================================================

  /**
   * Filter and paginate courses based on search and category
   */
  const filterAndPaginateCourses = (allCourses: PendingCourse[], page: number) => {
    let filtered = allCourses;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.tutor?.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category_id === selectedCategory);
    }

    // Calculate pagination
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedCourses = filtered.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filtered.length / limit);

    return { data: paginatedCourses, total: filtered.length, totalPages };
  };

  /**
   * Fetch pending courses from API with mock data fallback
   */
  const fetchCourses = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.getPendingCourses(page, limit, {
        search: searchQuery,
        category_id: selectedCategory,
      });

      setCourses(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(page);

      console.log(`✅ Loaded ${response.data.length} pending courses`);
    } catch (err: any) {
      // Fallback to mock data if API fails
      console.warn('⚠️ API failed, using mock data:', err.message);

      const result = filterAndPaginateCourses(MOCK_COURSES_WITH_SECTIONS, page);
      setCourses(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(page);

      setError(
        'Using demo data (backend not connected). Real data will appear when API is ready.'
      );
      console.log(`✅ Loaded ${result.data.length} demo courses`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initial load and when filters change
   */
  useEffect(() => {
    fetchCourses(1);
  }, [searchQuery, selectedCategory]);

  /**
   * Handle view course details
   */
  const handleViewDetails = (course: PendingCourse) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  /**
   * Handle approve course
   */
  const handleApproveCourse = async (courseId: string, adminNotes?: string) => {
    try {
      setIsActionLoading(true);
      await adminApi.approveCourse(courseId, adminNotes);
      setSuccessMessage('✅ Course approved successfully!');
      setShowDetailModal(false);
      fetchCourses(currentPage);

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve course');
      console.error('❌ Approve error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Handle reject course
   */
  const handleRejectCourse = async (courseId: string, rejectionReason: string) => {
    try {
      setIsActionLoading(true);
      await adminApi.rejectCourse(courseId, rejectionReason);
      setSuccessMessage('✅ Course rejected successfully!');
      setShowDetailModal(false);
      fetchCourses(currentPage);

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject course');
      console.error('❌ Reject error:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  /**
   * Handle dismiss error
   */
  const handleDismissError = () => {
    setError(null);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* ========== HEADER SECTION ========== */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-600 text-white py-10 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-2 flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <BookOpen className="w-8 h-8" />
                </div>
                Course Approval Management
              </h1>
              <p className="text-blue-100 text-lg">Review and manage pending courses from talented tutors</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Pending Approval</p>
              <p className="text-4xl font-bold text-white mt-1">{total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ========== Success Message ========== */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top shadow-md">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* ========== Error Message ========== */}
        {error && !error.includes('demo data') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 justify-between animate-in fade-in slide-in-from-top shadow-sm">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={handleDismissError}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========== FILTER SECTION ========== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-8 mb-8 hover:shadow-lg transition-all">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Filter className="w-6 h-6 text-indigo-600" />
            Search & Filter Courses
          </h2>
          <Filters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <div className="mt-6 flex gap-2">
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-semibold"
            >
              ↻ Reset Filters
            </Button>
          </div>
        </div>

        {/* ========== COURSE LIST SECTION ========== */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Loading pending courses...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your courses</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-16 text-center hover:shadow-lg transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-indigo-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Pending Courses</h3>
            <p className="text-gray-600 text-lg">All submitted courses have been reviewed!</p>
            {(searchQuery || selectedCategory) && (
              <p className="text-gray-500 text-sm mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                💡 Try adjusting your search or filter criteria to find courses
              </p>
            )}
          </div>
        ) : (
          <>
            {/* ========== Courses List ========== */}
            <CourseList
              courses={courses}
              onViewDetails={handleViewDetails}
            />

            {/* ========== Professional Pagination ========== */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              limit={limit}
              isLoading={isLoading}
              onPageChange={fetchCourses}
            />
          </>
        )}
      </div>

      {/* ========== Detail Modal ========== */}
      {selectedCourse && (
        <CourseDetailModal
          isOpen={showDetailModal}
          course={selectedCourse}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCourse(null);
          }}
          onApprove={handleApproveCourse}
          onReject={handleRejectCourse}
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
}

export default CourseApprovalPage;
