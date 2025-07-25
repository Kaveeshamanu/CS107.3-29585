const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI (will use mock responses if no API key)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Mock product data for recommendations
const mockProducts = [
  { id: 1, name: "Wireless Headphones", price: 99.99, category: "Electronics", rating: 4.5 },
  { id: 2, name: "Smart Watch", price: 299.99, category: "Electronics", rating: 4.7 },
  { id: 3, name: "Running Shoes", price: 129.99, category: "Sports", rating: 4.3 },
  { id: 4, name: "Coffee Maker", price: 79.99, category: "Home", rating: 4.6 },
  { id: 5, name: "Yoga Mat", price: 39.99, category: "Sports", rating: 4.4 }
];

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let response;

    if (openai) {
      // Use OpenAI for intelligent responses
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for an e-commerce platform. You can help customers with:
            - Product recommendations
            - Order tracking
            - Product comparisons
            - General shopping assistance
            - Customer support
            
            Be friendly, helpful, and concise. If asked about specific products, you can recommend from our catalog.
            Available categories: Electronics, Sports, Home, Fashion, Books.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      
      response = completion.choices[0].message.content;
    } else {
      // Fallback to rule-based responses
      response = generateMockResponse(message);
    }

    res.json({
      response,
      timestamp: new Date(),
      suggestions: generateSuggestions(message)
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again.'
    });
  }
});

// Product recommendations endpoint
router.post('/recommendations', async (req, res) => {
  try {
    const { userId, category, priceRange, previousPurchases } = req.body;

    // Filter products based on criteria
    let recommendations = mockProducts.filter(product => {
      if (category && product.category !== category) return false;
      if (priceRange) {
        const [min, max] = priceRange;
        if (product.price < min || product.price > max) return false;
      }
      return true;
    });

    // Sort by rating and limit results
    recommendations = recommendations
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(product => ({
        ...product,
        reason: generateRecommendationReason(product, category)
      }));

    res.json({
      recommendations,
      totalCount: recommendations.length,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Search with AI enhancement
router.post('/search', async (req, res) => {
  try {
    const { query, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Simple search implementation (in real app, this would use Elasticsearch or similar)
    const results = mockProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    // AI-enhanced search suggestions
    const suggestions = generateSearchSuggestions(query);

    res.json({
      results,
      suggestions,
      query,
      totalResults: results.length,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Intent detection endpoint
router.post('/intent', async (req, res) => {
  try {
    const { message } = req.body;

    const intent = detectIntent(message);
    
    res.json({
      intent: intent.type,
      confidence: intent.confidence,
      entities: intent.entities,
      suggestedActions: intent.actions
    });

  } catch (error) {
    console.error('Intent Detection Error:', error);
    res.status(500).json({ error: 'Intent detection failed' });
  }
});

// Helper functions
function generateMockResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return "I'd be happy to recommend some products for you! What category are you interested in? We have Electronics, Sports, Home, Fashion, and Books.";
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
    return "I can help you track your order. Please provide your order number, and I'll get the latest status for you.";
  }
  
  if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
    return "I can assist you with returns and refunds. Our return policy allows returns within 30 days of purchase. Would you like me to start a return request?";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "I can help you find products within your budget. What's your price range, and what type of product are you looking for?";
  }
  
  return "Hello! I'm your AI shopping assistant. I can help you find products, track orders, compare items, and answer any questions about our store. What can I help you with today?";
}

function generateSuggestions(message) {
  const suggestions = [
    "Show me electronics under $200",
    "Track my recent order",
    "Compare wireless headphones",
    "Find sports equipment",
    "What's on sale today?"
  ];
  
  return suggestions.slice(0, 3);
}

function generateRecommendationReason(product, category) {
  const reasons = [
    `Highly rated (${product.rating}/5) in ${product.category}`,
    `Popular choice in ${product.category} category`,
    `Great value at $${product.price}`,
    `Trending item with excellent reviews`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateSearchSuggestions(query) {
  const suggestions = [
    `${query} on sale`,
    `best ${query}`,
    `${query} reviews`,
    `cheap ${query}`,
    `${query} alternatives`
  ];
  
  return suggestions.slice(0, 3);
}

function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
    return {
      type: 'purchase_intent',
      confidence: 0.8,
      entities: [],
      actions: ['show_cart', 'checkout']
    };
  }
  
  if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
    return {
      type: 'order_tracking',
      confidence: 0.9,
      entities: [],
      actions: ['track_order', 'order_history']
    };
  }
  
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return {
      type: 'recommendation_request',
      confidence: 0.85,
      entities: [],
      actions: ['show_recommendations', 'browse_categories']
    };
  }
  
  return {
    type: 'general_inquiry',
    confidence: 0.6,
    entities: [],
    actions: ['show_help', 'browse_products']
  };
}

module.exports = router;