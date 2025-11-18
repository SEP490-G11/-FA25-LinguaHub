import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { CourseDetailView } from '@/components/shared/CourseDetailView';
import { getCourseDetail, deleteCourse } from './api';
import { getCourseEditRoute, getCourseListRoute } from '@/utils/course-routes';
import type { CourseDetail as Course } from '@/pages/Admin/CourseApproval/types';

export default function TutorCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const data = await getCourseDetail(courseId!);
      console.log('📚 Course detail loaded:', {
        title: data.title,
        status: data.status,
        hasSections: !!data.section,
        sectionsCount: data.section?.length || 0,
      });
      setCourse(data);
    } catch (error: any) {
      console.error('Error fetching course detail:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (courseId: string) => {
    navigate(getCourseEditRoute(courseId));
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      return;
    }

    try {
      await deleteCourse(parseInt(courseId));
      
      toast({
        title: "Thành công",
        description: "Khóa học đã được xóa thành công",
      });
      
      navigate(getCourseListRoute());
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa khóa học",
        variant: "destructive",
      });
    }
  };

  return (
    <CourseDetailView
      course={course}
      loading={loading}
      backUrl={getCourseListRoute()}
      backLabel="Quay lại danh sách khóa học"
      showTutorActions={true}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}