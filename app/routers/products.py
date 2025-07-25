from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db, Product

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock_quantity: int = 0
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    stock_quantity: int
    image_url: Optional[str]
    rating: float
    review_count: int
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get products with optional filtering"""
    query = db.query(Product).filter(Product.is_active == True)
    
    if category:
        query = query.filter(Product.category == category)
    
    if search:
        query = query.filter(
            Product.name.contains(search) | 
            Product.description.contains(search)
        )
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    categories = db.query(Product.category).filter(Product.is_active == True).distinct().all()
    return {"categories": [cat[0] for cat in categories]}

@router.get("/search/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """Get search suggestions based on query"""
    products = db.query(Product.name).filter(
        Product.is_active == True,
        Product.name.contains(q)
    ).limit(5).all()
    
    suggestions = [product[0] for product in products]
    return {"suggestions": suggestions}

@router.get("/featured/products", response_model=List[ProductResponse])
async def get_featured_products(limit: int = 8, db: Session = Depends(get_db)):
    """Get featured products (highest rated)"""
    products = db.query(Product).filter(
        Product.is_active == True
    ).order_by(Product.rating.desc(), Product.review_count.desc()).limit(limit).all()
    
    return products