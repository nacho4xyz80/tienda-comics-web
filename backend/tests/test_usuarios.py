import pytest
from core.entities import Usuario, CrearUsuario, LoginUsuario
from application.usuario_service import UsuarioService
from core.ports import UsuarioRepository

class MockUsuarioRepository(UsuarioRepository):
    def __init__(self):
        # Base de datos en memoria inicial
        self.usuarios = [
            Usuario(id=1, nombre="Admin", email="admin@test.com", password="123")
        ]
        self.next_id = 2

    def obtener_por_credenciales(self, email, password):
        for u in self.usuarios:
            if u.email == email and u.password == password:
                return u
        return None

    def existe_email(self, email):
        return any(u.email == email for u in self.usuarios)

    def crear_usuario(self, usuario: CrearUsuario):
        nuevo_user = Usuario(id=self.next_id, nombre=usuario.nombre, email=usuario.email, password=usuario.password)
        self.usuarios.append(nuevo_user)
        self.next_id += 1

    def eliminar_usuario(self, usuario_id):
        longitud_inicial = len(self.usuarios)
        self.usuarios = [u for u in self.usuarios if u.id != usuario_id]
        return len(self.usuarios) < longitud_inicial

def test_login_exitoso():
    servicio = UsuarioService(MockUsuarioRepository())
    credenciales = LoginUsuario(email="admin@test.com", password="123")
    
    usuario = servicio.login(credenciales)
    assert usuario.nombre == "Admin"

def test_login_fallido_lanza_error():
    servicio = UsuarioService(MockUsuarioRepository())
    credenciales = LoginUsuario(email="admin@test.com", password="clave_mala")
    
    with pytest.raises(Exception) as excinfo:
        servicio.login(credenciales)
    assert "incorrectos" in str(excinfo.value)

def test_registrar_usuario_nuevo_exitoso():
    repo = MockUsuarioRepository()
    servicio = UsuarioService(repo)
    nuevo = CrearUsuario(nombre="Paco", email="paco@test.com", password="abc")
    
    servicio.registrar(nuevo)
    assert len(repo.usuarios) == 2 # Se añadió correctamente

def test_registrar_usuario_con_email_duplicado_lanza_error():
    servicio = UsuarioService(MockUsuarioRepository())
    # Intentamos registrar con el email que ya existe en el mock
    duplicado = CrearUsuario(nombre="Copia", email="admin@test.com", password="abc")
    
    with pytest.raises(Exception) as excinfo:
        servicio.registrar(duplicado)
    assert "ya está registrado" in str(excinfo.value)

def test_eliminar_cuenta_existente():
    repo = MockUsuarioRepository()
    servicio = UsuarioService(repo)
    
    servicio.eliminar_cuenta(1) # Borramos al Admin
    assert len(repo.usuarios) == 0

def test_eliminar_cuenta_inexistente_lanza_error():
    servicio = UsuarioService(MockUsuarioRepository())
    
    with pytest.raises(Exception) as excinfo:
        servicio.eliminar_cuenta(99)
    assert "no encontrado" in str(excinfo.value)