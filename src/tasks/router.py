from fastapi import APIRouter, Depends
from src.tasks import controller
from src.tasks.dtos import TaskSchema

from src.utils.db import get_db

#router receive req and pass to controller

#this is to make a default route
task_routes = APIRouter(prefix="/tasks")

#depends is for the dependevy injection
@task_routes.post("/create")
def create_tasks(body: TaskSchema , db = Depends(get_db)):
    return controller.create_task(body , db)

@task_routes.get("/all_tasks")
def get_all_tasks(db = Depends(get_db)):
    return controller.get_tasks(db)

@task_routes.get("/tasks/{task_id}")
def get_one_tasks(task_id:int , db = Depends(get_db)):
    return controller.get_one_tasks(task_id , db)

@task_routes.put("/update_tasks/{task_id}")
def update_task(task_id:int , body:TaskSchema , db=Depends(get_db)):
    return controller.update_task(task_id , body , db)

@task_routes.delete("/delete_tasks/{task_id}")
def delete_task(task_id:int , db=Depends(get_db)):
    return controller.delete_task(task_id , db)