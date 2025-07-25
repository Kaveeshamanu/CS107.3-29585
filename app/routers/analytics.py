from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db, Product, Order, OrderItem, User, ChatInteraction

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    # Total counts
    total_users = db.query(User).count()
    total_products = db.query(Product).filter(Product.is_active == True).count()
    total_orders = db.query(Order).count()
    
    # Revenue statistics
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_orders = db.query(Order).filter(Order.created_at >= thirty_days_ago).count()
    recent_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Order status distribution
    order_status_stats = db.query(
        Order.status,
        func.count(Order.id)
    ).group_by(Order.status).all()
    
    return {
        "totals": {
            "users": total_users,
            "products": total_products,
            "orders": total_orders,
            "revenue": total_revenue
        },
        "recent_activity": {
            "orders_last_30_days": recent_orders,
            "revenue_last_30_days": recent_revenue
        },
        "order_status_distribution": {
            status: count for status, count in order_status_stats
        }
    }

@router.get("/sales/trends")
async def get_sales_trends(days: int = 30, db: Session = Depends(get_db)):
    """Get sales trends over specified period"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily sales
    daily_sales = db.query(
        func.date(Order.created_at).label('date'),
        func.count(Order.id).label('orders'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        Order.created_at >= start_date
    ).group_by(
        func.date(Order.created_at)
    ).order_by('date').all()
    
    return {
        "period_days": days,
        "daily_trends": [
            {
                "date": str(row.date),
                "orders": row.orders,
                "revenue": float(row.revenue or 0)
            }
            for row in daily_sales
        ]
    }

@router.get("/products/top-selling")
async def get_top_selling_products(limit: int = 10, db: Session = Depends(get_db)):
    """Get top selling products"""
    top_products = db.query(
        Product.id,
        Product.name,
        Product.price,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.quantity * OrderItem.price).label('total_revenue')
    ).join(OrderItem).join(Order).filter(
        Product.is_active == True
    ).group_by(
        Product.id, Product.name, Product.price
    ).order_by(
        desc('total_sold')
    ).limit(limit).all()
    
    return {
        "top_products": [
            {
                "id": row.id,
                "name": row.name,
                "price": row.price,
                "total_sold": row.total_sold,
                "total_revenue": float(row.total_revenue)
            }
            for row in top_products
        ]
    }

@router.get("/categories/performance")
async def get_category_performance(db: Session = Depends(get_db)):
    """Get performance metrics by product category"""
    category_stats = db.query(
        Product.category,
        func.count(Product.id).label('product_count'),
        func.avg(Product.rating).label('avg_rating'),
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.quantity * OrderItem.price).label('total_revenue')
    ).outerjoin(OrderItem).filter(
        Product.is_active == True
    ).group_by(Product.category).all()
    
    return {
        "categories": [
            {
                "category": row.category,
                "product_count": row.product_count,
                "avg_rating": float(row.avg_rating or 0),
                "total_sold": row.total_sold or 0,
                "total_revenue": float(row.total_revenue or 0)
            }
            for row in category_stats
        ]
    }

@router.get("/customers/insights")
async def get_customer_insights(db: Session = Depends(get_db)):
    """Get customer behavior insights"""
    # Customer order statistics
    customer_stats = db.query(
        func.count(func.distinct(Order.user_id)).label('total_customers'),
        func.avg(Order.total_amount).label('avg_order_value'),
        func.count(Order.id).label('total_orders')
    ).first()
    
    # Top customers by order value
    top_customers = db.query(
        User.id,
        User.username,
        User.email,
        func.count(Order.id).label('order_count'),
        func.sum(Order.total_amount).label('total_spent')
    ).join(Order).group_by(
        User.id, User.username, User.email
    ).order_by(desc('total_spent')).limit(10).all()
    
    # Customer acquisition (new customers per month)
    monthly_new_customers = db.query(
        func.date_trunc('month', User.created_at).label('month'),
        func.count(User.id).label('new_customers')
    ).group_by('month').order_by('month').all()
    
    return {
        "overview": {
            "total_customers": customer_stats.total_customers,
            "avg_order_value": float(customer_stats.avg_order_value or 0),
            "total_orders": customer_stats.total_orders
        },
        "top_customers": [
            {
                "id": row.id,
                "username": row.username,
                "email": row.email,
                "order_count": row.order_count,
                "total_spent": float(row.total_spent)
            }
            for row in top_customers
        ],
        "monthly_acquisition": [
            {
                "month": str(row.month),
                "new_customers": row.new_customers
            }
            for row in monthly_new_customers
        ]
    }

@router.get("/ai-interactions/stats")
async def get_ai_interaction_stats(db: Session = Depends(get_db)):
    """Get AI assistant interaction statistics"""
    # Total interactions
    total_interactions = db.query(ChatInteraction).count()
    
    # Interactions by intent
    intent_stats = db.query(
        ChatInteraction.intent,
        func.count(ChatInteraction.id)
    ).group_by(ChatInteraction.intent).all()
    
    # Daily interactions (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_interactions = db.query(
        func.date(ChatInteraction.created_at).label('date'),
        func.count(ChatInteraction.id).label('interactions')
    ).filter(
        ChatInteraction.created_at >= thirty_days_ago
    ).group_by(
        func.date(ChatInteraction.created_at)
    ).order_by('date').all()
    
    # Most active users
    active_users = db.query(
        User.username,
        func.count(ChatInteraction.id).label('interaction_count')
    ).join(ChatInteraction).group_by(
        User.id, User.username
    ).order_by(desc('interaction_count')).limit(10).all()
    
    return {
        "total_interactions": total_interactions,
        "intent_distribution": {
            intent: count for intent, count in intent_stats
        },
        "daily_interactions": [
            {
                "date": str(row.date),
                "interactions": row.interactions
            }
            for row in daily_interactions
        ],
        "most_active_users": [
            {
                "username": row.username,
                "interaction_count": row.interaction_count
            }
            for row in active_users
        ]
    }

@router.get("/inventory/alerts")
async def get_inventory_alerts(low_stock_threshold: int = 10, db: Session = Depends(get_db)):
    """Get inventory alerts for low stock products"""
    low_stock_products = db.query(Product).filter(
        Product.is_active == True,
        Product.stock_quantity <= low_stock_threshold
    ).order_by(Product.stock_quantity).all()
    
    out_of_stock = db.query(Product).filter(
        Product.is_active == True,
        Product.stock_quantity == 0
    ).count()
    
    return {
        "alerts": {
            "out_of_stock_count": out_of_stock,
            "low_stock_count": len(low_stock_products)
        },
        "low_stock_products": [
            {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "current_stock": product.stock_quantity,
                "price": product.price
            }
            for product in low_stock_products
        ]
    }

@router.get("/predictions/demand")
async def predict_demand(product_id: int, db: Session = Depends(get_db)):
    """Simple demand prediction based on historical data"""
    # Get historical sales data for the product
    historical_sales = db.query(
        func.date_trunc('week', Order.created_at).label('week'),
        func.sum(OrderItem.quantity).label('quantity_sold')
    ).join(OrderItem).filter(
        OrderItem.product_id == product_id,
        Order.created_at >= datetime.utcnow() - timedelta(days=90)
    ).group_by('week').order_by('week').all()
    
    if not historical_sales:
        return {"prediction": "Insufficient data for prediction"}
    
    # Simple moving average prediction
    recent_weeks = [row.quantity_sold for row in historical_sales[-4:]]  # Last 4 weeks
    if recent_weeks:
        predicted_demand = sum(recent_weeks) / len(recent_weeks)
        trend = "increasing" if recent_weeks[-1] > recent_weeks[0] else "decreasing"
    else:
        predicted_demand = 0
        trend = "stable"
    
    return {
        "product_id": product_id,
        "predicted_weekly_demand": predicted_demand,
        "trend": trend,
        "historical_data": [
            {
                "week": str(row.week),
                "quantity_sold": row.quantity_sold
            }
            for row in historical_sales
        ]
    }