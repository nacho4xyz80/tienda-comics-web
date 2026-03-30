// index.html 
// La URL base de tu backend en FastAPI
const API_URL = 'http://localhost:8000';

// Función auxiliar para DIBUJAR los cómics en la pantalla
function renderizarComics(comics) {
    const contenedor = document.getElementById('comics-container');
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiamos el contenedor

    // Si la búsqueda no devuelve nada, mostramos un mensaje
    if (comics.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center"><p class="fs-4 text-muted">No se encontraron cómics con ese nombre.</p></div>';
        return;
    }

    // Dibujamos cada cómic
    comics.forEach(comic => {
        const tarjetaHtml = `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img 
                        src="${comic.imagen_url || 'img/no-disponible.png'}" 
                        onerror="this.onerror=null; this.src='img/no-disponible.png';"
                        class="card-img-top" 
                        alt="${comic.titulo}" 
                        style="height: 350px; object-fit: cover;"
                    >
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${comic.titulo}</h5>
                        <p class="card-text text-truncate">${comic.descripcion}</p>
                        <h3 class="text-primary mt-auto">$${comic.precio}</h3>
                        <a href="detalle.html?id=${comic.id}" class="btn btn-dark w-100 mt-3">Ver Detalles</a>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjetaHtml;
    });
}

// Función para cargar TODOS los cómics (al inicio)
async function cargarComics() {
    try {
        const respuesta = await fetch(`${API_URL}/comics`);
        const comics = await respuesta.json();
        renderizarComics(comics); // Llamamos a nuestra nueva función dibujante
    } catch (error) {
        console.error("Error al conectar con la API:", error);
        document.getElementById('comics-container').innerHTML = '<p class="text-danger text-center">Error al cargar el catálogo.</p>';
    }
}

// Función para buscar cómics por título
async function buscarComics(evento) {
    evento.preventDefault(); // Evita que la página se recargue al enviar el formulario

    const termino = document.getElementById('input-busqueda').value.trim();

    // Si el usuario le da a buscar con la barra vacía, cargamos todos los cómics normales
    if (termino === '') {
        cargarComics();
        return;
    }

    try {
        // Hacemos la petición a nuestra nueva ruta de FastAPI con el parámetro "q"
        const respuesta = await fetch(`${API_URL}/comics/buscar/?q=${termino}`);
        const comics = await respuesta.json();
        renderizarComics(comics); // Reutilizamos la función dibujante para mostrar los resultados
    } catch (error) {
        console.error("Error al buscar:", error);
        document.getElementById('comics-container').innerHTML = '<p class="text-danger text-center">Error al realizar la búsqueda.</p>';
    }
}

// async function cargarComics() {
//     try {
//         // 1. Llamamos a la API
//         const respuesta = await fetch(`${API_URL}/comics`);
//         const comics = await respuesta.json();

//         // 2. Buscamos el contenedor en el HTML
//         const contenedor = document.getElementById('comics-container');

//         // Verificamos que el contenedor exista (solo existirá en index.html)
//         if (contenedor) {
//             contenedor.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."

//             // 3. Recorremos los cómics y creamos el HTML para cada uno
//             comics.forEach(comic => {
//                 const tarjetaHtml = `
//                     <div class="col-md-4 mb-4">
//                         <div class="card h-100 shadow-sm">
//                             <img src="${comic.imagen_url || 'img/noImagen.png'}" class="card-img-top" alt="${comic.titulo}" style="height: 350px; object-fit: cover;">
//                             <div class="card-body d-flex flex-column">
//                                 <h5 class="card-title">${comic.titulo}</h5>
//                                 <p class="card-text text-truncate">${comic.descripcion}</p>
//                                 <h3 class="text-primary mt-auto">$${comic.precio}</h3>
//                                 <a href="detalle.html?id=${comic.id}" class="btn btn-dark w-100 mt-3">Ver Detalles</a>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//                 // Añadimos la tarjeta al contenedor
//                 contenedor.innerHTML += tarjetaHtml;
//             });
//         }
//     } catch (error) {
//         console.error("Error al conectar con la API:", error);
//         document.getElementById('comics-container').innerHTML = '<p class="text-danger text-center">Error al cargar el catálogo.</p>';
//     }
// }

// Ejecutar la función en cuanto la página web cargue
// document.addEventListener('DOMContentLoaded', cargarComics);


// detalle.html

// Función para cargar los detalles de un solo cómic
async function cargarDetalleComic() {
    // 1. Leer el ID de la URL (ej: ?id=2)
    const parametrosUrl = new URLSearchParams(window.location.search);
    const comicId = parametrosUrl.get('id');

    // Si no hay ID en la URL, no hacemos nada (probablemente estamos en otra página)
    if (!comicId) return;

    try {
        // 2. Pedirle al backend el cómic con ese ID
        const respuesta = await fetch(`${API_URL}/comics/${comicId}`);

        if (!respuesta.ok) {
            throw new Error('Cómic no encontrado');
        }

        const comic = await respuesta.json();

        // 3. Inyectar los datos en el HTML
        document.getElementById('detalle-titulo').textContent = comic.titulo;
        document.getElementById('detalle-descripcion').textContent = comic.descripcion;
        document.getElementById('detalle-precio').textContent = `$${comic.precio}`;
        document.getElementById('detalle-imagen').src = comic.imagen_url || 'img/noImagen.png';

        // Mostrar el contenedor (lo teníamos oculto por defecto)
        document.getElementById('detalle-contenedor').style.display = 'flex';

        // 4. Configurar el botón de añadir al carrito
        const btnAgregar = document.getElementById('btn-agregar-carrito');
        btnAgregar.addEventListener('click', () => {
            agregarAlCarrito(comic);
        });

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('mensaje-error').innerHTML = '<div class="alert alert-danger">Error al cargar el cómic. Puede que no exista.</div>';
    }
}

// Función para manejar el carrito usando LocalStorage
function agregarAlCarrito(comic) {
    // Leer el carrito actual de la memoria del navegador (si no hay, creamos un array vacío)
    let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];

    // Añadir el nuevo cómic al array
    carrito.push(comic);

    // Volver a guardar el array actualizado en la memoria
    localStorage.setItem('carritoComics', JSON.stringify(carrito));

    alert(`¡"${comic.titulo}" añadido al carrito!`);

    // Opcional: Actualizar el contador del carrito en la barra de navegación si lo deseas
    actualizarContadorCarrito();
}

// Ejecutamos la función de detalles cuando cargue la página
// document.addEventListener('DOMContentLoaded', cargarDetalleComic);


// carrito.html

// --- CÓDIGO NUEVO A AÑADIR AL FINAL DE main.js ---

// Función para mostrar los productos en la página del carrito
function cargarCarrito() {
    const cuerpoCarrito = document.getElementById('cuerpo-carrito');
    const totalCarrito = document.getElementById('total-carrito');

    // Si no estamos en la página del carrito, salimos de la función
    if (!cuerpoCarrito) return;

    // Obtenemos los cómics guardados
    let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];

    // Limpiamos la tabla antes de rellenarla
    cuerpoCarrito.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        cuerpoCarrito.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">Tu carrito está vacío. ¡Ve a comprar algunos cómics!</td></tr>';
        totalCarrito.textContent = '$0.00';
        return;
    }

    // Recorremos el carrito y creamos las filas de la tabla
    carrito.forEach((comic, index) => {
        // Asegurarnos de que el precio sea un número
        const precio = parseFloat(comic.precio);
        total += precio;

        const fila = `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${comic.imagen_url || 'img/noImagen.png'}" alt="${comic.titulo}" style="width: 50px; height: 75px; object-fit: cover;" class="me-3 rounded">
                        <strong>${comic.titulo}</strong>
                    </div>
                </td>
                <td>$${precio.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})">Eliminar</button>
                </td>
            </tr>
        `;
        cuerpoCarrito.innerHTML += fila;
    });

    // Actualizamos el total en la pantalla
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

// Función para eliminar un solo artículo del carrito
function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];
    carrito.splice(index, 1); // Quita 1 elemento en la posición 'index'
    localStorage.setItem('carritoComics', JSON.stringify(carrito));

    cargarCarrito(); // Recargamos la tabla
    actualizarContadorCarrito(); // Actualizamos el numerito de la barra superior
}

