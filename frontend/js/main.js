// index.html 
// La URL base de tu backend en FastAPI
const API_URL = 'http://localhost:8000';

async function cargarComics() {
    try {
        // 1. Llamamos a la API
        const respuesta = await fetch(`${API_URL}/comics`);
        const comics = await respuesta.json();
        
        // 2. Buscamos el contenedor en el HTML
        const contenedor = document.getElementById('comics-container');
        
        // Verificamos que el contenedor exista (solo existirá en index.html)
        if (contenedor) {
            contenedor.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."
            
            // 3. Recorremos los cómics y creamos el HTML para cada uno
            comics.forEach(comic => {
                const tarjetaHtml = `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <img src="${comic.imagen_url || 'https://via.placeholder.com/300x400'}" class="card-img-top" alt="${comic.titulo}" style="height: 350px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${comic.titulo}</h5>
                                <p class="card-text text-truncate">${comic.descripcion}</p>
                                <h3 class="text-primary mt-auto">$${comic.precio}</h3>
                                <a href="detalle.html?id=${comic.id}" class="btn btn-dark w-100 mt-3">Ver Detalles</a>
                            </div>
                        </div>
                    </div>
                `;
                // Añadimos la tarjeta al contenedor
                contenedor.innerHTML += tarjetaHtml;
            });
        }
    } catch (error) {
        console.error("Error al conectar con la API:", error);
        document.getElementById('comics-container').innerHTML = '<p class="text-danger text-center">Error al cargar el catálogo.</p>';
    }
}

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
        document.getElementById('detalle-imagen').src = comic.imagen_url || 'https://via.placeholder.com/300x450';
        
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
                        <img src="${comic.imagen_url || 'https://via.placeholder.com/50'}" alt="${comic.titulo}" style="width: 50px; height: 75px; object-fit: cover;" class="me-3 rounded">
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
    if(confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
        localStorage.removeItem('carritoComics');
        cargarCarrito();
        actualizarContadorCarrito();
    }
}

// Función para simular una compra exitosa
function simularCompra() {
    let carrito = JSON.parse(localStorage.getItem('carritoComics')) || [];
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }
    
    alert("¡Compra realizada con éxito! Gracias por tu pedido.");
    localStorage.removeItem('carritoComics'); // Vaciamos el carrito tras comprar
    window.location.href = "index.html"; // Redirigimos a la portada
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
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Si estamos en index.html (existe el contenedor de cómics)
    if (document.getElementById('comics-container')) {
        cargarComics();
    }
    
    // 2. Si estamos en detalle.html (existe el contenedor del detalle)
    if (document.getElementById('detalle-contenedor')) {
        cargarDetalleComic();
    }
    
    // 3. Si estamos en carrito.html (existe la tabla del carrito)
    if (document.getElementById('cuerpo-carrito')) {
        cargarCarrito();
    }

    // 4. El contador de la barra de navegación está en todas las páginas, 
    // así que lo actualizamos siempre.
    actualizarContadorCarrito();
});