// Test script for Resources API
// Run with: node backend/test-resources.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testResourcesAPI() {
    console.log('🧪 Testing Resources API...\n');

    try {
        // 1. Test fetching resources without authentication
        console.log('1️⃣ Testing GET /api/resources (public)...');
        const response1 = await axios.get(`${API_BASE_URL}/resources?branch=computer`);
        console.log(`✅ Success! Found ${response1.data.length} resources`);
        console.log('   Sample:', response1.data[0]?.title || 'No resources yet\n');

        // 2. Test with filters
        console.log('2️⃣ Testing GET /api/resources with filters...');
        const response2 = await axios.get(`${API_BASE_URL}/resources?branch=computer&type=pdf&semester=Semester%203`);
        console.log(`✅ Filtered results: ${response2.data.length} resources\n`);

        // 3. Test search
        console.log('3️⃣ Testing search functionality...');
        const response3 = await axios.get(`${API_BASE_URL}/resources?branch=computer&search=data`);
        console.log(`✅ Search results: ${response3.data.length} resources\n`);

        console.log('✅ All public endpoints working!\n');
        console.log('⚠️  To test protected endpoints (upload, delete), you need:');
        console.log('   1. Register/Login to get JWT token');
        console.log('   2. Use Postman or similar tool with Authorization header');
        console.log('   3. Header format: Authorization: Bearer <your-token>\n');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.log('\n⚠️  Make sure:');
        console.log('   1. Backend server is running (npm start in backend/)');
        console.log('   2. MongoDB is connected');
        console.log('   3. Port 5000 is available\n');
    }
}

// Sample upload payload (for testing with Postman)
const sampleUploadPayload = {
    title: "Data Structures Complete Notes",
    description: "Comprehensive notes covering arrays, linked lists, stacks, queues, trees, and graphs",
    type: "pdf",
    url: "https://drive.google.com/file/d/1abc123xyz/view",
    branch: "computer",
    subject: "Data Structures",
    semester: "Semester 3",
    tags: ["arrays", "linked-list", "trees", "graphs"]
};

console.log('📋 Sample Upload Payload (use in Postman):');
console.log(JSON.stringify(sampleUploadPayload, null, 2));
console.log('\n📍 Endpoint: POST http://localhost:5000/api/resources');
console.log('📍 Header: Authorization: Bearer <your-jwt-token>\n');

testResourcesAPI();
