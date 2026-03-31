from fastapi import APIRouter, HTTPException, Depends
from typing import List
from core.entities import Comic
from application.comic_service import ComicService
from infrastructure.mysql_adapters import MySQLComicRepository

# Creamos un "Router" que luego conectaremos a la app principal
router = APIRouter()

# Función para inyectar dependencias limpiamente
def get_comic_service():
    # Aquí es donde decidimos usar MySQL. 
    # Si mañana usamos MongoDB, solo cambiamos esta línea.
    repositorio = MySQLComicRepository()
    return ComicService(repositorio)

@router.get("/comics", response_model=List[Comic])
def obtener_comics(servicio: ComicService = Depends(get_comic_service)):
    return servicio.obtener_catalogo()

@router.get("/comics/buscar/", response_model=List[Comic])
def buscar_comics(q: str, servicio: ComicService = Depends(get_comic_service)):
    return servicio.buscar_comics(q)

@router.get("/comics/{comic_id}", response_model=Comic)
def obtener_comic(comic_id: int, servicio: ComicService = Depends(get_comic_service)):
    try:
        return servicio.obtener_detalle(comic_id)
    except Exception as e:
        # Si el servicio lanza una excepción (ej. "Cómic no encontrado"), 
        # el adaptador web lo traduce a un error HTTP 404
        raise HTTPException(status_code=404, detail=str(e))