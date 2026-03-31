import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Landmark, Smartphone, IndianRupee, Loader2, X, ShieldCheck } from 'lucide-react';

const MockRazorpay = ({ amount, onPaymentSuccess, onPaymentCancel }) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    if (!method) return alert(t('select_payment_alert'));
    setProcessing(true);
    
    // Simulate API network delay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Complete transaction and close after 1.5 seconds message
      setTimeout(() => {
         onPaymentSuccess({
             paymentMethod: method === 'cash' ? 'COD' : method,
             paymentStatus: method === 'cash' ? 'Pending' : 'Paid',
             transactionId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`
         });
      }, 1500);
    }, 2000);
  };

  if (success) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('pay_successful')}</h3>
                  <p className="text-gray-500 mb-6">{t('trans_secure_msg')}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-[#0b1221] text-white p-6 relative shrink-0">
             <button onClick={onPaymentCancel} disabled={processing} className="absolute right-4 top-4 text-gray-400 hover:text-white transition cursor-pointer z-10">
                 <X className="w-6 h-6" />
             </button>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-gray-400 text-sm mb-1 font-medium">{t('secure_checkout')}</p>
                   <p className="text-3xl font-bold flex items-center">
                      <IndianRupee className="w-6 h-6 mr-1 opacity-80" /> {amount}
                   </p>
                </div>
                <div className="flex items-center text-blue-400 text-sm font-bold bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-400/20">
                   <ShieldCheck className="w-4 h-4 mr-1.5" /> {t('secure')}
                </div>
             </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
             <p className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">{t('select_payment_method')}</p>
             
             <div className="space-y-3 relative">
                {processing && (
                   <div className="absolute inset-[-10px] bg-gray-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                      <p className="text-gray-900 font-bold">{t('processing_payment')}</p>
                      <p className="text-sm text-gray-500 mt-1">{t('do_not_close_msg')}</p>
                   </div>
                )}

                <PaymentOption 
                  id="UPI" 
                  title={t('upi_qr')} 
                  desc={t('upi_desc')} 
                  icon={<Smartphone className="w-5 h-5" />} 
                  selected={method === 'UPI'} 
                  onClick={() => setMethod('UPI')} 
                />
                <PaymentOption 
                  id="Card" 
                  title={t('card_title')} 
                  desc={t('card_desc')} 
                  icon={<CreditCard className="w-5 h-5" />} 
                  selected={method === 'Card'} 
                  onClick={() => setMethod('Card')} 
                />
                <PaymentOption 
                  id="NetBanking" 
                  title={t('net_banking')} 
                  desc={t('net_banking_desc')} 
                  icon={<Landmark className="w-5 h-5" />} 
                  selected={method === 'NetBanking'} 
                  onClick={() => setMethod('NetBanking')} 
                />
                <PaymentOption 
                  id="cash" 
                  title={t('cod_title')} 
                  desc={t('cod_desc')} 
                  icon={<IndianRupee className="w-5 h-5" />} 
                  selected={method === 'cash'} 
                  onClick={() => setMethod('cash')} 
                />
             </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-white border-t border-gray-100 shrink-0">
             <button 
               onClick={handlePay}
               disabled={!method || processing}
               className="w-full bg-[#3366ff] hover:bg-[#2852cc] text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {method === 'cash' ? t('confirm_order') : t('pay_securely', { amount })}
             </button>
             <p className="text-center text-xs text-gray-400 mt-4 flex justify-center items-center">
                {t('powered_by')}
             </p>
          </div>
       </div>
    </div>
  );
};

const PaymentOption = ({ id, title, desc, icon, selected, onClick }) => (
   <div 
     onClick={onClick}
     className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border ${
         selected ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
     }`}
   >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
         selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
         {icon}
      </div>
      <div className="flex-1">
         <h4 className={`font-bold text-sm mb-0.5 ${selected ? 'text-blue-900' : 'text-gray-900'}`}>{title}</h4>
         <p className={`text-xs ${selected ? 'text-blue-600/80' : 'text-gray-500'}`}>{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
         selected ? 'border-blue-600' : 'border-gray-300'
      }`}>
         {selected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
      </div>
   </div>
);

export default MockRazorpay;
