from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pymysql

# 1. Inicializar la aplicación
app = FastAPI(title="API Tienda de Cómics")

# 2. Configurar CORS (Vital para que el frontend pueda comunicarse)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se pone la URL exacta, "*" permite todas en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Función para conectar a MySQL
def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='', # Si pusiste contraseña en MySQL, escríbela aquí
        database='comics_db',
        cursorclass=pymysql.cursors.DictCursor # Devuelve los datos como diccionarios, ideal para JSON
    )

# 4. Modelos de datos (Pydantic) para recibir información del frontend
class LoginUsuario(BaseModel):
    email: str
    password: str

# --- ENDPOINTS (RUTAS) ---

# Ruta para obtener todos los cómics
@app.get("/comics")
def obtener_comics():
    conexion = get_db_connection()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM comics")
            comics = cursor.fetchall()
            return comics
    finally:
        conexion.close()

# Ruta para obtener un solo cómic por su ID
@app.get("/comics/{comic_id}")
def obtener_comic(comic_id: int):
    conexion = get_db_connection()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM comics WHERE id = %s", (comic_id,))
            comic = cursor.fetchone()
            if comic:
                return comic
            raise HTTPException(status_code=404, detail="Cómic no encontrado")
    finally:
        conexion.close()

# Ruta para el login de usuarios
@app.post("/login")
def login(usuario: LoginUsuario):
    conexion = get_db_connection()
    try:
        with conexion.cursor() as cursor:
            # En un proyecto real, las contraseñas se comparan usando hashes (ej. bcrypt)
            cursor.execute("SELECT id, nombre, email FROM usuarios WHERE email = %s AND password = %s", 
                           (usuario.email, usuario.password))
            user_db = cursor.fetchone()
            if user_db:
                return {"mensaje": "Login exitoso", "usuario": user_db}
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    finally:
        conexion.close()