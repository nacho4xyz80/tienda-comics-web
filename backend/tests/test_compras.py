import pytest
from core.entities import FinalizarCompra, ItemCarrito, HistorialCompra
from application.compra_service import CompraService
from core.ports import CompraRepository

class MockCompraRepository(CompraRepository):
    def __init__(self):
        self.compras = []
        self.next_id = 1

    def registrar_compra(self, compra: FinalizarCompra):
        self.compras.append(compra)
        id_asignado = self.next_id
        self.next_id += 1
        return id_asignado

    def obtener_historial(self, usuario_id):
        # Devolvemos un historial falso estático para probar
        return [
            HistorialCompra(id=1, total=25.50, fecha="2024-01-01 12:00:00")
        ]

def test_procesar_compra_con_items_exitoso():
    repo = MockCompraRepository()
    servicio = CompraService(repo)
    
    # Simulamos un carrito con 1 Batman (id:1) y 2 Spider-Man (id:2)
    items = [ItemCarrito(comic_id=1, cantidad=1), ItemCarrito(comic_id=2, cantidad=2)]
    compra = FinalizarCompra(usuario_id=1, total=45.0, items=items)
    
    compra_id = servicio.procesar_compra(compra)
    assert compra_id == 1
    assert len(repo.compras) == 1

def test_procesar_compra_con_carrito_vacio_lanza_error():
    servicio = CompraService(MockCompraRepository())
    compra_vacia = FinalizarCompra(usuario_id=1, total=0.0, items=[])
    
    with pytest.raises(Exception) as excinfo:
        servicio.procesar_compra(compra_vacia)
    assert "vacío" in str(excinfo.value)

def test_obtener_historial_compras():
    servicio = CompraService(MockCompraRepository())
    historial = servicio.obtener_historial_usuario(1)
    
    assert len(historial) == 1
    assert historial[0].total == 25.50