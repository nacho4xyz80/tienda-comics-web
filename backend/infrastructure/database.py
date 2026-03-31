import pymysql

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='', # Pon tu contraseña si la tienes
        database='comics_db',
        cursorclass=pymysql.cursors.DictCursor
    )