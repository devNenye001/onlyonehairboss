// Mock Supabase Client
// This file translates Supabase SDK method calls into Express API HTTP requests

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('hairboss_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const supabase = {
  auth: {
    signUp: async ({ email, password, options }) => {
      try {
        const fullName = options?.data?.full_name || '';
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName })
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: { user: null }, error: { message: data.error || 'Signup failed' } };
        }
        localStorage.setItem('hairboss_token', data.token);
        
        // Supabase schema returns { data: { user, session }, error: null }
        const payload = {
          user: data.user,
          session: { access_token: data.token, user: data.user }
        };
        
        // Trigger listeners
        supabase.auth._trigger('SIGNED_IN', payload.session);
        
        return { data: payload, error: null };
      } catch (err) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },

    signInWithPassword: async ({ email, password }) => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: { user: null }, error: { message: data.error || 'Login failed' } };
        }
        localStorage.setItem('hairboss_token', data.token);
        
        const payload = {
          user: data.user,
          session: { access_token: data.token, user: data.user }
        };
        
        supabase.auth._trigger('SIGNED_IN', payload.session);
        
        return { data: payload, error: null };
      } catch (err) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },

    signInWithOAuth: async ({ provider, options }) => {
      if (provider === 'google') {
        const redirectTo = options?.redirectTo || window.location.origin;
        // Redirect browser to our backend google auth route
        window.location.href = `${API_URL}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`;
        return { data: {}, error: null };
      }
      return { data: null, error: { message: 'Provider not supported' } };
    },

    signOut: async () => {
      localStorage.removeItem('hairboss_token');
      supabase.auth._trigger('SIGNED_OUT', null);
      return { error: null };
    },

    getSession: async () => {
      const token = localStorage.getItem('hairboss_token');
      if (!token) return { data: { session: null }, error: null };
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { ...getAuthHeaders() }
        });
        const data = await res.json();
        if (!res.ok) {
          localStorage.removeItem('hairboss_token');
          supabase.auth._trigger('SIGNED_OUT', null);
          return { data: { session: null }, error: null };
        }
        return { data: { session: { access_token: token, user: data.user } }, error: null };
      } catch (err) {
        return { data: { session: null }, error: null };
      }
    },

    resetPasswordForEmail: async (email, options) => {
      try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectTo: options?.redirectTo })
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.error || 'Failed to send reset email' } };
        }
        return { error: null };
      } catch (err) {
        return { error: { message: err.message } };
      }
    },

    updateUser: async ({ password }) => {
      try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.error || 'Failed to reset password' } };
        }
        return { data: { user: data.user }, error: null };
      } catch (err) {
        return { data: null, error: { message: err.message } };
      }
    },

    // Callback manager
    _listeners: new Set(),
    onAuthStateChange: (callback) => {
      const listener = { callback };
      supabase.auth._listeners.add(listener);

      // Trigger initial call asynchronously
      supabase.auth.getSession().then(({ data: { session } }) => {
        const event = session ? 'SIGNED_IN' : 'SIGNED_OUT';
        callback(event, session);
      });

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              supabase.auth._listeners.delete(listener);
            }
          }
        }
      };
    },

    _trigger: (event, session) => {
      supabase.auth._listeners.forEach(l => {
        try {
          l.callback(event, session);
        } catch (e) {
          console.error('Error in auth listener:', e);
        }
      });
    }
  },

  // Storage
  storage: {
    from: (bucket) => ({
      upload: async (path, file) => {
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(`${API_URL}/storage/upload`, {
            method: 'POST',
            headers: {
              ...getAuthHeaders()
            },
            body: formData
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: { message: data.error || 'Upload failed' } };
          }
          return { data: { path: data.path }, error: null };
        } catch (err) {
          return { data: null, error: { message: err.message } };
        }
      },
      getPublicUrl: (filePath) => {
        // Return full HTTP path served statically by our backend Express app
        const publicUrl = filePath.startsWith('http') ? filePath : `${API_URL}/storage/files/${filePath}`;
        return { data: { publicUrl } };
      }
    })
  },

  // Edge Functions
  functions: {
    invoke: async (name, { body }) => {
      try {
        const res = await fetch(`${API_URL}/functions/${name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  },

  // Fluent database operations builder
  from: (table) => {
    let selectFields = '*';
    let orderField = null;
    let orderAscending = true;
    let eqField = null;
    let eqValue = null;
    let isSingle = false;
    let isMaybeSingle = false;
    let limitVal = null;

    const builder = {
      select: (fields = '*') => {
        selectFields = fields;
        return builder;
      },
      order: (field, { ascending = true } = {}) => {
        orderField = field;
        orderAscending = ascending;
        return builder;
      },
      eq: (field, value) => {
        eqField = field;
        eqValue = value;
        return builder;
      },
      single: () => {
        isSingle = true;
        return builder;
      },
      maybeSingle: () => {
        isMaybeSingle = true;
        return builder;
      },
      limit: (limitCount) => {
        limitVal = limitCount;
        return builder;
      },

      // Executing DB insertions
      insert: (payload) => {
        let selectCalled = false;
        let singleCalled = false;

        const chain = {
          select: () => {
            selectCalled = true;
            return chain;
          },
          single: () => {
            singleCalled = true;
            return chain;
          },
          then: async (resolve, reject) => {
            try {
              const res = await fetch(`${API_URL}/db/${table}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...getAuthHeaders()
                },
                body: JSON.stringify({ payload })
              });
              const json = await res.json();
              if (!res.ok) {
                resolve({ data: null, error: { message: json.error || 'Insertion failed.' } });
                return;
              }
              let data = json.data;
              if (singleCalled) {
                data = Array.isArray(data) ? data[0] : data;
              }
              resolve({ data, error: null });
            } catch (err) {
              resolve({ data: null, error: { message: err.message } });
            }
          }
        };
        return chain;
      },

      // Executing DB updates
      update: (payload) => {
        const updateChain = {
          eq: async (field, value) => {
            try {
              const res = await fetch(`${API_URL}/db/${table}/update`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  ...getAuthHeaders()
                },
                body: JSON.stringify({ payload, field, value })
              });
              const json = await res.json();
              if (!res.ok) {
                return { data: null, error: { message: json.error || 'Update failed.' } };
              }
              return { data: json.data, error: null };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }
        };
        return updateChain;
      },

      // Executing DB deletions
      delete: () => {
        const deleteChain = {
          eq: async (field, value) => {
            try {
              const res = await fetch(`${API_URL}/db/${table}/delete`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  ...getAuthHeaders()
                },
                body: JSON.stringify({ field, value })
              });
              const json = await res.json();
              if (!res.ok) {
                return { data: null, error: { message: json.error || 'Deletion failed.' } };
              }
              return { data: json.data, error: null };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }
        };
        return deleteChain;
      },

      // Promise adapter for fetching data
      then: async (resolve, reject) => {
        try {
          let url = `${API_URL}/db/${table}?`;
          if (eqField) {
            url += `eq_field=${encodeURIComponent(eqField)}&eq_value=${encodeURIComponent(eqValue)}&`;
          }
          if (orderField) {
            url += `order_field=${encodeURIComponent(orderField)}&order_ascending=${orderAscending}&`;
          }
          if (isSingle) {
            url += `single=true&`;
          }
          if (isMaybeSingle) {
            url += `maybe_single=true&`;
          }
          if (limitVal !== null) {
            url += `limit=${limitVal}&`;
          }

          const res = await fetch(url, {
            headers: {
              ...getAuthHeaders()
            }
          });
          const json = await res.json();
          if (!res.ok) {
            resolve({ data: null, error: { message: json.error || 'Query failed' } });
            return;
          }
          resolve({ data: json.data, error: null });
        } catch (err) {
          resolve({ data: null, error: { message: err.message } });
        }
      }
    };

    return builder;
  }
};
