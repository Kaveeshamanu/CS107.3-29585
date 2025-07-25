from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db, Order, OrderItem, Product, User

router = APIRouter()

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemCreate]
    shipping_address: str
    payment_method: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    shipping_address: str
    payment_method: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    
    class Config:
        from_attributes = True

@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    # Verify user exists
    user = db.query(User).filter(User.id == order.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate total amount and verify products
    total_amount = 0
    order_items_data = []
    
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")
        
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_items_data.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price
        })
    
    # Create order
    db_order = Order(
        user_id=order.user_id,
        total_amount=total_amount,
        shipping_address=order.shipping_address,
        payment_method=order.payment_method,
        status="pending"
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item_data in order_items_data:
        db_item = OrderItem(
            order_id=db_order.id,
            **item_data
        )
        db.add(db_item)
        
        # Update product stock
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock_quantity -= item_data["quantity"]
    
    db.commit()
    
    # Return order with items
    return get_order_with_items(db_order.id, db)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order details"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return get_order_with_items(order_id, db)

@router.get("/user/{user_id}", response_model=List[OrderResponse])
async def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    """Get all orders for a user"""
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        order_data = get_order_with_items(order.id, db)
        result.append(order_data)
    
    return result

@router.put("/{order_id}/status")
async def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    """Update order status"""
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    order.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Order {order_id} status updated to {status}"}

@router.get("/track/{order_id}")
async def track_order(order_id: int, db: Session = Depends(get_db)):
    """Track order status and get estimated delivery"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Simple tracking logic
    status_info = {
        "pending": {"message": "Order received and being processed", "progress": 20},
        "confirmed": {"message": "Order confirmed and preparing for shipment", "progress": 40},
        "shipped": {"message": "Order has been shipped", "progress": 70},
        "delivered": {"message": "Order has been delivered", "progress": 100},
        "cancelled": {"message": "Order has been cancelled", "progress": 0}
    }
    
    return {
        "order_id": order_id,
        "status": order.status,
        "info": status_info.get(order.status, {"message": "Unknown status", "progress": 0}),
        "created_at": order.created_at,
        "updated_at": order.updated_at
    }

def get_order_with_items(order_id: int, db: Session) -> OrderResponse:
    """Helper function to get order with items"""
    order = db.query(Order).filter(Order.id == order_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    
    order_items = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        order_items.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=product.name if product else "Unknown Product",
            quantity=item.quantity,
            price=item.price
        ))
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        total_amount=order.total_amount,
        status=order.status,
        shipping_address=order.shipping_address,
        payment_method=order.payment_method,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=order_items
    )