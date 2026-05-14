import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Akashraj786@",
        database="olms_db"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT email, role FROM users")
    users = cursor.fetchall()
    for user in users:
        print(f"Email: {user[0]}, Role: {user[1]}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