// Función para vaciar todo el carrito
function vaciarCarrito() {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
        localStorage.removeItem('carritoComics');
        cargarCarrito();
        actualizarContadorCarrito();
    }
}

// Función para simular una compra exitosa
// function simularCompra() {
//     let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];
//     if (carrito.length === 0) {
//         alert("El carrito está vacío.");
//         return;
//     }

//     alert("¡Compra realizada con éxito! Gracias por tu pedido.");
//     localStorage.removeItem('carritoComics'); // Vaciamos el carrito tras comprar
//     window.location.href = "index.html"; // Redirigimos a la portada
// }

// Función para enviar la compra real al backend
async function simularCompra() {
    // 1. Verificar si hay un usuario logueado
    const usuarioString = localStorage.getItem('usuarioLogueado');
    if (!usuarioString) {
        alert("Debes iniciar sesión para poder finalizar tu compra.");
        window.location.href = "login.html"; // Lo mandamos a loguearse
        return;
    }

    const usuario = JSON.parse(usuarioString);
    let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    // 2. Calcular el total y agrupar los cómics repetidos para sacar la "cantidad"
    let total = 0;
    let conteoComics = {}; // Objeto para contar: { id_del_comic: cantidad }

    carrito.forEach(comic => {
        total += parseFloat(comic.precio);

        // Si el cómic ya está en el conteo, sumamos 1, si no, lo inicializamos en 1
        if (conteoComics[comic.id]) {
            conteoComics[comic.id] += 1;
        } else {
            conteoComics[comic.id] = 1;
        }
    });

    // 3. Formatear la lista de items como la espera nuestro backend (Pydantic)
    const itemsParaBackend = Object.keys(conteoComics).map(id => {
        return {
            comic_id: parseInt(id),
            cantidad: conteoComics[id]
        };
    });

    // 4. Crear el paquete de datos completo
    const payload = {
        usuario_id: usuario.id,
        total: total,
        items: itemsParaBackend
    };

    // 5. Enviar al backend
    try {
        const respuesta = await fetch(`${API_URL}/comprar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert(`¡Éxito! Compra #${data.compra_id} registrada. Gracias por tu pedido.`);
            localStorage.removeItem('carritoComics'); // Limpiamos el carrito
            window.location.href = "index.html"; // Volvemos al inicio
        } else {
            alert("Hubo un problema con la compra: " + data.detail);
        }
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("Error de conexión con el servidor.");
    }
}

