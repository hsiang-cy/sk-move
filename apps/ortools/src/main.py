from fastapi import FastAPI
from vrp.router import router as vrp_router

app = FastAPI()

app.include_router(vrp_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}
