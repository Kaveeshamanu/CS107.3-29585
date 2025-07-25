const express = require('express');
const router = express.Router();

// Mock orders database
const orders = [
  {
    id: 1001,
    userId: 1,
    products: [
      { productId: 1, quantity: 1, price: 99.99 }
    ],
    total: 99.99,
    status: 'delivered',
    orderDate: '2024-01-15T10:30:00Z',
    deliveryDate: '2024-01-18T14:00:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'ST',
      zipCode: '12345',
      country: 'USA'
    },
    trackingNumber: 'TRK123456789'
  },
  {
    id: 1002,
    userId: 1,
    products: [
      { productId: 3, quantity: 1, price: 129.99 }
    ],
    total: 129.99,
    status: 'shipped',
    orderDate: '2024-01-20T09:15:00Z',
    estimatedDelivery: '2024-01-25T16:00:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'ST',
      zipCode: '12345',
      country: 'USA'
    },
    trackingNumber: 'TRK987654321'
  }
];

// Get all orders for a user
router.get('/user/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userOrders = orders.filter(order => order.userId === userId);

    res.json({
      orders: userOrders,
      totalOrders: userOrders.length
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order by ID
router.get('/:orderId', (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Track order status
router.get('/:orderId/track', (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate tracking timeline
    const timeline = generateTrackingTimeline(order);

    res.json({
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      timeline,
      estimatedDelivery: order.estimatedDelivery,
      deliveryDate: order.deliveryDate
    });

  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// Create new order
router.post('/', (req, res) => {
  try {
    const { userId, products, shippingAddress } = req.body;

    if (!userId || !products || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total
    const total = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create new order
    const newOrder = {
      id: Math.max(...orders.map(o => o.id)) + 1,
      userId,
      products,
      total,
      status: 'processing',
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      shippingAddress,
      trackingNumber: `TRK${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    };

    orders.push(newOrder);

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status (admin function)
router.put('/:orderId/status', (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    order.status = status;

    if (status === 'delivered') {
      order.deliveryDate = new Date().toISOString();
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Helper function to generate tracking timeline
function generateTrackingTimeline(order) {
  const timeline = [
    {
      status: 'processing',
      description: 'Order received and being processed',
      timestamp: order.orderDate,
      completed: true
    }
  ];

  if (['confirmed', 'shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'confirmed',
      description: 'Order confirmed and preparing for shipment',
      timestamp: new Date(new Date(order.orderDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    });
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    timeline.push({
      status: 'shipped',
      description: 'Order shipped and on the way',
      timestamp: new Date(new Date(order.orderDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    });
  }

  if (order.status === 'delivered') {
    timeline.push({
      status: 'delivered',
      description: 'Order delivered successfully',
      timestamp: order.deliveryDate,
      completed: true
    });
  } else if (order.status === 'shipped') {
    timeline.push({
      status: 'delivered',
      description: 'Estimated delivery',
      timestamp: order.estimatedDelivery,
      completed: false,
      estimated: true
    });
  }

  return timeline;
}

module.exports = router;