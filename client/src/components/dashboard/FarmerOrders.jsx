import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Loader2, PackageCheck, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFarmerOrders, updateOrderStatus, subscribeToOrders } from '../../services/orderService';
import TransportSelection from '../TransportSelection';
import { notifyOrder, notifySuccess, notifyError } from '../../services/notificationService';
import { DEMO_MODE } from '../../services/authService';

const USE_FAKE_DATA = DEMO_MODE;

const fakeOrders = [
  {
    _id: 'ord-demo-1',
    buyer: { name: 'Karthik', location: 'Chennai' },
    product: { product_name: 'Fresh Tomatoes' },
    quantity: 50,
    totalPrice: 1000,
    status: 'Ordered',
    created_at: new Date().toISOString()
  },
  {
    _id: 'ord-demo-2',
    buyer: { name: 'Priya', location: 'Coimbatore' },
    product: { product_name: 'Organic Potatoes' },
    quantity: 100,
    totalPrice: 3200,
    status: 'Picked Up',
    created_at: new Date().toISOString()
  },
  {
    _id: 'ord-demo-3',
    buyer: { name: 'Ramesh', location: 'Madurai' },
    product: { product_name: 'Red Onions' },
    quantity: 200,
    totalPrice: 9000,
    status: 'Delivered',
    created_at: new Date().toISOString()
  }
];

const FarmerOrders = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [transportModalOrder, setTransportModalOrder] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Real-time subscription for new/updated orders
    if (user?.id) {
      const unsubscribe = subscribeToOrders(user.id, 'Farmer', (payload) => {
        fetchOrders();
        if (payload.eventType === 'INSERT') {
          notifyOrder('New Order Received!', `A buyer just placed an order.`);
        } else if (payload.eventType === 'UPDATE') {
          notifySuccess('Order Updated', `Status changed to: ${payload.new?.status}`);
        }
      });
      return unsubscribe;
    }
  }, [user?.id]);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getFarmerOrders();
      if (USE_FAKE_DATA && (!data || data.length === 0)) {
        setOrders(fakeOrders);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      if (USE_FAKE_DATA) {
        setOrders(fakeOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      if (USE_FAKE_DATA && String(orderId).startsWith('ord-demo-')) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
        if (status === 'Picked Up') {
          const order = orders.find(o => o._id === orderId);
          setTransportModalOrder({ ...order, status });
          notifySuccess('Shipped!', 'Order marked as shipped. Select transport below.');
        } else if (status === 'Delivered') {
          notifySuccess('Delivered!', 'Order has been successfully delivered.');
        } else {
          notifySuccess('Status Updated', `Order set to ${status}`);
        }
        return;
      }

      await updateOrderStatus(orderId, status);
      fetchOrders();
      if (status === 'Picked Up') {
        const order = orders.find(o => o._id === orderId);
        setTransportModalOrder(order);
        notifySuccess('Shipped!', 'Order marked as shipped. Select transport below.');
      } else if (status === 'Delivered') {
        notifySuccess('Delivered!', 'Order has been successfully delivered.');
      } else {
        notifySuccess('Status Updated', `Order set to ${status}`);
      }
    } catch (err) {
      notifyError('Update Failed', err.message);
    }
  };

  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.buyer?.name && order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.product?.name && order.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-6xl mx-auto shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('tracking_title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('tracking_desc')}</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute top-3 left-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-700 focus:ring-2 focus:ring-primary-500 transition-all font-semibold placeholder-slate-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-widest font-bold">
              <th className="pb-4 px-4 font-bold">Order ID</th>
              <th className="pb-4 px-4 font-bold">Buyer</th>
              <th className="pb-4 px-4 font-bold">Product</th>
              <th className="pb-4 px-4 font-bold">Total Price</th>
              <th className="pb-4 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-500">
                  <PackageCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <motion.tr variants={item} key={order._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-5 px-4">
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-white">
                    <p className="font-bold">{order.buyer?.name || order.customer_name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {order.buyer?.location || 'No location'}
                    </p>
                  </td>
                  <td className="py-5 px-4 text-white">
                    <p className="font-bold">{order.product?.product_name || order.product_name}</p>
                    <p className="text-xs text-slate-500 font-semibold">{order.quantity} kg</p>
                  </td>
                  <td className="py-5 px-4">
                    <p className="font-bold text-primary-400">₹{order.totalPrice}</p>
                  </td>
                  <td className="py-5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className={`text-xs font-bold uppercase py-2 px-3 rounded-xl border bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer transition-all ${
                        order.status === 'Ordered'   ? 'text-amber-400 border-amber-500/30' :
                        order.status === 'Picked Up' ? 'text-cyan-400 border-cyan-500/30'  :
                        'text-primary-400 border-primary-500/30'
                      }`}
                    >
                      <option value="Ordered" className="bg-slate-900 text-white">Pending</option>
                      <option value="Picked Up" className="bg-slate-900 text-white">Shipped</option>
                      <option value="Delivered" className="bg-slate-900 text-white">Delivered</option>
                    </select>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>

      <AnimatePresence>
        {transportModalOrder && (
          <TransportSelection
            isOpen={!!transportModalOrder}
            order={transportModalOrder}
            onClose={() => setTransportModalOrder(null)}
            onSuccess={() => {
              fetchOrders();
              showNotification('Transport assigned & tracking started!', 'shipping');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerOrders;
