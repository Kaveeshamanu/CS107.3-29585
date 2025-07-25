#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Demo script to showcase AI e-commerce assistant features
async function runDemo() {
    console.log('🤖 AI E-commerce Assistant Demo\n');
    console.log('===============================\n');

    try {
        // 1. Test Products API
        console.log('📦 1. Testing Products API...');
        const productsResponse = await axios.get(`${BASE_URL}/products`);
        console.log(`   ✅ Found ${productsResponse.data.products.length} products`);
        console.log(`   📱 Categories: ${productsResponse.data.filters.categories.join(', ')}`);
        console.log(`   💰 Price range: $${productsResponse.data.filters.priceRange.min} - $${productsResponse.data.filters.priceRange.max}\n`);

        // 2. Test AI Chat
        console.log('💬 2. Testing AI Chat Assistant...');
        const chatMessages = [
            "Hello! Can you help me find a good product?",
            "I'm looking for electronics under $200",
            "What about wireless headphones?",
            "Can you track my order?"
        ];

        for (const message of chatMessages) {
            const chatResponse = await axios.post(`${BASE_URL}/ai/chat`, { message });
            console.log(`   👤 User: ${message}`);
            console.log(`   🤖 AI: ${chatResponse.data.response}`);
            console.log('');
        }

        // 3. Test Product Recommendations
        console.log('🎯 3. Testing AI Recommendations...');
        const recsResponse = await axios.post(`${BASE_URL}/ai/recommendations`, {
            category: 'Electronics',
            priceRange: [50, 300]
        });
        console.log(`   ✅ Generated ${recsResponse.data.recommendations.length} recommendations:`);
        recsResponse.data.recommendations.forEach(product => {
            console.log(`   📱 ${product.name} - $${product.price} (${product.rating}⭐) - ${product.reason}`);
        });
        console.log('');

        // 4. Test Product Search
        console.log('🔍 4. Testing AI-Enhanced Search...');
        const searchResponse = await axios.post(`${BASE_URL}/ai/search`, {
            query: 'wireless'
        });
        console.log(`   ✅ Found ${searchResponse.data.results.length} products matching "wireless"`);
        console.log(`   💡 Suggestions: ${searchResponse.data.suggestions.join(', ')}\n`);

        // 5. Test Intent Detection
        console.log('🧠 5. Testing Intent Detection...');
        const intents = [
            "I want to buy a laptop",
            "Track my order #1234",
            "Can you recommend some headphones?",
            "What's the return policy?"
        ];

        for (const message of intents) {
            const intentResponse = await axios.post(`${BASE_URL}/ai/intent`, { message });
            console.log(`   💭 "${message}"`);
            console.log(`   🎯 Intent: ${intentResponse.data.intent} (${Math.round(intentResponse.data.confidence * 100)}% confidence)`);
            console.log(`   🔧 Actions: ${intentResponse.data.suggestedActions.join(', ')}\n`);
        }

        // 6. Test User Authentication
        console.log('🔐 6. Testing User Authentication...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'demo@example.com',
            password: 'demo123'
        });
        console.log(`   ✅ Login successful for: ${loginResponse.data.user.name}`);
        console.log(`   👤 User ID: ${loginResponse.data.user.id}`);
        console.log(`   🎯 Preferences: ${JSON.stringify(loginResponse.data.user.preferences)}\n`);

        // 7. Test Orders
        console.log('📋 7. Testing Order Management...');
        const ordersResponse = await axios.get(`${BASE_URL}/orders/user/${loginResponse.data.user.id}`);
        console.log(`   ✅ Found ${ordersResponse.data.orders.length} orders for user`);
        ordersResponse.data.orders.forEach(order => {
            console.log(`   📦 Order #${order.id}: $${order.total} - ${order.status.toUpperCase()}`);
        });
        console.log('');

        // 8. Test Product Details
        console.log('🔍 8. Testing Product Details...');
        const productResponse = await axios.get(`${BASE_URL}/products/1`);
        const product = productResponse.data.product;
        console.log(`   📱 Product: ${product.name}`);
        console.log(`   💰 Price: $${product.price} (was $${product.originalPrice})`);
        console.log(`   ⭐ Rating: ${product.rating}/5 (${product.reviewCount} reviews)`);
        console.log(`   🏷️ Features: ${product.features.join(', ')}`);
        console.log(`   🔗 Related: ${productResponse.data.relatedProducts.length} similar products\n`);

        console.log('🎉 Demo completed successfully!');
        console.log('\n📝 Summary of Features Tested:');
        console.log('   ✅ Product catalog with filtering');
        console.log('   ✅ AI-powered chat assistant');
        console.log('   ✅ Personalized recommendations');
        console.log('   ✅ Smart search with suggestions');
        console.log('   ✅ Intent detection and analysis');
        console.log('   ✅ User authentication system');
        console.log('   ✅ Order management and tracking');
        console.log('   ✅ Detailed product information');
        console.log('\n🌐 Visit http://localhost:3000 to see the full UI!');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

// Run the demo
runDemo();