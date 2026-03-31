from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importamos las rutas que acabamos de crear
from infrastructure.api_routes import router as comics_router

app = FastAPI(
    title="API Tienda de Cómics - Arquitectura Hexagonal",
    description="API refactorizada usando principios SOLID y Arquitectura Hexagonal."
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectamos nuestras rutas a la aplicación principal
app.include_router(comics_router)

# Nota: Para mantener el login y las compras funcionando en este nuevo archivo, 
# más adelante podrías crear un `user_service` y un `compras_service` siguiendo 
# el mismo patrón exacto que hicimos con los cómics, y luego usar app.include_router() aquí.