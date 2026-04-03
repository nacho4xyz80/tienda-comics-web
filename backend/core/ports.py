from abc import ABC, abstractmethod
from typing import List, Optional
from core.entities import Comic, Usuario, CrearUsuario, FinalizarCompra, HistorialCompra

class ComicRepository(ABC):
    
    @abstractmethod
    def obtener_todos(self) -> List[Comic]:
        pass
        
    @abstractmethod
    def obtener_por_id(self, comic_id: int) -> Optional[Comic]:
        pass
        
    @abstractmethod
    def buscar_por_titulo(self, titulo: str) -> List[Comic]:
        pass

class UsuarioRepository(ABC):
    @abstractmethod
    def obtener_por_credenciales(self, email: str, password: str) -> Optional[Usuario]:
        pass
        
    @abstractmethod
    def existe_email(self, email: str) -> bool:
        pass
        
    @abstractmethod
    def crear_usuario(self, usuario: CrearUsuario) -> None:
        pass
        
    @abstractmethod
    def eliminar_usuario(self, usuario_id: int) -> bool:
        pass

class CompraRepository(ABC):
    @abstractmethod
    def registrar_compra(self, compra: FinalizarCompra) -> int:
        pass
        
    @abstractmethod
    def obtener_historial(self, usuario_id: int) -> List[HistorialCompra]:
        pass