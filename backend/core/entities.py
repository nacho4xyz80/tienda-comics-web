from pydantic import BaseModel
from typing import List, Optional

# Entidad pura de Cómic
class Comic(BaseModel):
    id: Optional[int] = None
    titulo: str
    descripcion: str
    precio: float
    imagen_url: Optional[str] = None

# Entidades de Usuario
class Usuario(BaseModel):
    id: Optional[int] = None
    nombre: str
    email: str
    password: str

class LoginUsuario(BaseModel):
    email: str
    password: str

class CrearUsuario(BaseModel):
    nombre: str
    email: str
    password: str

# Entidades de Compras
class ItemCarrito(BaseModel):
    comic_id: int
    cantidad: int

class FinalizarCompra(BaseModel):
    usuario_id: int
    total: float
    items: List[ItemCarrito]

class HistorialCompra(BaseModel):
    id: int
    total: float
    fecha: str