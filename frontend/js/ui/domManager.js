export class DomManager {
    renderizarComics(comics) {
        const contenedor = document.getElementById('comics-container');
        if (!contenedor) return;

        contenedor.innerHTML = '';
        if (comics.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center"><p class="fs-4 text-muted">No se encontraron cómics.</p></div>';
            return;
        }

        comics.forEach(comic => {
            contenedor.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${comic.imagen_url || 'img/no-disponible.png'}" 
                             onerror="this.onerror=null; this.src='img/no-disponible.png';"
                             class="card-img-top" alt="${comic.titulo}" style="height: 350px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${comic.titulo}</h5>
                            <p class="card-text text-truncate">${comic.descripcion}</p>
                            <h3 class="text-primary mt-auto">$${comic.precio}</h3>
                            <a href="detalle.html?id=${comic.id}" class="btn btn-dark w-100 mt-3">Ver Detalles</a>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    renderizarDetalle(comic) {
        document.getElementById('detalle-titulo').textContent = comic.titulo;
        document.getElementById('detalle-descripcion').textContent = comic.descripcion;
        document.getElementById('detalle-precio').textContent = `$${comic.precio}`;
        
        const img = document.getElementById('detalle-imagen');
        img.src = comic.imagen_url || 'img/no-disponible.png';
        img.onerror = function() { this.onerror = null; this.src = 'img/no-disponible.png'; };
        
        document.getElementById('detalle-contenedor').style.display = 'flex';
    }

    renderizarCarrito(carrito) {
        const cuerpoCarrito = document.getElementById('cuerpo-carrito');
        const totalCarrito = document.getElementById('total-carrito');
        if (!cuerpoCarrito) return;

        cuerpoCarrito.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            cuerpoCarrito.innerHTML = '<tr><td colspan="3" class="text-center py-4">Tu carrito está vacío.</td></tr>';
            totalCarrito.textContent = '$0.00';
            return;
        }

        carrito.forEach((comic, index) => {
            const precio = parseFloat(comic.precio);
            total += precio;
            cuerpoCarrito.innerHTML += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${comic.imagen_url || 'img/no-disponible.png'}" style="width: 50px; height: 75px; object-fit: cover;" class="me-3 rounded">
                            <strong>${comic.titulo}</strong>
                        </div>
                    </td>
                    <td>$${precio.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        totalCarrito.textContent = `$${total.toFixed(2)}`;
    }

    renderizarHistorial(compras) {
        const cuerpo = document.getElementById('cuerpo-historial');
        if (!cuerpo) return;

        cuerpo.innerHTML = '';
        if (compras.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="3" class="text-center py-4">No hay compras registradas.</td></tr>';
            return;
        }

        compras.forEach(compra => {
            cuerpo.innerHTML += `
                <tr>
                    <td><strong>#${compra.id}</strong></td>
                    <td>${compra.fecha}</td>
                    <td class="text-success fw-bold">$${parseFloat(compra.total).toFixed(2)}</td>
                </tr>
            `;
        });
    }

    actualizarContadorCarrito(cantidad) {
        const contador = document.getElementById('contador-carrito');
        if (contador) contador.textContent = cantidad;
    }

    actualizarMenuSesion(usuario) {
        const navLogin = document.getElementById('nav-login');
        if (usuario && navLogin) {
            navLogin.innerHTML = `
                <a href="mis-compras.html" class="text-light text-decoration-none me-3 fw-bold">Mis Pedidos</a>
                <span class="text-white-50">Hola, ${usuario.nombre}</span> | 
                <span style="cursor:pointer; color:#ff6b6b; margin-left: 5px; margin-right: 10px;" onclick="cerrarSesion()">Salir</span> |
                <span style="cursor:pointer; color:#dc3545;" onclick="eliminarCuenta()">Borrar Cuenta</span>
            `;
            navLogin.href = "#";
        }
    }

    mostrarAlerta(elementoId, mensaje, tipo = 'success') {
        const div = document.getElementById(elementoId);
        if (div) div.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    }
}