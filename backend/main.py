from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
from database import SessionLocal, engine
import os
from typing import List, Optional
import uuid
import os
from fastapi.staticfiles import StaticFiles

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Users CRUD
@app.post("/users", response_model=schemas.User)
@app.post("/users/", response_model=schemas.User)
async def create_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    cellphone: str = Form(...),
    password: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    
    image_path = None
    if image:
        UPLOAD_DIR = "uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        file_ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        base_url = str(request.base_url)
        image_path = f"{base_url}uploads/{filename}"

    db_user = models.User(
        name=name,
        email=email,
        cellphone=cellphone,
        password=password,
        image=image_path,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/users/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    request: Request,
    name: str = Form(None),
    email: str = Form(None),
    cellphone: str = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if they are provided
    if name is not None:
        db_user.name = name
    if email is not None:
        db_user.email = email
    if cellphone is not None:
        db_user.cellphone = cellphone
    
    # Handle image upload
    if image:
        # Delete old image if it exists
        if db_user.image:
            try:
                old_filename = db_user.image.split('/')[-1]
                old_filepath = os.path.join("uploads", old_filename)
                if os.path.exists(old_filepath):
                    os.remove(old_filepath)
            except Exception as e:
                print(f"Error deleting old image: {e}")
        
        # Save new image
        UPLOAD_DIR = "uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        file_ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        base_url = str(request.base_url)
        db_user.image = f"{base_url}uploads/{filename}"
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Products CRUD
@app.post("/users/{user_id}/products", response_model=schemas.Product)
@app.post("/users/{user_id}/products/", response_model=schemas.Product)
async def create_product(
    user_id: int,
    request: Request,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    image_path = None
    if image:
        UPLOAD_DIR = "uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        file_ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        base_url = str(request.base_url)
        image_path = f"{base_url}uploads/{filename}"

    db_product = models.Product(
        name=name,
        description=description,
        price=price,
        image=image_path,
        user_id=user_id
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# Notifications CRUD

@app.put("/users/{user_id}/notifications/read_all", response_model=List[schemas.Notification])
def mark_all_notifications_read(
    user_id: int, db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    unread_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.is_read == False
    ).all()
    
    if not unread_notifications:
        return []
    
    for notification in unread_notifications:
        notification.is_read = True
    
    db.commit()

    for notification in unread_notifications:
        db.refresh(notification)
    
    return unread_notifications

@app.post("/users/{user_id}/notifications/", response_model=schemas.Notification)
def create_notification(
    user_id: int, notification: schemas.NotificationCreate, db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_notification = models.Notification(**notification.model_dump(), user_id=user_id)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@app.get("/users/{user_id}/notifications/", response_model=List[schemas.Notification])
def read_notifications(
    user_id: int, skip: int = 0, db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    notifications = db.query(models.Notification).filter(models.Notification.user_id == user_id).offset(skip).all()
    return notifications

@app.put("/users/{user_id}/notifications/{notification_id}", response_model=schemas.Notification)
def update_notification(
    user_id: int, notification_id: int, notification: schemas.NotificationUpdate, db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id, models.Notification.user_id == user_id).first()
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    update_data = notification.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_notification, key, value)
    
    db.commit()
    db.refresh(db_notification)
    return db_notification

@app.delete("/users/{user_id}/notifications/{notification_id}")
def delete_notification(
    user_id: int, notification_id: int, db: Session = Depends(get_db)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id, models.Notification.user_id == user_id).first()
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(db_notification)
    db.commit()
    return {"message": "Notification deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)