import mysql.connector
import json

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Akashraj786@",
        database="olms_db"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = 'admin@gmail.com'")
    user = cursor.fetchone()
    if user:
        print(json.dumps(user, indent=2, default=str))
    else:
        print("Admin user not found")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
