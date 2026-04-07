export class CartService {
    constructor(apiAdapter, storageAdapter) {
        this.api = apiAdapter;
        this.storage = storageAdapter;
        this.CART_KEY = 'carritoComics';
    }

    obtenerCarrito() {
        return this.storage.obtener(this.CART_KEY) || [];
    }

    agregarItem(comic) {
        const carrito = this.obtenerCarrito();
        carrito.push(comic);
        this.storage.guardar(this.CART_KEY, carrito);
    }

    eliminarItem(index) {
        const carrito = this.obtenerCarrito();
        carrito.splice(index, 1);
        this.storage.guardar(this.CART_KEY, carrito);
    }

    vaciarCarrito() {
        this.storage.eliminar(this.CART_KEY);
    }

    async procesarCompra(usuarioId) {
        const carrito = this.obtenerCarrito();
        if (carrito.length === 0) throw new Error("El carrito está vacío");

        let total = 0;
        let conteoComics = {};

        // Lógica de negocio: Agrupar y calcular total
        carrito.forEach(comic => {
            total += parseFloat(comic.precio);
            if (conteoComics[comic.id]) {
                conteoComics[comic.id] += 1;
            } else {
                conteoComics[comic.id] = 1;
            }
        });

        // Formatear para la API
        const items = Object.keys(conteoComics).map(id => ({
            comic_id: parseInt(id),
            cantidad: conteoComics[id]
        }));

        const payload = { usuario_id: usuarioId, total: total, items: items };
        
        // Enviar compra a la API
        const data = await this.api.post('/comprar', payload);
        
        // Si todo sale bien, vaciamos el carrito local
        this.vaciarCarrito();
        
        return data.compra_id;
    }

    async obtenerHistorial(usuarioId) {
        return await this.api.get(`/usuarios/${usuarioId}/compras`);
    }
}