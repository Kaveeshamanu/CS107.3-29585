from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.ai_assistant import AIAssistant

router = APIRouter()
ai_assistant = AIAssistant()

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[int] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    suggestions: List[str]
    context: dict

@router.post("/message", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage, db: Session = Depends(get_db)):
    """Send a message to the AI assistant"""
    try:
        result = await ai_assistant.process_message(
            message=chat_message.message,
            user_id=chat_message.user_id,
            db=db
        )
        
        return ChatResponse(
            response=result["response"],
            intent=result["intent"],
            suggestions=result["suggestions"],
            context=result["context"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    """Get personalized product recommendations"""
    try:
        recommendations = await ai_assistant.get_product_recommendations(user_id, db)
        return {"recommendations": recommendations}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sentiment")
async def analyze_sentiment(chat_message: ChatMessage):
    """Analyze sentiment of a message"""
    try:
        sentiment = await ai_assistant.analyze_sentiment(chat_message.message)
        return sentiment
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_chat_history(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Get chat history for a user"""
    from app.database import ChatInteraction
    
    try:
        interactions = db.query(ChatInteraction).filter(
            ChatInteraction.user_id == user_id
        ).order_by(ChatInteraction.created_at.desc()).limit(limit).all()
        
        history = [
            {
                "id": interaction.id,
                "message": interaction.message,
                "response": interaction.response,
                "intent": interaction.intent,
                "created_at": interaction.created_at.isoformat()
            }
            for interaction in interactions
        ]
        
        return {"history": history}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))