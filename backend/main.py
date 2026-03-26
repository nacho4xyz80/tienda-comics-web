from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List # Añade esto arriba del todo
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

class CrearUsuario(BaseModel):
    nombre: str
    email: str
    password: str

class ItemCarrito(BaseModel):
    comic_id: int
    cantidad: int

class FinalizarCompra(BaseModel):
    usuario_id: int
    total: float
    items: List[ItemCarrito]

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

# Ruta para registrar un nuevo usuario
@app.post("/usuarios")
def registrar_usuario(usuario: CrearUsuario):
    conexion = get_db_connection()
    try:
        with conexion.cursor() as cursor:
            # Primero verificamos si el email ya existe
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (usuario.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="El email ya está registrado")
            
            # Si no existe, lo insertamos
            cursor.execute("INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)", 
                           (usuario.nombre, usuario.email, usuario.password))
            conexion.commit() # Guardar cambios en la base de datos
            return {"mensaje": "Usuario creado exitosamente"}
    finally:
        conexion.close()

# Ruta para eliminar un usuario
@app.delete("/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int):
    conexion = get_db_connection()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
            conexion.commit()
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return {"mensaje": "Cuenta eliminada correctamente"}
    finally:
        conexion.close()

# Ruta para procesar la compra
@app.post("/comprar")
def finalizar_compra(compra: FinalizarCompra):
    conexion = get_db_connection()
    try:
        with conexion.cursor() as cursor:
            # 1. Insertar la cabecera de la compra
            cursor.execute(
                "INSERT INTO compras (usuario_id, total) VALUES (%s, %s)",
                (compra.usuario_id, compra.total)
            )
            # Obtenemos el ID de la compra que MySQL acaba de generar
            compra_id = cursor.lastrowid 

            # 2. Insertar cada cómic en los detalles de la compra
            for item in compra.items:
                cursor.execute(
                    "INSERT INTO detalles_compra (compra_id, comic_id, cantidad) VALUES (%s, %s, %s)",
                    (compra_id, item.comic_id, item.cantidad)
                )
            
            # 3. Guardar todos los cambios definitivamente
            conexion.commit()
            
            return {"mensaje": "Compra realizada con éxito", "compra_id": compra_id}
    except Exception as e:
        conexion.rollback() # Si hay un error, deshacemos todo por seguridad
        raise HTTPException(status_code=500, detail=f"Error al procesar la compra: {str(e)}")
    finally:
        conexion.close()