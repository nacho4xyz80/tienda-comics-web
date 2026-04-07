const API_URL = 'http://localhost:8000';

export class ApiAdapter {
    async request(endpoint, options = {}) {
        try {
            const respuesta = await fetch(`${API_URL}${endpoint}`, options);
            const data = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(data.detail || "Error en la petición a la API");
            }
            return data;
        } catch (error) {
            console.error(`Error en API (${endpoint}):`, error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}