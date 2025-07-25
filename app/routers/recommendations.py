from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db, Product, Order, OrderItem, User
from app.ai_assistant import AIAssistant
import random

router = APIRouter()
ai_assistant = AIAssistant()

@router.get("/user/{user_id}")
async def get_user_recommendations(
    user_id: int, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    """Get personalized recommendations for a user"""
    try:
        recommendations = await ai_assistant.get_product_recommendations(user_id, db, limit)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/similar/{product_id}")
async def get_similar_products(
    product_id: int, 
    limit: int = 5, 
    db: Session = Depends(get_db)
):
    """Get products similar to a given product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Find similar products in the same category
    similar_products = db.query(Product).filter(
        Product.category == product.category,
        Product.id != product_id,
        Product.is_active == True
    ).order_by(Product.rating.desc()).limit(limit).all()
    
    recommendations = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "rating": p.rating,
            "image_url": p.image_url,
            "reason": f"Similar to {product.name}"
        }
        for p in similar_products
    ]
    
    return {"recommendations": recommendations}

@router.get("/trending")
async def get_trending_products(limit: int = 10, db: Session = Depends(get_db)):
    """Get trending products based on recent orders"""
    # Get products from recent orders
    recent_product_ids = db.query(OrderItem.product_id).join(Order).filter(
        Order.status.in_(["confirmed", "shipped", "delivered"])
    ).distinct().all()
    
    if not recent_product_ids:
        # Fallback to highest rated products
        trending = db.query(Product).filter(
            Product.is_active == True
        ).order_by(Product.rating.desc()).limit(limit).all()
    else:
        product_ids = [pid[0] for pid in recent_product_ids]
        trending = db.query(Product).filter(
            Product.id.in_(product_ids),
            Product.is_active == True
        ).order_by(Product.rating.desc()).limit(limit).all()
    
    recommendations = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "rating": p.rating,
            "image_url": p.image_url,
            "reason": "Trending now"
        }
        for p in trending
    ]
    
    return {"recommendations": recommendations}

@router.get("/category/{category}")
async def get_category_recommendations(
    category: str, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    """Get top products in a specific category"""
    products = db.query(Product).filter(
        Product.category == category,
        Product.is_active == True
    ).order_by(Product.rating.desc(), Product.review_count.desc()).limit(limit).all()
    
    recommendations = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "rating": p.rating,
            "image_url": p.image_url,
            "reason": f"Top rated in {category}"
        }
        for p in products
    ]
    
    return {"recommendations": recommendations}

@router.get("/price-range")
async def get_recommendations_by_price(
    min_price: float,
    max_price: float,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get product recommendations within a price range"""
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.price >= min_price,
        Product.price <= max_price
    ).order_by(Product.rating.desc()).limit(limit).all()
    
    recommendations = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "rating": p.rating,
            "image_url": p.image_url,
            "reason": f"Great value in ${min_price}-${max_price} range"
        }
        for p in products
    ]
    
    return {"recommendations": recommendations}

@router.get("/frequently-bought-together/{product_id}")
async def get_frequently_bought_together(
    product_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get products frequently bought together with the given product"""
    # Find orders that contain the given product
    orders_with_product = db.query(Order.id).join(OrderItem).filter(
        OrderItem.product_id == product_id
    ).subquery()
    
    # Find other products in those orders
    related_products = db.query(
        OrderItem.product_id,
        db.func.count(OrderItem.product_id).label('frequency')
    ).join(Order).filter(
        Order.id.in_(orders_with_product),
        OrderItem.product_id != product_id
    ).group_by(OrderItem.product_id).order_by(
        db.func.count(OrderItem.product_id).desc()
    ).limit(limit).all()
    
    if not related_products:
        # Fallback to similar category products
        base_product = db.query(Product).filter(Product.id == product_id).first()
        if base_product:
            similar = db.query(Product).filter(
                Product.category == base_product.category,
                Product.id != product_id,
                Product.is_active == True
            ).order_by(Product.rating.desc()).limit(limit).all()
            
            recommendations = [
                {
                    "id": p.id,
                    "name": p.name,
                    "price": p.price,
                    "rating": p.rating,
                    "image_url": p.image_url,
                    "reason": "Customers also liked"
                }
                for p in similar
            ]
            return {"recommendations": recommendations}
    
    # Get product details for frequently bought together items
    product_ids = [rp[0] for rp in related_products]
    products = db.query(Product).filter(
        Product.id.in_(product_ids),
        Product.is_active == True
    ).all()
    
    recommendations = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "rating": p.rating,
            "image_url": p.image_url,
            "reason": "Frequently bought together"
        }
        for p in products
    ]
    
    return {"recommendations": recommendations}