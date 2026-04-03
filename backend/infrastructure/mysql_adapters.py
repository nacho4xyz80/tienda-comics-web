from typing import List, Optional
from core.ports import ComicRepository, UsuarioRepository, CompraRepository
from core.entities import Comic, Usuario, CrearUsuario, FinalizarCompra, HistorialCompra
from infrastructure.database import get_db_connection

class MySQLComicRepository(ComicRepository):
    
    def obtener_todos(self) -> List[Comic]:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT * FROM comics")
                rows = cursor.fetchall()
                # Convertimos los diccionarios de la BD en entidades Comic
                return [Comic(**row) for row in rows]
        finally:
            conexion.close()

    def obtener_por_id(self, comic_id: int) -> Optional[Comic]:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT * FROM comics WHERE id = %s", (comic_id,))
                row = cursor.fetchone()
                if row:
                    return Comic(**row)
                return None
        finally:
            conexion.close()

    def buscar_por_titulo(self, titulo: str) -> List[Comic]:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT * FROM comics WHERE titulo LIKE %s", (f"%{titulo}%",))
                rows = cursor.fetchall()
                return [Comic(**row) for row in rows]
        finally:
            conexion.close()

class MySQLUsuarioRepository(UsuarioRepository):
    def obtener_por_credenciales(self, email: str, password: str) -> Optional[Usuario]:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT id, nombre, email, password FROM usuarios WHERE email = %s AND password = %s", (email, password))
                row = cursor.fetchone()
                if row: return Usuario(**row)
                return None
        finally:
            conexion.close()

    def existe_email(self, email: str) -> bool:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
                return cursor.fetchone() is not None
        finally:
            conexion.close()

    def crear_usuario(self, usuario: CrearUsuario) -> None:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)", 
                               (usuario.nombre, usuario.email, usuario.password))
                conexion.commit()
        finally:
            conexion.close()

    def eliminar_usuario(self, usuario_id: int) -> bool:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
                conexion.commit()
                return cursor.rowcount > 0
        finally:
            conexion.close()

class MySQLCompraRepository(CompraRepository):
    def registrar_compra(self, compra: FinalizarCompra) -> int:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                # 1. Cabecera de compra
                cursor.execute("INSERT INTO compras (usuario_id, total) VALUES (%s, %s)", (compra.usuario_id, compra.total))
                compra_id = cursor.lastrowid
                # 2. Detalles
                for item in compra.items:
                    cursor.execute("INSERT INTO detalles_compra (compra_id, comic_id, cantidad) VALUES (%s, %s, %s)",
                                   (compra_id, item.comic_id, item.cantidad))
                conexion.commit()
                return compra_id
        except Exception as e:
            conexion.rollback()
            raise e
        finally:
            conexion.close()

    def obtener_historial(self, usuario_id: int) -> List[HistorialCompra]:
        conexion = get_db_connection()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT id, total, fecha FROM compras WHERE usuario_id = %s ORDER BY fecha DESC", (usuario_id,))
                rows = cursor.fetchall()
                # Formatear la fecha
                for row in rows:
                    if 'fecha' in row and row['fecha']:
                        row['fecha'] = row['fecha'].strftime("%Y-%m-%d %H:%M:%S")
                return [HistorialCompra(**row) for row in rows]
        finally:
            conexion.close()