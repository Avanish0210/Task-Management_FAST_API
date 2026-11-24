from fastapi import APIRouter, Depends, status
from src.tasks import controller
from src.tasks.dtos import TaskSchema , TaskResponseSchema
from typing import List
from src.utils.db import get_db
from sqlalchemy.orm import Session

#router receive req and pass to controller

#this is to make a default route
task_routes = APIRouter(prefix="/tasks")

#depends is for the dependevy injection
@task_routes.post("/create" ,response_model=TaskResponseSchema , status_code=status.HTTP_201_CREATED)
def create_tasks(body: TaskSchema , db:Session = Depends(get_db)):
    return controller.create_task(body , db)

@task_routes.get("/all_tasks" ,response_model=List[TaskResponseSchema] ,  status_code=status.HTTP_200_OK)
def get_all_tasks(db:Session = Depends(get_db)):
    return controller.get_tasks(db)

@task_routes.get("/tasks/{task_id}" ,response_model=TaskResponseSchema , status_code=status.HTTP_200_OK)
def get_one_tasks(task_id:int , db:Session = Depends(get_db)):
    return controller.get_one_tasks(task_id , db)

@task_routes.put("/update_tasks/{task_id}" ,response_model=TaskResponseSchema,  status_code=status.HTTP_201_CREATED)
def update_task(task_id:int , body:TaskSchema , db:Session=Depends(get_db)):
    return controller.update_task(task_id , body , db)

@task_routes.delete("/delete_tasks/{task_id}" , status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id:int , db:Session=Depends(get_db)):
    return controller.delete_task(task_id , db)