import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineStar, HiStar, HiOutlinePlus, HiX } from 'react-icons/hi';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import './AdminProducts.css';

const EMPTY_FORM = { name: '', price: '', description: '', category: 'Bone Straight', is_featured: false, in_stock: true, stock_count: 0 };
const CATEGORIES = ['Frontal', 'Bob', 'Deep Wave', 'Bone Straight', 'Curly', 'Wavy', 'Other'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProducts = async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });

      if (!cancelled) {
        setProducts(data ?? []);
        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditing(null); setImageFiles([]); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, description: p.description ?? '', category: p.category ?? 'Bone Straight', is_featured: p.is_featured, in_stock: p.in_stock, stock_count: p.stock_count ?? 0 });
    setEditing(p.id);
    setImageFiles([]);
    setShowForm(true);
  };

  const uploadImages = async () => {
    const urls = [];
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    let images = [];
    if (imageFiles.length) images = await uploadImages();

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      category: form.category,
      is_featured: form.is_featured,
      in_stock: form.in_stock,
      stock_count: parseInt(form.stock_count, 10),
      ...(images.length && { images }),
    };

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing);
      setMsg('Product updated.');
    } else {
      await supabase.from('products').insert({ ...payload, images: images.length ? images : [] });
      setMsg('Product added.');
    }

    setSaving(false);
    setShowForm(false);
    fetchProducts({ showLoading: false });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts({ showLoading: false });
  };

  const toggleFeatured = async (p) => {
    await supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id);
    fetchProducts({ showLoading: false });
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <AdminLayout>
      <div className="ap-page">
        <div className="ap-header">
          <div>
            <p className="ap-tag">Admin</p>
            <h1 className="ap-headline">Products</h1>
          </div>
          <button className="ap-add-btn" onClick={openNew}><HiOutlinePlus /> Add Product</button>
        </div>

        {msg && <p className="ap-msg">{msg}</p>}

        {loading ? <p className="ap-loading">Loading...</p> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Price</th><th>Category</th>
                  <th>Stock</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.images?.[0] ?? '/wig1.svg'} alt={p.name} className="ap-thumb" /></td>
                    <td className="ap-name">{p.name}</td>
                    <td>₦{p.price?.toLocaleString()}</td>
                    <td>{p.category}</td>
                    <td><span className={`ap-badge ${p.in_stock ? 'in' : 'out'}`}>{p.in_stock ? 'In Stock' : 'Out'}</span></td>
                    <td>
                      <button className="ap-icon-btn" onClick={() => toggleFeatured(p)}>
                        {p.is_featured ? <HiStar className="star-filled" /> : <HiOutlineStar />}
                      </button>
                    </td>
                    <td className="ap-actions-cell">
                      <button className="ap-icon-btn" onClick={() => openEdit(p)}><HiOutlinePencil /></button>
                      <button className="ap-icon-btn danger" onClick={() => handleDelete(p.id)}><HiOutlineTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="ap-modal-backdrop" onClick={() => setShowForm(false)}>
            <Motion.div
              className="ap-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="ap-modal-header">
                <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                <button className="ap-close-btn" onClick={() => setShowForm(false)}><HiX /></button>
              </div>
              <form onSubmit={handleSave} className="ap-form">
                <div className="ap-form-row">
                  <div className="ap-form-field">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Product name" />
                  </div>
                  <div className="ap-form-field">
                    <label>Price (₦)</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="270000" />
                  </div>
                </div>
                <div className="ap-form-field">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Product description..." />
                </div>
                <div className="ap-form-row">
                  <div className="ap-form-field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="ap-form-field">
                    <label>Stock Count</label>
                    <input name="stock_count" type="number" value={form.stock_count} onChange={handleChange} min="0" />
                  </div>
                </div>
                <div className="ap-form-field">
                  <label>Images</label>
                  <input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files))} />
                  <p className="ap-field-hint">{editing ? 'Leave empty to keep existing images.' : 'Upload product images.'}</p>
                </div>
                <div className="ap-checkboxes">
                  <label className="ap-checkbox">
                    <input type="checkbox" name="in_stock" checked={form.in_stock} onChange={handleChange} />
                    In Stock
                  </label>
                  <label className="ap-checkbox">
                    <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                    Featured
                  </label>
                </div>
                <button type="submit" className="ap-save-btn" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </Motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
