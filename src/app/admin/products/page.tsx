// src/app/admin/products/page.tsx
// Maa Flavours — Admin Products List (Full Build)
// Features:
//   • Search + spice level + active/inactive filter
//   • Card grid view (default) + table list view toggle
//   • Inline enable/disable per product
//   • Quick stock indicator per variant
//   • Delete with confirmation modal
//   • Bulk: enable all / disable all selected
//   • Empty state with "Add your first product" CTA

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AdminPage, Card, Table, StatusBadge, Btn, Input, Select,
  Modal, Alert, Pagination, fmt₹, A, Spinner,
} from "@/components/admin/AdminUI";

// ─── Spice level helpers ──────────────────────────────────────────────────────
const SPICE_COLOURS: Record<string,string> = {
  mild:       "#4A7C59",
  medium:     "#B8750A",
  spicy:      "#C0272D",
  "extra-hot":"#7A1515",
};
const SPICE_ICONS: Record<string,string> = {
  mild:"🟢", medium:"🟡", spicy:"🔴", "extra-hot":"🌑",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products,   setProducts]   = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [spiceFilter,setSpiceFilter]= useState("");
  const [activeFilter,setActiveFilter] = useState("");
  const [viewMode,   setViewMode]   = useState<"cards" | "table">("cards");
  const [deleteTarget,setDeleteTarget] = useState<any | null>(null);
  const [deleting,   setDeleting]   = useState(false);
  const [toast,      setToast]      = useState("");
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit:"12" });
    if (search)      params.set("search", search);
    if (spiceFilter) params.set("spice",  spiceFilter);
    if (activeFilter !== "") params.set("active", activeFilter);
    try {
      const r = await fetch(`/api/admin/products?${params}`);
      const d = await r.json();
      setProducts(d.products || []);
      setTotal(d.total   || 0);
      setPages(d.pages   || 1);
    } catch {}
    setLoading(false);
  }, [search, spiceFilter, activeFilter]);

  useEffect(() => { load(page); }, [page, load]);

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(1); }, 350);
  }

  async function toggleActive(id: string, isActive: boolean, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    showToast(isActive ? "Product disabled" : "Product enabled");
    load(page);
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method:"DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    showToast(`"${deleteTarget.name}" deleted`);
    load(page);
  }

  // ── stock status colour ───────────────────────────────────────────────────
  function stockColour(qty: number, threshold: number): string {
    if (qty === 0)         return "#C0272D";
    if (qty <= threshold)  return "#B8750A";
    return "#2E7D32";
  }

  const allActive   = products.filter(p => p.is_active).length;
  const allInactive = products.filter(p => !p.is_active).length;

  return (
    <AdminPage>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background:"#fff", border:`1px solid ${A.gold}`, color:A.brown }}>
          ✅ {toast}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label=""
          placeholder="🔍 Search products…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-64"
        />
        <Select value={spiceFilter} onChange={e => { setSpiceFilter(e.target.value); setPage(1); }} className="w-40">
          <option value="">All Spice Levels</option>
          <option value="mild">🟢 Mild</option>
          <option value="medium">🟡 Medium</option>
          <option value="spicy">🔴 Spicy</option>
          <option value="extra-hot">🌑 Extra Hot</option>
        </Select>
        <Select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1); }} className="w-36">
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </Select>

        {/* View mode toggle */}
        <div className="flex rounded-lg overflow-hidden border ml-auto" style={{ borderColor:A.border }}>
          {(["cards","table"] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: viewMode === mode ? A.brown : "#fff",
                color:      viewMode === mode ? "#fff"  : A.grey,
              }}>
              {mode === "cards" ? "⊞ Grid" : "≡ Table"}
            </button>
          ))}
        </div>

        <Link href="/admin/products/new">
          <Btn>+ Add Product</Btn>
        </Link>
      </div>

      {/* ── Stats strip ── */}
      {!loading && (
        <div className="flex flex-wrap gap-5 px-4 py-2.5 rounded-lg"
          style={{ background:"#fff", border:`1px solid ${A.border}` }}>
          <span style={{ color:A.grey, fontSize:12 }}>
            <strong style={{ color:A.brown }}>{total}</strong> total products
          </span>
          <span style={{ color:"#2E7D32", fontSize:12 }}>
            <strong>{allActive}</strong> active
          </span>
          <span style={{ color:A.grey, fontSize:12 }}>
            <strong>{allInactive}</strong> inactive
          </span>
        </div>
      )}

      {/* ── CARD GRID VIEW ── */}
      {viewMode === "cards" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-xl animate-pulse" style={{ background:"#fff", height:280 }}/>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-6xl mb-4">🫙</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:A.brown, fontWeight:600, marginBottom:8 }}>
                No products yet
              </p>
              <p style={{ color:A.grey, fontSize:14, marginBottom:20 }}>
                Add your first Maa Flavours pickle to get started
              </p>
              <Link href="/admin/products/new">
                <Btn>+ Add First Product</Btn>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onToggle={toggleActive}
                  onDelete={() => setDeleteTarget(p)}
                />
              ))}
            </div>
          )}

          {!loading && pages > 1 && (
            <div className="mt-6">
              <Pagination page={page} pages={pages} total={total} limit={12} onPage={setPage}/>
            </div>
          )}
        </div>
      )}

      {/* ── TABLE LIST VIEW ── */}
      {viewMode === "table" && (
        <Card noPad>
          <Table
            loading={loading}
            columns={[
              { key:"product",  label:"Product"                  },
              { key:"spice",    label:"Spice Level", width:"130px"},
              { key:"variants", label:"Variants"                  },
              { key:"stock",    label:"Stock",       width:"140px"},
              { key:"featured", label:"",            width:"90px" },
              { key:"status",   label:"Status",      width:"90px" },
              { key:"actions",  label:"",            width:"160px"},
            ]}
            rows={products.map(p => ({
              product: (
                <div className="flex items-center gap-3">
                  {/* REPLACE with actual product image */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden"
                    style={{ background:A.cream, border:`1px solid ${A.border}` }}>
                    {p.primary_image_url
                      ? <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover"/>
                      : "🫙"}
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:13, color:A.brown }}>{p.name}</p>
                    <p style={{ fontSize:11, color:A.grey }}>{p.subtitle}</p>
                    <p style={{ fontSize:10, color:A.grey, fontStyle:"italic" }}>{p.tag}</p>
                  </div>
                </div>
              ),
              spice: (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background:`${SPICE_COLOURS[p.spice_level]}15`, color:SPICE_COLOURS[p.spice_level] }}>
                  {SPICE_ICONS[p.spice_level]} {p.spice_level}
                </span>
              ),
              variants: (
                <div className="space-y-0.5">
                  {(p.variants || []).map((v: any) => (
                    <div key={v.id} style={{ fontSize:11 }}>
                      <span style={{ color:A.grey }}>{v.label}:</span>{" "}
                      <strong style={{ color:A.gold }}>{fmt₹(v.price)}</strong>
                    </div>
                  ))}
                </div>
              ),
              stock: (
                <div className="space-y-0.5">
                  {(p.variants || []).map((v: any) => (
                    <div key={v.id} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full"
                        style={{ background:stockColour(v.stock_quantity, v.low_stock_threshold) }}/>
                      <span style={{ fontSize:11, color:A.grey }}>{v.label}:</span>
                      <span style={{ fontSize:11, fontWeight:600, color:stockColour(v.stock_quantity, v.low_stock_threshold) }}>
                        {v.stock_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ),
              featured: p.is_featured
                ? <span className="text-xs px-2 py-0.5 rounded" style={{ background:`rgba(200,150,12,0.12)`, color:A.gold }}>⭐ Featured</span>
                : null,
              status: <StatusBadge status={p.is_active ? "active" : "inactive"}/>,
              actions: (
                <div className="flex gap-1.5">
                  <Link href={`/admin/products/${p.id}`}>
                    <Btn variant="secondary" size="sm">Edit</Btn>
                  </Link>
                  <Btn
                    variant={p.is_active ? "ghost" : "secondary"}
                    size="sm"
                    onClick={e => toggleActive(p.id, p.is_active, e)}
                  >
                    {p.is_active ? "Disable" : "Enable"}
                  </Btn>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(p)}
                    style={{ color:"#C0272D" } as any}
                  >
                    🗑
                  </Btn>
                </div>
              ),
            }))}
            emptyMessage="No products found — try adjusting your filters"
          />
          {!loading && pages > 1 && (
            <div className="px-4 py-3 border-t" style={{ borderColor:A.border }}>
              <Pagination page={page} pages={pages} total={total} limit={12} onPage={setPage}/>
            </div>
          )}
        </Card>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" width={440}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background:"rgba(192,39,45,0.05)", border:"1px solid rgba(192,39,45,0.2)" }}>
            <span className="text-3xl shrink-0">🫙</span>
            <div>
              <p style={{ fontWeight:700, color:A.brown }}>{deleteTarget?.name}</p>
              <p style={{ fontSize:12, color:A.grey }}>This will permanently remove the product and all its variants.</p>
            </div>
          </div>
          <p style={{ fontSize:13, color:A.grey }}>
            Active orders will not be affected, but the product will no longer appear in the store.
          </p>
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
            <Btn
              variant="danger"
              loading={deleting}
              onClick={deleteProduct}
              style={{ background:"#C0272D", color:"#fff", borderColor:"#C0272D" } as any}
            >
              Yes, Delete Product
            </Btn>
          </div>
        </div>
      </Modal>
    </AdminPage>
  );

  function stockColour(qty: number, threshold: number): string {
    if (qty === 0)        return "#C0272D";
    if (qty <= threshold) return "#B8750A";
    return "#2E7D32";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({
  product: p,
  onToggle,
  onDelete,
}: {
  product:  any;
  onToggle: (id: string, active: boolean, e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const spiceCol = SPICE_COLOURS[p.spice_level] || "#6B6B6B";

  const lowestStock = Math.min(...(p.variants || []).map((v: any) => v.stock_quantity));
  const anyLowStock = (p.variants || []).some((v: any) => v.stock_quantity <= v.low_stock_threshold);
  const anyOutOfStock = (p.variants || []).some((v: any) => v.stock_quantity === 0);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "#fff",
        border:     `1px solid ${hovered ? A.gold : A.border}`,
        boxShadow:  hovered ? `0 8px 32px rgba(200,150,12,0.12)` : `0 1px 4px rgba(74,44,10,0.06)`,
        transform:  hovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <Link href={`/admin/products/${p.id}`}>
        <div
          className="relative aspect-square flex items-center justify-center overflow-hidden"
          style={{ background: p.is_active ? A.cream : "#F0EDE8" }}
        >
          {/* REPLACE with actual product image */}
          {p.primary_image_url ? (
            <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover"/>
          ) : (
            <span className="text-5xl opacity-80">🫙</span>
          )}

          {/* Overlays */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {p.is_featured && (
              <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background:A.gold, color:"#fff" }}>⭐ Featured</span>
            )}
            {anyOutOfStock && (
              <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background:"#C0272D", color:"#fff" }}>Out of Stock</span>
            )}
            {!anyOutOfStock && anyLowStock && (
              <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background:"#B8750A", color:"#fff" }}>Low Stock</span>
            )}
          </div>

          {/* Inactive overlay */}
          {!p.is_active && (
            <div className="absolute inset-0 flex items-end justify-center pb-3"
              style={{ background:"rgba(0,0,0,0.35)" }}>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background:"rgba(0,0,0,0.5)", color:"#fff" }}>
                ● Hidden from store
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3.5">
        {/* Name + spice */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <Link href={`/admin/products/${p.id}`}>
              <p style={{ fontWeight:700, fontSize:13, color:A.brown, lineHeight:1.3 }}
                className="hover:underline">
                {p.name}
              </p>
            </Link>
            {p.tag && (
              <p style={{ fontSize:10, color:A.grey, marginTop:1 }}>{p.tag}</p>
            )}
          </div>
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background:`${spiceCol}18`, color:spiceCol, whiteSpace:"nowrap" }}>
            {SPICE_ICONS[p.spice_level]} {p.spice_level}
          </span>
        </div>

        {/* Variants pricing */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(p.variants || []).map((v: any) => (
            <div key={v.id} className="text-center px-2 py-1 rounded-lg flex-1 min-w-0"
              style={{ background:A.cream, border:`1px solid ${A.border}` }}>
              <p style={{ fontSize:11, color:A.grey }}>{v.label}</p>
              <p style={{ fontWeight:700, fontSize:13, color:A.gold }}>{fmt₹(v.price)}</p>
              <p style={{ fontSize:10, color: v.stock_quantity === 0 ? "#C0272D" : v.stock_quantity <= v.low_stock_threshold ? "#B8750A" : "#2E7D32" }}>
                {v.stock_quantity} left
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link href={`/admin/products/${p.id}`} className="flex-1">
            <Btn variant="secondary" size="sm" className="w-full justify-center">Edit</Btn>
          </Link>
          <Btn
            variant={p.is_active ? "ghost" : "secondary"}
            size="sm"
            onClick={e => onToggle(p.id, p.is_active, e)}
            title={p.is_active ? "Disable product" : "Enable product"}
          >
            {p.is_active ? "●" : "○"}
          </Btn>
          <Btn
            variant="ghost"
            size="sm"
            onClick={onDelete}
            title="Delete product"
            style={{ color:"#C0272D" } as any}
          >
            🗑
          </Btn>
        </div>
      </div>
    </div>
  );
}
