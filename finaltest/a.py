import psycopg2
import os
from dotenv import load_dotenv


load_dotenv()


conn = psycopg2.connect(os.environ["DATABASE_URL"])
print("a")
with conn.cursor() as cur:
    cur.execute("INSERT INTO \"Recordings\" DEFAULT VALUES")
    cur
    conn.commit()
