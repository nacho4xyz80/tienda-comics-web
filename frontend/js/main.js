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