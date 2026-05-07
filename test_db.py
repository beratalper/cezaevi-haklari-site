import sqlite3

conn = sqlite3.connect(r"C:\Projects\aym_kararlar_v2\db\aym_kararlar.db")
cur = conn.cursor()

cur.execute("""
select name
from sqlite_master
where type='table'
order by name
""")

for row in cur.fetchall():
    print(row[0])

conn.close()