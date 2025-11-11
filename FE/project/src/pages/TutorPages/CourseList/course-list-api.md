API 1	GET /tutor/courses/me 
respone: 
{
    "code": 0,
    "result": [
        {
            "id": 1,
            "title": "IELTS Masterclass",
            "description": "Comprehensive IELTS preparation course",
            "duration": 8,
            "price": 199.00,
            "language": "English",
            "thumbnailURL": "https://cdn.linguahub.com/img/ielts.png",
            "categoryName": "English",
            "status": "Approved"
        },
        {
            "id": 2,
            "title": "Business English Basics",
            "description": "Improve your business communication",
            "duration": 6,
            "price": 99.00,
            "language": "English",
            "thumbnailURL": "https://cdn.linguahub.com/img/business.png",
            "categoryName": "English",
            "status": "Approved"
        }
    ]
}
sau khi bấm vào quản lí khóa học thì sẽ chuyển đến trang ManageCourseContent với courseID tương ứng để chỉnh sửa 