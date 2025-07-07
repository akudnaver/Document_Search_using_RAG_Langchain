import sqlite3

# connect to sqlite database and create a table
conn = sqlite3.connect('example.db')

# create a cursor object
cursor = conn.cursor()

# create a table , drop the table if it exists
cursor_obj.execute('DROP TABLE IF EXISTS users')


# creating a table
table = """create table IF NOT EXISTS INSTRUCTOR(ID INTEGER PRIMARY KEY NOT NULL, FNAME VARCHAR(20), LNAME VARCHAR(20), CITY VARCHAR(20), CCODE CHAR(2));"""

cursor_obj.execute(table)

print("Table created successfully")

cursor_obj.execute('''inset into INSTRUCTOR (ID, FNAME, LNAME, CITY, CCODE) values(1, 'John', 'Doe', 'New York', 'US')''')



