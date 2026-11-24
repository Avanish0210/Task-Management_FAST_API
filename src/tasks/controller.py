from src.tasks.dtos import TaskSchema
from sqlalchemy.orm import Session
from src.tasks.models import TaskModel
from fastapi import HTTPException

#logics are defined in controller
def create_task(body:TaskSchema , db:Session):
    data = body.model_dump()

    new_task = TaskModel(title = data["title"] , description = data["description"] , is_completed = data["is_completed"])

    db.add(new_task)
    db.commit()

    db.refresh(new_task)

    return new_task  


def get_tasks(db:Session):
    tasks = db.query(TaskModel).all()

    return tasks

def get_one_tasks(task_id:int , db:Session):
    one_task = db.query().get(task_id)

    if not one_task:
        return HTTPException(404 , detail="Not Found")

    return one_task

def update_task(task_id: int , body:TaskSchema, db:Session):
    one_task = db.query(TaskModel).get(task_id)
    
    if not one_task:
        return HTTPException(404 , detail="Not Found")

    body = body.model_dump()
    for field , value in body.items():
        setattr(one_task , field , value)

    db.add(one_task)
    db.commit()
    db.refresh(one_task)

    return one_task

def delete_task(task_id: int , db:Session):
    one_task = db.query().get(task_id)
        
    if not one_task:
        return HTTPException(404 , detail="Not Found")

    db.delete(one_task)
    db.commit()

    return None