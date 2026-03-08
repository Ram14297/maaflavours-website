// src/app/admin/products/ProductForm.tsx
// Maa Flavours — Product Create/Edit Form (shared by /new and /[productId])
// Features:
//   • Multi-image upload with drag-to-reorder and primary image selection
//   • Two variants (250g / 500g) with price, SKU, stock, threshold
//   • Spice level selector with live colour preview
//   • Active / Featured toggles
//   • SEO fields: meta title, meta description, slug preview
//   • Ingredients, shelf life, description, short description
//   • Delete with confirmation (edit mode only)
//   • Auto-generates SKU from product name

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPage, Card, Btn, Input, Select, Textarea,
  Alert, Modal, fmt₹, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Types ────────────────────────────────────────────────────────────────────
type Variant = {
  id?:                string;
  label:              string;
  weight_grams:       number;
  sku:                string;
  price:              string;   // display in ₹
  stock_quantity:     string;
  low_stock_threshold:string;
  is_active:          boolean;
};

type ProductImage = {
  id?:        string;
  url:        string;
  sort_order: number;
  is_primary: boolean;
  uploading?: boolean;
  error?:     string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const SPICE_OPTIONS = [
  { value:"mild",       label:"🟢 Mild",         colour:"#4A7C59" },
  { value:"medium",     label:"🟡 Medium Spicy",  colour:"#B8750A" },
  { value:"spicy",      label:"🔴 Spicy",          colour:"#C0272D" },
  { value:"extra-hot",  label:"🌑 Extra Hot",      colour:"#7A1515" },
];

const DEFAULT_VARIANTS: Variant[] = [
  { label:"250g", weight_grams:250, sku:"", price:"", stock_quantity:"10", low_stock_threshold:"5", is_active:true },
  { label:"500g", weight_grams:500, sku:"", price:"", stock_quantity:"10", low_stock_threshold:"5", is_active:true },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
function autoSku(name: string, label: string): string {
  const base = name.split(" ").map(w => w[0]?.toUpperCase() || "").join("").slice(0,3) || "MF";
  return `MF-${base}-${label}`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const isNew  = !productId;
  const fileRef= useRef<HTMLInputElement>(null);

  // ── Core fields ─────────────────────────────────────────────────────────
  const [name,            setName]            = useState("");
  const [subtitle,        setSubtitle]        = useState("");
  const [tag,             setTag]             = useState("");
  const [slug,            setSlug]            = useState("");
  const [slugEdited,      setSlugEdited]      = useState(false);
  const [spice,           setSpice]           = useState("medium");
  const [shortDesc,       setShortDesc]       = useState("");
  const [description,     setDescription]     = useState("");
  const [ingredients,     setIngredients]     = useState("");
  const [shelfLife,       setShelfLife]       = useState("180");
  const [metaTitle,       setMetaTitle]       = useState("");
  const [metaDesc,        setMetaDesc]        = useState("");
  const [isActive,        setIsActive]        = useState(true);
  const [isFeatured,      setIsFeatured]      = useState(false);
  const [variants,        setVariants]        = useState<Variant[]>(DEFAULT_VARIANTS);
  const [images,          setImages]          = useState<ProductImage[]>([]);

  // ── UI state ────────────────────────────────────────────────────────────
  const [loading,         setLoading]         = useState(!isNew);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const [showDelete,      setShowDelete]      = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [dragOver,        setDragOver]        = useState(false);
  const [activeTab,       setActiveTab]       = useState<"details"|"seo"|"images">("details");

  // ── Load existing product ───────────────────────────────────────────────
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/admin/products/${productId}`)
      .then(r => r.json())
      .then(d => {
        const p = d.product;
        if (!p) return;
        setName(p.name || "");
        setSubtitle(p.subtitle || "");
        setTag(p.tag || "");
        setSlug(p.slug || "");
        setSlugEdited(true);
        setSpice(p.spice_level || "medium");
        setShortDesc(p.short_description || "");
        setDescription(p.description || "");
        setIngredients(p.ingredients || "");
        setShelfLife(String(p.shelf_life_days || 180));
        setMetaTitle(p.meta_title || "");
        setMetaDesc(p.meta_description || "");
        setIsActive(p.is_active ?? true);
        setIsFeatured(p.is_featured ?? false);

        if (d.variants?.length) {
          setVariants(d.variants.map((v: any) => ({
            id:                 v.id,
            label:              v.label,
            weight_grams:       v.weight_grams,
            sku:                v.sku || "",
            price:              String(v.price / 100),
            stock_quantity:     String(v.stock_quantity),
            low_stock_threshold:String(v.low_stock_threshold),
            is_active:          v.is_active ?? true,
          })));
        }

        if (d.images?.length) {
          setImages(d.images.map((img: any, i: number) => ({
            id:         img.id,
            url:        img.image_url,
            sort_order: img.sort_order ?? i,
            is_primary: img.is_primary ?? (i === 0),
          })));
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId, isNew]);

  // Auto-generate slug from name (unless manually edited)
  function handleNameChange(val: string) {
    setName(val);
    if (!slugEdited) setSlug(toSlug(val));
    setVariants(prev => prev.map(v => ({
      ...v,
      sku: v.sku || autoSku(val, v.label),
    })));
  }

  function updateVariant(idx: number, field: keyof Variant, value: string | boolean) {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  }

  // ── Image Upload ─────────────────────────────────────────────────────────
  async function uploadImages(files: FileList | null) {
    if (!files) return;
    const fileArr = Array.from(files);

    for (const file of fileArr) {
      // Add placeholder immediately
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempImg: ProductImage = {
        id:         tempId,
        url:        URL.createObjectURL(file),
        sort_order: images.length,
        is_primary: images.length === 0,
        uploading:  true,
      };
      setImages(prev => [...prev, tempImg]);

      // Upload
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "product-images");
      fd.append("path", `products/${toSlug(name || "product")}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`);

      const r = await fetch("/api/admin/upload", { method:"POST", body:fd });
      const d = await r.json();

      if (d.url) {
        setImages(prev => prev.map(img =>
          img.id === tempId
            ? { ...img, url: d.url, uploading: false }
            : img
        ));
      } else {
        setImages(prev => prev.map(img =>
          img.id === tempId
            ? { ...img, uploading: false, error: d.error || "Upload failed" }
            : img
        ));
      }
    }
  }

  function setPrimaryImage(url: string) {
    setImages(prev => prev.map(img => ({ ...img, is_primary: img.url === url })));
  }

  function removeImage(url: string) {
    setImages(prev => {
      const filtered = prev.filter(img => img.url !== url);
      // If we removed the primary, set first as primary
      if (filtered.length > 0 && !filtered.some(img => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  function moveImage(fromIdx: number, toIdx: number) {
    setImages(prev => {
      const arr  = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  // ── Drag and drop for images ─────────────────────────────────────────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadImages(e.dataTransfer.files);
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function save() {
    setError(""); setSuccess("");
    if (!name.trim()) { setError("Product name is required"); setActiveTab("details"); return; }
    if (variants.some(v => !v.price || parseFloat(v.price) <= 0)) {
      setError("Please enter prices for all variants");
      setActiveTab("details");
      return;
    }

    setSaving(true);
    const primaryUrl = images.find(img => img.is_primary && !img.uploading)?.url
                    || images.find(img => !img.uploading)?.url
                    || null;

    const body = {
      name:              name.trim(),
      slug:              slug || toSlug(name),
      subtitle:          subtitle.trim(),
      tag:               tag.trim(),
      spice_level:       spice,
      short_description: shortDesc.trim(),
      description:       description.trim(),
      ingredients:       ingredients.trim(),
      shelf_life_days:   parseInt(shelfLife) || 180,
      is_vegetarian:     true,
      is_active:         isActive,
      is_featured:       isFeatured,
      meta_title:        metaTitle.trim() || null,
      meta_description:  metaDesc.trim()  || null,
      primary_image_url: primaryUrl,
      variants: variants.map((v, idx) => ({
        id:                 v.id,
        label:              v.label,
        weight_grams:       v.weight_grams,
        sku:                v.sku || autoSku(name, v.label),
        price:              Math.round(parseFloat(v.price) * 100),
        stock_quantity:     parseInt(v.stock_quantity) || 0,
        low_stock_threshold:parseInt(v.low_stock_threshold) || 5,
        is_active:          v.is_active,
        sort_order:         idx,
      })),
      images: images
        .filter(img => !img.uploading && !img.error)
        .map((img, idx) => ({
          id:         img.id?.startsWith("temp-") ? undefined : img.id,
          image_url:  img.url,
          sort_order: idx,
          is_primary: img.is_primary,
        })),
    };

    const url    = isNew ? "/api/admin/products" : `/api/admin/products/${productId}`;
    const method = isNew ? "POST" : "PUT";
    const r      = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d      = await r.json();

    if (!r.ok) {
      setError(d.error || "Save failed");
      setSaving(false);
      return;
    }

    setSuccess(isNew ? "Product created!" : "Product saved!");
    if (isNew && d.product?.id) {
      setTimeout(() => router.push(`/admin/products/${d.product.id}`), 1000);
    }
    setSaving(false);
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function deleteProduct() {
    setDeleting(true);
    await fetch(`/api/admin/products/${productId}`, { method:"DELETE" });
    router.push("/admin/products");
  }

  if (loading) {
    return <AdminPage><div className="flex justify-center py-20"><Spinner size={32}/></div></AdminPage>;
  }

  const spiceConfig = SPICE_OPTIONS.find(o => o.value === spice) || SPICE_OPTIONS[1];

  return (
    <AdminPage>
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button onClick={() => router.push("/admin/products")}
            style={{ color:A.grey, fontSize:12 }} className="flex items-center gap-1 mb-2">
            ← Back to Products
          </button>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:A.brown, lineHeight:1.2 }}>
            {isNew ? "Add New Product" : name || "Edit Product"}
          </h1>
          {!isNew && slug && (
            <p style={{ fontSize:11, color:A.grey, marginTop:2 }}>
              maaflavours.com/products/<span style={{ color:A.gold }}>{slug}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isNew && (
            <Btn variant="ghost" size="sm" onClick={() => setShowDelete(true)}
              style={{ color:"#C0272D" } as any}>
              🗑 Delete
            </Btn>
          )}
          <Btn variant="ghost" onClick={() => router.push("/admin/products")}>Cancel</Btn>
          <Btn loading={saving} onClick={save}>
            {isNew ? "🫙 Create Product" : "💾 Save Changes"}
          </Btn>
        </div>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b" style={{ borderColor:A.border }}>
        {(["details","images","seo"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium capitalize transition-colors relative"
            style={{
              color:      activeTab === tab ? A.brown : A.grey,
              fontWeight: activeTab === tab ? 700 : 400,
            }}
          >
            {tab === "details" ? "📋 Product Details"
             : tab === "images" ? `🖼 Images (${images.filter(i => !i.error).length})`
             : "🔍 SEO & Meta"}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background:A.gold }}/>
            )}
          </button>
        ))}
      </div>

      {/* ── DETAILS TAB ── */}
      {activeTab === "details" && (
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Left: Main details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <Card title="Product Information">
              <div className="space-y-4">
                <Input
                  label="Product Name *"
                  placeholder="e.g. Drumstick Pickle"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Subtitle"
                    placeholder="e.g. Medium Spicy"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                  />
                  <Input
                    label="Tag / Badge"
                    placeholder="e.g. Authentic Andhra Taste"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                    URL Slug
                  </label>
                  <div className="flex items-center gap-0 mt-1.5 overflow-hidden rounded-lg border"
                    style={{ borderColor:A.border }}>
                    <span className="px-3 py-2 text-sm shrink-0"
                      style={{ background:A.cream, color:A.grey, borderRight:`1px solid ${A.border}` }}>
                      /products/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                      className="flex-1 px-3 py-2 text-sm outline-none"
                      style={{ color:A.brown }}
                      placeholder="auto-generated from name"
                    />
                  </div>
                </div>

                {/* Spice level */}
                <div>
                  <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                    Spice Level *
                  </label>
                  <div className="grid grid-cols-4 gap-2 mt-1.5">
                    {SPICE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSpice(opt.value)}
                        className="py-2.5 px-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: spice === opt.value ? `${opt.colour}18` : "#fff",
                          border:     `2px solid ${spice === opt.value ? opt.colour : A.border}`,
                          color:      spice === opt.value ? opt.colour : A.grey,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Live preview */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background:`${spiceConfig.colour}18`, color:spiceConfig.colour }}>
                      {spiceConfig.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs"
                      style={{ color:"#2E7D32", fontWeight:600 }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background:"#2E7D32" }}/>
                      100% Vegetarian
                    </span>
                  </div>
                </div>

                <Textarea
                  label="Short Description (shown in product card)"
                  placeholder="e.g. Traditional Andhra drumstick pickle made with sesame oil and sun-dried spices"
                  value={shortDesc}
                  onChange={e => setShortDesc(e.target.value)}
                  rows={2}
                />
                <Textarea
                  label="Full Description (shown on product page)"
                  placeholder="Describe the taste, texture, origin story, serving suggestions…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                />
                <Textarea
                  label="Ingredients"
                  placeholder="e.g. Drumstick (Moringa), Sesame Oil, Red Chilli, Salt, Turmeric, Mustard Seeds, Fenugreek"
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  rows={2}
                />
                <Input
                  label="Shelf Life (days)"
                  type="number"
                  placeholder="180"
                  value={shelfLife}
                  onChange={e => setShelfLife(e.target.value)}
                  className="w-40"
                />
              </div>
            </Card>

            {/* Variants & Pricing */}
            <Card
              title="Variants & Pricing"
              subtitle="Prices in ₹ — stored as paise (× 100) in the database"
            >
              <div className="space-y-4">
                {variants.map((v, idx) => (
                  <VariantEditor
                    key={idx}
                    variant={v}
                    index={idx}
                    productName={name}
                    onChange={(field, value) => updateVariant(idx, field, value)}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Visibility + Quick image preview */}
          <div className="space-y-5">

            {/* Visibility toggles */}
            <Card title="Visibility">
              <div className="space-y-4">
                {[
                  { label:"Active", sub:"Visible on the store", key:"isActive", value:isActive, set:setIsActive },
                  { label:"Featured", sub:"Show on homepage grid", key:"isFeatured", value:isFeatured, set:setIsFeatured },
                ].map(t => (
                  <div key={t.key} className="flex items-center justify-between">
                    <div>
                      <p style={{ color:A.brown, fontSize:13, fontWeight:500 }}>{t.label}</p>
                      <p style={{ color:A.grey, fontSize:11 }}>{t.sub}</p>
                    </div>
                    <Toggle value={t.value} onChange={t.set}/>
                  </div>
                ))}
              </div>
            </Card>

            {/* Primary image mini-preview */}
            <Card title="Primary Image" action={
              <button onClick={() => setActiveTab("images")}
                style={{ color:A.gold, fontSize:12 }}>Manage →</button>
            }>
              <div
                className="aspect-square rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
                style={{ background:A.cream, border:`2px dashed ${A.border}` }}
                onClick={() => setActiveTab("images")}
              >
                {/* REPLACE with actual product image */}
                {images.find(img => img.is_primary && !img.uploading)?.url ? (
                  <img
                    src={images.find(img => img.is_primary)!.url}
                    alt="Primary"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <p className="text-4xl mb-2">🫙</p>
                    <p style={{ color:A.grey, fontSize:11 }}>Click to add images</p>
                  </div>
                )}
              </div>
              <p style={{ color:A.grey, fontSize:10, textAlign:"center", marginTop:6 }}>
                {images.filter(i => !i.error).length} image{images.filter(i => !i.error).length !== 1 ? "s" : ""} uploaded
              </p>
            </Card>

            {/* Save button */}
            <Btn className="w-full justify-center" loading={saving} onClick={save}>
              {isNew ? "🫙 Create Product" : "💾 Save Changes"}
            </Btn>
          </div>
        </div>
      )}

      {/* ── IMAGES TAB ── */}
      {activeTab === "images" && (
        <div className="space-y-5">
          {/* Upload drop zone */}
          <div
            className="relative p-10 rounded-2xl text-center cursor-pointer transition-all"
            style={{
              border:     `2px dashed ${dragOver ? A.gold : A.border}`,
              background: dragOver ? `rgba(200,150,12,0.05)` : A.cream,
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={e => uploadImages(e.target.files)}
            />
            <p className="text-4xl mb-3">{dragOver ? "📂" : "📸"}</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:600, color:A.brown, marginBottom:4 }}>
              {dragOver ? "Drop images here" : "Upload Product Images"}
            </p>
            <p style={{ color:A.grey, fontSize:12 }}>
              Drag & drop or click to browse · JPEG, PNG, WebP · Max 5MB each · Multiple files supported
            </p>
          </div>

          {/* Image grid */}
          {images.length > 0 && (
            <Card
              title={`Uploaded Images (${images.filter(i => !i.error).length})`}
              subtitle="Drag to reorder · Click ⭐ to set as primary · First image is shown in product cards"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <ImageTile
                    key={img.url}
                    image={img}
                    index={idx}
                    total={images.length}
                    onSetPrimary={() => setPrimaryImage(img.url)}
                    onRemove={() => removeImage(img.url)}
                    onMoveLeft={() => idx > 0 && moveImage(idx, idx - 1)}
                    onMoveRight={() => idx < images.length - 1 && moveImage(idx, idx + 1)}
                  />
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex items-center gap-4" style={{ borderColor:A.border }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ border:`1px dashed ${A.border}`, color:A.grey }}
                >
                  + Add More Images
                </button>
                <p style={{ color:A.grey, fontSize:11 }}>
                  ⭐ = primary (shown in product card & detail page)
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── SEO TAB ── */}
      {activeTab === "seo" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="Search Engine Optimisation" subtitle="How this product appears in Google and other search engines">
            <div className="space-y-4">
              <Input
                label="Meta Title"
                placeholder={name ? `${name} | Maa Flavours` : "e.g. Drumstick Pickle — Authentic Andhra | Maa Flavours"}
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
              />
              <div>
                <Textarea
                  label="Meta Description"
                  placeholder="e.g. Buy authentic Andhra Drumstick Pickle from Maa Flavours. Handmade with fresh drumsticks, sesame oil, and traditional spices. No preservatives. Pan-India delivery."
                  value={metaDesc}
                  onChange={e => setMetaDesc(e.target.value)}
                  rows={3}
                />
                <p style={{ color: metaDesc.length > 160 ? "#C0272D" : A.grey, fontSize:10, textAlign:"right", marginTop:2 }}>
                  {metaDesc.length}/160 characters
                </p>
              </div>
              <div>
                <label style={{ color:A.grey, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                  URL Path
                </label>
                <div className="flex items-center gap-0 mt-1.5 overflow-hidden rounded-lg border"
                  style={{ borderColor:A.border }}>
                  <span className="px-3 py-2 text-xs shrink-0"
                    style={{ background:A.cream, color:A.grey, borderRight:`1px solid ${A.border}` }}>
                    maaflavours.com/products/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{ color:A.brown }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Google preview */}
          <Card title="Google Search Preview">
            <div className="p-4 rounded-xl" style={{ background:A.cream, border:`1px solid ${A.border}` }}>
              <p style={{ fontSize:11, color:"#6B6B6B", marginBottom:4 }}>maaflavours.com › products › {slug}</p>
              <p style={{ fontSize:16, color:"#1a0dab", fontWeight:500, lineHeight:1.3 }}>
                {metaTitle || (name ? `${name} | Maa Flavours` : "Product Title")}
              </p>
              <p style={{ fontSize:13, color:"#545454", marginTop:4, lineHeight:1.5 }}>
                {metaDesc || shortDesc || description.slice(0,155) || "Add a meta description to preview how this product will appear in search results."}
              </p>
            </div>
            <p style={{ color:A.grey, fontSize:11, marginTop:12 }}>
              ✅ Best practices: title 50–60 chars · description 120–160 chars
            </p>
            <p style={{ color: metaTitle.length > 0 && metaTitle.length <= 60 ? "#2E7D32" : A.grey, fontSize:11, marginTop:4 }}>
              Title length: {metaTitle.length || (name ? `${name} | Maa Flavours`.length : 0)} chars
            </p>
          </Card>
        </div>
      )}

      {/* Save floating bar */}
      <div
        className="flex items-center justify-between px-6 py-4 rounded-2xl"
        style={{ background:"#fff", border:`1px solid ${A.border}`, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}
      >
        <div>
          {isActive
            ? <p style={{ color:"#2E7D32", fontSize:12, fontWeight:500 }}>● Active — visible on store</p>
            : <p style={{ color:A.grey, fontSize:12 }}>○ Inactive — hidden from store</p>
          }
          {images.some(img => img.uploading) && (
            <p style={{ color:A.gold, fontSize:11 }}>⏳ Images still uploading…</p>
          )}
        </div>
        <div className="flex gap-3">
          <Btn variant="ghost" onClick={() => router.push("/admin/products")}>Cancel</Btn>
          <Btn loading={saving} onClick={save} disabled={images.some(img => img.uploading)}>
            {isNew ? "🫙 Create Product" : "💾 Save Changes"}
          </Btn>
        </div>
      </div>

      {/* Delete modal */}
      {!isNew && (
        <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Product" width={440}>
          <div className="space-y-4">
            <Alert type="warning">
              This will permanently delete <strong>{name}</strong> and all its variants.
              Completed orders will not be affected.
            </Alert>
            <div className="flex gap-3 justify-end">
              <Btn variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Btn>
              <Btn
                loading={deleting}
                onClick={deleteProduct}
                style={{ background:"#C0272D", color:"#fff" } as any}
              >
                Delete "{name}"
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT EDITOR SUBCOMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function VariantEditor({
  variant: v,
  index,
  productName,
  onChange,
}: {
  variant:     any;
  index:       number;
  productName: string;
  onChange:    (field: string, value: any) => void;
}) {
  const autoSKU = autoSku(productName, v.label);
  const priceNum = parseFloat(v.price) || 0;

  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{ background:A.cream, border:`1px solid ${A.border}` }}
    >
      {/* Variant header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold"
            style={{ background:A.gold, color:"#fff" }}
          >
            {v.label}
          </span>
          <span style={{ color:A.grey, fontSize:11 }}>{v.weight_grams}g jar</span>
        </div>
        <Toggle
          value={v.is_active}
          onChange={val => onChange("is_active", val)}
          label={v.is_active ? "Active" : "Hidden"}
          small
        />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label style={{ color:A.grey, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
            Price (₹) *
          </label>
          <input
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 180"
            value={v.price}
            onChange={e => onChange("price", e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
          />
          {priceNum > 0 && (
            <p style={{ color:A.grey, fontSize:9, marginTop:2 }}>{Math.round(priceNum * 100)} paise</p>
          )}
        </div>

        <div>
          <label style={{ color:A.grey, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
            SKU
          </label>
          <input
            type="text"
            placeholder={autoSKU}
            value={v.sku}
            onChange={e => onChange("sku", e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none font-mono"
            style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
          />
        </div>

        <div>
          <label style={{ color:A.grey, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
            Stock Qty
          </label>
          <input
            type="number"
            min={0}
            value={v.stock_quantity}
            onChange={e => onChange("stock_quantity", e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
          />
        </div>

        <div>
          <label style={{ color:A.grey, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
            Low Stock Alert
          </label>
          <input
            type="number"
            min={0}
            value={v.low_stock_threshold}
            onChange={e => onChange("low_stock_threshold", e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background:"#fff", border:`1px solid ${A.border}`, color:A.brown }}
          />
          <p style={{ color:A.grey, fontSize:9, marginTop:2 }}>Alert when ≤ this qty</p>
        </div>
      </div>

      {/* Stock health indicator */}
      {v.stock_quantity !== "" && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{
            background:
              parseInt(v.stock_quantity) === 0 ? "#C0272D" :
              parseInt(v.stock_quantity) <= parseInt(v.low_stock_threshold) ? "#B8750A" : "#2E7D32",
          }}/>
          <p style={{ fontSize:10, color:A.grey }}>
            {parseInt(v.stock_quantity) === 0
              ? "Out of stock — not visible on store"
              : parseInt(v.stock_quantity) <= parseInt(v.low_stock_threshold)
              ? `Low stock — alert will trigger (${v.stock_quantity} remaining)`
              : `In stock — ${v.stock_quantity} jars available`}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE TILE SUBCOMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ImageTile({
  image,
  index,
  total,
  onSetPrimary,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: {
  image:        ProductImage;
  index:        number;
  total:        number;
  onSetPrimary: () => void;
  onRemove:     () => void;
  onMoveLeft:   () => void;
  onMoveRight:  () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        border:     `2px solid ${image.is_primary ? A.gold : hovered ? A.border : "transparent"}`,
        boxShadow:  image.is_primary ? `0 0 0 2px ${A.gold}40` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden" style={{ background:A.cream }}>
        {/* REPLACE with actual product image */}
        <img
          src={image.url}
          alt={`Image ${index + 1}`}
          className="w-full h-full object-cover"
          style={{ opacity: image.uploading ? 0.5 : image.error ? 0.3 : 1 }}
        />

        {/* Uploading overlay */}
        {image.uploading && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background:"rgba(255,255,255,0.7)" }}>
            <Spinner size={20}/>
          </div>
        )}

        {/* Error overlay */}
        {image.error && (
          <div className="absolute inset-0 flex items-center justify-center p-2 text-center"
            style={{ background:"rgba(192,39,45,0.15)" }}>
            <p style={{ color:"#C0272D", fontSize:10 }}>{image.error}</p>
          </div>
        )}

        {/* Primary badge */}
        {image.is_primary && !image.uploading && (
          <div className="absolute top-1 left-1">
            <span className="px-1.5 py-0.5 rounded text-xs font-bold"
              style={{ background:A.gold, color:"#fff" }}>⭐ Primary</span>
          </div>
        )}

        {/* Hover controls */}
        {hovered && !image.uploading && !image.error && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 flex-wrap"
            style={{ background:"rgba(0,0,0,0.5)" }}>
            {!image.is_primary && (
              <button
                onClick={onSetPrimary}
                className="px-2 py-1 rounded text-xs font-bold transition-opacity"
                style={{ background:A.gold, color:"#fff" }}
                title="Set as primary image"
              >
                ⭐ Primary
              </button>
            )}
            <button
              onClick={onRemove}
              className="px-2 py-1 rounded text-xs font-bold"
              style={{ background:"rgba(192,39,45,0.9)", color:"#fff" }}
              title="Remove image"
            >
              ✕ Remove
            </button>
          </div>
        )}
      </div>

      {/* Reorder controls */}
      {!image.uploading && (
        <div className="flex border-t" style={{ borderColor:A.border }}>
          <button
            onClick={onMoveLeft}
            disabled={index === 0}
            className="flex-1 py-1 text-xs transition-colors disabled:opacity-30"
            style={{ background:"#fff", color:A.grey }}
            title="Move left"
          >
            ←
          </button>
          <span style={{ color:A.border }}>|</span>
          <button
            onClick={onMoveRight}
            disabled={index === total - 1}
            className="flex-1 py-1 text-xs transition-colors disabled:opacity-30"
            style={{ background:"#fff", color:A.grey }}
            title="Move right"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE SWITCH SUBCOMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  label,
  small = false,
}: {
  value:    boolean;
  onChange: (v: boolean) => void;
  label?:   string;
  small?:   boolean;
}) {
  const w = small ? 9 : 11;
  const h = small ? 5 : 6;
  const dot = small ? 3.5 : 4.5;

  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChange(!value)}>
      <div
        className="relative rounded-full transition-colors"
        style={{
          width:      `${w * 4}px`,
          height:     `${h * 4}px`,
          background: value ? A.gold : A.border,
        }}
      >
        <div
          className="absolute rounded-full transition-transform"
          style={{
            width:     `${dot * 4}px`,
            height:    `${dot * 4}px`,
            top:       `${(h - dot) / 2 * 4}px`,
            background: "#fff",
            transform:  value ? `translateX(${(w - dot) * 4}px)` : `translateX(${(h - dot) / 2 * 4}px)`,
            boxShadow:  "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      {label && <span style={{ fontSize:11, color: value ? A.brown : A.grey, fontWeight: value ? 600 : 400 }}>{label}</span>}
    </div>
  );
}
