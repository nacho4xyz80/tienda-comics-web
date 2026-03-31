from typing import List, Optional
from core.ports import ComicRepository
from core.entities import Comic
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