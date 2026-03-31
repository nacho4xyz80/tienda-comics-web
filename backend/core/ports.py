from abc import ABC, abstractmethod
from typing import List, Optional
from core.entities import Comic

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