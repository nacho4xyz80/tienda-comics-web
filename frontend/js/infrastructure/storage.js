export class StorageAdapter {
    guardar(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    obtener(clave) {
        const item = localStorage.getItem(clave);
        return item ? JSON.parse(item) : null;
    }

    eliminar(clave) {
        localStorage.removeItem(clave);
    }
}