// Función extra: Actualiza el numerito azul en la barra de navegación en TODAS las páginas
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];
        contador.textContent = carrito.length;
    }
}

// --- MODIFICACIONES A LOS EVENT LISTENERS EXISTENTES ---

// Asegurarnos de que el carrito y el contador se carguen al iniciar cualquier página
// document.addEventListener('DOMContentLoaded', () => {
//     // Estas funciones ya las tenías, las mantenemos:
//     if (typeof cargarComics === 'function') cargarComics();
//     if (typeof cargarDetalleComic === 'function') cargarDetalleComic();

//     // Añadimos estas nuevas:
//     cargarCarrito();
//     actualizarContadorCarrito();
// });

// Busca la función agregarAlCarrito() que creamos en el paso anterior y modifícala 
// LIGERAMENTE para que llame a actualizarContadorCarrito() al final:
/*
function agregarAlCarrito(comic) {
    let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];
    carrito.push(comic);
    localStorage.setItem('carritoComics', JSON.stringify(carrito));
    alert(`¡"${comic.titulo}" añadido al carrito!`);
    
    // --> ¡AÑADE ESTA LÍNEA AQUÍ! <--
    actualizarContadorCarrito(); 
}
*/

// --- INICIALIZADOR ÚNICO ---
// Ejecutar cuando la página web haya cargado completamente
// document.addEventListener('DOMContentLoaded', () => {

//     // 1. Si estamos en index.html (existe el contenedor de cómics)
//     if (document.getElementById('comics-container')) {
//         cargarComics();
//     }

//     // 2. Si estamos en detalle.html (existe el contenedor del detalle)
//     if (document.getElementById('detalle-contenedor')) {
//         cargarDetalleComic();
//     }

//     // 3. Si estamos en carrito.html (existe la tabla del carrito)
//     if (document.getElementById('cuerpo-carrito')) {
//         cargarCarrito();
//     }

//     // 4. El contador de la barra de navegación está en todas las páginas, 
//     // así que lo actualizamos siempre.
//     actualizarContadorCarrito();
// });


// login.html

// --- FUNCIONES DE LOGIN Y SESIÓN ---

