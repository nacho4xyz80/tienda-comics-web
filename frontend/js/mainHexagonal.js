// 1. Importaciones (El patrón inyección de dependencias requiere importar todo aquí)
import { ApiAdapter } from './infrastructure/api.js';
import { StorageAdapter } from './infrastructure/storage.js';
import { ComicService } from './application/comicService.js';
import { UsuarioService } from './application/usuarioService.js';
import { CompraService } from './application/compraService.js';
import { DomManager } from './ui/domManager.js';

// 2. Instanciación e Inyección (Construimos el Hexágono)
const api = new ApiAdapter();
const storage = new StorageAdapter();
const ui = new DomManager();

const comicService = new ComicService(api);
const usuarioService = new UsuarioService(api, storage);
const compraService = new CompraService(api, storage);

// 3. Controladores de Vistas (Ejecutan lógica según la página)
document.addEventListener('DOMContentLoaded', async () => {
    
    // --- ESTADO GLOBAL (Todas las páginas) ---
    const usuario = usuarioService.obtenerUsuarioActual();
    ui.actualizarMenuSesion(usuario);
    ui.actualizarContadorCarrito(compraService.obtenerCarrito().length);

    // --- PORTADA (index.html) ---
    if (document.getElementById('comics-container')) {
        try {
            const comics = await comicService.obtenerCatalogo();
            ui.renderizarComics(comics);
        } catch (e) { console.error(e); }

        const formBusqueda = document.getElementById('form-busqueda');
        if (formBusqueda) {
            formBusqueda.addEventListener('submit', async (e) => {
                e.preventDefault();
                const termino = document.getElementById('input-busqueda').value.trim();
                const resultados = termino === '' ? await comicService.obtenerCatalogo() : await comicService.buscar(termino);
                ui.renderizarComics(resultados);
            });
        }
    }

    // --- DETALLE DE CÓMIC (detalle.html) ---
    if (document.getElementById('detalle-contenedor')) {
        const comicId = new URLSearchParams(window.location.search).get('id');
        if (comicId) {
            try {
                const comic = await comicService.obtenerDetalle(comicId);
                ui.renderizarDetalle(comic);
                
                document.getElementById('btn-agregar-carrito').addEventListener('click', () => {
                    compraService.agregarItem(comic);
                    ui.actualizarContadorCarrito(compraService.obtenerCarrito().length);
                    alert(`¡"${comic.titulo}" añadido al carrito!`);
                });
            } catch (e) {
                ui.mostrarAlerta('mensaje-error', 'Error al cargar el cómic', 'danger');
            }
        }
    }

    // --- CARRITO (carrito.html) ---
    if (document.getElementById('cuerpo-carrito')) {
        ui.renderizarCarrito(compraService.obtenerCarrito());
    }

    // --- HISTORIAL (mis-compras.html) ---
    if (document.getElementById('cuerpo-historial')) {
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }
        try {
            const historial = await compraService.obtenerHistorial(usuario.id);
            ui.renderizarHistorial(historial);
        } catch (e) { console.error(e); }
    }

    // --- LOGIN (login.html) ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const user = await usuarioService.login(email, password);
                ui.mostrarAlerta('mensaje-login', `¡Bienvenido, ${user.nombre}!`, 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } catch (error) {
                ui.mostrarAlerta('mensaje-login', error.message, 'danger');
            }
        });
    }

    // --- REGISTRO (registro.html) ---
    const formRegistro = document.getElementById('form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('reg-nombre').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            try {
                await usuarioService.registrar(nombre, email, password);
                ui.mostrarAlerta('mensaje-registro', 'Cuenta creada. Redirigiendo...', 'success');
                setTimeout(() => window.location.href = 'login.html', 1500);
            } catch (error) {
                ui.mostrarAlerta('mensaje-registro', error.message, 'danger');
            }
        });
    }
});

// 4. Exponer funciones al entorno Global
// Los Módulos de JS (type="module") aíslan las funciones. Para que botones HTML 
// con onclick="eliminarDelCarrito(1)" funcionen, debemos exponerlas al objeto window.
window.eliminarDelCarrito = (index) => {
    compraService.eliminarItem(index);
    ui.renderizarCarrito(compraService.obtenerCarrito());
    ui.actualizarContadorCarrito(compraService.obtenerCarrito().length);
};

window.vaciarCarrito = () => {
    if(confirm("¿Seguro que quieres vaciar el carrito?")) {
        compraService.vaciarCarrito();
        ui.renderizarCarrito(compraService.obtenerCarrito());
        ui.actualizarContadorCarrito(0);
    }
};

window.simularCompra = async () => {
    const user = usuarioService.obtenerUsuarioActual();
    if (!user) {
        alert("Debes iniciar sesión para comprar.");
        window.location.href = "login.html";
        return;
    }
    try {
        const idCompra = await compraService.procesarCompra(user.id);
        alert(`¡Compra #${idCompra} realizada con éxito!`);
        window.location.href = "index.html";
    } catch (e) {
        alert("Error en la compra: " + e.message);
    }
};

window.cerrarSesion = () => {
    usuarioService.logout();
    window.location.reload();
};

window.eliminarCuenta = async () => {
    if (confirm("¿Estás seguro de borrar tu cuenta? Esto no se puede deshacer.")) {
        try {
            await usuarioService.eliminarCuenta();
            alert("Cuenta eliminada correctamente.");
            window.location.reload();
        } catch (e) {
            alert("Error al eliminar la cuenta: " + e.message);
        }
    }
};