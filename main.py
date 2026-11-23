from fastapi import FastAPI
from src.utils.db import Base, engine
from src.tasks.router import task_routes

Base.metadata.create_all(engine)

app  = FastAPI(title="This is task management application")
app.include_router(task_routes)
#pydentic settings library helps to load data from env file to our fast api application