// Función para enviar las credenciales a la API
async function manejarLogin(evento) {
    // Evitamos que el formulario recargue la página al pulsar "Entrar"
    evento.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const divMensaje = document.getElementById('mensaje-login');

    try {
        // Hacemos un POST a nuestra API de FastAPI
        const respuesta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // LOGIN EXITOSO: Guardamos los datos del usuario en localStorage
            localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));

            divMensaje.innerHTML = `<div class="alert alert-success">¡Bienvenido, ${data.usuario.nombre}! Redirigiendo...</div>`;

            // Esperamos 1.5 segundos y lo mandamos a la portada
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // ERROR (Contraseña o email incorrectos)
            divMensaje.innerHTML = `<div class="alert alert-danger">${data.detail}</div>`;
        }
    } catch (error) {
        console.error("Error en login:", error);
        divMensaje.innerHTML = `<div class="alert alert-danger">Error al conectar con el servidor.</div>`;
    }
}

// Función para cambiar el menú si el usuario ya inició sesión
// function verificarSesion() {
//     const usuarioString = localStorage.getItem('usuarioLogueado');
//     const navLogin = document.getElementById('nav-login'); 

//     if (usuarioString && navLogin) {
//         const usuario = JSON.parse(usuarioString);
//         // Cambiamos "Login" por el nombre del usuario y un botón de salir
//         navLogin.innerHTML = `Hola, ${usuario.nombre} | <span style="cursor:pointer; color:#ff6b6b;" onclick="cerrarSesion()">Salir</span>`;
//         navLogin.href = "#"; // Desactivamos el link a login.html
//     }
// }

// function verificarSesion() {
//     const usuarioString = localStorage.getItem('usuarioLogueado');
//     const navLogin = document.getElementById('nav-login');

//     if (usuarioString && navLogin) {
//         const usuario = JSON.parse(usuarioString);
//         navLogin.innerHTML = `
//             Hola, ${usuario.nombre} | 
//             <span style="cursor:pointer; color:#ff6b6b; margin-right: 10px;" onclick="cerrarSesion()">Salir</span> |
//             <span style="cursor:pointer; color:#dc3545;" onclick="eliminarCuenta()">Borrar Cuenta</span>
//         `;
//         navLogin.href = "#";
//     }
// }

// Función para cambiar el menú si el usuario ya inició sesión
function verificarSesion() {
    const usuarioString = localStorage.getItem('usuarioLogueado');
    const navLogin = document.getElementById('nav-login'); 

    if (usuarioString && navLogin) {
        const usuario = JSON.parse(usuarioString);
        
        // Añadimos el enlace "Mis Pedidos" al menú
        navLogin.innerHTML = `
            <a href="mis-compras.html" class="text-light text-decoration-none me-3 fw-bold">Mis Pedidos</a>
            <span class="text-white-50">Hola, ${usuario.nombre}</span> | 
            <span style="cursor:pointer; color:#ff6b6b; margin-left: 5px; margin-right: 10px;" onclick="cerrarSesion()">Salir</span> |
            <span style="cursor:pointer; color:#dc3545;" onclick="eliminarCuenta()">Borrar Cuenta</span>
        `;
        navLogin.href = "#"; // Desactivamos el link principal para que no lleve al login
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    window.location.reload(); // Recargamos la página
}

// registro.html

// Función para registrar un nuevo usuario
async function manejarRegistro(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const divMensaje = document.getElementById('mensaje-registro');

    try {
        const respuesta = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre, email: email, password: password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            divMensaje.innerHTML = `<div class="alert alert-success">${data.mensaje}. Redirigiendo al login...</div>`;
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            divMensaje.innerHTML = `<div class="alert alert-danger">${data.detail}</div>`;
        }
    } catch (error) {
        divMensaje.innerHTML = `<div class="alert alert-danger">Error de conexión con el servidor.</div>`;
    }
}

// Función para eliminar la cuenta actual
async function eliminarCuenta() {
    if (!confirm("¿Estás seguro de que quieres borrar tu cuenta permanentemente? Esta acción no se puede deshacer.")) {
        return;
    }

    const usuarioString = localStorage.getItem('usuarioLogueado');
    if (!usuarioString) return;

    const usuario = JSON.parse(usuarioString);

    try {
        const respuesta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            alert("Cuenta eliminada correctamente.");
            cerrarSesion(); // Esto limpiará el localStorage y recargará la página
        } else {
            alert("Error al intentar eliminar la cuenta.");
        }
    } catch (error) {
        alert("Error de conexión con el servidor.");
    }
}

