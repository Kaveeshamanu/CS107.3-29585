import openai
import os
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import Product, Order, User, ChatInteraction
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class AIAssistant:
    def __init__(self):
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key and openai_api_key != "sk-your-openai-api-key-here":
            self.openai_client = openai.OpenAI(api_key=openai_api_key)
            self.use_openai = True
        else:
            self.openai_client = None
            self.use_openai = False
            
        self.system_prompt = """
        You are an intelligent AI assistant for an e-commerce platform. Your role is to help customers with:
        
        1. Product recommendations and search
        2. Order tracking and support
        3. General customer service inquiries
        4. Shopping assistance and comparisons
        5. Technical support
        
        You have access to the following functions:
        - search_products: Find products based on queries
        - get_order_status: Check order status and details
        - get_product_recommendations: Get personalized recommendations
        - analyze_customer_sentiment: Understand customer mood
        
        Always be helpful, professional, and provide accurate information. If you cannot find specific information, offer alternatives or suggest contacting customer support.
        """
        
        self.product_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.product_vectors = None
        
    async def process_message(self, message: str, user_id: Optional[int], db: Session) -> Dict[str, Any]:
        """Process user message and generate response"""
        try:
            # Analyze intent
            intent = await self._analyze_intent(message)
            
            # Get context based on intent
            context = await self._get_context(intent, message, user_id, db)
            
            # Generate response using OpenAI
            response = await self._generate_response(message, context, intent)
            
            # Store interaction
            if user_id:
                interaction = ChatInteraction(
                    user_id=user_id,
                    message=message,
                    response=response["content"],
                    intent=intent
                )
                db.add(interaction)
                db.commit()
            
            return {
                "response": response["content"],
                "intent": intent,
                "context": context,
                "suggestions": response.get("suggestions", [])
            }
            
        except Exception as e:
            return {
                "response": "I apologize, but I'm experiencing some technical difficulties. Please try again or contact customer support.",
                "intent": "error",
                "context": {},
                "suggestions": []
            }
    
    async def _analyze_intent(self, message: str) -> str:
        """Analyze user intent from message"""
        message_lower = message.lower()
        
        # Product search intent
        if any(keyword in message_lower for keyword in ['find', 'search', 'looking for', 'show me', 'recommend', 'suggest']):
            return "product_search"
        
        # Order inquiry intent
        elif any(keyword in message_lower for keyword in ['order', 'delivery', 'shipping', 'track', 'status']):
            return "order_inquiry"
        
        # Support intent
        elif any(keyword in message_lower for keyword in ['help', 'problem', 'issue', 'support', 'complaint']):
            return "support"
        
        # Comparison intent
        elif any(keyword in message_lower for keyword in ['compare', 'difference', 'better', 'vs', 'versus']):
            return "comparison"
        
        # General inquiry
        else:
            return "general"
    
    async def _get_context(self, intent: str, message: str, user_id: Optional[int], db: Session) -> Dict[str, Any]:
        """Get relevant context based on intent"""
        context = {}
        
        if intent == "product_search":
            products = await self._search_products(message, db)
            context["products"] = products[:5]  # Limit to top 5 results
        
        elif intent == "order_inquiry" and user_id:
            orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).limit(3).all()
            context["recent_orders"] = [
                {
                    "id": order.id,
                    "status": order.status,
                    "total": order.total_amount,
                    "created_at": order.created_at.isoformat()
                }
                for order in orders
            ]
        
        elif intent == "support" and user_id:
            # Get recent interactions for better support
            recent_interactions = db.query(ChatInteraction).filter(
                ChatInteraction.user_id == user_id
            ).order_by(ChatInteraction.created_at.desc()).limit(3).all()
            
            context["recent_interactions"] = [
                {
                    "message": interaction.message,
                    "response": interaction.response,
                    "intent": interaction.intent
                }
                for interaction in recent_interactions
            ]
        
        return context
    
    async def _search_products(self, query: str, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Search products based on query"""
        # Simple text search using OR logic for each term
        search_terms = query.lower().split()
        if not search_terms:
            return []
            
        # Build OR conditions for each search term
        conditions = []
        for term in search_terms:
            conditions.append(Product.name.ilike(f'%{term}%'))
            conditions.append(Product.description.ilike(f'%{term}%'))
            conditions.append(Product.category.ilike(f'%{term}%'))
        
        # Use OR logic to find products matching any condition
        from sqlalchemy import or_
        products = db.query(Product).filter(
            Product.is_active == True,
            or_(*conditions)
        ).order_by(Product.rating.desc()).limit(limit).all()
        
        return [
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "category": product.category,
                "rating": product.rating,
                "stock": product.stock_quantity,
                "image_url": product.image_url
            }
            for product in products
        ]
    
    async def _generate_response(self, message: str, context: Dict[str, Any], intent: str) -> Dict[str, Any]:
        """Generate response using OpenAI or fallback to rule-based responses"""
        try:
            if self.use_openai and self.openai_client:
                # Use OpenAI for response generation
                context_str = json.dumps(context, indent=2) if context else "No specific context available."
                
                messages = [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"""
                    User message: {message}
                    Intent: {intent}
                    Context: {context_str}
                    
                    Please provide a helpful response and suggest 2-3 follow-up actions if appropriate.
                    """}
                ]
                
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=500,
                    temperature=0.7
                )
                
                content = response.choices[0].message.content
                suggestions = self._extract_suggestions(content)
                
                return {
                    "content": content,
                    "suggestions": suggestions
                }
            else:
                # Fallback to rule-based responses
                return await self._generate_fallback_response(message, context, intent)
            
        except Exception as e:
            return await self._generate_fallback_response(message, context, intent)
    
    async def _generate_fallback_response(self, message: str, context: Dict[str, Any], intent: str) -> Dict[str, Any]:
        """Generate rule-based responses when OpenAI is not available"""
        message_lower = message.lower()
        
        if intent == "product_search":
            if context.get("products"):
                products = context["products"]
                if products:
                    product_list = "\n".join([f"• {p['name']} - ${p['price']}" for p in products[:3]])
                    content = f"I found {len(products)} products matching your search:\n\n{product_list}\n\nWould you like to see more details about any of these products?"
                    suggestions = ["Show product details", "Refine search", "View all products"]
                else:
                    content = "I couldn't find any products matching your search. Try using different keywords or browse our categories."
                    suggestions = ["Browse categories", "Try different keywords", "View featured products"]
            else:
                content = "I can help you search for products! What are you looking for today?"
                suggestions = ["Electronics", "Clothing", "Home & Garden"]
        
        elif intent == "order_inquiry":
            if context.get("recent_orders"):
                orders = context["recent_orders"]
                if orders:
                    order_info = f"Your most recent order (#{orders[0]['id']}) is {orders[0]['status']}."
                    content = f"{order_info} You have {len(orders)} recent orders. Would you like more details?"
                    suggestions = ["Track order", "View order history", "Contact support"]
                else:
                    content = "I don't see any recent orders for you. Would you like to browse our products?"
                    suggestions = ["Browse products", "View featured items", "Contact support"]
            else:
                content = "I can help you track your orders! Please provide your order number or sign in to view your order history."
                suggestions = ["Enter order number", "Sign in", "Contact support"]
        
        elif intent == "support":
            content = "I'm here to help! I can assist with product questions, order tracking, returns, and general inquiries. What do you need help with?"
            suggestions = ["Order issues", "Product questions", "Return/refund"]
        
        elif intent == "comparison":
            content = "I can help you compare products! Please tell me which specific products you'd like to compare, and I'll highlight the key differences."
            suggestions = ["Compare by category", "Price comparison", "Feature comparison"]
        
        else:
            content = "Hello! I'm your AI shopping assistant. I can help you find products, track orders, answer questions, and provide recommendations. How can I assist you today?"
            suggestions = ["Find products", "Track order", "Get recommendations"]
        
        return {
            "content": content,
            "suggestions": suggestions
        }
    
    def _extract_suggestions(self, content: str) -> List[str]:
        """Extract suggestions from AI response"""
        # Simple pattern matching for suggestions
        suggestions = []
        lines = content.split('\n')
        
        for line in lines:
            if line.strip().startswith(('•', '-', '*')) or 'suggest' in line.lower():
                suggestion = re.sub(r'^[•\-\*\s]+', '', line.strip())
                if suggestion and len(suggestion) < 100:
                    suggestions.append(suggestion)
        
        return suggestions[:3]  # Limit to 3 suggestions
    
    async def get_product_recommendations(self, user_id: int, db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """Get personalized product recommendations"""
        try:
            # Get user's order history
            user_orders = db.query(Order).filter(Order.user_id == user_id).all()
            
            if not user_orders:
                # Return popular products for new users
                popular_products = db.query(Product).filter(
                    Product.is_active == True
                ).order_by(Product.rating.desc(), Product.review_count.desc()).limit(limit).all()
                
                return [
                    {
                        "id": product.id,
                        "name": product.name,
                        "price": product.price,
                        "rating": product.rating,
                        "reason": "Popular choice"
                    }
                    for product in popular_products
                ]
            
            # Get categories from user's purchase history
            purchased_categories = set()
            for order in user_orders:
                for item in order.items:
                    if item.product:
                        purchased_categories.add(item.product.category)
            
            # Recommend products from similar categories
            recommended_products = db.query(Product).filter(
                Product.is_active == True,
                Product.category.in_(purchased_categories)
            ).order_by(Product.rating.desc()).limit(limit).all()
            
            return [
                {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "rating": product.rating,
                    "reason": f"Based on your interest in {product.category}"
                }
                for product in recommended_products
            ]
            
        except Exception as e:
            return []
    
    async def analyze_sentiment(self, message: str) -> Dict[str, Any]:
        """Analyze customer sentiment"""
        try:
            if self.use_openai and self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Analyze the sentiment of the following customer message. Respond with a JSON object containing 'sentiment' (positive/negative/neutral), 'confidence' (0-1), and 'emotions' (array of detected emotions)."},
                        {"role": "user", "content": message}
                    ],
                    max_tokens=150
                )
                
                result = response.choices[0].message.content
                return json.loads(result)
            else:
                # Simple rule-based sentiment analysis
                message_lower = message.lower()
                positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic']
                negative_words = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointed', 'angry']
                
                positive_count = sum(1 for word in positive_words if word in message_lower)
                negative_count = sum(1 for word in negative_words if word in message_lower)
                
                if positive_count > negative_count:
                    sentiment = "positive"
                    confidence = min(0.8, 0.5 + positive_count * 0.1)
                elif negative_count > positive_count:
                    sentiment = "negative"
                    confidence = min(0.8, 0.5 + negative_count * 0.1)
                else:
                    sentiment = "neutral"
                    confidence = 0.6
                
                return {
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "emotions": []
                }
            
        except Exception as e:
            return {
                "sentiment": "neutral",
                "confidence": 0.5,
                "emotions": []
            }