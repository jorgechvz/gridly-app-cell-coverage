from fastapi import FastAPI
import uvicorn
from .api.routes import router as api_router

app = FastAPI(title="Cell Coverage App")

app.include_router(api_router, prefix="/api", tags=["API"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
