import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, PackageCheck, Truck, MapPin, Calendar, Star, ShieldCheck, 
  CheckCircle2, Sparkles, Thermometer, Layers, ChevronRight, User, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderTracking from '../OrderTracking';
import ReviewModal from './ReviewModal';
import DeliverySignoffModal from '../DeliverySignoffModal';
import { getBuyerOrders, subscribeToOrders } from '../../services/orderService';
import { supplyChainService } from '../../services/supplyChainService';
import { notifySuccess, notify, NOTIF_TYPES } from '../../services/notificationService';

const fakeBuyerOrders = [
  { 
    id: 'ORD-9021', 
    product: { name: 'Direct Field Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200' }, 
    farmer: { name: 'Murugan Farms', location: 'Trichy Agri Belt' }, 
    quantity: 50, 
    totalPrice: 1000, 
    status: 'Ordered', 
    createdAt: Date.now() - 3600000, 
    transport: { name: 'TN Reefer Logistics', boarding: '11:00 PM', delivery: '05:00 AM' } 
  },
  { 
    id: 'ORD-8944', 
    product: { name: 'Grade-A Table Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?w=200' }, 
    farmer: { name: 'Green Valley Organic', location: 'Madurai Cluster' }, 
    quantity: 100, 
    totalPrice: 3200, 
    status: 'Picked Up', 
    createdAt: Date.now() - 86400000, 
    transport: { name: 'Southern Cold Transport', boarding: '08:00 PM', delivery: '04:00 AM' } 
  },
  { 
    id: 'ORD-8710', 
    product: { name: 'Export Quality Red Onions', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8d1?w=200' }, 
    farmer: { name: 'Salem Agri Hub', location: 'Salem FPO' }, 
    quantity: 200, 
    totalPrice: 9000, 
    status: 'Delivered', 
    createdAt: Date.now() - 172800000, 
    transport: { name: 'AgriFreight TN', boarding: '05:00 PM', delivery: '09:00 PM' } 
  }
];

const BuyerOrders = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);

  // Supply chain active state
  const [bulkOrders, setBulkOrders] = useState(() => supplyChainService.getState().bulkOrders);
  const [activeShipment, setActiveShipment] = useState(() => supplyChainService.getActiveShipment());
  const [isSignoffOpen, setIsSignoffOpen] = useState(false);

  useEffect(() => {
    fetchOrders();

    // Subscribe to reactive supply chain updates
    const unsubscribeSC = supplyChainService.subscribe((state) => {
      setBulkOrders([...state.bulkOrders]);
      setActiveShipment(state.shipments[0] || null);
    });

    // Real-time subscription for order status updates
    if (user?.id) {
      const unsubscribe = subscribeToOrders(user.id, 'Buyer', (payload) => {
        fetchOrders();
        if (payload.eventType === 'UPDATE') {
          const newStatus = payload.new?.status;
          if (newStatus === 'Picked Up') {
            notifySuccess('Order Shipped', 'Shipment dispatched from farm aggregation hub.');
          } else if (newStatus === 'Delivered') {
            notifySuccess('Delivered', 'Shipment arrived at destination. Complete sign-off to release escrow.');
          } else {
            notify(NOTIF_TYPES.ORDER_UPDATED, 'Order Updated', `Status: ${newStatus}`);
          }
        }
      });
      return () => {
        unsubscribe();
        unsubscribeSC();
      };
    }

    return () => unsubscribeSC();
  }, [user?.id, t]);

  const fetchOrders = async () => {
    try {
      const data = await getBuyerOrders();
      setOrders(data || []);
      setBulkOrders(supplyChainService.getState().bulkOrders);
      setActiveShipment(supplyChainService.getActiveShipment());
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignoffComplete = (signoffData) => {
    if (activeShipment) {
      supplyChainService.completeDeliverySignoff(activeShipment.id, signoffData);
      setIsSignoffOpen(false);
      notifySuccess('Escrow Released', 'Quality verified. Payout credited to farmer bank ledger.');
    }
  };

  const journeySteps = [
    { title: 'Order Placed', time: '08:30 AM', status: 'completed' },
    { title: 'Farmers Confirmed', time: '09:15 AM', status: 'completed' },
    { title: 'Harvested & QC', time: '01:00 PM', status: 'completed' },
    { title: 'Aggregated at Hub', time: '03:45 PM', status: 'completed' },
    { title: 'Cold-Chain Transit', time: 'In Progress', status: 'active' },
    { title: 'Terminal Arrival', time: '09:00 PM', status: 'pending' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#D8DFD5] gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Procurement & Logistics</span>
          <h2 className="text-2xl font-serif font-bold text-[#17201B]">Active Supply Orders & Contracts</h2>
          <p className="text-xs text-[#66736A] mt-1">
            Real-time track multi-farmer aggregated lots, cold-chain transit, and terminal handovers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#66736A]">Total Active:</span>
          <span className="px-3 py-1 bg-[#E8EFE4] text-[#123C2A] font-bold text-xs rounded-full border border-[#D8DFD5]">
            {bulkOrders.length + (orders.length || fakeBuyerOrders.length)} Shipments
          </span>
        </div>
      </div>

      {/* Institutional Multi-Farmer Consolidated Contracts */}
      {bulkOrders.map((bulkOrder) => {
        const isDelivered = bulkOrder.status === 'DELIVERED';
        return (
          <div 
            key={bulkOrder.id}
            className="bg-white rounded-xl border border-[#D8DFD5] shadow-sm overflow-hidden"
          >
            {/* Contract Top Banner */}
            <div className="bg-[#123C2A] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7DBA52]/20 text-[#7DBA52] text-[10px] font-bold uppercase tracking-wider border border-[#7DBA52]/30">
                    Aggregated Supply Lot • {bulkOrder.id}
                  </span>
                  <span className="text-xs text-[#E8EFE4]/70">Consolidated B2B Contract</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white">
                  {bulkOrder.crop} — {bulkOrder.totalQuantityKg.toLocaleString()} kg Total Supply
                </h3>
                <p className="text-xs text-[#E8EFE4]/80 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#7DBA52]" />
                  Routing to: <span className="font-semibold text-white">{bulkOrder.destination}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                  isDelivered
                    ? 'bg-[#E8EFE4] text-[#123C2A] border-[#7DBA52]'
                    : 'bg-[#D9A441]/20 text-[#D9A441] border-[#D9A441]/40'
                }`}>
                  {isDelivered ? '✓ Delivered & Escrow Released' : '● Cold-Chain In Transit'}
                </span>
              </div>
            </div>

            {/* Supply Journey Horizontal Timeline */}
            <div className="p-6 bg-[#F5F3EA]/50 border-b border-[#D8DFD5]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736A] mb-4">
                Supply Chain Progression
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {journeySteps.map((step, idx) => {
                  const isCurrent = isDelivered ? idx === 5 : step.status === 'active';
                  const isDone = isDelivered ? true : step.status === 'completed';
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border text-left ${
                        isDone 
                          ? 'bg-white border-[#7DBA52] text-[#123C2A]' 
                          : isCurrent 
                            ? 'bg-[#E8EFE4] border-[#2F7D4A] ring-1 ring-[#2F7D4A]' 
                            : 'bg-white/60 border-[#D8DFD5] text-[#66736A]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A]">
                          Step 0{idx + 1}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D4A]" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-[#D9A441] animate-ping" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#D8DFD5]" />
                        )}
                      </div>
                      <p className="text-xs font-bold leading-tight">{step.title}</p>
                      <p className="text-[10px] text-[#66736A] mt-0.5">{step.time}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggregated Farmer Breakdown */}
            <div className="p-6 border-b border-[#D8DFD5]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#123C2A]">
                  Aggregated Farmer Pool ({bulkOrder.allocations.length} Verified Producers)
                </span>
                <span className="text-xs text-[#66736A]">No Middleman Margin Deducted</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bulkOrder.allocations.map((alloc, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white border border-[#D8DFD5] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2F7D4A]" />
                        <span className="text-xs font-bold text-[#17201B]">{alloc.name}</span>
                      </div>
                      <span className="text-[11px] text-[#66736A] mt-0.5 block">{alloc.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#123C2A] font-mono block">{alloc.allocatedKg} kg</span>
                      <span className="text-[11px] text-[#2F7D4A] font-medium font-mono">₹{alloc.unitPrice}/kg farmgate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reefer Telemetry & Logistics Bar */}
            <div className="p-6 bg-[#F5F3EA]/30 border-b border-[#D8DFD5] grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Landed Value</span>
                <span className="text-lg font-bold text-[#123C2A] font-mono mt-0.5 block">
                  ₹{bulkOrder.totalLandedCost?.toLocaleString() || '88,200'}
                </span>
                <span className="text-[10px] text-[#66736A] font-mono">₹{bulkOrder.landedPricePerKg || '44.10'}/kg all-inclusive</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Reefer Temp</span>
                <span className="text-lg font-bold text-[#2F7D4A] font-mono mt-0.5 flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-[#2F7D4A]" />
                  {activeShipment?.cargoTemp || '11.4°C'}
                </span>
                <span className="text-[10px] text-[#2F7D4A] font-medium">Optimal Cold Chain</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Current Corridor</span>
                <span className="text-xs font-bold text-[#17201B] truncate mt-1 block">
                  {activeShipment?.currentLocation || 'NH-44 Namakkal Toll'}
                </span>
                <span className="text-[10px] text-[#66736A] font-mono">{activeShipment?.etaToBuyer || '5h remaining to hub'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D8DFD5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Carrier & Unit</span>
                <span className="text-xs font-bold text-[#17201B] truncate mt-1 block">
                  {activeShipment?.driverName || 'Murugan (TN-48 REEFER)'}
                </span>
                <span className="text-[10px] text-[#66736A] font-mono">{activeShipment?.driverContact || '+91 98401 23456'}</span>
              </div>
            </div>

            {/* Delivery Sign-off Footer */}
            <div className="p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[#66736A] max-w-lg">
                {isDelivered ? (
                  <span className="inline-flex items-center text-[#123C2A] font-semibold gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2F7D4A]" />
                    Delivery Verified & Escrow Released. Payout disbursed directly to 3 farmers' verified accounts.
                  </span>
                ) : (
                  <span>
                    When cargo arrives at your dock, inspect quality, verify lot tamper seal, and complete sign-off with OTP to release payout.
                  </span>
                )}
              </div>

              {!isDelivered ? (
                <button
                  onClick={() => setIsSignoffOpen(true)}
                  className="px-5 py-2.5 rounded-lg bg-[#123C2A] hover:bg-[#1E4D36] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#7DBA52]" /> Complete Delivery Sign-Off
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#E8EFE4] text-[#123C2A] text-xs font-mono font-semibold border border-[#D8DFD5]">
                  <ShieldCheck className="w-4 h-4 text-[#2F7D4A]" />
                  Ledger Hash: {activeShipment?.deliverySignoff?.digitalSignatureHash || '0x49f2b8a1...'}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Standard Orders Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#123C2A]">Standard Direct Orders</h3>
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2F7D4A]" />
          </div>
        ) : (orders.length > 0 ? orders : fakeBuyerOrders).map((order) => (
          <div 
            key={order.id || order._id}
            className="bg-white rounded-xl border border-[#D8DFD5] p-5 shadow-sm hover:border-[#2F7D4A] transition-colors flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 w-full md:w-auto">
              <img
                src={order.product?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                className="w-16 h-16 rounded-lg object-cover border border-[#D8DFD5]"
                alt={order.product?.name}
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A]">
                  Order #{order.id}
                </span>
                <h4 className="text-base font-bold text-[#17201B]">
                  {order.product?.name || 'Produce Lot'}
                </h4>
                <p className="text-xs text-[#66736A]">
                  Producer: <span className="font-semibold text-[#123C2A]">{order.farmer?.name}</span> ({order.farmer?.location})
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs font-semibold text-[#17201B] font-mono">{order.quantity} kg</span>
                  <span className="text-xs font-bold text-[#2F7D4A] font-mono">₹{order.totalPrice}</span>
                  {order.transport && (
                    <span className="text-[11px] text-[#66736A] hidden sm:inline">
                      🚚 {order.transport.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#D8DFD5]">
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                order.status === 'Ordered'    ? 'bg-[#D9A441]/15 text-[#D9A441] border-[#D9A441]/30' :
                order.status === 'Picked Up'  ? 'bg-[#E8EFE4] text-[#2F7D4A] border-[#7DBA52]' :
                order.status === 'In Transit' ? 'bg-[#E8EFE4] text-[#123C2A] border-[#2F7D4A]' :
                'bg-[#E8EFE4] text-[#2F7D4A] border-[#7DBA52]'
              }`}>
                {order.status}
              </span>

              {(order.status === 'Picked Up' || order.status === 'In Transit' || order.status === 'Ordered') && (
                <button
                  onClick={() => setTrackingOrder(order)}
                  className="px-4 py-2 bg-white hover:bg-[#F5F3EA] text-[#123C2A] border border-[#D8DFD5] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#2F7D4A]" /> Track Route
                </button>
              )}

              {order.status === 'Delivered' && (
                <button
                  onClick={() => setReviewOrder(order)}
                  className="px-4 py-2 bg-[#D9A441] hover:bg-[#c99432] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-current" /> Rate Produce
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <OrderTracking 
            isOpen={!!trackingOrder} 
            order={trackingOrder} 
            onClose={() => setTrackingOrder(null)} 
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <ReviewModal
            order={reviewOrder}
            onClose={() => setReviewOrder(null)}
            onSuccess={fetchOrders}
          />
        )}
      </AnimatePresence>

      {/* Delivery Sign-off Modal */}
      <DeliverySignoffModal
        isOpen={isSignoffOpen}
        onClose={() => setIsSignoffOpen(false)}
        shipment={activeShipment}
        onComplete={handleSignoffComplete}
      />
    </div>
  );
};

export default BuyerOrders;
