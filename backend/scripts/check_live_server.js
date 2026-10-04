import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.nowthepurple.com/api/v1/admin';

async function checkLiveServer() {
  // Login
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_INITIAL_EMAIL || 'superadmin@gmail.com',
      password: process.env.ADMIN_INITIAL_PASSWORD || '123456',
    }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.token;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Get categories
  const catRes = await fetch(`${API_BASE}/categories`, { headers: authHeaders });
  const catJson = await catRes.json();
  console.log('Categories on live server:', JSON.stringify(catJson.data, null, 2));

  // Get subcategories
  const subRes = await fetch(`${API_BASE}/subcategories`, { headers: authHeaders });
  const subJson = await subRes.json();
  console.log('Subcategories on live server:', JSON.stringify(subJson.data, null, 2));

  // Get products
  const prodRes = await fetch(`${API_BASE}/products?limit=20`, { headers: authHeaders });
  const prodJson = await prodRes.json();
  console.log('Products on live server count:', prodJson.data?.products?.length || 0);
}

checkLiveServer();
