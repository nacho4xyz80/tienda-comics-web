export class AuthService {
    constructor(apiAdapter, storageAdapter) {
        this.api = apiAdapter;
        this.storage = storageAdapter;
        this.USER_KEY = 'usuarioLogueado'; // Constante para la clave del Storage
    }

    async login(email, password) {
        const data = await this.api.post('/login', { email, password });
        // Si el login es exitoso en la API, guardamos la sesión localmente
        this.storage.guardar(this.USER_KEY, data.usuario);
        return data.usuario;
    }

    async registrar(nombre, email, password) {
        return await this.api.post('/usuarios', { nombre, email, password });
    }

    obtenerUsuarioActual() {
        return this.storage.obtener(this.USER_KEY);
    }

    logout() {
        this.storage.eliminar(this.USER_KEY);
    }

    async eliminarCuenta() {
        const usuario = this.obtenerUsuarioActual();
        if (!usuario) throw new Error("No hay sesión activa para eliminar");
        
        await this.api.delete(`/usuarios/${usuario.id}`);
        this.logout(); // Limpiamos la sesión tras borrar la cuenta
    }
}