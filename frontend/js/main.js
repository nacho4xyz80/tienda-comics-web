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
document.addEventListener('DOMContentLoaded', cargarComics);


// --- CÓDIGO NUEVO A AÑADIR AL FINAL DE main.js ---

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
    // actualizarContadorCarrito();
}

// Ejecutamos la función de detalles cuando cargue la página
document.addEventListener('DOMContentLoaded', cargarDetalleComic);