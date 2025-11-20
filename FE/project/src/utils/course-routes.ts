
export const getCourseEditRoute = (courseId: number | string): string => {
  return `/courses/${courseId}/content`;
};

export const getCourseDraftEditRoute = (courseId: number | string, draftId: number | string): string => {
  return `/courses/${courseId}/draft/${draftId}/content`;
};

export const getCourseDetailRoute = (courseId: number | string): string => {
  return `/courses/${courseId}/details`;
};

export const getCourseListRoute = (): string => {
  return '/courses';
};