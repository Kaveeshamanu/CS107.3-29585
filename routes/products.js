const express = require('express');
const router = express.Router();

// Mock product database
const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 99.99,
    originalPrice: 129.99,
    category: "Electronics",
    subcategory: "Audio",
    rating: 4.5,
    reviewCount: 1247,
    inStock: true,
    stockCount: 25,
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    features: ["Noise Cancellation", "30h Battery", "Bluetooth 5.0", "Quick Charge"],
    images: ["/images/headphones-1.jpg", "/images/headphones-2.jpg"],
    tags: ["wireless", "bluetooth", "audio", "music"],
    brand: "TechSound",
    model: "TS-WH100",
    warranty: "2 years"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 299.99,
    originalPrice: 349.99,
    category: "Electronics",
    subcategory: "Wearables",
    rating: 4.7,
    reviewCount: 892,
    inStock: true,
    stockCount: 15,
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration.",
    features: ["Heart Rate Monitor", "GPS Tracking", "Water Resistant", "7-day Battery"],
    images: ["/images/smartwatch-1.jpg", "/images/smartwatch-2.jpg"],
    tags: ["fitness", "smartwatch", "health", "gps"],
    brand: "FitTech",
    model: "FT-SW200",
    warranty: "1 year"
  },
  {
    id: 3,
    name: "Professional Running Shoes",
    price: 129.99,
    originalPrice: 159.99,
    category: "Sports",
    subcategory: "Footwear",
    rating: 4.3,
    reviewCount: 654,
    inStock: true,
    stockCount: 42,
    description: "Lightweight running shoes with advanced cushioning and breathable mesh upper.",
    features: ["Lightweight Design", "Advanced Cushioning", "Breathable Mesh", "Durable Sole"],
    images: ["/images/shoes-1.jpg", "/images/shoes-2.jpg"],
    tags: ["running", "shoes", "sports", "fitness"],
    brand: "RunPro",
    model: "RP-RS300",
    warranty: "6 months"
  },
  {
    id: 4,
    name: "Smart Coffee Maker",
    price: 79.99,
    originalPrice: 99.99,
    category: "Home",
    subcategory: "Kitchen",
    rating: 4.6,
    reviewCount: 423,
    inStock: true,
    stockCount: 18,
    description: "Programmable coffee maker with smartphone app control and built-in grinder.",
    features: ["App Control", "Built-in Grinder", "Programmable", "Auto Shut-off"],
    images: ["/images/coffee-maker-1.jpg", "/images/coffee-maker-2.jpg"],
    tags: ["coffee", "smart", "kitchen", "appliance"],
    brand: "BrewMaster",
    model: "BM-CM400",
    warranty: "1 year"
  },
  {
    id: 5,
    name: "Premium Yoga Mat",
    price: 39.99,
    originalPrice: 49.99,
    category: "Sports",
    subcategory: "Fitness",
    rating: 4.4,
    reviewCount: 321,
    inStock: true,
    stockCount: 67,
    description: "Non-slip yoga mat with extra cushioning and eco-friendly materials.",
    features: ["Non-slip Surface", "Extra Cushioning", "Eco-friendly", "Lightweight"],
    images: ["/images/yoga-mat-1.jpg", "/images/yoga-mat-2.jpg"],
    tags: ["yoga", "fitness", "mat", "exercise"],
    brand: "ZenFit",
    model: "ZF-YM100",
    warranty: "6 months"
  }
];

// Get all products with filtering and AI-enhanced sorting
router.get('/', (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sortBy,
      sortOrder,
      limit,
      offset,
      search
    } = req.query;

    let filteredProducts = [...products];

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (subcategory) {
      filteredProducts = filteredProducts.filter(p => 
        p.subcategory.toLowerCase() === subcategory.toLowerCase()
      );
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= parseFloat(rating));
    }

    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(p => p.inStock && p.stockCount > 0);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        p.brand.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'price' || sortBy === 'rating') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const startIndex = parseInt(offset) || 0;
    const limitNum = parseInt(limit) || filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limitNum);

    res.json({
      products: paginatedProducts,
      totalCount: filteredProducts.length,
      hasMore: startIndex + limitNum < filteredProducts.length,
      filters: {
        categories: [...new Set(products.map(p => p.category))],
        subcategories: [...new Set(products.map(p => p.subcategory))],
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        },
        brands: [...new Set(products.map(p => p.brand))]
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get related products (same category, different product)
    const relatedProducts = products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    res.json({
      product,
      relatedProducts,
      recommendations: generateProductRecommendations(product)
    });

  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product recommendations based on AI logic
router.get('/:id/recommendations', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const recommendations = generateProductRecommendations(product);

    res.json({
      recommendations,
      basedOn: product.name,
      algorithm: 'collaborative_filtering'
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get trending products
router.get('/trending/now', (req, res) => {
  try {
    // Simulate trending algorithm based on rating and review count
    const trendingProducts = products
      .map(product => ({
        ...product,
        trendingScore: (product.rating * product.reviewCount) / 100
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 6);

    res.json({
      trending: trendingProducts,
      lastUpdated: new Date(),
      algorithm: 'engagement_score'
    });

  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({ error: 'Failed to fetch trending products' });
  }
});

// AI-powered product comparison
router.post('/compare', (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 products required for comparison' });
    }

    const compareProducts = products.filter(p => productIds.includes(p.id));

    if (compareProducts.length !== productIds.length) {
      return res.status(404).json({ error: 'One or more products not found' });
    }

    const comparison = {
      products: compareProducts,
      comparison: generateComparison(compareProducts),
      recommendation: generateComparisonRecommendation(compareProducts)
    };

    res.json(comparison);

  } catch (error) {
    console.error('Product comparison error:', error);
    res.status(500).json({ error: 'Failed to compare products' });
  }
});

// Helper functions
function generateProductRecommendations(product) {
  // Simple recommendation based on category and price range
  const recommendations = products
    .filter(p => {
      if (p.id === product.id) return false;
      if (p.category === product.category) return true;
      if (Math.abs(p.price - product.price) < 50) return true;
      return false;
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
    .map(p => ({
      ...p,
      reason: generateRecommendationReason(p, product)
    }));

  return recommendations;
}

function generateRecommendationReason(recommendedProduct, baseProduct) {
  if (recommendedProduct.category === baseProduct.category) {
    return `Similar to ${baseProduct.name} in ${baseProduct.category}`;
  }
  if (Math.abs(recommendedProduct.price - baseProduct.price) < 50) {
    return `Similar price range to ${baseProduct.name}`;
  }
  return `Customers who viewed ${baseProduct.name} also liked this`;
}

function generateComparison(products) {
  const features = ['price', 'rating', 'reviewCount', 'brand', 'warranty'];
  const comparison = {};

  features.forEach(feature => {
    comparison[feature] = products.map(p => ({
      productId: p.id,
      value: p[feature],
      isHighest: p[feature] === Math.max(...products.map(prod => prod[feature] || 0)),
      isLowest: p[feature] === Math.min(...products.map(prod => prod[feature] || Infinity))
    }));
  });

  return comparison;
}

function generateComparisonRecommendation(products) {
  // Simple logic: recommend highest rated product
  const bestRated = products.reduce((best, current) => 
    current.rating > best.rating ? current : best
  );

  return {
    recommendedProduct: bestRated.id,
    reason: `Highest rated (${bestRated.rating}/5) with ${bestRated.reviewCount} reviews`,
    confidence: 0.85
  };
}

module.exports = router;