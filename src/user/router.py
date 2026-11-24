from fastapi import APIRouter , Depends , status , Request, BackgroundTasks
from sqlalchemy.orm import Session
from src.user.dtos import UserSchema, UserResponseSchema, LoginSchema
from src.utils.db import get_db
from src.user import controller

user_routes = APIRouter(prefix="/user")

#If we know a task take a lot of time so we make it async
#mail send take so much time so we make it as background task
@user_routes.post("/register" , response_model=UserResponseSchema)
async def register(body:UserSchema ,bg_task:BackgroundTasks, db:Session=Depends(get_db)):
    return await controller.register(body ,db , bg_task)

@user_routes.post("/login" , status_code=status.HTTP_200_OK)
def login(body:LoginSchema , db:Session=Depends(get_db)):
    return controller.login_user(body , db)

@user_routes.get("/is_auth" , status_code=status.HTTP_200_OK , response_model=UserResponseSchema)
def is_auth(request:Request , db:Session=Depends(get_db) , status_code=status.HTTP_200_OK):
    return controller.is_authenticated(request , db)