import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Akashraj786@",
        database="olms_db"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT email, password_hash, role FROM users LIMIT 5")
    users = cursor.fetchall()
    for user in users:
        print(f"Email: {user[0]}, Hash: {user[1][:10]}..., Role: {user[2]}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
