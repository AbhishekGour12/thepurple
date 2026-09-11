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
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { adminProductApi } from '@/lib/api/admin/products';
import { BusyOverlay, BusyButtonLabel } from '@/components/admin/BusyUI';
import { adminCategoryApi } from '@/lib/api/admin/categories';
import { adminAttributeApi } from '@/lib/api/admin/attributes';

// Modals
import CategoryManagerModal from '@/components/admin/products/CategoryManagerModal';
import ColorManagerModal from '@/components/admin/products/ColorManagerModal';
import SizeManagerModal from '@/components/admin/products/SizeManagerModal';
import AttributeManagerModal from '@/components/admin/products/AttributeManagerModal';

export default function ProductForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Modals state for inline management
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);

  // Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [brand, setBrand] = useState(initialData?.brand || 'ThePurple');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [specifications, setSpecifications] = useState(initialData?.specifications || '');
  const [careInstructions, setCareInstructions] = useState(initialData?.careInstructions || '');

  // Category & Taxonomy
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.subcategory?.categoryId || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialData?.subcategoryId || '');

  // Pricing & Tax
  const [price, setPrice] = useState(initialData?.price !== undefined ? initialData.price : '');
  const [salePrice, setSalePrice] = useState(initialData?.salePrice !== undefined ? initialData.salePrice : '');
  const [taxRate, setTaxRate] = useState(initialData?.taxRate !== undefined ? initialData.taxRate : '0');
  const [hsnCode, setHSNCode] = useState(initialData?.hsnCode || '');

  // Inventory & Publishing
  const [stock, setStock] = useState(initialData?.stock !== undefined ? initialData.stock : '0');
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.lowStockThreshold || '5');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [badge, setBadge] = useState(initialData?.badge || '');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isBestSeller, setIsBestSeller] = useState(initialData?.isBestSeller || false);
  const [isBulk, setIsBulk] = useState(initialData?.isBulk || false);
  const [minOrderQuantity, setMinOrderQuantity] = useState(initialData?.minOrderQuantity || 30);

  // Dynamic Attributes & Specifications
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrValIds, setSelectedAttrValIds] = useState(
    initialData?.attributeValues?.map((av) => av.id) || []
  );
  const [newValInputs, setNewValInputs] = useState({});

  // Shipping Dimensions
  const [weightGrams, setWeightGrams] = useState(initialData?.weightGrams || '');
  const [lengthCm, setLengthCm] = useState(initialData?.lengthCm || '');
  const [widthCm, setWidthCm] = useState(initialData?.widthCm || '');
  const [heightCm, setHeightCm] = useState(initialData?.heightCm || '');

  // Images
  const [images, setImages] = useState(
    initialData?.images?.map((img) => ({
      imageUrl: img.imageUrl,
      altText: img.altText || '',
      isPrimary: img.isPrimary,
      displayOrder: img.displayOrder,
    })) || []
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants & Colors/Sizes
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variants, setVariants] = useState(
    initialData?.variants?.map((v) => ({
      sku: v.sku,
      name: v.name || '',
      colorId: v.colorId || '',
      sizeId: v.sizeId || '',
      mrp: v.mrp || '',
      salePrice: v.salePrice || '',
      stock: v.stock !== undefined ? v.stock : '0',
    })) || []
  );

  // Matrix generation state
  const [matrixColors, setMatrixColors] = useState([]);
  const [matrixSizes, setMatrixSizes] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-calculate discount percentage
  const numMrp = parseFloat(price) || 0;
  const numSale = parseFloat(salePrice) || numMrp;
  const discountPercent = numMrp > 0 ? Math.max(0, Math.round(((numMrp - numSale) / numMrp) * 100)) : 0;

  // Load Categories, Colors, Sizes & Dynamic Attributes
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

  useEffect(() => {
    refreshCategories();
    refreshColors();
    refreshSizes();
    refreshAttributes();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      adminCategoryApi.listSubcategories({ categoryId: selectedCategory }).then((res) => {
        setSubcategories(res?.subcategories || []);
      });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const handleToggleAttrVal = (valId) => {
    setSelectedAttrValIds((prev) =>
      prev.includes(valId) ? prev.filter((id) => id !== valId) : [...prev, valId]
    );
  };

  const handleAddInlineAttrVal = async (attrId) => {
    const valText = newValInputs[attrId]?.trim();
    if (!valText) return;

    try {
      const res = await adminAttributeApi.addAttributeValue(attrId, { value: valText });
      if (res?.attributeValue) {
        setAttributes((prev) =>
          prev.map((a) =>
            a.id === attrId
              ? { ...a, values: [...(a.values || []), res.attributeValue] }
              : a
          )
        );
        setSelectedAttrValIds((prev) => [...prev, res.attributeValue.id]);
        setNewValInputs((prev) => ({ ...prev, [attrId]: '' }));
      }
    } catch {
      // Handled
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages([
      ...images,
      {
        imageUrl: imageUrlInput.trim(),
        altText: name,
        isPrimary: images.length === 0,
        displayOrder: images.length,
      },
    ]);
    setImageUrlInput('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminProductApi.uploadImage(file);
      if (res?.imageUrl) {
        setImages([
          ...images,
          {
            imageUrl: res.imageUrl,
            altText: name,
            isPrimary: images.length === 0,
            displayOrder: images.length,
          },
        ]);
      }
    } catch {
      // Handled
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSetPrimaryImage = (index) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleAddVariant = () => {
    const nextSku = sku ? `${sku}-V${variants.length + 1}` : `VAR-${variants.length + 1}`;
    setVariants([
      ...variants,
      {
        sku: nextSku,
        name: '',
        colorId: colors[0]?.id || '',
        sizeId: sizes[0]?.id || '',
        mrp: price || '',
        salePrice: salePrice || '',
        stock: '10',
      },
    ]);
  };

  const handleGenerateMatrix = () => {
    if (matrixColors.length === 0 && matrixSizes.length === 0) return;

    const newVariants = [];
    const colorList = matrixColors.length > 0 ? matrixColors : [''];
    const sizeList = matrixSizes.length > 0 ? matrixSizes : [''];

    let count = variants.length;
    for (const cId of colorList) {
      for (const sId of sizeList) {
        count++;
        const cObj = colors.find((c) => c.id === cId);
        const sObj = sizes.find((s) => s.id === sId);
        const colorName = cObj ? cObj.name.toUpperCase().replace(/\s+/g, '') : '';
        const sizeName = sObj ? (sObj.code || sObj.name).toUpperCase().replace(/\s+/g, '') : '';
        const suffix = [colorName, sizeName].filter(Boolean).join('-') || `V${count}`;

        newVariants.push({
          sku: sku ? `${sku}-${suffix}` : `VAR-${suffix}`,
          name: `${cObj?.name || ''} ${sObj?.name || ''}`.trim(),
          colorId: cId || '',
          sizeId: sId || '',
          mrp: price || '',
          salePrice: salePrice || '',
          stock: '10',
        });
      }
    }

    setVariants((prev) => [...prev, ...newVariants]);
    setMatrixColors([]);
    setMatrixSizes([]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Product name is required');
    if (!sku.trim()) return setError('SKU is required');
    if (!selectedSubcategory) return setError('Please select a category and subcategory');
    if (!price || parseFloat(price) < 0) return setError('Valid price (MRP) is required');
    if (salePrice && parseFloat(salePrice) > parseFloat(price)) {
      return setError('Selling price cannot exceed MRP');
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      brand: brand.trim(),
      subcategoryId: selectedSubcategory,
      price: parseFloat(price),
      salePrice: parseFloat(salePrice) || parseFloat(price),
      discountPercent,
      taxRate: parseFloat(taxRate) || 0,
      hsnCode: hsnCode.trim() || undefined,
      stock: parseInt(stock, 10) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
      status,
      badge: badge ? badge.trim() : null,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller) || badge?.toUpperCase() === 'BESTSELLER',
      isBulk: Boolean(isBulk),
      minOrderQuantity: Boolean(isBulk) ? Math.max(1, parseInt(minOrderQuantity, 10) || 1) : 1,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      specifications: specifications.trim() || undefined,
      careInstructions: careInstructions.trim() || undefined,
      tags: tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      attributeValueIds: selectedAttrValIds,
      weightGrams: weightGrams ? parseFloat(weightGrams) : undefined,
      lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
      widthCm: widthCm ? parseFloat(widthCm) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      images,
      variants,
    };

    setLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await adminProductApi.updateProduct(initialData.id, payload);
      } else {
        await adminProductApi.createProduct(payload);
      }
      setSuccess(true);
      router.push('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
      setLoading(false);
    }
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #E9D5FF',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
  };

  const sectionHeaderStyle = {
    fontSize: '15px',
    fontWeight: 700,
    color: '#2E1065',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

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

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '60px', position: 'relative' }}>
      <BusyOverlay show={loading} label={isEdit ? 'Updating product...' : 'Saving product...'} />
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/products"
            style={{
              padding: '8px',
              borderRadius: '8px',
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2E1065', margin: 0 }}>
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Manage master taxonomy, custom attributes, multi-color & size variants, and pricing
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '10px',
            backgroundColor: '#7E22CE',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
          }}
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          <span>
            <BusyButtonLabel busy={loading} busyText="Saving Product...">
              {isEdit ? 'Update Product' : 'Save & Publish Product'}
            </BusyButtonLabel>
          </span>
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            color: '#DC2626',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '10px',
            color: '#065F46',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Product saved successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Sparkles size={18} style={{ color: '#7E22CE' }} />
            <span>1. Basic Product Information</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 18K Gold Plated Crystal Drop Earrings"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                SKU (Unique Identifier) *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. TP-JW-001"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="ThePurple"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. gold, jewellery, earrings, partywear"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Short Description
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A brief 1-sentence hook for catalogue cards"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Section 2: Category & Master Taxonomy */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Parent Category *
              </label>
              <select
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Subcategory *
              </label>
              <select
                required
                disabled={!selectedCategory}
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                style={{
                  ...inputStyle,
                  backgroundColor: selectedCategory ? '#FAF5FF' : '#F3F4F6',
                }}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((s) => (
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
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
            Select all applicable attribute tags for this product or add new options inline.
          </p>

          {attributes.length === 0 ? (
            <div style={{ padding: '16px', backgroundColor: '#FAF5FF', borderRadius: '8px', color: '#9CA3AF', fontSize: '13px', textAlign: 'center' }}>
              No dynamic attributes configured yet. Go to Attributes manager to create standard options.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {attributes.map((attr) => (
                <div key={attr.id} style={{ padding: '12px 16px', backgroundColor: '#FAF5FF', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#2E1065', marginBottom: '8px' }}>
                    {attr.name}
                  </div>

                  {/* Value Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {attr.values?.map((val) => {
                      const isSelected = selectedAttrValIds.includes(val.id);
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => handleToggleAttrVal(val.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#7E22CE' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#374151',
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{val.value}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Add Custom Value */}
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '320px' }}>
                    <input
                      type="text"
                      placeholder={`+ New ${attr.name} option...`}
                      value={newValInputs[attr.id] || ''}
                      onChange={(e) =>
                        setNewValInputs((prev) => ({ ...prev, [attr.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineAttrVal(attr.id);
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        fontSize: '12px',
                        outline: 'none',
                        flex: 1,
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddInlineAttrVal(attr.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#7E22CE',
                        color: '#ffffff',
                        fontSize: '12px',
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

        {/* Section 4: Pricing & Discounts */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Tag size={18} style={{ color: '#7E22CE' }} />
            <span>4. Product Pricing & Taxes</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                MRP (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="1799"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="3"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                HSN Code
              </label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHSNCode(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Low Stock Threshold
              </label>
              <input
                type="number"
                min={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="5"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Catalog Status *
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="DRAFT">Draft (Hidden from store)</option>
                <option value="PUBLISHED">Published (Visible in store)</option>
                <option value="UNPUBLISHED">Unpublished (Archived)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#7E22CE' }}
              />
              <span>Featured Product on Homepage</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              <input
                type="checkbox"
                checked={isBestSeller || badge?.toUpperCase() === 'BESTSELLER'}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsBestSeller(val);
                  if (val && !badge) setBadge('BESTSELLER');
                }}
                style={{ width: '16px', height: '16px', accentColor: '#7E22CE' }}
              />
              <span>Best Seller Status</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: isBulk ? '#7E22CE' : '#374151' }}>
              <input
                type="checkbox"
                checked={isBulk}
                onChange={(e) => setIsBulk(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#7E22CE' }}
              />
              <span>📦 Bulk Selling / Wholesale Only</span>
            </label>
          </div>

          {/* Product Badges Selection */}
          <div
            style={{
              padding: '16px 18px',
              backgroundColor: '#FAF5FF',
              border: '1.5px solid #E9D5FF',
              borderRadius: '12px',
              marginBottom: isBulk ? '16px' : '0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#2E1065', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#7E22CE" />
                <span>Product Card Badge (Shown on storefront catalog &amp; cards)</span>
              </label>
              {badge && (
                <button
                  type="button"
                  onClick={() => setBadge('')}
                  style={{
                    fontSize: '11.5px',
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

            {/* Quick Badge Selection Checkboxes / Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              {[
                { key: 'EXCLUSIVE', label: '✨ Exclusive', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
                { key: 'TRENDING', label: '🔥 Trending', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8' },
                { key: 'GIFT CHOICE', label: '🎁 Gift Choice', color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
                { key: 'BESTSELLER', label: '👑 Best Seller', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
                { key: 'NEW', label: '⭐ New Arrival', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
                { key: 'HOT DEAL', label: '⚡ Hot Deal', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
                { key: 'LIMITED EDITION', label: '💎 Limited Edition', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
              ].map((item) => {
                const isChecked = badge?.toUpperCase() === item.key;
                return (
                  <label
                    key={item.key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: isChecked ? item.bg : '#FFFFFF',
                      color: isChecked ? item.color : '#4B5563',
                      border: `1.5px solid ${isChecked ? item.color : '#E5E7EB'}`,
                      boxShadow: isChecked ? `0 2px 8px ${item.color}25` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setBadge('');
                        } else {
                          setBadge(item.key);
                          if (item.key === 'BESTSELLER') setIsBestSeller(true);
                        }
                      }}
                      style={{ width: '15px', height: '15px', accentColor: item.color, cursor: 'pointer' }}
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Badge Text Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>
                Or Custom Badge:
              </span>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. FESTIVE SPECIAL, HANDCRAFTED"
                style={{
                  ...inputStyle,
                  maxWidth: '300px',
                  backgroundColor: '#FFFFFF',
                  padding: '7px 12px',
                  fontSize: '12.5px',
                }}
              />
              {badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    letterSpacing: '0.04em',
                  }}
                >
                  Preview: {badge.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {isBulk && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#581C87', marginBottom: '6px' }}>
                  Minimum Order Quantity (MOQ) *
                </label>
                <input
                  type="number"
                  min={1}
                  required={isBulk}
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(e.target.value)}
                  placeholder="e.g. 30"
                  style={{ ...inputStyle, backgroundColor: '#ffffff', fontWeight: 700, color: '#6B21A8' }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', flex: 1, minWidth: '200px' }}>
                Customers will not be allowed to purchase less than <strong>{minOrderQuantity || 30} pieces</strong>. When added to cart, the default quantity will automatically be set to this minimum.
              </p>
            </div>
          )}
        </div>

        {/* Section 6: Product Images */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <ImageIcon size={18} style={{ color: '#7E22CE' }} />
            <span>6. Product Images</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Paste image URL..."
              style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#7E22CE',
                fontWeight: 700,
                fontSize: '13px',
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
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#7E22CE',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Upload size={15} />
              <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {images.length === 0 ? (
            <div
              style={{
                padding: '24px',
                backgroundColor: '#FAF5FF',
                borderRadius: '10px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '13px',
              }}
            >
              No images added yet. Add URLs or upload image files above.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    border: img.isPrimary ? '2px solid #7E22CE' : '1px solid #E9D5FF',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                  }}
                >
                  <img src={img.imageUrl} alt="" style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                  <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
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
                      onClick={() => handleRemoveImage(idx)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 7: Variants with Visual Color Picker & Multi-Matrix Generator */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={sectionHeaderStyle}>
              <Palette size={18} style={{ color: '#7E22CE' }} />
              <span>7. Product Variants (Visual Colors & Sizes Matrix)</span>
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
                onClick={() => setSizeModalOpen(true)}
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
                onClick={handleAddVariant}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>
          </div>

          {/* Quick Matrix Multi-Selection Bar */}
          <div
            style={{
              padding: '14px',
              backgroundColor: '#FAF5FF',
              borderRadius: '12px',
              border: '1px solid #E9D5FF',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#2E1065', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="#D97706" />
              <span>Quick Matrix Generator: Select multiple colors and sizes to auto-generate all combinations</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
              {/* Select Colors */}
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Select Colors:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '60px', overflowY: 'auto' }}>
                  {colors.map((c) => {
                    const isSelected = matrixColors.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setMatrixColors((prev) =>
                            prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          )
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                          backgroundColor: isSelected ? '#7E22CE' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#374151',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.hexCode, border: '1px solid #ccc' }} />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Sizes */}
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Select Sizes:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '60px', overflowY: 'auto' }}>
                  {sizes.map((s) => {
                    const isSelected = matrixSizes.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setMatrixSizes((prev) =>
                            prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                          )
                        }
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                          backgroundColor: isSelected ? '#7E22CE' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#374151',
                          fontSize: '11px',
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
                  onClick={handleGenerateMatrix}
                  disabled={matrixColors.length === 0 && matrixSizes.length === 0}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#7E22CE',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: matrixColors.length === 0 && matrixSizes.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: matrixColors.length === 0 && matrixSizes.length === 0 ? 0.5 : 1,
                  }}
                >
                  Generate Combinations
                </button>
              </div>
            </div>
          </div>

          {variants.length === 0 ? (
            <div
              style={{
                padding: '20px',
                backgroundColor: '#FAF5FF',
                borderRadius: '10px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '13px',
              }}
            >
              No variants configured. The product will use the base product SKU and details.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {variants.map((v, idx) => {
                const selectedColor = colors.find((c) => c.id === v.colorId);
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 1.6fr 1fr 1fr 1fr 40px',
                      gap: '10px',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#FAF5FF',
                      borderRadius: '10px',
                      border: '1px solid #E9D5FF',
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        placeholder="Variant SKU"
                        style={{ ...inputStyle, padding: '8px 10px', backgroundColor: '#fff' }}
                      />
                    </div>

                    {/* Color with visual swatch preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: selectedColor?.hexCode || '#E5E7EB',
                          border: '2px solid #CBD5E1',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          flexShrink: 0,
                        }}
                        title={selectedColor ? `${selectedColor.name} (${selectedColor.hexCode})` : 'No color'}
                      />
                      <select
                        value={v.colorId}
                        onChange={(e) => handleVariantChange(idx, 'colorId', e.target.value)}
                        style={{ ...inputStyle, padding: '8px 10px', backgroundColor: '#fff', flex: 1 }}
                      >
                        <option value="">Select Color</option>
                        {colors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.hexCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={v.sizeId}
                        onChange={(e) => handleVariantChange(idx, 'sizeId', e.target.value)}
                        style={{ ...inputStyle, padding: '8px 10px', backgroundColor: '#fff' }}
                      >
                        <option value="">Select Size</option>
                        {sizes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.code ? `(${s.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="number"
                        value={v.salePrice}
                        onChange={(e) => handleVariantChange(idx, 'salePrice', e.target.value)}
                        placeholder="Price ₹"
                        style={{ ...inputStyle, padding: '8px 10px', backgroundColor: '#fff' }}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        placeholder="Stock"
                        style={{ ...inputStyle, padding: '8px 10px', backgroundColor: '#fff' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                      title="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 8: Detailed Story & Care */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <FileText size={18} style={{ color: '#7E22CE' }} />
            <span>8. Story, Specifications & Care</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Detailed Story / Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive product storytelling and details..."
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Specifications & Materials Notes
              </label>
              <textarea
                rows={3}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder="e.g. Material: Brass, Plating: 18K Gold, Gemstone: Zircon"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Care Instructions
              </label>
              <textarea
                rows={3}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Avoid direct contact with perfume and water. Store in pouch."
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Weight (Grams)
              </label>
              <input
                type="number"
                min={0}
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="50"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Length (cm)
              </label>
              <input
                type="number"
                min={0}
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                placeholder="10"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Width (cm)
              </label>
              <input
                type="number"
                min={0}
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                placeholder="10"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Height (cm)
              </label>
              <input
                type="number"
                min={0}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="5"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 0 40px' }}>
          <Link
            href="/admin/products"
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 32px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>
              <BusyButtonLabel busy={loading} busyText="Saving Product...">
                {isEdit ? 'Update Product' : 'Save & Publish Product'}
              </BusyButtonLabel>
            </span>
          </button>
        </div>
      </form>

      {/* Embedded Modals for Fast Popups */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoriesUpdated={() => {
          refreshCategories();
          if (selectedCategory) {
            adminCategoryApi.listSubcategories({ categoryId: selectedCategory }).then((res) => {
              setSubcategories(res?.subcategories || []);
            });
          }
        }}
      />

      <ColorManagerModal
        open={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        onColorsUpdated={refreshColors}
      />

      <SizeManagerModal
        open={sizeModalOpen}
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
