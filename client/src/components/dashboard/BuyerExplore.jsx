import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, Search, Filter, ShoppingBag, Star, X, ArrowRight, 
  MapPin, CheckCircle2, ShieldCheck, Calendar, SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MockRazorpay from './MockRazorpay';
import { getAllProducts } from '../../services/productService';
import { createOrder } from '../../services/orderService';
import { notifyOrder, notifyError } from '../../services/notificationService';

const BuyerExplore = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter drawer state
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(300);
  const [minRating, setMinRating] = useState(0);

  // Order modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setFetchError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const initiateCheckout = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handleOrder = async (paymentDetails) => {
    setShowPayment(false);
    setOrdering(true);
    try {
      await createOrder({
        productId: selectedProduct.id || selectedProduct._id,
        quantity: orderQuantity,
        paymentMethod: paymentDetails.paymentMethod || 'COD',
        paymentStatus: paymentDetails.paymentStatus || 'Paid',
      });
      notifyOrder('Order Confirmed', `${orderQuantity} kg of ${selectedProduct.name} reserved directly with farmer.`);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      notifyError('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const price = parseFloat(p.pricePerKg || p.price_per_kg || 0);
    const matchesPrice = price <= maxPrice;
    const rating = p.farmer?.averageRating || 5;
    const matchesRating = rating >= minRating;
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  const isFilterActive = selectedCategory !== 'All' || maxPrice < 300 || minRating > 0;

  return (
    <div className="space-y-8">
      {/* Header and Search Bar */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#D8DFD5]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Direct Farmgate Produce</span>
            <h2 className="text-2xl font-serif font-bold text-[#17201B]">Produce Marketplace</h2>
            <p className="text-xs text-[#66736A] mt-1">
              Fresh inventory listed directly by verified regional farmers and FPOs. Zero middlemen margins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 absolute top-3.5 left-3.5 text-[#66736A]" />
              <input
                type="text"
                placeholder="Search crop, farm, region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] focus:border-[#2F7D4A] text-[#17201B] pl-10 pr-4 py-2.5 rounded-lg text-xs outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilterDrawer(prev => !prev)}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                isFilterActive 
                  ? 'bg-[#123C2A] text-white border-[#123C2A]' 
                  : 'bg-white border-[#D8DFD5] text-[#17201B] hover:bg-[#F5F3EA]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {isFilterActive && <span className="w-2 h-2 rounded-full bg-[#7DBA52]" />}
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilterDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F5F3EA]/40 p-5 rounded-lg border border-[#D8DFD5]">
                {/* Category selector */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block mb-2">Produce Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Leafy Greens'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                          selectedCategory === cat
                            ? 'bg-[#123C2A] text-white border-[#123C2A]'
                            : 'bg-white text-[#17201B] border-[#D8DFD5] hover:border-[#2F7D4A]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A]">Max Price:</span>
                    <span className="font-bold text-[#123C2A] font-mono">₹{maxPrice}/kg</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#2F7D4A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#66736A] font-mono mt-1">
                    <span>₹20</span>
                    <span>₹300</span>
                  </div>
                </div>

                {/* Minimum rating & Reset */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block mb-2">Farmer Rating</span>
                  <div className="flex items-center gap-2">
                    {[0, 4.0, 4.5, 4.8].map(r => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                          minRating === r
                            ? 'bg-[#D9A441] text-white border-[#D9A441]'
                            : 'bg-white text-[#17201B] border-[#D8DFD5] hover:border-[#D9A441]'
                        }`}
                      >
                        {r === 0 ? 'All' : `${r}★`}
                      </button>
                    ))}
                    {isFilterActive && (
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setMaxPrice(300);
                          setMinRating(0);
                        }}
                        className="ml-auto text-xs text-rose-600 hover:underline cursor-pointer font-medium"
                      >
                        Reset All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#2F7D4A]" />
        </div>
      ) : fetchError ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#D8DFD5] p-6">
          <p className="text-rose-600 font-bold mb-2">Unable to load produce catalog</p>
          <p className="text-xs text-[#66736A] mb-4">{fetchError}</p>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-[#123C2A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E4D36] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#D8DFD5] p-6">
          <ShoppingBag className="w-12 h-12 text-[#66736A]/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#17201B]">No Produce Found</h4>
          <p className="text-xs text-[#66736A] mt-1">Try adjusting your category or price filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const price = p.pricePerKg || p.price_per_kg || 0;
            return (
              <div 
                key={p.id || p._id} 
                className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm hover:border-[#2F7D4A] hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="h-48 overflow-hidden relative bg-[#F5F3EA]">
                  <img 
                    src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={p.name} 
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5] shadow-sm">
                      {p.category || 'Produce'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-[#17201B] border border-[#D8DFD5] shadow-sm">
                    <Star className="w-3.5 h-3.5 text-[#D9A441] fill-current" />
                    <span>{p.farmer?.averageRating?.toFixed(1) || '4.9'}</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-[#17201B] leading-snug">{p.name}</h3>
                    <p className="text-xs text-[#66736A] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" />
                      <span>{p.farmer?.name || 'Local Farm'}</span>
                      <span className="text-[#D8DFD5]">•</span>
                      <span>{p.location || 'Direct Farmgate'}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#D8DFD5] mt-auto flex items-end justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Farmgate Price</span>
                      <p className="text-2xl font-bold text-[#123C2A] font-mono leading-none">
                        ₹{price}<span className="text-xs font-normal text-[#66736A]">/kg</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Available</span>
                      <p className={`text-xs font-bold font-mono ${p.quantity < 20 ? 'text-amber-600' : 'text-[#2F7D4A]'}`}>
                        {p.quantity} kg in stock
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedProduct(p); setOrderQuantity(1); }}
                    disabled={p.quantity <= 0}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#123C2A] hover:bg-[#1E4D36] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {p.quantity <= 0 ? 'Out of Stock' : 'Order Farmgate Lot'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-[#17201B]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-[#D8DFD5] max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#D8DFD5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F7D4A]">Direct Order Confirmation</span>
                  <h3 className="text-xl font-bold text-[#17201B]">{selectedProduct.name}</h3>
                </div>
                <button 
                  onClick={() => { setSelectedProduct(null); setShowPayment(false); }}
                  className="p-1 rounded-lg text-[#66736A] hover:bg-[#F5F3EA] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F5F3EA] rounded-lg border border-[#D8DFD5]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Unit Price</span>
                    <span className="text-xl font-bold text-[#123C2A] font-mono">₹{selectedProduct.pricePerKg}/kg</span>
                  </div>
                  <div className="p-3 bg-[#F5F3EA] rounded-lg border border-[#D8DFD5]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Producer Stock</span>
                    <span className="text-xl font-bold text-[#2F7D4A] font-mono">{selectedProduct.quantity} kg</span>
                  </div>
                </div>

                <form onSubmit={initiateCheckout} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17201B] mb-2">
                      Required Quantity (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.quantity}
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Number(e.target.value))}
                        className="w-full bg-[#F5F3EA]/50 border border-[#D8DFD5] focus:border-[#2F7D4A] text-[#17201B] px-4 py-3 rounded-lg text-lg font-mono font-bold outline-none"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#66736A]">
                        KG
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#E8EFE4] rounded-lg border border-[#D8DFD5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block">Total Payable</span>
                      <span className="text-xs text-[#66736A]">Direct Escrow (Release on Delivery)</span>
                    </div>
                    <span className="text-2xl font-bold text-[#123C2A] font-mono">
                      ₹{(selectedProduct.pricePerKg * orderQuantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={ordering || orderQuantity > selectedProduct.quantity}
                    className="w-full py-3 rounded-lg bg-[#123C2A] hover:bg-[#1E4D36] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {ordering ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#7DBA52]" />
                        Confirm Order with Escrow
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Gateway Modal */}
      {showPayment && selectedProduct && (
        <MockRazorpay
          amount={(selectedProduct.pricePerKg * orderQuantity).toFixed(0)}
          onPaymentSuccess={handleOrder}
          onPaymentCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default BuyerExplore;
