import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import { HiOutlineUpload, HiOutlineSave, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import './AdminContent.css';

const AdminContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Sections State
  const [newIns, setNewIns] = useState({ heading: '', description: '', product_ids: [] });
  const [collections, setCollections] = useState({ title: '', description: '', image_url: '', product_ids: [] });
  const [featuredCol, setFeaturedCol] = useState({ product_id: '', heading: '', description: '' });
  const [socials, setSocials] = useState({ videos: [] });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products (for selectors)
      const { data: prodData } = await supabase.from('products').select('id, name');
      setProducts(prodData || []);

      // 2. Fetch New Ins config
      const { data: newInsData } = await supabase.from('site_content').select('*').eq('key', 'new_ins').maybeSingle();
      if (newInsData?.value) setNewIns(newInsData.value);

      // 3. Fetch Collection Section config
      const { data: colData } = await supabase.from('site_content').select('*').eq('key', 'collection_section').maybeSingle();
      if (colData?.value) setCollections(colData.value);

      // 4. Fetch Featured config
      const { data: featData } = await supabase.from('site_content').select('*').eq('key', 'featured_collection').maybeSingle();
      if (featData?.value) setFeaturedCol(featData.value);

      // 5. Fetch Socials videos
      const { data: socData } = await supabase.from('site_content').select('*').eq('key', 'stay_connected').maybeSingle();
      if (socData?.value) setSocials(socData.value);

    } catch (err) {
      console.error(err);
      setMsg('Error loading configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSection = async (key, value) => {
    setSaving(true);
    setMsg('');
    try {
      const { error } = await supabase.from('site_content').insert({ key, value });
      if (error) throw error;
      setMsg(`${key.replace('_', ' ').toUpperCase()} section saved successfully!`);
    } catch (err) {
      console.error(err);
      setMsg(`Failed to save ${key}: ` + err.message);
    } finally {
      setSaving(false);
      // Clear alert message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    }
  };

  // Upload helpers
  const handleMediaUpload = async (file, onComplete) => {
    if (!file) return;
    try {
      setSaving(true);
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path);
      onComplete(publicUrl);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProductSelectForNewIns = (prodId, index) => {
    const ids = [...newIns.product_ids];
    ids[index] = prodId;
    setNewIns({ ...newIns, product_ids: ids.filter(Boolean) });
  };

  const handleProductSelectForCollections = (prodId, index) => {
    const ids = [...(collections.product_ids || [])];
    ids[index] = prodId;
    setCollections({ ...collections, product_ids: ids.filter(Boolean) });
  };

  const handleSocialVideoChange = (index, field, value) => {
    const videos = [...socials.videos];
    videos[index] = { ...videos[index], [field]: value };
    setSocials({ ...socials, videos });
  };

  return (
    <AdminLayout>
      <div className="content-page">
        <div className="content-header">
          <p className="content-tag">Admin</p>
          <h1 className="content-headline">Landing Page Manager</h1>
        </div>

        {msg && <p className="content-alert-msg">{msg}</p>}

        {loading ? <p className="content-loading">Loading page settings...</p> : (
          <div className="sections-container">

            {/* 1. NEW INS SECTION */}
            <div className="config-card">
              <h2>New Ins Section</h2>
              <p className="card-desc">Edit details and pick up to 4 wigs shown in the New In landing grid.</p>
              
              <div className="field-group">
                <label>Section Heading</label>
                <input 
                  value={newIns.heading} 
                  onChange={e => setNewIns({ ...newIns, heading: e.target.value })} 
                  placeholder="New Ins"
                />
              </div>

              <div className="field-group">
                <label>Description</label>
                <textarea 
                  value={newIns.description} 
                  onChange={e => setNewIns({ ...newIns, description: e.target.value })} 
                  rows="2"
                  placeholder="Fresh handpicked luxury wigs..."
                />
              </div>

              <div className="wigs-selector-group">
                <label>Select Displayed Products (Max 4)</label>
                <div className="sel-grid">
                  {[0, 1, 2, 3].map(i => (
                    <select 
                      key={i} 
                      value={newIns.product_ids[i] || ''} 
                      onChange={e => handleProductSelectForNewIns(e.target.value, i)}
                    >
                      <option value="">-- Choose Wig --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <button 
                className="save-section-btn" 
                onClick={() => handleSaveSection('new_ins', newIns)}
                disabled={saving}
              >
                <HiOutlineSave /> Save New Ins
              </button>
            </div>

            {/* 2. COLLECTION SECTION */}
            <div className="config-card">
              <h2>Collection Section (Shop)</h2>
              <p className="card-desc">Edit titles and background banner information for the Collection intro segment.</p>
              
              <div className="field-group">
                <label>Section Title</label>
                <input 
                  value={collections.title} 
                  onChange={e => setCollections({ ...collections, title: e.target.value })} 
                  placeholder="Our Collection"
                />
              </div>

              <div className="field-group">
                <label>Section Description</label>
                <textarea 
                  value={collections.description} 
                  onChange={e => setCollections({ ...collections, description: e.target.value })} 
                  rows="2"
                  placeholder="Luxury Hair. Timeless Beauty..."
                />
              </div>

              <div className="field-group">
                <label>Banner Image/Logo (URL)</label>
                <div className="file-upload-row">
                  <input 
                    value={collections.image_url} 
                    onChange={e => setCollections({ ...collections, image_url: e.target.value })} 
                    placeholder="/logo.svg"
                  />
                  <label className="upload-file-btn">
                    <HiOutlineUpload /> Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleMediaUpload(e.target.files[0], url => setCollections({ ...collections, image_url: url }))}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="wigs-selector-group" style={{ marginTop: '20px' }}>
                <label>Select Displayed Products (Max 6)</label>
                <div className="sel-grid">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <select 
                      key={i} 
                      value={collections.product_ids?.[i] || ''} 
                      onChange={e => handleProductSelectForCollections(e.target.value, i)}
                    >
                      <option value="">-- Choose Wig --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <button 
                className="save-section-btn" 
                onClick={() => handleSaveSection('collection_section', collections)}
                disabled={saving}
              >
                <HiOutlineSave /> Save Collection Info
              </button>
            </div>

            {/* 3. FEATURED COLLECTION */}
            <div className="config-card">
              <h2>Featured Collection</h2>
              <p className="card-desc">Highlight one featured luxury wig product on the homepage with custom texts.</p>
              
              <div className="field-group">
                <label>Featured Wig</label>
                <select 
                  value={featuredCol.product_id || ''} 
                  onChange={e => setFeaturedCol({ ...featuredCol, product_id: e.target.value })}
                >
                  <option value="">-- Choose Featured Wig --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>Custom Heading</label>
                <input 
                  value={featuredCol.heading} 
                  onChange={e => setFeaturedCol({ ...featuredCol, heading: e.target.value })} 
                  placeholder="Luxury Deep Wave Wig"
                />
              </div>

              <div className="field-group">
                <label>Custom Description</label>
                <textarea 
                  value={featuredCol.description} 
                  onChange={e => setFeaturedCol({ ...featuredCol, description: e.target.value })} 
                  rows="3"
                  placeholder="Flawless, natural look with rich volume..."
                />
              </div>

              <button 
                className="save-section-btn" 
                onClick={() => handleSaveSection('featured_collection', featuredCol)}
                disabled={saving}
              >
                <HiOutlineSave /> Save Featured Info
              </button>
            </div>

            {/* 4. STAY CONNECTED (VIDEOS) */}
            <div className="config-card">
              <h2>Stay Connected Section (Videos)</h2>
              <p className="card-desc">Manage the 4 TikTok loop videos displayed in the bottom socials grid feed.</p>
              
              <div className="videos-config-grid">
                {[0, 1, 2, 3].map(i => {
                  const video = socials.videos[i] || { id: i + 1, videoUrl: '', alt: '' };
                  return (
                    <div key={i} className="video-item-box">
                      <h4>Video Slot #{i + 1}</h4>
                      
                      <div className="field-group">
                        <label>Video URL / File Path</label>
                        <div className="file-upload-row">
                          <input 
                            value={video.videoUrl} 
                            onChange={e => handleSocialVideoChange(i, 'videoUrl', e.target.value)} 
                            placeholder="/video1.mp4"
                          />
                          <label className="upload-file-btn">
                            <HiOutlineUpload /> Upload
                            <input 
                              type="file" 
                              accept="video/*" 
                              onChange={e => handleMediaUpload(e.target.files[0], url => handleSocialVideoChange(i, 'videoUrl', url))}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="field-group">
                        <label>Caption / Alt Text</label>
                        <input 
                          value={video.alt} 
                          onChange={e => handleSocialVideoChange(i, 'alt', e.target.value)} 
                          placeholder="TikTok Look description"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                className="save-section-btn" 
                onClick={() => handleSaveSection('stay_connected', socials)}
                disabled={saving}
              >
                <HiOutlineSave /> Save Social Videos
              </button>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
