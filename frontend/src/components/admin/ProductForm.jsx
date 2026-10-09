"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  Tag,
  ShieldCheck,
  Palette,
  Ruler,
  Truck,
  FileText,
  Sliders,
  RefreshCw,
  Zap,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { adminProductApi } from '@/lib/api/admin/products';
import { adminCategoryApi } from '@/lib/api/admin/categories';
import { adminAttributeApi } from '@/lib/api/admin/attributes';
import { BusyOverlay } from '@/components/admin/BusyUI';

// Modals
import CategoryManagerModal from '@/components/admin/products/CategoryManagerModal';
import ColorManagerModal from '@/components/admin/products/ColorManagerModal';
import SizeManagerModal from '@/components/admin/products/SizeManagerModal';
import AttributeManagerModal from '@/components/admin/products/AttributeManagerModal';

// Helper to create an initial product or clone from a template
const createInitialProduct = (template = null, isEditData = null) => {
  if (isEditData) {
    return {
      clientId: 'prod_' + Math.random().toString(36).substring(2, 9),
      id: isEditData.id,
      name: isEditData.name || '',
      sku: isEditData.sku || '',
      brand: isEditData.brand || 'ThePurple',
      tags: isEditData.tags?.join(', ') || '',
      shortDescription: isEditData.shortDescription || '',
      description: isEditData.description || '',
      specifications: isEditData.specifications || '',
      careInstructions: isEditData.careInstructions || '',
      selectedCategory: isEditData.subcategory?.categoryId || isEditData.categoryId || '',
      selectedSubcategory: isEditData.subcategoryId || '',
      price: isEditData.price !== undefined ? isEditData.price : '',
      salePrice: isEditData.salePrice !== undefined ? isEditData.salePrice : '',
      taxRate: isEditData.taxRate !== undefined ? isEditData.taxRate : '0',
      hsnCode: isEditData.hsnCode || '',
      stock: isEditData.stock !== undefined ? isEditData.stock : '0',
      lowStockThreshold: isEditData.lowStockThreshold || '5',
      status: isEditData.status || 'DRAFT',
      badge: isEditData.badge || '',
      isFeatured: Boolean(isEditData.isFeatured),
      isBestSeller: Boolean(isEditData.isBestSeller),
      isBulk: Boolean(isEditData.isBulk),
      minOrderQuantity: isEditData.minOrderQuantity || 30,
      selectedAttrValIds: isEditData.attributeValues?.map((av) => av.id) || [],
      newValInputs: {},
      weightGrams: isEditData.weightGrams || '',
      lengthCm: isEditData.lengthCm || '',
      widthCm: isEditData.widthCm || '',
      heightCm: isEditData.heightCm || '',
      images:
        isEditData.images?.map((img) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || '',
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
          colorId: img.colorId || '',
        })) || [],
      imageUrlInput: '',
      uploadingImage: false,
      variants:
        isEditData.variants?.map((v) => ({
          sku: v.sku,
          name: v.name || '',
          colorId: v.colorId || '',
          sizeId: v.sizeId || '',
          mrp: v.mrp || '',
          salePrice: v.salePrice || '',
          stock: v.stock !== undefined ? v.stock : '0',
        })) || [],
      matrixColors: [],
      matrixSizes: [],
      isCollapsed: false,
    };
  }

  if (template) {
    // Cloned / Duplicated Product: Copy all metadata, tags, taxonomies, dimensions, attributes, variants
    // BUT reset images to EMPTY array as requested by user ("bs iammges ko chodke")
    return {
      clientId: 'prod_' + Math.random().toString(36).substring(2, 9),
      name: template.name ? `${template.name}` : '',
      sku: template.sku ? `${template.sku}-COPY` : '',
      brand: template.brand || 'ThePurple',
      tags: template.tags || '',
      shortDescription: template.shortDescription || '',
      description: template.description || '',
      specifications: template.specifications || '',
      careInstructions: template.careInstructions || '',
      selectedCategory: template.selectedCategory || '',
      selectedSubcategory: template.selectedSubcategory || '',
      price: template.price !== undefined ? template.price : '',
      salePrice: template.salePrice !== undefined ? template.salePrice : '',
      taxRate: template.taxRate !== undefined ? template.taxRate : '0',
      hsnCode: template.hsnCode || '',
      stock: template.stock !== undefined ? template.stock : '0',
      lowStockThreshold: template.lowStockThreshold || '5',
      status: template.status || 'DRAFT',
      badge: template.badge || '',
      isFeatured: Boolean(template.isFeatured),
      isBestSeller: Boolean(template.isBestSeller),
      isBulk: Boolean(template.isBulk),
      minOrderQuantity: template.minOrderQuantity || 30,
      selectedAttrValIds: [...(template.selectedAttrValIds || [])],
      newValInputs: {},
      weightGrams: template.weightGrams || '',
      lengthCm: template.lengthCm || '',
      widthCm: template.widthCm || '',
      heightCm: template.heightCm || '',
      images: [], // EMPTY IMAGES ON COPY
      imageUrlInput: '',
      uploadingImage: false,
      variants: (template.variants || []).map((v) => ({
        ...v,
        sku: v.sku ? `${v.sku}-COPY` : '',
      })),
      matrixColors: [...(template.matrixColors || [])],
      matrixSizes: [...(template.matrixSizes || [])],
      isCollapsed: false,
    };
  }

  // Brand new blank product
  return {
    clientId: 'prod_' + Math.random().toString(36).substring(2, 9),
    name: '',
    sku: '',
    brand: 'ThePurple',
    tags: '',
    shortDescription: '',
    description: '',
    specifications: '',
    careInstructions: '',
    selectedCategory: '',
    selectedSubcategory: '',
    price: '',
    salePrice: '',
    taxRate: '0',
    hsnCode: '',
    stock: '0',
    lowStockThreshold: '5',
    status: 'DRAFT',
    badge: '',
    isFeatured: false,
    isBestSeller: false,
    isBulk: false,
    minOrderQuantity: 30,
    selectedAttrValIds: [],
    newValInputs: {},
    weightGrams: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    images: [],
    imageUrlInput: '',
    uploadingImage: false,
    variants: [],
    matrixColors: [],
    matrixSizes: [],
    isCollapsed: false,
  };
};

