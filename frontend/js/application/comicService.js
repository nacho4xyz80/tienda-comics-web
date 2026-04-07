export class ComicService {
    // Inyectamos el adaptador de la API
    constructor(apiAdapter) {
        this.api = apiAdapter;
    }

    async obtenerCatalogo() {
        return await this.api.get('/comics');
    }

    async buscar(termino) {
        return await this.api.get(`/comics/buscar/?q=${termino}`);
    }

    async obtenerDetalle(id) {
        return await this.api.get(`/comics/${id}`);
    }
}