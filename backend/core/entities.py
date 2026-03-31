from pydantic import BaseModel
from typing import Optional

# Entidad pura de Cómic
class Comic(BaseModel):
    id: Optional[int] = None
    titulo: str
    descripcion: str
    precio: float
    imagen_url: Optional[str] = None