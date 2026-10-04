import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import r2Service from '../src/services/r2Service.js';

async function testR2() {
  try {
    const testImgPath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\29aa7339-54cb-4d6d-9797-a09993edcf28\\.user_uploaded\\media_1790847160792.jpg';
    const buffer = fs.readFileSync(testImgPath);
    console.log('Uploading test image to R2...');
    const result = await r2Service.uploadImage(buffer, 'sunflower_bouquet.jpg', 'image/jpeg', 'products');
    console.log('R2 Upload result:', result);
  } catch (err) {
    console.error('R2 upload failed:', err);
  }
}

testR2();
