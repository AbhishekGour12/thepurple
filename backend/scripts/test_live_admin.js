import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.nowthepurple.com/api/v1/admin';

async function testAdminLogin() {
  try {
    console.log('Testing Admin Login on https://api.nowthepurple.com...');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_INITIAL_EMAIL || 'nowthepurple25@gmail.com',
        password: process.env.ADMIN_INITIAL_PASSWORD || '123456',
      }),
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testAdminLogin();
