import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')

DATABASE_URL = os.getenv('DATABASE_URL')

# Read migration SQL
with open('backend/migrations/001_create_tasks_table.sql', 'r') as f:
    sql = f.read()

# Execute migration
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

try:
    cur.execute(sql)
    conn.commit()
    print("✅ Tasks table created successfully!")
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
finally:
    cur.close()
    conn.close()
