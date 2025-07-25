"""
Sample data generator for the e-commerce AI assistant
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, User, Product, Order, OrderItem
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_sample_data():
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Product).delete()
        db.query(User).delete()
        db.commit()
        
        # Create sample users
        users_data = [
            {
                "email": "john.doe@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "hashed_password": pwd_context.hash("password123")
            },
            {
                "email": "jane.smith@example.com",
                "username": "janesmith",
                "full_name": "Jane Smith",
                "hashed_password": pwd_context.hash("password123")
            },
            {
                "email": "alice.johnson@example.com",
                "username": "alicejohnson",
                "full_name": "Alice Johnson",
                "hashed_password": pwd_context.hash("password123")
            },
            {
                "email": "bob.wilson@example.com",
                "username": "bobwilson",
                "full_name": "Bob Wilson",
                "hashed_password": pwd_context.hash("password123")
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
            users.append(user)
        
        db.commit()
        
        # Create sample products
        products_data = [
            {
                "name": "Wireless Bluetooth Headphones",
                "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
                "price": 199.99,
                "category": "Electronics",
                "stock_quantity": 50,
                "rating": 4.5,
                "review_count": 128,
                "image_url": "https://example.com/headphones.jpg"
            },
            {
                "name": "Smart Fitness Watch",
                "description": "Advanced fitness tracker with heart rate monitoring, GPS, and waterproof design.",
                "price": 299.99,
                "category": "Electronics",
                "stock_quantity": 30,
                "rating": 4.7,
                "review_count": 89,
                "image_url": "https://example.com/watch.jpg"
            },
            {
                "name": "Organic Cotton T-Shirt",
                "description": "Comfortable and sustainable organic cotton t-shirt available in multiple colors.",
                "price": 29.99,
                "category": "Clothing",
                "stock_quantity": 100,
                "rating": 4.3,
                "review_count": 245,
                "image_url": "https://example.com/tshirt.jpg"
            },
            {
                "name": "Premium Coffee Beans",
                "description": "Single-origin arabica coffee beans, medium roast, 1lb bag.",
                "price": 24.99,
                "category": "Food & Beverages",
                "stock_quantity": 75,
                "rating": 4.8,
                "review_count": 156,
                "image_url": "https://example.com/coffee.jpg"
            },
            {
                "name": "Wireless Phone Charger",
                "description": "Fast wireless charging pad compatible with all Qi-enabled devices.",
                "price": 39.99,
                "category": "Electronics",
                "stock_quantity": 60,
                "rating": 4.4,
                "review_count": 92,
                "image_url": "https://example.com/charger.jpg"
            },
            {
                "name": "Yoga Mat Premium",
                "description": "Non-slip yoga mat made from eco-friendly materials, perfect for all yoga styles.",
                "price": 79.99,
                "category": "Sports & Fitness",
                "stock_quantity": 40,
                "rating": 4.6,
                "review_count": 203,
                "image_url": "https://example.com/yogamat.jpg"
            },
            {
                "name": "Stainless Steel Water Bottle",
                "description": "Insulated water bottle that keeps drinks cold for 24h or hot for 12h.",
                "price": 34.99,
                "category": "Sports & Fitness",
                "stock_quantity": 80,
                "rating": 4.5,
                "review_count": 167,
                "image_url": "https://example.com/bottle.jpg"
            },
            {
                "name": "Bluetooth Speaker",
                "description": "Portable Bluetooth speaker with 360-degree sound and 12-hour battery life.",
                "price": 89.99,
                "category": "Electronics",
                "stock_quantity": 45,
                "rating": 4.4,
                "review_count": 134,
                "image_url": "https://example.com/speaker.jpg"
            },
            {
                "name": "Skincare Set",
                "description": "Complete skincare routine with cleanser, toner, serum, and moisturizer.",
                "price": 149.99,
                "category": "Beauty & Personal Care",
                "stock_quantity": 25,
                "rating": 4.7,
                "review_count": 78,
                "image_url": "https://example.com/skincare.jpg"
            },
            {
                "name": "LED Desk Lamp",
                "description": "Adjustable LED desk lamp with multiple brightness levels and USB charging port.",
                "price": 59.99,
                "category": "Home & Garden",
                "stock_quantity": 35,
                "rating": 4.3,
                "review_count": 112,
                "image_url": "https://example.com/lamp.jpg"
            },
            {
                "name": "Running Shoes",
                "description": "Lightweight running shoes with advanced cushioning and breathable mesh upper.",
                "price": 129.99,
                "category": "Sports & Fitness",
                "stock_quantity": 55,
                "rating": 4.6,
                "review_count": 189,
                "image_url": "https://example.com/shoes.jpg"
            },
            {
                "name": "Kitchen Knife Set",
                "description": "Professional-grade kitchen knife set with wooden block and sharpening steel.",
                "price": 199.99,
                "category": "Home & Garden",
                "stock_quantity": 20,
                "rating": 4.8,
                "review_count": 67,
                "image_url": "https://example.com/knives.jpg"
            }
        ]
        
        products = []
        for product_data in products_data:
            product = Product(**product_data)
            db.add(product)
            products.append(product)
        
        db.commit()
        
        # Create sample orders
        for user in users:
            # Create 1-3 orders per user
            num_orders = random.randint(1, 3)
            
            for _ in range(num_orders):
                # Random order date within last 60 days
                order_date = datetime.utcnow() - timedelta(days=random.randint(1, 60))
                
                # Select 1-4 random products for the order
                order_products = random.sample(products, random.randint(1, 4))
                
                total_amount = 0
                order_items_data = []
                
                for product in order_products:
                    quantity = random.randint(1, 3)
                    item_total = product.price * quantity
                    total_amount += item_total
                    
                    order_items_data.append({
                        "product_id": product.id,
                        "quantity": quantity,
                        "price": product.price
                    })
                
                # Create order
                order = Order(
                    user_id=user.id,
                    total_amount=total_amount,
                    status=random.choice(["pending", "confirmed", "shipped", "delivered"]),
                    shipping_address=f"{random.randint(100, 9999)} Main St, City, State {random.randint(10000, 99999)}",
                    payment_method=random.choice(["credit_card", "debit_card", "paypal"]),
                    created_at=order_date,
                    updated_at=order_date
                )
                
                db.add(order)
                db.commit()
                db.refresh(order)
                
                # Create order items
                for item_data in order_items_data:
                    order_item = OrderItem(
                        order_id=order.id,
                        **item_data
                    )
                    db.add(order_item)
                
                db.commit()
        
        print("Sample data created successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {len(products)} products")
        
        # Count orders
        total_orders = db.query(Order).count()
        print(f"Created {total_orders} orders")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()