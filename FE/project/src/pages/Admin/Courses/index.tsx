import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from './api';
import { CourseCard, CourseFilters, Pagination } from './components';
import type { Course, CoursesFilters } from './types';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CoursesFilters>({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch all courses and pending count
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesData = await coursesApi.getAllCourses();
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...courses];
    
    console.log('🔍 Applying filters:', {
      totalCourses: courses.length,
      filters,
      hasSearch: !!filters.search,
      hasCategory: !!filters.category,
      hasStatus: !!filters.status
    });

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(course =>
        course.title?.toLowerCase().includes(searchLower) ||
        course.shortDescription?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(course => 
        course.category === filters.category || 
        course.categoryID?.toString() === filters.category ||
        course.categoryName === filters.category
      );
    }

    // Status filter (case-insensitive)
    if (filters.status) {
      result = result.filter(course => 
        course.status?.toUpperCase() === filters.status?.toUpperCase()
      );
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'price':
            return (b.price || 0) - (a.price || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });
    }

    console.log('✅ Filter result:', {
      filteredCount: result.length,
      originalCount: courses.length
    });
    
    setFilteredCourses(result);
    setCurrentPage(1);
  }, [filters, courses]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const handleCourseClick = (courseId: string | number) => {
    navigate(`/admin/courses/${courseId}`);
  };

  // Convert Course to PendingCourse format for CourseCard
  const convertToPendingCourse = (course: Course) => {
    const converted = {
      id: course.courseID || course.id,
      title: course.title,
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      requirement: course.requirement || '',
      level: course.level || 'BEGINNER',
      categoryID: course.categoryID || 0,
      categoryName: course.categoryName || course.category || 'Unknown',
      language: course.language || 'English',
      duration: course.duration || 0,
      price: course.price || 0,
      thumbnailURL: course.thumbnailURL || '',
      status: course.status || 'Pending',
      tutorID: course.tutorID || 0,
      tutorName: course.tutorName || 'Unknown',
      tutorEmail: course.tutorEmail || '',
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: course.updatedAt || new Date().toISOString(),
      isDraft: false,
    };
    
    // Debug: Log courses with Draft status
    if (course.status?.toLowerCase().includes('draft')) {
      console.log('🔍 Draft course found:', {
        title: course.title,
        status: course.status,
        converted: converted.status
      });
    }
    
    return converted;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý khóa học
        </h1>
        <p className="text-gray-600">
          Tổng số {courses.length} khóa học trên hệ thống
        </p>
      </div>



      {/* Filters */}
      <CourseFilters
        filters={filters}
        onFilterChange={setFilters}
        totalCount={filteredCourses.length}
      />

      {/* Course Grid */}
      {paginatedCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.courseID || course.id}
                course={convertToPendingCourse(course)}
                onClick={() => handleCourseClick(course.courseID || course.id)}
                variant="management"
                showPendingBadge={true}
                showDraftBadge={false}
                buttonText="Xem chi tiết"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={filteredCourses.length}
              limit={itemsPerPage}
              isLoading={loading}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
