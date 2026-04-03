from fastapi import APIRouter, HTTPException, Depends
from typing import List
from application.comic_service import ComicService
from application.usuario_service import UsuarioService
from application.compra_service import CompraService
from core.entities import Comic, LoginUsuario, CrearUsuario, FinalizarCompra, HistorialCompra
from infrastructure.mysql_adapters import MySQLComicRepository, MySQLUsuarioRepository, MySQLCompraRepository

# Creamos un "Router" que luego conectaremos a la app principal
router = APIRouter()

# Función para inyectar dependencias
def get_comic_service():
    # Si cambiamos bd, solo cambiamos esta línea, en este caso MySQL.
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

# Inyección de dependencias para Usuarios y Compras
def get_usuario_service():
    return UsuarioService(MySQLUsuarioRepository())

def get_compra_service():
    return CompraService(MySQLCompraRepository())

# --- RUTAS DE USUARIOS ---
@router.post("/login")
def login(credenciales: LoginUsuario, servicio: UsuarioService = Depends(get_usuario_service)):
    try:
        usuario = servicio.login(credenciales)
        return {"mensaje": "Login exitoso", "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email}}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/usuarios")
def registrar_usuario(usuario: CrearUsuario, servicio: UsuarioService = Depends(get_usuario_service)):
    try:
        servicio.registrar(usuario)
        return {"mensaje": "Usuario creado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int, servicio: UsuarioService = Depends(get_usuario_service)):
    try:
        servicio.eliminar_cuenta(usuario_id)
        return {"mensaje": "Cuenta eliminada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- RUTAS DE COMPRAS ---
@router.post("/comprar")
def finalizar_compra(compra: FinalizarCompra, servicio: CompraService = Depends(get_compra_service)):
    try:
        compra_id = servicio.procesar_compra(compra)
        return {"mensaje": "Compra realizada con éxito", "compra_id": compra_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la compra: {str(e)}")

@router.get("/usuarios/{usuario_id}/compras", response_model=List[HistorialCompra])
def obtener_historial_compras(usuario_id: int, servicio: CompraService = Depends(get_compra_service)):
    return servicio.obtener_historial_usuario(usuario_id)