// Función para obtener y mostrar el historial de compras del usuario
async function cargarHistorialCompras() {
    const cuerpoHistorial = document.getElementById('cuerpo-historial');
    if (!cuerpoHistorial) return;

    // Verificamos quién está logueado
    const usuarioString = localStorage.getItem('usuarioLogueado');
    if (!usuarioString) {
        // Si alguien intenta entrar a mis-compras.html sin loguearse, lo echamos al login
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioString);

    try {
        // Hacemos la petición a la API con el ID del usuario
        const respuesta = await fetch(`${API_URL}/usuarios/${usuario.id}/compras`);
        const compras = await respuesta.json();

        cuerpoHistorial.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."

        if (compras.length === 0) {
            cuerpoHistorial.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">Aún no has realizado ninguna compra. ¡Anímate!</td></tr>';
            return;
        }

        // Recorremos las compras y creamos las filas
        compras.forEach(compra => {
            const fila = `
                <tr>
                    <td><strong>#${compra.id}</strong></td>
                    <td>${compra.fecha}</td>
                    <td class="text-success fw-bold">$${parseFloat(compra.total).toFixed(2)}</td>
                </tr>
            `;
            cuerpoHistorial.innerHTML += fila;
        });

    } catch (error) {
        console.error("Error al cargar el historial:", error);
        cuerpoHistorial.innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4">Error al cargar el historial de pedidos.</td></tr>';
    }
}


// --- INICIALIZADOR ÚNICO ---
// document.addEventListener('DOMContentLoaded', () => {

//     if (document.getElementById('comics-container')) {
//         cargarComics();
//     }
//     if (document.getElementById('detalle-contenedor')) {
//         cargarDetalleComic();
//     }
//     if (document.getElementById('cuerpo-carrito')) {
//         cargarCarrito();
//     }

//     // NUEVO: Si estamos en login.html, escuchamos al formulario
//     const formLogin = document.getElementById('form-login');
//     if (formLogin) {
//         formLogin.addEventListener('submit', manejarLogin);
//     }

//     // SIEMPRE ejecutamos estas dos cosas en TODAS las páginas:
//     actualizarContadorCarrito();
//     verificarSesion();
// });


// --- INICIALIZADOR ÚNICO ---
// document.addEventListener('DOMContentLoaded', () => {
//     if (document.getElementById('comics-container')) cargarComics();
//     if (document.getElementById('detalle-contenedor')) cargarDetalleComic();
//     if (document.getElementById('cuerpo-carrito')) cargarCarrito();

//     if (document.getElementById('form-login')) {
//         document.getElementById('form-login').addEventListener('submit', manejarLogin);
//     }

//     // NUEVO: Escuchar al formulario de registro
//     if (document.getElementById('form-registro')) {
//         document.getElementById('form-registro').addEventListener('submit', manejarRegistro);
//     }

//     // NUEVO: Escuchar al formulario de búsqueda en la portada
//     const formBusqueda = document.getElementById('form-busqueda');
//     if (formBusqueda) {
//         formBusqueda.addEventListener('submit', buscarComics);
//     }

//     actualizarContadorCarrito();
//     verificarSesion();
// });

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('comics-container')) cargarComics();
    if (document.getElementById('detalle-contenedor')) cargarDetalleComic();
    if (document.getElementById('cuerpo-carrito')) cargarCarrito();
    
    // NUEVO: Ejecutar historial si estamos en mis-compras.html
    if (document.getElementById('cuerpo-historial')) cargarHistorialCompras();
    
    if (document.getElementById('form-login')) {
        document.getElementById('form-login').addEventListener('submit', manejarLogin);
    }
    if (document.getElementById('form-registro')) {
        document.getElementById('form-registro').addEventListener('submit', manejarRegistro);
    }

    // NUEVO: Escuchar al formulario de búsqueda
    const formBusqueda = document.getElementById('form-busqueda');
    if (formBusqueda) {
        formBusqueda.addEventListener('submit', buscarComics);
    }

    actualizarContadorCarrito();
    verificarSesion();
});