from core.ports import CompraRepository
from core.entities import FinalizarCompra

class CompraService:
    def __init__(self, repository: CompraRepository):
        self.repository = repository

    def procesar_compra(self, compra: FinalizarCompra):
        if not compra.items or len(compra.items) == 0:
            raise Exception("El carrito está vacío")
        # El repositorio nos devolverá el ID de la nueva compra
        return self.repository.registrar_compra(compra)

    def obtener_historial_usuario(self, usuario_id: int):
        return self.repository.obtener_historial(usuario_id)