export default function ProductForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Products array for Multi-Product creation
  const [products, setProducts] = useState([createInitialProduct(null, isEdit ? initialData : null)]);

  // Master Data (Shared across all forms)
  const [categories, setCategories] = useState([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({}); // { [categoryId]: Subcategory[] }
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [attributes, setAttributes] = useState([]);

  // Modals state for inline management
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [sizeModalInitialTab, setSizeModalInitialTab] = useState('browse');
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);

  // Global Quick Add States (Reusable for any product)
  const [quickColorName, setQuickColorName] = useState('');
  const [quickColorHex, setQuickColorHex] = useState('#7E22CE');
  const [quickColorLoading, setQuickColorLoading] = useState(false);
  const [quickColorSuccess, setQuickColorSuccess] = useState(false);

  const [quickSizeName, setQuickSizeName] = useState('');
  const [quickSizeCode, setQuickSizeCode] = useState('');
  const [quickSizeLoading, setQuickSizeLoading] = useState(false);
  const [quickSizeSuccess, setQuickSizeSuccess] = useState(false);

  // UI / Progress State
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0, currentName: '' });
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState(false);

  // Load Shared Master Data
  const refreshCategories = async () => {
    try {
      const res = await adminCategoryApi.listCategories();
      setCategories(res?.categories || []);
    } catch {}
  };

  const refreshColors = async () => {
    try {
      const res = await adminAttributeApi.listColors();
      setColors(res?.colors || []);
    } catch {}
  };

  const refreshSizes = async () => {
    try {
      const res = await adminAttributeApi.listSizes();
      setSizes(res?.sizes || []);
    } catch {}
  };

  const refreshAttributes = async () => {
    try {
      const res = await adminAttributeApi.listAttributes();
      setAttributes(res?.attributes || []);
    } catch {}
  };

  const loadSubcategoriesForCategory = async (catId) => {
    if (!catId) return;
    try {
      const res = await adminCategoryApi.listSubcategories({ categoryId: catId });
      setSubcategoriesMap((prev) => ({
        ...prev,
        [catId]: res?.subcategories || [],
      }));
    } catch {}
  };

  useEffect(() => {
    refreshCategories();
    refreshColors();
    refreshSizes();
    refreshAttributes();
  }, []);

  // Pre-fetch subcategories for any initial product category
  useEffect(() => {
    products.forEach((p) => {
      if (p.selectedCategory && !subcategoriesMap[p.selectedCategory]) {
        loadSubcategoriesForCategory(p.selectedCategory);
      }
    });
  }, [products]);

  // Handle updates to specific product fields
  const updateProduct = (index, updates) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Add another product by copying details from a specific form (Images reset to empty)
  const handleAddMoreProductCopy = (sourceIndex) => {
    const sourceProduct = products[sourceIndex] || products[products.length - 1];
    const newProduct = createInitialProduct(sourceProduct);
    setProducts((prev) => [...prev, newProduct]);

    // Pre-fetch subcategory for new product category if needed
    if (newProduct.selectedCategory) {
      loadSubcategoriesForCategory(newProduct.selectedCategory);
    }

    // Scroll to bottom smoothly after render
    setTimeout(() => {
      const el = document.getElementById(`product-card-${newProduct.clientId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Add a blank product form
  const handleAddBlankProduct = () => {
    const newProduct = createInitialProduct(null);
    setProducts((prev) => [...prev, newProduct]);
    setTimeout(() => {
      const el = document.getElementById(`product-card-${newProduct.clientId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Remove a product form (if more than 1)
  const handleRemoveProduct = (index) => {
    if (products.length <= 1) return;
    const confirmDelete = window.confirm(`Are you sure you want to remove Product #${index + 1}?`);
    if (!confirmDelete) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // Collapse / Expand Toggles
  const handleToggleCollapse = (index) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isCollapsed: !next[index].isCollapsed };
      return next;
    });
  };

  const handleExpandAll = () => {
    setProducts((prev) => prev.map((p) => ({ ...p, isCollapsed: false })));
  };

  const handleCollapseAll = () => {
    setProducts((prev) => prev.map((p) => ({ ...p, isCollapsed: true })));
  };

  // Quick Add Color
  const handleQuickAddColor = async (e, targetProductIndex) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cName = quickColorName.trim();
    if (!cName) return;
    setQuickColorLoading(true);
    try {
      const res = await adminAttributeApi.createColor({ name: cName, hexCode: quickColorHex || '#7E22CE' }, true);
      const colorId = res?.color?.id;
      await refreshColors();
      if (colorId && targetProductIndex !== undefined) {
        const prod = products[targetProductIndex];
        const updatedMatrix = prod.matrixColors.includes(colorId) ? prod.matrixColors : [...prod.matrixColors, colorId];
        updateProduct(targetProductIndex, { matrixColors: updatedMatrix });
      }
      setQuickColorName('');
      setQuickColorSuccess(true);
      setTimeout(() => setQuickColorSuccess(false), 2500);
    } catch (err) {
      alert(err?.message || 'Failed to add color');
    } finally {
      setQuickColorLoading(false);
    }
  };

  // Quick Add Size
  const handleQuickAddSize = async (e, targetProductIndex) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const sName = quickSizeName.trim();
    if (!sName) return;
    setQuickSizeLoading(true);
    try {
      const res = await adminAttributeApi.createSize({ name: sName, code: quickSizeCode.trim() || undefined }, true);
      const sizeId = res?.size?.id;
      await refreshSizes();
      if (sizeId && targetProductIndex !== undefined) {
        const prod = products[targetProductIndex];
        const updatedMatrix = prod.matrixSizes.includes(sizeId) ? prod.matrixSizes : [...prod.matrixSizes, sizeId];
        updateProduct(targetProductIndex, { matrixSizes: updatedMatrix });
      }
      setQuickSizeName('');
      setQuickSizeCode('');
      setQuickSizeSuccess(true);
      setTimeout(() => setQuickSizeSuccess(false), 2500);
    } catch (err) {
      alert(err?.message || 'Failed to add size');
    } finally {
      setQuickSizeLoading(false);
    }
  };

  // Generate Matrix Combinations for a specific Product
  const handleGenerateMatrix = (prodIndex) => {
    const prod = products[prodIndex];
    if (!prod) return;

    const newVariants = [];
    const selColors = prod.matrixColors.length > 0 ? prod.matrixColors : [''];
    const selSizes = prod.matrixSizes.length > 0 ? prod.matrixSizes : [''];

    let count = prod.variants.length;
    for (const cId of selColors) {
      for (const sId of selSizes) {
        if (!cId && !sId) continue;
        count++;
        const cObj = colors.find((c) => c.id === cId);
        const sObj = sizes.find((s) => s.id === sId);

        const colorName = cObj ? cObj.name.toUpperCase().replace(/\s+/g, '') : '';
        const sizeName = sObj ? (sObj.code || sObj.name).toUpperCase().replace(/\s+/g, '') : '';
        const suffix = [colorName, sizeName].filter(Boolean).join('-') || `V${count}`;

        newVariants.push({
          sku: prod.sku ? `${prod.sku}-${suffix}` : `VAR-${suffix}`,
          name: `${cObj?.name || ''} ${sObj?.name || ''}`.trim(),
          colorId: cId || '',
          sizeId: sId || '',
          mrp: prod.price || '',
          salePrice: prod.salePrice || '',
          stock: '10',
        });
      }
    }

    updateProduct(prodIndex, {
      variants: [...prod.variants, ...newVariants],
      matrixColors: [],
      matrixSizes: [],
    });
  };

  // Image Upload for specific product
  const handleFileUpload = async (e, prodIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const prod = products[prodIndex];
    updateProduct(prodIndex, { uploadingImage: true });
    try {
      const res = await adminProductApi.uploadImage(file);
      if (res?.imageUrl) {
        const nextImages = [
          ...prod.images,
          {
            imageUrl: res.imageUrl,
            altText: prod.name || 'Product Image',
            isPrimary: prod.images.length === 0,
            displayOrder: prod.images.length,
            colorId: '',
          },
        ];
        updateProduct(prodIndex, { images: nextImages, uploadingImage: false });
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
      updateProduct(prodIndex, { uploadingImage: false });
    }
  };

  // Add Image URL for specific product
  const handleAddImageUrl = (prodIndex) => {
    const prod = products[prodIndex];
    const url = prod.imageUrlInput.trim();
    if (!url) return;
    const nextImages = [
      ...prod.images,
      {
        imageUrl: url,
        altText: prod.name || 'Product Image',
        isPrimary: prod.images.length === 0,
        displayOrder: prod.images.length,
        colorId: '',
      },
    ];
    updateProduct(prodIndex, { images: nextImages, imageUrlInput: '' });
  };

  // Dynamic Attribute Value Inline Add
  const handleAddInlineAttrVal = async (attrId, prodIndex) => {
    const prod = products[prodIndex];
    const valText = prod.newValInputs?.[attrId]?.trim();
    if (!valText) return;

    try {
      const res = await adminAttributeApi.addAttributeValue(attrId, { value: valText });
      if (res?.attributeValue) {
        setAttributes((prev) =>
          prev.map((a) => (a.id === attrId ? { ...a, values: [...(a.values || []), res.attributeValue] } : a))
        );
        updateProduct(prodIndex, {
          selectedAttrValIds: [...(prod.selectedAttrValIds || []), res.attributeValue.id],
          newValInputs: { ...prod.newValInputs, [attrId]: '' },
        });
      }
    } catch {}
  };

  // Global Submit Handler (Validates & saves all products)
  const handleSubmitAll = async (e) => {
    if (e) e.preventDefault();
    setGlobalError('');

    // Step 1: Validation across all product forms
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const prodNum = i + 1;
      if (!p.name.trim()) {
        setGlobalError(`Product #${prodNum}: Name is required`);
        updateProduct(i, { isCollapsed: false });
        const el = document.getElementById(`product-card-${p.clientId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (!p.sku.trim()) {
        setGlobalError(`Product #${prodNum} (${p.name}): SKU is required`);
        updateProduct(i, { isCollapsed: false });
        const el = document.getElementById(`product-card-${p.clientId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (!p.selectedSubcategory) {
        setGlobalError(`Product #${prodNum} (${p.name}): Please select Category & Subcategory`);
        updateProduct(i, { isCollapsed: false });
        const el = document.getElementById(`product-card-${p.clientId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (!p.price || parseFloat(p.price) < 0) {
        setGlobalError(`Product #${prodNum} (${p.name}): Valid MRP price is required`);
        updateProduct(i, { isCollapsed: false });
        const el = document.getElementById(`product-card-${p.clientId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (p.salePrice && parseFloat(p.salePrice) > parseFloat(p.price)) {
        setGlobalError(`Product #${prodNum} (${p.name}): Offer/Selling price cannot exceed MRP`);
        updateProduct(i, { isCollapsed: false });
        const el = document.getElementById(`product-card-${p.clientId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Step 2: Submission Process
    setSubmitting(true);
    const totalToSave = products.length;
    let savedCount = 0;
    const remainingProducts = [...products];

    try {
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        setSubmitProgress({
          current: i + 1,
          total: totalToSave,
          currentName: p.name || `Product #${i + 1}`,
        });

        const numMrp = parseFloat(p.price) || 0;
        const numSale = parseFloat(p.salePrice) || numMrp;
        const discountPercent = numMrp > 0 ? Math.max(0, Math.round(((numMrp - numSale) / numMrp) * 100)) : 0;

        const payload = {
          name: p.name.trim(),
          sku: p.sku.trim().toUpperCase(),
          brand: p.brand.trim(),
          subcategoryId: p.selectedSubcategory,
          price: parseFloat(p.price),
          salePrice: parseFloat(p.salePrice) || parseFloat(p.price),
          discountPercent,
          taxRate: parseFloat(p.taxRate) || 0,
          hsnCode: p.hsnCode.trim() || undefined,
          stock: parseInt(p.stock, 10) || 0,
          lowStockThreshold: parseInt(p.lowStockThreshold, 10) || 5,
          status: p.status,
          badge: p.badge ? p.badge.trim() : null,
          isFeatured: Boolean(p.isFeatured),
          isBestSeller: Boolean(p.isBestSeller) || p.badge?.toUpperCase() === 'BESTSELLER',
          isBulk: Boolean(p.isBulk),
          minOrderQuantity: Boolean(p.isBulk) ? Math.max(1, parseInt(p.minOrderQuantity, 10) || 1) : 1,
          shortDescription: p.shortDescription.trim() || undefined,
          description: p.description.trim() || undefined,
          specifications: p.specifications.trim() || undefined,
          careInstructions: p.careInstructions.trim() || undefined,
          tags: p.tags
            ? p.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          attributeValueIds: p.selectedAttrValIds,
          weightGrams: p.weightGrams ? parseFloat(p.weightGrams) : undefined,
          lengthCm: p.lengthCm ? parseFloat(p.lengthCm) : undefined,
          widthCm: p.widthCm ? parseFloat(p.widthCm) : undefined,
          heightCm: p.heightCm ? parseFloat(p.heightCm) : undefined,
          images: p.images.map((img, idx) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            altText: typeof img === 'object' ? img.altText || p.name : p.name,
            isPrimary: typeof img === 'object' && img.isPrimary !== undefined ? Boolean(img.isPrimary) : idx === 0,
            displayOrder: typeof img === 'object' && img.displayOrder !== undefined ? img.displayOrder : idx,
            colorId: typeof img === 'object' && img.colorId ? img.colorId : null,
          })),
          variants: p.variants,
        };

        if (isEdit && p.id) {
          await adminProductApi.updateProduct(p.id, payload);
        } else {
          await adminProductApi.createProduct(payload);
        }

        savedCount++;
      }

      setGlobalSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err) {
      setGlobalError(
        `Error saving product (${savedCount + 1} of ${totalToSave}): ${err.message || 'Failed to save product'}`
      );
      // Keep remaining unsaved products in form
      setProducts(remainingProducts.slice(savedCount));
      setSubmitting(false);
    }
  };

  // Common UI Styles
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    backgroundColor: '#FAF5FF',
    fontSize: '13px',
    color: '#1E1B4B',
    outline: 'none',
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #E9D5FF',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 5px rgba(107, 33, 168, 0.03)',
  };

  const sectionHeaderStyle = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#2E1065',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '90px', position: 'relative' }}>
      <BusyOverlay
        show={submitting}
        label={
          isEdit
            ? 'Updating product details...'
            : `Saving Product ${submitProgress.current} of ${submitProgress.total}: ${submitProgress.currentName}...`
        }
      />

      {/* Top Header & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/admin/products"
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1065', margin: 0 }}>
                {isEdit ? 'Edit Product' : 'Add New Products'}
              </h1>
              {!isEdit && (
                <span
                  style={{
                    backgroundColor: '#F3E8FF',
                    color: '#7E22CE',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 800,
                    border: '1px solid #D8B4FE',
                  }}
                >
                  {products.length} {products.length === 1 ? 'Product Form' : 'Products in Batch'}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0' }}>
              {!isEdit
                ? 'Fill details and click "+ Add More Product (Copy Details)" to easily clone & batch create multiple products.'
                : 'Update product information, images, pricing, and variants.'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {!isEdit && products.length > 1 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleExpandAll}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={handleCollapseAll}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                Collapse All
              </button>
            </div>
          )}

          {!isEdit && (
            <button
              type="button"
              onClick={() => handleAddMoreProductCopy(products.length - 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                border: '1.5px solid #C084FC',
                color: '#7E22CE',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(126, 34, 206, 0.08)',
              }}
              title="Adds a new form below copying all details from the last product (with empty images)"
            >
              <Copy size={15} />
              <span>+ Add More Product (Copy Details)</span>
            </button>
          )}

          <button
            onClick={handleSubmitAll}
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(126, 34, 206, 0.28)',
            }}
          >
            {submitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>
              {isEdit
                ? 'Update Product'
                : products.length > 1
                ? `Save & Publish All (${products.length}) Products`
                : 'Save & Publish Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Global Error Notice */}
      {globalError && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '12px',
            color: '#DC2626',
            fontSize: '13.5px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{globalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError('')}
            style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Global Success Notice */}
      {globalSuccess && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            borderRadius: '12px',
            color: '#065F46',
            fontSize: '14px',
            fontWeight: 700,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={20} color="#059669" />
          <span>
            🎉 Successfully saved {products.length} {products.length > 1 ? 'products' : 'product'}! Redirecting to
            catalog...
          </span>
        </div>
      )}

      {/* RENDER PRODUCT FORMS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {products.map((prod, pIdx) => {
          const numMrp = parseFloat(prod.price) || 0;
          const numSale = parseFloat(prod.salePrice) || numMrp;
          const discountPercent =
            numMrp > 0 ? Math.max(0, Math.round(((numMrp - numSale) / numMrp) * 100)) : 0;
          const currentSubcategories = subcategoriesMap[prod.selectedCategory] || [];

          return (
            <div
              key={prod.clientId}
              id={`product-card-${prod.clientId}`}
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #E9D5FF',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(107, 33, 168, 0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Product Card Master Header Banner */}
              <div
                style={{
                  padding: '16px 22px',
                  backgroundColor: '#FAF5FF',
                  borderBottom: prod.isCollapsed ? 'none' : '1.5px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
                  <span
                    style={{
                      backgroundColor: '#7E22CE',
                      color: '#ffffff',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                    }}
                  >
                    #{pIdx + 1}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#2E1065' }}>
                        {prod.name ? prod.name : `Product #${pIdx + 1} (Untitled)`}
                      </span>
                      {prod.sku && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #D8B4FE',
                            color: '#6B21A8',
                          }}
                        >
                          SKU: {prod.sku}
                        </span>
                      )}
                      {prod.price && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            color: '#065F46',
                          }}
                        >
                          ₹{prod.salePrice || prod.price}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: prod.status === 'PUBLISHED' ? '#DCFCE7' : '#FEF3C7',
                          color: prod.status === 'PUBLISHED' ? '#166534' : '#92400E',
                        }}
                      >
                        {prod.status}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                      {prod.images.length} images • {prod.variants.length} variants •{' '}
                      {prod.brand || 'ThePurple'}
                    </p>
                  </div>
                </div>

                {/* Card Header Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => handleAddMoreProductCopy(pIdx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #C084FC',
                        color: '#7E22CE',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Duplicate details of this product into a new form (empty images)"
                    >
                      <Copy size={13} />
                      <span>Duplicate / Copy Below</span>
                    </button>
                  )}

                  {products.length > 1 && !isEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(pIdx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Remove this product form"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleCollapse(pIdx)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: '#4B5563',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {prod.isCollapsed ? (
                      <>
                        <span>Edit Form</span>
                        <ChevronDown size={14} />
                      </>
                    ) : (
                      <>
                        <span>Collapse</span>
                        <ChevronUp size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Form Body */}
              {!prod.isCollapsed && (
                <div style={{ padding: '24px' }}>
                  {/* Section 1: Basic Information */}
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <Sparkles size={18} style={{ color: '#7E22CE' }} />
                      <span>1. Basic Product Information</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={prod.name}
                          onChange={(e) => updateProduct(pIdx, { name: e.target.value })}
                          placeholder="e.g. 18K Gold Plated Crystal Drop Earrings"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          SKU (Unique Identifier) *
                        </label>
                        <input
                          type="text"
                          required
                          value={prod.sku}
                          onChange={(e) => updateProduct(pIdx, { sku: e.target.value })}
                          placeholder="e.g. TP-JW-001"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          value={prod.brand}
                          onChange={(e) => updateProduct(pIdx, { brand: e.target.value })}
                          placeholder="ThePurple"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Tags (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={prod.tags}
                          onChange={(e) => updateProduct(pIdx, { tags: e.target.value })}
                          placeholder="e.g. gold, jewellery, earrings, partywear"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '6px',
                        }}
                      >
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={prod.shortDescription}
                        onChange={(e) => updateProduct(pIdx, { shortDescription: e.target.value })}
                        placeholder="A brief 1-sentence hook for catalogue cards"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Section 2: Category & Master Taxonomy */}
                  <div style={sectionStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={sectionHeaderStyle}>
                        <Layers size={18} style={{ color: '#7E22CE' }} />
                        <span>2. Category & Master Taxonomy</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCategoryModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FAF5FF',
                          border: '1px solid #E9D5FF',
                          color: '#7E22CE',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Manage Categories & Subcategories
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Parent Category *
                        </label>
                        <select
                          required
                          value={prod.selectedCategory}
                          onChange={(e) => {
                            const catId = e.target.value;
                            updateProduct(pIdx, { selectedCategory: catId, selectedSubcategory: '' });
                            if (catId) loadSubcategoriesForCategory(catId);
                          }}
                          style={inputStyle}
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Subcategory *
                        </label>
                        <select
                          required
                          disabled={!prod.selectedCategory}
                          value={prod.selectedSubcategory}
                          onChange={(e) => updateProduct(pIdx, { selectedSubcategory: e.target.value })}
                          style={{
                            ...inputStyle,
                            backgroundColor: prod.selectedCategory ? '#FAF5FF' : '#F3F4F6',
                          }}
                        >
                          <option value="">Select Subcategory</option>
                          {currentSubcategories.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Dynamic Specifications & Custom Attributes */}
                  <div style={sectionStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={sectionHeaderStyle}>
                        <Sliders size={18} style={{ color: '#7E22CE' }} />
                        <span>3. Dynamic Specifications & Attributes (Material, Gemstone, Occasion, etc.)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttributeModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FAF5FF',
                          border: '1px solid #E9D5FF',
                          color: '#7E22CE',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Manage Dynamic Attributes
                      </button>
                    </div>

                    <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px' }}>
                      Select attributes applicable to this product. You can also type custom values inline.
                    </p>

                    {attributes.length === 0 ? (
                      <div
                        style={{
                          padding: '16px',
                          backgroundColor: '#FAF5FF',
                          borderRadius: '10px',
                          textAlign: 'center',
                          color: '#6B7280',
                          fontSize: '13px',
                        }}
                      >
                        No dynamic attributes created yet.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                        {attributes.map((attr) => (
                          <div
                            key={attr.id}
                            style={{
                              padding: '12px',
                              backgroundColor: '#FAF5FF',
                              borderRadius: '10px',
                              border: '1px solid #E9D5FF',
                            }}
                          >
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#581C87', display: 'block', marginBottom: '8px' }}>
                              {attr.name}
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                              {(attr.values || []).map((val) => {
                                const isChecked = prod.selectedAttrValIds?.includes(val.id);
                                return (
                                  <label
                                    key={val.id}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: isChecked ? '#7E22CE' : '#FFFFFF',
                                      color: isChecked ? '#FFFFFF' : '#374151',
                                      border: `1px solid ${isChecked ? '#7E22CE' : '#E5E7EB'}`,
                                      fontSize: '11.5px',
                                      fontWeight: isChecked ? 600 : 400,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        const newIds = isChecked
                                          ? prod.selectedAttrValIds.filter((id) => id !== val.id)
                                          : [...(prod.selectedAttrValIds || []), val.id];
                                        updateProduct(pIdx, { selectedAttrValIds: newIds });
                                      }}
                                      style={{ display: 'none' }}
                                    />
                                    {val.value}
                                  </label>
                                );
                              })}
                            </div>

                            {/* Inline new value input */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input
                                type="text"
                                placeholder={`+ New ${attr.name} option...`}
                                value={prod.newValInputs?.[attr.id] || ''}
                                onChange={(e) =>
                                  updateProduct(pIdx, {
                                    newValInputs: { ...prod.newValInputs, [attr.id]: e.target.value },
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddInlineAttrVal(attr.id, pIdx);
                                  }
                                }}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #E5E7EB',
                                  fontSize: '11.5px',
                                  outline: 'none',
                                  flex: 1,
                                  backgroundColor: '#ffffff',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddInlineAttrVal(attr.id, pIdx)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#7E22CE',
                                  color: '#ffffff',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Pricing & Taxes */}
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <Tag size={18} style={{ color: '#7E22CE' }} />
                      <span>4. Product Pricing & Taxes</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          MRP (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step="0.01"
                          value={prod.price}
                          onChange={(e) => updateProduct(pIdx, { price: e.target.value })}
                          placeholder="2499"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step="0.01"
                          value={prod.salePrice}
                          onChange={(e) => updateProduct(pIdx, { salePrice: e.target.value })}
                          placeholder="1799"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Discount
                        </label>
                        <div
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            borderRadius: '8px',
                            fontWeight: 700,
                            color: '#7E22CE',
                            fontSize: '13px',
                            textAlign: 'center',
                          }}
                        >
                          {discountPercent}% OFF
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={prod.taxRate}
                          onChange={(e) => updateProduct(pIdx, { taxRate: e.target.value })}
                          placeholder="3"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          HSN Code
                        </label>
                        <input
                          type="text"
                          value={prod.hsnCode}
                          onChange={(e) => updateProduct(pIdx, { hsnCode: e.target.value })}
                          placeholder="7113"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Inventory & Publishing */}
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <ShieldCheck size={18} style={{ color: '#7E22CE' }} />
                      <span>5. Inventory & Publishing Status</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={prod.stock}
                          onChange={(e) => updateProduct(pIdx, { stock: e.target.value })}
                          placeholder="50"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Low Stock Threshold
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={prod.lowStockThreshold}
                          onChange={(e) => updateProduct(pIdx, { lowStockThreshold: e.target.value })}
                          placeholder="5"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Catalog Status *
                        </label>
                        <select
                          value={prod.status}
                          onChange={(e) => updateProduct(pIdx, { status: e.target.value })}
                          style={inputStyle}
                        >
                          <option value="DRAFT">Draft (Hidden from store)</option>
                          <option value="PUBLISHED">Published (Visible in store)</option>
                          <option value="UNPUBLISHED">Unpublished (Archived)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={prod.isFeatured}
                          onChange={(e) => updateProduct(pIdx, { isFeatured: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#7E22CE' }}
                        />
                        <span>Featured Product on Homepage</span>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={prod.isBestSeller || prod.badge?.toUpperCase() === 'BESTSELLER'}
                          onChange={(e) => {
                            const val = e.target.checked;
                            updateProduct(pIdx, {
                              isBestSeller: val,
                              badge: val && !prod.badge ? 'BESTSELLER' : prod.badge,
                            });
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#7E22CE' }}
                        />
                        <span>Best Seller Status</span>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: prod.isBulk ? '#7E22CE' : '#374151',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={prod.isBulk}
                          onChange={(e) => updateProduct(pIdx, { isBulk: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#7E22CE' }}
                        />
                        <span>📦 Bulk Selling / Wholesale Only</span>
                      </label>
                    </div>

                    {/* Product Badges Selection */}
                    <div
                      style={{
                        padding: '14px 16px',
                        backgroundColor: '#FAF5FF',
                        border: '1.5px solid #E9D5FF',
                        borderRadius: '12px',
                        marginBottom: prod.isBulk ? '16px' : '0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <label
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: '#2E1065',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sparkles size={14} color="#7E22CE" />
                          <span>Product Card Badge</span>
                        </label>
                        {prod.badge && (
                          <button
                            type="button"
                            onClick={() => updateProduct(pIdx, { badge: '' })}
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#DC2626',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              padding: 0,
                            }}
                          >
                            Clear Badge
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        {[
                          { key: 'EXCLUSIVE', label: '✨ Exclusive', color: '#059669', bg: '#ECFDF5' },
                          { key: 'TRENDING', label: '🔥 Trending', color: '#DB2777', bg: '#FDF2F8' },
                          { key: 'GIFT CHOICE', label: '🎁 Gift Choice', color: '#9333EA', bg: '#FAF5FF' },
                          { key: 'BESTSELLER', label: '👑 Best Seller', color: '#6D28D9', bg: '#F5F3FF' },
                          { key: 'NEW', label: '⭐ New Arrival', color: '#4338CA', bg: '#EEF2FF' },
                          { key: 'HOT DEAL', label: '⚡ Hot Deal', color: '#DC2626', bg: '#FEF2F2' },
                          { key: 'LIMITED EDITION', label: '💎 Limited Edition', color: '#0284C7', bg: '#F0F9FF' },
                        ].map((item) => {
                          const isChecked = prod.badge?.toUpperCase() === item.key;
                          return (
                            <label
                              key={item.key}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                userSelect: 'none',
                                backgroundColor: isChecked ? item.bg : '#FFFFFF',
                                color: isChecked ? item.color : '#4B5563',
                                border: `1.5px solid ${isChecked ? item.color : '#E5E7EB'}`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    updateProduct(pIdx, { badge: '' });
                                  } else {
                                    updateProduct(pIdx, {
                                      badge: item.key,
                                      isBestSeller: item.key === 'BESTSELLER' ? true : prod.isBestSeller,
                                    });
                                  }
                                }}
                                style={{ display: 'none' }}
                              />
                              <span>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#6B7280' }}>Or Custom Badge:</span>
                        <input
                          type="text"
                          value={prod.badge}
                          onChange={(e) => updateProduct(pIdx, { badge: e.target.value })}
                          placeholder="e.g. FESTIVE SPECIAL"
                          style={{
                            ...inputStyle,
                            maxWidth: '260px',
                            backgroundColor: '#FFFFFF',
                            padding: '6px 10px',
                            fontSize: '12px',
                          }}
                        />
                      </div>
                    </div>

                    {prod.isBulk && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          backgroundColor: '#FAF5FF',
                          border: '1px solid #E9D5FF',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ minWidth: '200px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: '#581C87',
                              marginBottom: '4px',
                            }}
                          >
                            Minimum Order Quantity (MOQ) *
                          </label>
                          <input
                            type="number"
                            min={1}
                            required={prod.isBulk}
                            value={prod.minOrderQuantity}
                            onChange={(e) => updateProduct(pIdx, { minOrderQuantity: e.target.value })}
                            placeholder="e.g. 30"
                            style={{ ...inputStyle, backgroundColor: '#ffffff', fontWeight: 700, color: '#6B21A8' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 6: Product Images (Clean upload/add, empty on copied form) */}
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <ImageIcon size={18} style={{ color: '#7E22CE' }} />
                      <span>6. Product Images (Fresh Upload for this Product)</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <input
                        type="url"
                        value={prod.imageUrlInput}
                        onChange={(e) => updateProduct(pIdx, { imageUrlInput: e.target.value })}
                        placeholder="Paste image URL..."
                        style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(pIdx)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#FAF5FF',
                          border: '1px solid #E9D5FF',
                          color: '#7E22CE',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                        }}
                      >
                        + Add URL
                      </button>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#7E22CE',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                        }}
                      >
                        <Upload size={14} />
                        <span>{prod.uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, pIdx)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {prod.images.length === 0 ? (
                      <div
                        style={{
                          padding: '20px',
                          backgroundColor: '#FAF5FF',
                          borderRadius: '10px',
                          textAlign: 'center',
                          color: '#9CA3AF',
                          fontSize: '13px',
                          border: '1.5px dashed #D8B4FE',
                        }}
                      >
                        📷 No images added yet for this product. Upload image files or paste URLs above.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                          gap: '12px',
                        }}
                      >
                        {prod.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            style={{
                              border: img.isPrimary ? '2px solid #7E22CE' : '1px solid #E9D5FF',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              backgroundColor: '#ffffff',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={img.imageUrl}
                              alt=""
                              style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                            />
                            <div
                              style={{
                                padding: '6px 8px 4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImgs = prod.images.map((m, k) => ({
                                    ...m,
                                    isPrimary: k === imgIdx,
                                  }));
                                  updateProduct(pIdx, { images: nextImgs });
                                }}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: img.isPrimary ? '#7E22CE' : '#9CA3AF',
                                }}
                              >
                                {img.isPrimary ? '★ Primary' : 'Set Primary'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImgs = prod.images.filter((_, k) => k !== imgIdx);
                                  updateProduct(pIdx, { images: nextImgs });
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                                title="Remove Image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Color Tag Selector per Image */}
                            <div style={{ padding: '0 8px 8px' }}>
                              <select
                                value={img.colorId || ''}
                                onChange={(e) => {
                                  const nextImgs = prod.images.map((m, k) =>
                                    k === imgIdx ? { ...m, colorId: e.target.value } : m
                                  );
                                  updateProduct(pIdx, { images: nextImgs });
                                }}
                                style={{
                                  width: '100%',
                                  padding: '4px 6px',
                                  borderRadius: '6px',
                                  border: img.colorId ? '1.5px solid #7E22CE' : '1px solid #D1D5DB',
                                  backgroundColor: img.colorId ? '#FAF5FF' : '#FFFFFF',
                                  fontSize: '11px',
                                  color: img.colorId ? '#6B21A8' : '#4B5563',
                                  fontWeight: img.colorId ? 700 : 500,
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                                title="Tag image to a specific color or keep as general for all colors"
                              >
                                <option value="">All Colors / General</option>
                                {colors.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    🎨 {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 7: Variants Matrix */}
                  <div style={sectionStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={sectionHeaderStyle}>
                        <Palette size={18} style={{ color: '#7E22CE' }} />
                        <span>7. Variants Matrix (Visual Colors & Sizes)</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setColorModalOpen(true)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            color: '#7E22CE',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Palette size={13} /> Manage Colors
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSizeModalInitialTab('dimensions');
                            setSizeModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FAF5FF',
                            border: '1.5px solid #C084FC',
                            color: '#7E22CE',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Ruler size={13} /> 📐 + Dimension (L × W)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSizeModalInitialTab('browse');
                            setSizeModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FAF5FF',
                            border: '1px solid #E9D5FF',
                            color: '#7E22CE',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Ruler size={13} /> Manage Sizes
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newV = {
                              sku: prod.sku ? `${prod.sku}-V${prod.variants.length + 1}` : '',
                              name: '',
                              colorId: '',
                              sizeId: '',
                              mrp: prod.price || '',
                              salePrice: prod.salePrice || '',
                              stock: '10',
                            };
                            updateProduct(pIdx, { variants: [...prod.variants, newV] });
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#7E22CE',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Plus size={13} /> Add Variant
                        </button>
                      </div>
                    </div>

                    {/* Direct Inline Quick Add Strip */}
                    <div
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1.5px solid #E9D5FF',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#581C87',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={14} style={{ color: '#7E22CE' }} />
                        <span>Direct Quick-Add (Instant Database Save & Real-Time Sync):</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                        {/* Quick Add Color Box */}
                        <div
                          style={{
                            backgroundColor: '#FAF5FF',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #E9D5FF',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#7E22CE', whiteSpace: 'nowrap' }}>
                              + Color:
                            </span>
                            <input
                              type="text"
                              value={quickColorName}
                              onChange={(e) => setQuickColorName(e.target.value)}
                              placeholder="e.g. Emerald Green / Gold"
                              style={{ ...inputStyle, padding: '5px 8px', fontSize: '11.5px', flex: 1, backgroundColor: '#fff' }}
                            />
                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 5px',
                                backgroundColor: '#fff',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <span
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  backgroundColor: quickColorHex,
                                  border: '1px solid #94A3B8',
                                  display: 'inline-block',
                                }}
                              />
                              <input
                                type="color"
                                value={quickColorHex}
                                onChange={(e) => setQuickColorHex(e.target.value)}
                                style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAddColor(e, pIdx)}
                              disabled={quickColorLoading || !quickColorName.trim()}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: quickColorSuccess ? '#16A34A' : '#7E22CE',
                                color: '#fff',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {quickColorLoading ? '...' : quickColorSuccess ? '✓' : '+ Add'}
                            </button>
                          </div>
                        </div>

                        {/* Quick Add Size Box */}
                        <div
                          style={{
                            backgroundColor: '#FAF5FF',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #E9D5FF',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#7E22CE', whiteSpace: 'nowrap' }}>
                              + Size:
                            </span>
                            <input
                              type="text"
                              value={quickSizeName}
                              onChange={(e) => setQuickSizeName(e.target.value)}
                              placeholder='e.g. 18" (45.7 cm)'
                              style={{ ...inputStyle, padding: '5px 8px', fontSize: '11.5px', flex: 1, backgroundColor: '#fff' }}
                            />
                            <input
                              type="text"
                              value={quickSizeCode}
                              onChange={(e) => setQuickSizeCode(e.target.value)}
                              placeholder="Code"
                              style={{ ...inputStyle, padding: '5px 6px', fontSize: '11.5px', width: '70px', backgroundColor: '#fff' }}
                            />
                            <button
                              type="button"
                              onClick={(e) => handleQuickAddSize(e, pIdx)}
                              disabled={quickSizeLoading || !quickSizeName.trim()}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                backgroundColor: quickSizeSuccess ? '#16A34A' : '#7E22CE',
                                color: '#fff',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              {quickSizeLoading ? '...' : quickSizeSuccess ? '✓' : '+ Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Matrix Combination Generator */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#FAF5FF',
                        borderRadius: '10px',
                        border: '1px solid #E9D5FF',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2E1065',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Zap size={14} color="#D97706" />
                        <span>Quick Matrix Generator: Select colors & sizes to auto-generate all variants</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '3px' }}>
                            Colors:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '50px', overflowY: 'auto' }}>
                            {colors.map((c) => {
                              const isSelected = prod.matrixColors.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    const next = isSelected
                                      ? prod.matrixColors.filter((id) => id !== c.id)
                                      : [...prod.matrixColors, c.id];
                                    updateProduct(pIdx, { matrixColors: next });
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 7px',
                                    borderRadius: '10px',
                                    border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                                    backgroundColor: isSelected ? '#7E22CE' : '#ffffff',
                                    color: isSelected ? '#ffffff' : '#374151',
                                    fontSize: '10.5px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '7px',
                                      height: '7px',
                                      borderRadius: '50%',
                                      backgroundColor: c.hexCode,
                                    }}
                                  />
                                  <span>{c.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '3px' }}>
                            Sizes:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '50px', overflowY: 'auto' }}>
                            {sizes.map((s) => {
                              const isSelected = prod.matrixSizes.includes(s.id);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => {
                                    const next = isSelected
                                      ? prod.matrixSizes.filter((id) => id !== s.id)
                                      : [...prod.matrixSizes, s.id];
                                    updateProduct(pIdx, { matrixSizes: next });
                                  }}
                                  style={{
                                    padding: '2px 7px',
                                    borderRadius: '10px',
                                    border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                                    backgroundColor: isSelected ? '#7E22CE' : '#ffffff',
                                    color: isSelected ? '#ffffff' : '#374151',
                                    fontSize: '10.5px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {s.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleGenerateMatrix(pIdx)}
                            disabled={prod.matrixColors.length === 0 && prod.matrixSizes.length === 0}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#7E22CE',
                              color: '#ffffff',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              opacity: prod.matrixColors.length === 0 && prod.matrixSizes.length === 0 ? 0.5 : 1,
                            }}
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Variants Table */}
                    {prod.variants.length === 0 ? (
                      <div
                        style={{
                          padding: '16px',
                          backgroundColor: '#FAF5FF',
                          borderRadius: '10px',
                          textAlign: 'center',
                          color: '#9CA3AF',
                          fontSize: '12.5px',
                        }}
                      >
                        No variants configured. Product will use the base SKU and price.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1.4fr 1.3fr 0.9fr 1.1fr 0.8fr 32px',
                            gap: '8px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#6B7280',
                            textTransform: 'uppercase',
                          }}
                        >
                          <span>Variant SKU</span>
                          <span>Color</span>
                          <span>Size / Dim</span>
                          <span>MRP (₹)</span>
                          <span>Offer (₹)</span>
                          <span>Stock</span>
                          <span></span>
                        </div>

                        {prod.variants.map((v, vIdx) => {
                          const selectedColor = colors.find((c) => c.id === v.colorId);
                          return (
                            <div
                              key={vIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1.2fr 1.4fr 1.3fr 0.9fr 1.1fr 0.8fr 32px',
                                gap: '8px',
                                alignItems: 'center',
                                padding: '10px',
                                backgroundColor: '#FAF5FF',
                                borderRadius: '8px',
                                border: '1px solid #E9D5FF',
                              }}
                            >
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => {
                                  const nextV = [...prod.variants];
                                  nextV[vIdx].sku = e.target.value;
                                  updateProduct(pIdx, { variants: nextV });
                                }}
                                placeholder="Variant SKU"
                                style={{ ...inputStyle, padding: '6px 8px', backgroundColor: '#fff', fontSize: '11.5px' }}
                              />

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: selectedColor?.hexCode || '#E5E7EB',
                                    border: '1px solid #CBD5E1',
                                    flexShrink: 0,
                                  }}
                                />
                                <select
                                  value={v.colorId}
                                  onChange={(e) => {
                                    const nextV = [...prod.variants];
                                    nextV[vIdx].colorId = e.target.value;
                                    updateProduct(pIdx, { variants: nextV });
                                  }}
                                  style={{ ...inputStyle, padding: '6px 6px', backgroundColor: '#fff', flex: 1, fontSize: '11.5px' }}
                                >
                                  <option value="">Select Color</option>
                                  {colors.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <select
                                value={v.sizeId}
                                onChange={(e) => {
                                  const nextV = [...prod.variants];
                                  nextV[vIdx].sizeId = e.target.value;
                                  updateProduct(pIdx, { variants: nextV });
                                }}
                                style={{ ...inputStyle, padding: '6px 6px', backgroundColor: '#fff', fontSize: '11.5px' }}
                              >
                                <option value="">Select Size</option>
                                {sizes.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="number"
                                min="0"
                                value={v.mrp}
                                onChange={(e) => {
                                  const nextV = [...prod.variants];
                                  nextV[vIdx].mrp = e.target.value;
                                  updateProduct(pIdx, { variants: nextV });
                                }}
                                placeholder="MRP ₹"
                                style={{ ...inputStyle, padding: '6px 6px', backgroundColor: '#fff', fontSize: '11.5px' }}
                              />

                              <input
                                type="number"
                                min="0"
                                value={v.salePrice}
                                onChange={(e) => {
                                  const nextV = [...prod.variants];
                                  nextV[vIdx].salePrice = e.target.value;
                                  updateProduct(pIdx, { variants: nextV });
                                }}
                                placeholder="Sale ₹"
                                style={{
                                  ...inputStyle,
                                  padding: '6px 6px',
                                  backgroundColor: '#fff',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  color: '#7E22CE',
                                }}
                              />

                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => {
                                  const nextV = [...prod.variants];
                                  nextV[vIdx].stock = e.target.value;
                                  updateProduct(pIdx, { variants: nextV });
                                }}
                                placeholder="Qty"
                                style={{ ...inputStyle, padding: '6px 6px', backgroundColor: '#fff', fontSize: '11.5px' }}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const nextV = prod.variants.filter((_, k) => k !== vIdx);
                                  updateProduct(pIdx, { variants: nextV });
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Section 8: Story & Specifications */}
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <FileText size={18} style={{ color: '#7E22CE' }} />
                      <span>8. Story, Specifications & Care</span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '6px',
                        }}
                      >
                        Detailed Story / Description
                      </label>
                      <textarea
                        rows={3}
                        value={prod.description}
                        onChange={(e) => updateProduct(pIdx, { description: e.target.value })}
                        placeholder="Comprehensive product storytelling..."
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Specifications Notes
                        </label>
                        <textarea
                          rows={2}
                          value={prod.specifications}
                          onChange={(e) => updateProduct(pIdx, { specifications: e.target.value })}
                          placeholder="e.g. Material: Brass, Plating: 18K Gold"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '6px',
                          }}
                        >
                          Care Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={prod.careInstructions}
                          onChange={(e) => updateProduct(pIdx, { careInstructions: e.target.value })}
                          placeholder="e.g. Avoid perfume and water."
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 9: Shipping Dimensions */}
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <Truck size={18} style={{ color: '#7E22CE' }} />
                      <span>9. Shipping & Package Dimensions</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '4px',
                          }}
                        >
                          Weight (Grams)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prod.weightGrams}
                          onChange={(e) => updateProduct(pIdx, { weightGrams: e.target.value })}
                          placeholder="50"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '4px',
                          }}
                        >
                          Length (cm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prod.lengthCm}
                          onChange={(e) => updateProduct(pIdx, { lengthCm: e.target.value })}
                          placeholder="10"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '4px',
                          }}
                        >
                          Width (cm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prod.widthCm}
                          onChange={(e) => updateProduct(pIdx, { widthCm: e.target.value })}
                          placeholder="10"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '4px',
                          }}
                        >
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prod.heightCm}
                          onChange={(e) => updateProduct(pIdx, { heightCm: e.target.value })}
                          placeholder="5"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Footer Action Strip on each card */}
                  {!isEdit && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        backgroundColor: '#FAF5FF',
                        borderRadius: '12px',
                        border: '1.5px dashed #D8B4FE',
                        marginTop: '10px',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#7E22CE" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#581C87' }}>
                          Need to add another product variant or product with similar details?
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleAddMoreProductCopy(pIdx)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            borderRadius: '10px',
                            backgroundColor: '#7E22CE',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(126, 34, 206, 0.2)',
                          }}
                        >
                          <Copy size={14} />
                          <span>+ Add More Product (Copy Details)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddBlankProduct}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #E5E7EB',
                            color: '#4B5563',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={14} />
                          <span>+ Blank Form</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Bottom Sticky Action Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1.5px solid #E9D5FF',
          padding: '14px 28px',
          boxShadow: '0 -4px 20px rgba(107, 33, 168, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/admin/products"
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: '13.5px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>

          {!isEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#6B21A8',
                  backgroundColor: '#FAF5FF',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid #D8B4FE',
                }}
              >
                📦 {products.length} {products.length === 1 ? 'Product' : 'Products'} Ready to Submit
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isEdit && (
            <>
              <button
                type="button"
                onClick={handleAddBlankProduct}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#7E22CE',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} />
                <span>+ Add Blank Product</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddMoreProductCopy(products.length - 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1.5px solid #C084FC',
                  color: '#7E22CE',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(126, 34, 206, 0.1)',
                }}
              >
                <Copy size={15} />
                <span>+ Add More Product (Copy Details)</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 28px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
            }}
          >
            {submitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>
              {isEdit
                ? 'Update Product'
                : products.length > 1
                ? `Save & Publish All (${products.length}) Products`
                : 'Save & Publish Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Embedded Modals for Fast Inline Management */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoriesUpdated={() => {
          refreshCategories();
          products.forEach((p) => {
            if (p.selectedCategory) loadSubcategoriesForCategory(p.selectedCategory);
          });
        }}
      />

      <ColorManagerModal
        open={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        onColorsUpdated={refreshColors}
      />

      <SizeManagerModal
        open={sizeModalOpen}
        initialTab={sizeModalInitialTab}
        onClose={() => setSizeModalOpen(false)}
        onSizesUpdated={refreshSizes}
      />

      <AttributeManagerModal
        open={attributeModalOpen}
        onClose={() => setAttributeModalOpen(false)}
        onAttributesUpdated={refreshAttributes}
      />
    </div>
  );
}
