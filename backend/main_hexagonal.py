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
