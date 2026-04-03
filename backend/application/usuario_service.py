from core.ports import UsuarioRepository
from core.entities import CrearUsuario, LoginUsuario

class UsuarioService:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def login(self, credenciales: LoginUsuario):
        usuario = self.repository.obtener_por_credenciales(credenciales.email, credenciales.password)
        if not usuario:
            raise Exception("Email o contraseña incorrectos")
        return usuario

    def registrar(self, nuevo_usuario: CrearUsuario):
        if self.repository.existe_email(nuevo_usuario.email):
            raise Exception("El email ya está registrado")
        self.repository.crear_usuario(nuevo_usuario)

    def eliminar_cuenta(self, usuario_id: int):
        eliminado = self.repository.eliminar_usuario(usuario_id)
        if not eliminado:
            raise Exception("Usuario no encontrado")