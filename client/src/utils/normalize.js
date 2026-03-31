/**
 * normalize.js
 * Helpers to transform Supabase (snake_case) data to App (camelCase) data
 * and handle common normalization like _id and date formatting.
 */

export const normalizeProfile = (p) => {
  if (!p) return null;
  return {
    ...p,
    _id: p.id,
    averageRating: parseFloat(p.average_rating) || 0,
    createdAt: p.created_at,
  };
};

export const normalizeProduct = (p) => {
  if (!p) return null;
  return {
    ...p,
    _id: p.id,
    pricePerKg: parseFloat(p.price_per_kg) || 0,
    quantity: parseFloat(p.quantity) || 0,
    createdAt: p.created_at,
    farmer: p.farmer ? normalizeProfile(p.farmer) : null,
  };
};

export const normalizeOrder = (o) => {
  if (!o) return null;
  return {
    ...o,
    _id: o.id,
    totalPrice: parseFloat(o.total_price) || 0,
    quantity: parseFloat(o.quantity) || 0,
    createdAt: o.created_at,
    buyer: o.buyer ? normalizeProfile(o.buyer) : null,
    farmer: o.farmer ? normalizeProfile(o.farmer) : null,
    product: o.product ? normalizeProduct(o.product) : null,
  };
};

export const normalizeFastSellItem = (f) => {
  if (!f) return null;
  return {
    ...f,
    _id: f.id,
    productName: f.product_name,
    pricePerKg: parseFloat(f.price) || 0,
    quantity: parseFloat(f.quantity) || 0,
    expiryTime: f.expiry_time,
    createdAt: f.created_at,
    farmer: f.farmer ? normalizeProfile(f.farmer) : null,
  };
};

export const normalizeReview = (r) => {
  if (!r) return null;
  return {
    ...r,
    _id: r.id,
    rating: parseInt(r.rating) || 0,
    createdAt: r.created_at,
    buyer: r.buyer ? normalizeProfile(r.buyer) : null,
  };
};
