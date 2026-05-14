import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Akashraj786@",
        database="course_lession_db"
    )
    cursor = conn.cursor(dictionary=True)
    
    # Find course
    cursor.execute("SELECT * FROM courses WHERE title LIKE '%React Foundation%'")
    courses = cursor.fetchall()
    print("Courses found:", courses)
    
    if courses:
        course_id = courses[0]['course_id']
        # Find lessons
        cursor.execute(f"SELECT * FROM lessons WHERE course_id = {course_id}")
        lessons = cursor.fetchall()
        print("\nLessons for course", course_id, ":")
        for l in lessons:
            print(f"ID: {l['lesson_id']}, Title: {l['title']}, Type: {l['content_type']}, URL: {l['content_url']}")
            
    conn.close()
except Exception as e:
    print("Error:", e)
