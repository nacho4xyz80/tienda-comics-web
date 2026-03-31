from core.ports import ComicRepository
from core.entities import Comic

class ComicService:
    # Inyectamos la dependencia a través del constructor
    def __init__(self, repository: ComicRepository):
        self.repository = repository

    def obtener_catalogo(self):
        return self.repository.obtener_todos()

    def obtener_detalle(self, comic_id: int):
        comic = self.repository.obtener_por_id(comic_id)
        if not comic:
            # Aquí está nuestra regla de negocio: si no existe, lanzamos error
            raise Exception("Cómic no encontrado") 
        return comic

    def buscar_comics(self, titulo: str):
        return self.repository.buscar_por_titulo(titulo)