import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, Calendar, CheckCircle2, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MockRazorpay from './dashboard/MockRazorpay'; 
import { getPreOrders, placePreOrder } from '../services/preOrderService';
import { notifySuccess, notifyError } from '../services/notificationService';

const PreOrderBuyer = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = async () => {
    setLoading(true);
    try {
      const data = await getPreOrders();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdvance = (product) => {
    const total = (product.expected_quantity || 0) * (product.price_per_kg || 40);
    return Math.round(total * 0.25); // 25% advance commitment
  };

  const handlePreOrder = (product) => {
    setSelectedProduct(product);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    const advance = calculateAdvance(selectedProduct);
    try {
      await placePreOrder({
        preOrderProductId: selectedProduct.id,
        quantity: selectedProduct.expected_quantity,
        totalAmount: advance,
        paymentDetails: {
          paymentMethod: paymentDetails.paymentMethod,
          paymentStatus: paymentDetails.paymentStatus
        }
      });
      
      setSuccessMsg('Harvest yield reserved successfully! 25% advance escrow committed.');
      notifySuccess('Yield Reserved', `Contract generated for ${selectedProduct.product_name}.`);
      setSelectedProduct(null);
      fetchPreOrders();

      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      notifyError('Reservation Failed', err.message || 'Payment processed but record creation failed.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Forward Contracting</span>
          <h2 className="text-2xl font-serif font-bold text-[#17201B]">Harvest Yield Reservations</h2>
          <p className="text-xs text-[#66736A] mt-1">
            Lock direct farmgate pricing with regional growers ahead of harvest. Pay 25% advance in escrow, balance on verified dock delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#E8EFE4] text-[#123C2A] text-xs font-bold rounded-lg border border-[#D8DFD5] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2F7D4A]" />
            Escrow Protected
          </span>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E8EFE4] border border-[#7DBA52] text-[#123C2A] p-4 rounded-lg flex items-center gap-3 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-[#2F7D4A]" />
            <p className="text-xs font-bold">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#2F7D4A]" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#D8DFD5] p-6">
          <Sprout className="w-12 h-12 text-[#66736A]/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#17201B]">No Future Harvests Available</h4>
          <p className="text-xs text-[#66736A] mt-1">Check back shortly as farmers log new seasonal planting cycles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const price = product.price_per_kg || 40;
            const totalAmount = product.expected_quantity * price;
            const advanceAmount = calculateAdvance(product);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm hover:border-[#2F7D4A] hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE4] text-[#123C2A] text-[10px] font-bold uppercase tracking-wider border border-[#D8DFD5]">
                      🌱 Pre-Harvest Contract
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#D9A441]/15 text-[#D9A441] text-[10px] font-bold uppercase tracking-wider">
                      Guaranteed Rate
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#17201B] mb-1">
                    {product.product_name}
                  </h3>
                  <p className="text-xs text-[#66736A] flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" />
                    <span>{product.farmer?.name || 'Local Producer'}</span>
                    <span className="text-[#D8DFD5]">•</span>
                    <span>{product.location}</span>
                  </p>

                  {/* Yield & Rate */}
                  <div className="p-3 bg-[#F5F3EA] rounded-lg border border-[#D8DFD5] grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Expected Yield</span>
                      <span className="text-base font-bold text-[#17201B] font-mono">{product.expected_quantity} kg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Agreed Farmgate</span>
                      <span className="text-base font-bold text-[#123C2A] font-mono">₹{price}/kg</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 mb-5 text-xs text-[#66736A]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#66736A]" /> Sowing Date:
                      </span>
                      <span className="font-semibold text-[#17201B]">
                        {new Date(product.cultivation_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2F7D4A]" /> Harvest Window:
                      </span>
                      <span className="font-bold text-[#2F7D4A]">
                        {new Date(product.harvest_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Commitment */}
                <div className="pt-4 border-t border-[#D8DFD5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">25% Advance Escrow</span>
                    <p className="text-lg font-bold text-[#123C2A] font-mono">
                      ₹{advanceAmount.toLocaleString()}
                      <span className="text-xs text-[#66736A] font-normal ml-1 font-sans">of ₹{totalAmount.toLocaleString()}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreOrder(product)}
                    className="px-4 py-2.5 rounded-lg bg-[#123C2A] hover:bg-[#1E4D36] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7DBA52]" />
                    Reserve Yield
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Escrow Advance Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <MockRazorpay
            amount={calculateAdvance(selectedProduct)}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreOrderBuyer;
