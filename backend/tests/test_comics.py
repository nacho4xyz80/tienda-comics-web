import pytest
from core.entities import Comic
from application.comic_service import ComicService
from core.ports import ComicRepository

# Creamos un Adaptador Falso (Mock) para testing en memoria
class MockComicRepository(ComicRepository):
    def __init__(self):
        self.comics = [
            Comic(id=1, titulo="Batman", descripcion="Oscuro", precio=10.0, imagen_url="img.jpg"),
            Comic(id=2, titulo="Spider-Man", descripcion="Arácnido", precio=15.0, imagen_url="img2.jpg")
        ]

    def obtener_todos(self):
        return self.comics

    def obtener_por_id(self, comic_id: int):
        for c in self.comics:
            if c.id == comic_id:
                return c
        return None
        
    def buscar_por_titulo(self, titulo: str):
        return [c for c in self.comics if titulo.lower() in c.titulo.lower()]

def test_obtener_todos_los_comics():
    repo_falso = MockComicRepository()
    servicio = ComicService(repo_falso) # Inyección de dependencias
    
    resultados = servicio.obtener_catalogo()
    assert len(resultados) == 2
    assert resultados[0].titulo == "Batman"

def test_obtener_comic_por_id_existente():
    repo_falso = MockComicRepository()
    servicio = ComicService(repo_falso)
    
    resultado = servicio.obtener_detalle(1)
    assert resultado is not None
    assert resultado.titulo == "Batman"

def test_obtener_comic_por_id_inexistente_lanza_error():
    repo_falso = MockComicRepository()
    servicio = ComicService(repo_falso)
    
    with pytest.raises(Exception) as excinfo:
        servicio.obtener_detalle(99)
    assert "Cómic no encontrado" in str(excinfo.value)

def test_buscar_comics_por_titulo_encuentra_coincidencia():
    repo_falso = MockComicRepository()
    servicio = ComicService(repo_falso)
    
    # Buscamos "Bat", debería devolvernos "Batman"
    resultados = servicio.buscar_comics("Bat")
    assert len(resultados) == 1
    assert resultados[0].titulo == "Batman"

def test_buscar_comics_por_titulo_no_encuentra_nada():
    repo_falso = MockComicRepository()
    servicio = ComicService(repo_falso)
    
    # Buscamos algo que no existe
    resultados = servicio.buscar_comics("Superman")
    assert len(resultados) == 0