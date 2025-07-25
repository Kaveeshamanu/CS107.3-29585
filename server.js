const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Import routes
const aiRoutes = require('./routes/ai');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_chat', (userId) => {
    socket.join(`chat_${userId}`);
    console.log(`User ${userId} joined chat`);
  });

  socket.on('send_message', async (data) => {
    try {
      // Process message with AI
      const aiResponse = await processAIMessage(data.message, data.userId);
      
      // Emit response back to user
      io.to(`chat_${data.userId}`).emit('ai_response', {
        message: aiResponse,
        timestamp: new Date(),
        type: 'ai'
      });
    } catch (error) {
      console.error('Error processing AI message:', error);
      io.to(`chat_${data.userId}`).emit('ai_response', {
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'error'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// AI message processing function
async function processAIMessage(message, userId) {
  // This would integrate with OpenAI or other AI service
  // For now, return a mock response
  const responses = [
    "I'd be happy to help you find the perfect product! What are you looking for?",
    "Based on your preferences, I recommend checking out our featured items.",
    "Would you like me to help you track your order or find similar products?",
    "I can help you with product comparisons, recommendations, or answer any questions about our store."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});