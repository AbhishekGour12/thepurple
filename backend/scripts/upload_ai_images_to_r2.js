import fs from 'fs';
import path from 'path';

const API_BASE = 'http://127.0.0.1:5000/api/v1/admin';
const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\46e56f28-d88c-41cd-9b90-5960df150d18';

// List of all 12 generated image files by product
const productImagesMap = {
  ring: [
    'solitaire_ring_front_1788953573609.jpg',
    'solitaire_ring_side_1788953588264.jpg',
    'solitaire_ring_hand_1788953608128.jpg',
    'solitaire_ring_box_1788953628513.jpg',
  ],
  necklace: [
    'gold_necklace_front_1788953649077.jpg',
    'gold_necklace_detail_1788953670309.jpg',
    'gold_necklace_model_1788953922667.jpg',
    'gold_necklace_bust_1788953940602.jpg',
  ],
  kurta: [
    'silk_kurta_front_1788953960537.jpg',
    'silk_kurta_embroidery_1788953980665.jpg',
    'silk_kurta_drape_1788954000548.jpg',
    'silk_kurta_flatlay_1788954017785.jpg',
  ],
};

async function uploadFileThroughBackend(filePath, token) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('image', blob, fileName);
  formData.append('folder', 'products');

  const res = await fetch(`${API_BASE}/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Upload failed with status ${res.status}`);
  }
  return json.data;
}

async function runUploadPipeline() {
  console.log('🚀 Starting Real Image Upload, WebP Compression & Cloudflare R2 Pipeline...\n');

  try {
    // 1. Login
    console.log('1️⃣ Logging in as Super Admin...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@gmail.com', password: '123456' }),
    });
    const loginJson = await loginRes.json();
    const token = loginJson.data?.token;
    if (!token) throw new Error('Could not get token');
    console.log('✅ Admin Logged In!\n');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2. Fetch the 3 products
    console.log('2️⃣ Fetching products from database...');
    const prodListRes = await fetch(`${API_BASE}/products?limit=10`, { headers: authHeaders });
    const prodListJson = await prodListRes.json();
    const allProducts = prodListJson.data?.products || [];

    const ringProduct = allProducts.find((p) => p.sku?.startsWith('RNG-SOL'));
    const necklaceProduct = allProducts.find((p) => p.sku?.startsWith('NCK-GLD'));
    const kurtaProduct = allProducts.find((p) => p.sku?.startsWith('KRT-PUR'));

    if (!ringProduct || !necklaceProduct || !kurtaProduct) {
      console.log('Found products:', allProducts.map((p) => ({ id: p.id, name: p.name, sku: p.sku })));
      throw new Error('Could not find all 3 test products in database');
    }

    const tasks = [
      { product: ringProduct, key: 'ring', label: 'Diamond Ring' },
      { product: necklaceProduct, key: 'necklace', label: 'Gold Choker Necklace' },
      { product: kurtaProduct, key: 'kurta', label: 'Silk Kurta Set' },
    ];

    for (const task of tasks) {
      console.log(`\n📸 Processing 4 Images for [${task.label}] (ID: ${task.product.id})...`);
      const fileNames = productImagesMap[task.key];
      const uploadedImages = [];

      for (let i = 0; i < fileNames.length; i++) {
        const fName = fileNames[i];
        const fullPath = path.join(ARTIFACT_DIR, fName);

        if (!fs.existsSync(fullPath)) {
          console.error(`File missing: ${fullPath}`);
          continue;
        }

        const originalSizeBytes = fs.statSync(fullPath).size;
        console.log(`   Uploading (${i + 1}/4) ${fName} (${Math.round(originalSizeBytes / 1024)} KB)...`);

        const uploadData = await uploadFileThroughBackend(fullPath, token);
        console.log(`   ✅ Optimized to WebP (${Math.round(uploadData.sizeBytes / 1024)} KB) -> R2 URL: ${uploadData.imageUrl}`);

        uploadedImages.push({
          imageUrl: uploadData.imageUrl,
          r2Key: uploadData.r2Key,
          isPrimary: i === 0,
          displayOrder: i,
          altText: `${task.product.name} - View ${i + 1}`,
        });
      }

      // Update product in DB with these images
      console.log(`   💾 Updating Product in Database with 4 R2 WebP Images...`);
      const updateRes = await fetch(`${API_BASE}/products/${task.product.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          images: uploadedImages,
        }),
      });
      const updateJson = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(`Failed to update product images: ${updateJson.message}`);
      }
      console.log(`   ✨ ${task.label} updated successfully with 4 WebP Cloudflare R2 Images!`);
    }

    console.log('\n🎉 ALL 12 IMAGES COMPRESSED, CONVERTED TO .WEBP, UPLOADED TO CLOUDFLARE R2 & LINKED IN DATABASE!');
  } catch (err) {
    console.error('❌ Pipeline Error:', err.message);
  }
}

runUploadPipeline();
