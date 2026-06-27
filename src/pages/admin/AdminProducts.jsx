import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineStar, HiStar, HiOutlinePlus, HiX } from 'react-icons/hi';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import './AdminProducts.css';

const EMPTY_FORM = { name: '', price: '', description: '', featured: false, stock: 0, category: 'General' };

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
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) { setProducts(data ?? []); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditing(null); setImageFiles([]); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      description: p.description ?? '',
      featured: p.is_featured ?? false,
      stock: p.stock_count ?? 0,
      category: p.category ?? 'General'
    });
    setEditing(p.id);
    setImageFiles([]);
    setShowForm(true);
  };

  const uploadImage = async () => {
    const file = imageFiles[0];
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const imageUrl = imageFiles.length ? await uploadImage() : null;

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      description: form.description,
      category: form.category,
      is_featured: form.featured,
      stock_count: parseInt(form.stock, 10),
      in_stock: parseInt(form.stock, 10) > 0,
    };

    if (editing) {
      if (imageUrl) {
        payload.images = [imageUrl];
      }
      const { error } = await supabase.from('products').update(payload).eq('id', editing);
      if (error) setMsg(`Error: ${error.message}`);
      else setMsg('Product updated.');
    } else {
      const { error } = await supabase.from('products').insert({
        ...payload,
        images: imageUrl ? [imageUrl] : [],
      });
      if (error) setMsg(`Error: ${error.message}`);
      else setMsg('Product added.');
    }

    setSaving(false);
    setShowForm(false);
    fetchProducts({ showLoading: false });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) setMsg(`Error: ${error.message}`);
    fetchProducts({ showLoading: false });
  };

  const toggleFeatured = async (p) => {
    const { error } = await supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id);
    if (error) setMsg(`Error: ${error.message}`);
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
                  <th>Image</th><th>Name</th><th>Price</th><th>Stock Qty</th>
                  <th>Status</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.images?.[0] || '/wig1.svg'} alt={p.name} className="ap-thumb" /></td>
                    <td className="ap-name">{p.name}</td>
                    <td>₦{p.price?.toLocaleString()}</td>
                    <td>{p.stock_count ?? 0}</td>
                    <td><span className={`ap-badge ${p.stock_count > 0 ? 'in' : 'out'}`}>{p.stock_count > 0 ? 'In Stock' : 'Out'}</span></td>
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
                <div className="ap-form-row">
                  <div className="ap-form-field">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} required>
                      <option value="General">General</option>
                      <option value="Frontal">Frontal</option>
                      <option value="Bob">Bob</option>
                      <option value="Deep Wave">Deep Wave</option>
                      <option value="Bone Straight">Bone Straight</option>
                      <option value="Curly">Curly</option>
                      <option value="Wavy">Wavy</option>
                    </select>
                  </div>
                  <div className="ap-form-field">
                    <label>Stock Quantity</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} min="0" placeholder="0" />
                  </div>
                </div>
                <div className="ap-form-field">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Product description..." />
                </div>
                <div className="ap-form-field">
                  <label>Product Image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFiles(Array.from(e.target.files))} />
                  <p className="ap-field-hint">{editing ? 'Leave empty to keep existing image.' : 'Upload product image.'}</p>
                </div>
                <div className="ap-checkboxes">
                  <label className="ap-checkbox">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
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
