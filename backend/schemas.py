from typing import Optional, Union
from pydantic import BaseModel, EmailStr, AnyUrl

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    name: str
    email: EmailStr
    password: str
    cellphone: str
    image: Optional[Union[str, bytes]] = None 

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cellphone: Optional[str] = None
    password: Optional[str] = None
    image: Optional[Union[str, bytes]] = None 

class User(UserBase):
    id: int
    name: str
    email: EmailStr
    password: str
    cellphone: Optional[str]
    image: Optional[str]

    class Config:
        orm_mode = True


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ProductCreate(ProductBase):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[Union[str, bytes]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image: Optional[Union[str, bytes]] = None

class Product(ProductBase):
    id: int
    user_id: int
    image:  Optional[str]

    class Config:
        orm_mode = True

class NotificationBase(BaseModel):
    name: str
    message: str
    is_read: Optional[bool] = False

class NotificationCreate(NotificationBase):
    name: str
    message: str
    is_read: Optional[bool] = False

class NotificationUpdate(BaseModel):
    name: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True