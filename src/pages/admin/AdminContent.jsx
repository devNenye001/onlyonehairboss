import { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import { HiOutlineUpload, HiOutlineSave, HiX } from 'react-icons/hi';
import './AdminContent.css';

const cleanCollectionConfig = (value = {}) => ({
  ...value,
  description: ''
});

const AdminContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Sections State
  const [newIns, setNewIns] = useState({ heading: '', description: '', product_ids: [] });
  const [collections, setCollections] = useState({ title: '', description: '', image_url: '', product_ids: [] });
  const [featuredCol, setFeaturedCol] = useState({ product_id: '', heading: '', description: '', video_url: '' });
  const [socials, setSocials] = useState({ videos: [] });

  const fetchData = useCallback(async () => {
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
      if (colData?.value) setCollections(cleanCollectionConfig(colData.value));

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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

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

  const [uploadingSlot, setUploadingSlot] = useState(null); // 'featured' or index 0, 1, 2, 3
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTimeLeft, setUploadTimeLeft] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [retryUploadFn, setRetryUploadFn] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  const compressImage = (file, maxWidth = 1800, quality = 0.82) => {
    if (!file?.type?.startsWith('image/') || file.type === 'image/gif' || file.size < 450 * 1024) {
      return Promise.resolve(file);
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
        }, 'image/webp', quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  const uploadFormDataWithRetry = (url, formData, { onProgress, retries = 2, timeoutMs = 45000 } = {}) => {
    const token = localStorage.getItem('hairboss_token') || '';

    const attemptUpload = (attempt) => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.timeout = timeoutMs;
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      });
      xhr.onload = () => {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch { /* response was not JSON */ }
        if (xhr.status >= 200 && xhr.status < 300) return resolve(data);
        reject(new Error(data.error || `Upload failed with HTTP ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network connection failed.'));
      xhr.ontimeout = () => reject(new Error('Upload timed out.'));
      xhr.send(formData);
    }).catch((err) => {
      if (attempt < retries) return attemptUpload(attempt + 1);
      throw err;
    });

    return attemptUpload(0);
  };

  // Upload helper for images (uses single-part upload since images are small)
  const handleMediaUpload = async (file, expectedType, onComplete) => {
    if (!file) return;
    if (expectedType === 'image' && (!file.type || !file.type.startsWith('image/'))) {
      alert('Invalid file format. Please upload an image file (PNG, JPG, WebP, etc.).');
      return;
    }
    try {
      setSaving(true);
      setUploadingSlot('image');
      setUploadProgress(0);
      setUploadError(null);
      const uploadFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', uploadFile);

      const data = await uploadFormDataWithRetry(`${supabase.API_URL}/storage/upload`, formData, {
        onProgress: setUploadProgress,
      });
      const publicUrl = `${supabase.API_URL}/storage/files/${data.path}`;
      onComplete(publicUrl);
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setSaving(false);
      setUploadingSlot(null);
      setUploadProgress(0);
    }
  };

  // Browser-side video thumbnail generator
  const generateVideoThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      
      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;
      
      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1s
      };
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(fileUrl);
            resolve(blob);
          }, 'image/jpeg', 0.85);
        } catch {
          URL.revokeObjectURL(fileUrl);
          resolve(null);
        }
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(fileUrl);
        resolve(null);
      };
    });
  };

  // Chunked Resumable Video Uploader
  const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks
  
  const uploadFileInChunks = async (file, expectedType, onProgress, onComplete, onError) => {
    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    
    let chunkIndex = 0;
    const startTime = Date.now();
    
    const token = localStorage.getItem('hairboss_token') || '';
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const uploadNextChunk = (retryCount = 0) => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalSize);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('fileName', fileName);
      formData.append('chunk', chunk);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${supabase.API_URL}/storage/upload/chunk`, true);
      xhr.timeout = 45000;
      
      // Set auth headers
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const chunkProgress = e.loaded / e.total;
          const bytesUploaded = start + (chunkProgress * (end - start));
          const totalProgress = Math.min((bytesUploaded / totalSize) * 100, 99.9);
          
          // Calculate estimated remaining time
          const elapsed = (Date.now() - startTime) / 1000; // seconds
          const speed = bytesUploaded / elapsed; // bytes/sec
          const remainingBytes = totalSize - bytesUploaded;
          const remainingSecs = speed > 0 ? Math.ceil(remainingBytes / speed) : null;
          
          onProgress(Math.round(totalProgress), remainingSecs);
        }
      });
      
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          if (res.completed) {
            const publicUrl = `${supabase.API_URL}/storage/files/${res.path}`;
            onProgress(100, 0);
            onComplete(publicUrl);
          } else {
            chunkIndex = res.nextIndex;
            uploadNextChunk();
          }
        } else {
          let errorMsg = 'Upload failed';
          try {
            const json = JSON.parse(xhr.responseText);
            errorMsg = json.error || errorMsg;
          } catch { errorMsg = 'Upload failed'; }
          if (retryCount < 2) {
            uploadNextChunk(retryCount + 1);
          } else {
            onError(new Error(errorMsg), () => uploadNextChunk(0));
          }
        }
      };
      
      xhr.onerror = () => {
        if (retryCount < 2) {
          uploadNextChunk(retryCount + 1);
        } else {
          onError(new Error('Network connection failed.'), () => uploadNextChunk(0));
        }
      };

      xhr.ontimeout = () => {
        if (retryCount < 2) {
          uploadNextChunk(retryCount + 1);
        } else {
          onError(new Error('Upload timed out.'), () => uploadNextChunk(0));
        }
      };
      
      xhr.send(formData);
    };
    
    uploadNextChunk();
  };

  const handleChunkedVideoUpload = async (file, slotIndex, onComplete) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('video/')) {
      alert('Invalid file format. Please upload a video file (MP4, WEBM, etc.).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('Video file size exceeds maximum limit of 20MB.');
      return;
    }
    
    setUploadingSlot(slotIndex);
    setUploadProgress(0);
    setUploadTimeLeft(null);
    setUploadError(null);
    
    try {
      // 1. Generate and upload thumbnail in background
      let thumbnailUrl = '';
      const thumbBlob = await generateVideoThumbnail(file);
      if (thumbBlob) {
        const thumbFile = new File([thumbBlob], `thumb-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', thumbFile);
        try {
          const data = await uploadFormDataWithRetry(`${supabase.API_URL}/storage/upload`, formData);
          thumbnailUrl = `${supabase.API_URL}/storage/files/${data.path}`;
        } catch (thumbErr) {
          console.warn('Thumbnail upload failed:', thumbErr);
        } 
      }
      
      // 2. Start chunked upload
      await uploadFileInChunks(
        file,
        'video',
        (progress, timeLeft) => {
          setUploadProgress(progress);
          setUploadTimeLeft(timeLeft);
        },
        (videoUrl) => {
          onComplete(videoUrl, thumbnailUrl);
          setUploadingSlot(null);
          setUploadProgress(0);
          setUploadTimeLeft(null);
        },
        (error, retryFn) => {
          setUploadError(error.message || 'Upload failed.');
          setRetryUploadFn(() => retryFn);
        }
      );
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    }
  };

  const moveVideoSlot = (index, direction) => {
    const videos = [...socials.videos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= videos.length) return;
    
    const temp = videos[index];
    videos[index] = videos[targetIndex];
    videos[targetIndex] = temp;
    
    const updated = videos.map((v, idx) => ({ ...v, id: idx + 1 }));
    setSocials({ ...socials, videos: updated });
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

  const renderUploadProgress = (slot) => {
    if (uploadingSlot !== slot && !(slot === 'featured' && uploadError)) return null;
    return (
      <div className="upload-progress-box" role="status">
        {uploadingSlot === slot && (
          <>
            <div className="upload-progress-track">
              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p>{uploadProgress}% uploaded{uploadTimeLeft ? ` - about ${uploadTimeLeft}s left` : ''}</p>
          </>
        )}
        {uploadError && (
          <div className="upload-error-row">
            <span>{uploadError}</span>
            {retryUploadFn && (
              <button type="button" onClick={() => { setUploadError(null); retryUploadFn(); }}>
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    );
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
                      onChange={e => handleMediaUpload(e.target.files[0], 'image', url => setCollections({ ...collections, image_url: url }))}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="wigs-selector-group" style={{ marginTop: '20px' }}>
                <label>Select Displayed Products (Max 8)</label>
                <div className="sel-grid">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
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
                onClick={() => handleSaveSection('collection_section', cleanCollectionConfig(collections))}
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

              <div className="field-group">
                <label>Featured Video</label>
                <div className="file-upload-row">
                  <input 
                    value={featuredCol.video_url || ''} 
                    onChange={e => setFeaturedCol({ ...featuredCol, video_url: e.target.value })} 
                    placeholder="Upload video..."
                    style={{ flex: 1 }}
                  />
                  <label className="upload-file-btn" style={{ cursor: uploadingSlot === 'featured' ? 'not-allowed' : 'pointer', opacity: uploadingSlot === 'featured' ? 0.6 : 1 }}>
                    <HiOutlineUpload /> {featuredCol.video_url ? 'Replace' : 'Upload'}
                    <input 
                      type="file" 
                      accept="video/*" 
                      disabled={uploadingSlot !== null}
                      onChange={e => handleChunkedVideoUpload(e.target.files[0], 'featured', (vUrl) => {
                        setFeaturedCol({ ...featuredCol, video_url: vUrl });
                      })}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {featuredCol.video_url && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewVideoUrl(featuredCol.video_url)}
                        style={{ padding: '0 12px', background: 'rgba(153, 85, 68, 0.1)', color: '#995544', border: '1px solid rgba(153, 85, 68, 0.2)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeaturedCol({ ...featuredCol, video_url: '' })}
                        style={{ padding: '0 12px', background: 'rgba(192, 57, 43, 0.1)', color: '#c0392b', border: '1px solid rgba(192, 57, 43, 0.2)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
                {renderUploadProgress('featured')}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>Video Slot #{i + 1}</h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" disabled={i === 0} onClick={() => moveVideoSlot(i, -1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(153, 85, 68, 0.1)', border: 'none', borderRadius: '3px', color: '#995544' }}>▲</button>
                          <button type="button" disabled={i === 3} onClick={() => moveVideoSlot(i, 1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(153, 85, 68, 0.1)', border: 'none', borderRadius: '3px', color: '#995544' }}>▼</button>
                        </div>
                      </div>
                      
                      <div className="field-group">
                        <label>Video URL / File Path</label>
                        <div className="file-upload-row">
                          <input 
                            value={video.videoUrl} 
                            onChange={e => handleSocialVideoChange(i, 'videoUrl', e.target.value)} 
                            placeholder="/video1.mp4"
                            style={{ flex: 1 }}
                          />
                          <label className="upload-file-btn" style={{ cursor: uploadingSlot === i ? 'not-allowed' : 'pointer', opacity: uploadingSlot === i ? 0.6 : 1 }}>
                            <HiOutlineUpload /> {video.videoUrl ? 'Replace' : 'Upload'}
                            <input 
                              type="file" 
                              accept="video/*" 
                              disabled={uploadingSlot !== null}
                              onChange={e => handleChunkedVideoUpload(e.target.files[0], i, (vUrl, tUrl) => {
                                const videos = [...socials.videos];
                                videos[i] = { ...videos[i], videoUrl: vUrl, thumbnailUrl: tUrl };
                                setSocials({ ...socials, videos });
                              })}
                              style={{ display: 'none' }}
                            />
                          </label>
                          {video.videoUrl && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewVideoUrl(video.videoUrl)}
                                style={{ padding: '0 12px', background: 'rgba(153, 85, 68, 0.1)', color: '#995544', border: '1px solid rgba(153, 85, 68, 0.2)', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const videos = [...socials.videos];
                                  videos[i] = { ...videos[i], videoUrl: '', thumbnailUrl: '' };
                                  setSocials({ ...socials, videos });
                                }}
                                style={{ padding: '0 12px', background: 'rgba(192, 57, 43, 0.1)', color: '#c0392b', border: '1px solid rgba(192, 57, 43, 0.2)', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                        {renderUploadProgress(i)}
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

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="qv-modal-backdrop" onClick={() => setPreviewVideoUrl(null)}>
          <div className="qv-modal" role="dialog" aria-modal="true" aria-labelledby="video-preview-title" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <button className="qv-close-btn" onClick={() => setPreviewVideoUrl(null)} aria-label="Close video preview">
              <HiX />
            </button>
            <h3 id="video-preview-title" style={{ fontFamily: 'Taprom, serif', fontSize: '1.4rem', color: '#1a120e', margin: '0 0 20px 0' }}>Video Preview</h3>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              loop
              muted
              style={{ width: '100%', maxHeight: '400px', borderRadius: '4px', background: '#000' }}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminContent;
