
Item	Chi tiết
API 1	GET /tutor/courses/{courseId} 
respone : 
{
    "code": 0,
    "result": {
        "id": 1,
        "title": "IELTS Masterclass",
        "description": "Comprehensive IELTS preparation course",
        "duration": 8,
        "price": 199.00,
        "language": "English",
        "thumbnailURL": "https://cdn.linguahub.com/img/ielts.png",
        "categoryName": "English",
        "status": "Approved",
        "section": [
            {
                "sectionID": 1,
                "courseID": 1,
                "title": "Introduction to IELTS",
                "description": "Understand the IELTS structure",
                "orderIndex": 1,
                "lessons": [
                    {
                        "lessonID": 1,
                        "title": "Welcome & Orientation",
                        "duration": 10,
                        "lessonType": "Video",
                        "videoURL": "https://cdn.linguahub.com/videos/ielts_intro.mp4",
                        "content": "Welcome to the IELTS course",
                        "orderIndex": 1,
                        "createdAt": "2025-11-10T20:02:02",
                        "resources": [
                            {
                                "resourceID": 1,
                                "resourceType": "PDF",
                                "resourceTitle": "IELTS Overview",
                                "resourceURL": "https://cdn.linguahub.com/docs/ielts_overview.pdf",
                                "uploadedAt": "2025-11-10T20:02:02"
                            }
                        ]
                    }
                ]
            },
            {
                "sectionID": 2,
                "courseID": 1,
                "title": "Listening Skills",
                "description": "Focus on listening strategies",
                "orderIndex": 2,
                "lessons": [
                    {
                        "lessonID": 2,
                        "title": "Listening Test 1",
                        "duration": 15,
                        "lessonType": "Video",
                        "videoURL": "https://cdn.linguahub.com/videos/listening1.mp4",
                        "content": "Practice test explanation",
                        "orderIndex": 1,
                        "createdAt": "2025-11-10T20:02:02",
                        "resources": [
                            {
                                "resourceID": 2,
                                "resourceType": "ExternalLink",
                                "resourceTitle": "Listening Audio",
                                "resourceURL": "https://cdn.linguahub.com/audio/listening1.mp3",
                                "uploadedAt": "2025-11-10T20:02:02"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
API 2	PUT /tutor/courses/{courseId} 
request body: 
{
  "title": "IELTS Speaking Intensive (v2)",
  "description": "Updated syllabus",
  "duration": 80,
  "price": 229.99,
  "language": "English",
  "thumbnailURL": "https://.../new.png",
  "categoryID": 3
}
Responses:
{
  "code": 0,
  "message": "string",
  "result": {
    "id": 0,
    "title": "string",
    "description": "string",
    "duration": 0,
    "price": 0,
    "language": "string",
    "thumbnailURL": "string",
    "categoryName": "string",
    "status": "string"
  }
}
API 3	PUT /tutor/courses/sections/{sectionID} 
Request body
{
  "title": "string",
  "description": "string",
  "orderIndex": 0
}
respones:
{
  "code": 0,
  "message": "string",
  "result": {
    "sectionID": 0,
    "courseID": 0,
    "title": "string",
    "description": "string",
    "orderIndex": 0,
    "lessons": [
      {
        "lessonID": 0,
        "title": "string",
        "duration": 0,
        "lessonType": "Video",
        "videoURL": "string",
        "content": "string",
        "orderIndex": 0,
        "createdAt": "2025-11-10T06:11:36.654Z",
        "resources": [
          {
            "resourceID": 0,
            "resourceType": "PDF",
            "resourceTitle": "string",
            "resourceURL": "string",
            "uploadedAt": "2025-11-10T06:11:36.654Z"
          }
        ]
      }
    ]
  }
}
API 4	PUT /tutor/courses/sections/lessons/{lessonId} 
request body: 
{
  "title": "string",
  "duration": 600,
  "lessonType": "Video",
  "videoURL": "string",
  "content": "string",
  "orderIndex": 0
}
respones:
{
  "code": 0,
  "message": "string",
  "result": {
    "lessonID": 0,
    "title": "string",
    "duration": 0,
    "lessonType": "Video",
    "videoURL": "string",
    "content": "string",
    "orderIndex": 0,
    "createdAt": "2025-11-10T06:11:02.258Z",
    "resources": [
      {
        "resourceID": 0,
        "resourceType": "PDF",
        "resourceTitle": "string",
        "resourceURL": "string",
        "uploadedAt": "2025-11-10T06:11:02.258Z"
      }
    ]
  }
}
API 5	PUT /tutor/resources/{resourceId} 
request body: 
{
  "resourceType": "PDF",
  "resourceTitle": "string",
  "resourceURL": "https://G0iC\"sBFB\\|l^jcp)U|hCS8]BiI"
}
respones:
{
  "code": 0,
  "message": "string",
  "result": {
    "resourceID": 0,
    "resourceType": "PDF",
    "resourceTitle": "string",
    "resourceURL": "string",
    "uploadedAt": "2025-11-10T06:11:36.650Z"
  }
}
API 6	DELETE /tutor/courses/sections/{sectionID} 
{
  "code": 0,
  "message": "string",
  "result": {}
}
API 7	DELETE /tutor/courses/sections/lessons/{lessonId} 
{
  "code": 0,
  "message": "string",
  "result": {}
}
API 8	DELETE /tutor/resources/{resourceId} 
{
  "code": 0,
  "message": "string",
  "result": {}
}