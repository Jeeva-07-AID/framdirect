import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, TrendingUp, DollarSign, Layers, ArrowRight, 
  CheckCircle2, AlertCircle, PieChart, Users, Sprout, Truck, Warehouse, Check 
} from 'lucide-react';
import { impactAnalyticsService } from '../../services/impactAnalyticsService';

export const PriceTransparencyScreen = () => {
  const audit = impactAnalyticsService.calculateTransactionAudit({
    crop: 'Tomato',
    quantityKg: 2000,
    suppliers: [
      { name: 'Farmer A (Ravi Teja)', quantityKg: 700, ratePerKg: 38 },
      { name: 'Farmer B (Kaveri Valley)', quantityKg: 500, ratePerKg: 39 },
      { name: 'FPO C (Trichy Collective)', quantityKg: 800, ratePerKg: 37 }
    ],
    logisticsDistanceKm: 342,
    logisticsCost: 6400,
    storageDays: 3,
    storageCost: 1800,
    qcInspectionCost: 800,
    platformFeeRate: 0.025
  });

  const { illustrativeComparison } = audit;

  const costBreakdown = [
    {
      title: 'Farmer Farmgate Share',
      amountPerKg: '₹32.00',
      percentage: '80.0%',
      color: 'bg-[#2F7D4A]',
      textColor: 'text-[#123C2A]',
      bgLight: 'bg-[#E8EFE4]',
      icon: Sprout,
      desc: 'Paid directly to farmers via escrow on verified dock arrival'
    },
    {
      title: 'Reefer Cold Logistics',
      amountPerKg: '₹4.00',
      percentage: '10.0%',
      color: 'bg-[#D9A441]',
      textColor: 'text-[#8A6318]',
      bgLight: 'bg-[#FDF6E9]',
      icon: Truck,
      desc: 'Direct payment to carrier for 342 km continuous refrigerated corridor'
    },
    {
      title: 'Cold Storage Buffer',
      amountPerKg: '₹2.00',
      percentage: '5.0%',
      color: 'bg-[#7DBA52]',
      textColor: 'text-[#2F7D4A]',
      bgLight: 'bg-[#E8EFE4]',
      icon: Warehouse,
      desc: '3 days pre-cooling and terminal preservation fees'
    },
    {
      title: 'Platform Escrow & QC',
      amountPerKg: '₹2.00',
      percentage: '5.0%',
      color: 'bg-[#123C2A]',
      textColor: 'text-[#123C2A]',
      bgLight: 'bg-[#F5F3EA]',
      icon: ShieldCheck,
      desc: 'Quality inspection, automated settlement, and smart contract protocol'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#D8DFD5]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7D4A]">Audited Financial Ledger</span>
            <h2 className="text-2xl font-serif font-bold text-[#17201B]">Price Spread & Value Transparency</h2>
            <p className="text-xs text-[#66736A] mt-1 max-w-2xl leading-relaxed">
              Every single rupee in the supply chain is audited and accounted for. FarmDirect guarantees that farmers retain 80%+ of the landed produce value by eliminating unrecorded commission agent spreads.
            </p>
          </div>

          <div className="p-4 bg-[#F5F3EA] rounded-xl border border-[#D8DFD5] text-left md:text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Buyer Landed Price</span>
            <span className="text-3xl font-bold text-[#123C2A] font-mono block mt-0.5">
              ₹40.00<span className="text-xs text-[#66736A] font-sans">/kg</span>
            </span>
            <span className="text-xs text-[#2F7D4A] font-bold block mt-1">
              vs Traditional Mandi ₹50.00/kg (Save 20%)
            </span>
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs mb-2 font-semibold">
            <span className="text-[#17201B]">Price Attribution Per Kilogram:</span>
            <span className="font-mono text-[#123C2A]">₹40.00 Landed Total</span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#D8DFD5]">
            <div className="h-full bg-[#2F7D4A]" style={{ width: '80%' }} title="Farmer Share: 80%" />
            <div className="h-full bg-[#D9A441]" style={{ width: '10%' }} title="Logistics: 10%" />
            <div className="h-full bg-[#7DBA52]" style={{ width: '5%' }} title="Storage: 5%" />
            <div className="h-full bg-[#123C2A]" style={{ width: '5%' }} title="Platform & QC: 5%" />
          </div>
        </div>
      </div>

      {/* 4 Attribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {costBreakdown.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-[#D8DFD5] p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bgLight} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-[#123C2A]" />
                  </div>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${item.bgLight} ${item.textColor}`}>
                    {item.percentage}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#17201B]">{item.title}</h4>
                <p className="text-2xl font-bold text-[#123C2A] font-mono mt-1 mb-2">{item.amountPerKg}<span className="text-xs text-[#66736A]">/kg</span></p>
              </div>
              <p className="text-xs text-[#66736A] pt-3 border-t border-[#D8DFD5] leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Traditional Mandi vs FarmDirect Direct Comparison */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm">
        <div className="pb-4 border-b border-[#D8DFD5] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#17201B]">
              Direct Connection vs. Traditional Mandi
            </h3>
            <p className="text-xs text-[#66736A]">
              Structural economics of eliminating unnecessary layers of market intermediaries
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E8EFE4] text-[#123C2A] border border-[#D8DFD5]">
            Verified Supply Chain Benchmark
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Mandi */}
          <div className="p-6 rounded-xl bg-[#F5F3EA]/50 border border-[#D8DFD5] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#D8DFD5]">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Traditional Mandi APMC Supply Chain
              </span>
              <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                4-5 Intermediary Layers
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Farmer Gets</span>
                <span className="text-2xl font-bold text-rose-700 font-mono mt-0.5 block">₹18.00/kg</span>
                <span className="text-xs text-[#66736A]">Only 36% of final price</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block">Buyer Landed</span>
                <span className="text-2xl font-bold text-[#17201B] font-mono mt-0.5 block">₹50.00/kg</span>
                <span className="text-xs text-rose-700 font-medium">Overpaid by +25%</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736A] block mb-2">Intermediary Margin Spread:</span>
              <ul className="space-y-1.5 text-xs text-[#66736A]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Village Aggregator commission (₹4/kg)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>APMC Mandi Commission Agent / Arhatia (₹8/kg)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Secondary Wholesale Distributor (₹12/kg)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Unrecorded transport wastage & weight deduction (₹8/kg)</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800">
              <strong>Middlemen Capture:</strong> ₹32.00/kg (64% of total transaction value taken by non-producing layers)
            </div>
          </div>

          {/* FarmDirect Model */}
          <div className="p-6 rounded-xl bg-[#E8EFE4]/60 border border-[#7DBA52] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#7DBA52]/40">
              <span className="text-xs font-bold uppercase tracking-wider text-[#123C2A]">
                FarmDirect Intelligent Digital Supply
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#E8EFE4] text-[#123C2A] border border-[#7DBA52] px-2 py-0.5 rounded">
                Zero Middlemen Commissions
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block">Farmer Gets</span>
                <span className="text-2xl font-bold text-[#123C2A] font-mono mt-0.5 block">₹32.00/kg</span>
                <span className="text-xs text-[#2F7D4A] font-bold">+77.8% Higher Realization</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block">Buyer Landed</span>
                <span className="text-2xl font-bold text-[#2F7D4A] font-mono mt-0.5 block">₹40.00/kg</span>
                <span className="text-xs text-[#2F7D4A] font-bold">Save ₹10/kg (20% Savings)</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#123C2A] block mb-2">Cost Components:</span>
              <ul className="space-y-1.5 text-xs text-[#17201B]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2F7D4A]" />
                  <span>Direct Farmgate Payout (80.0%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2F7D4A]" />
                  <span>Temperature-Controlled Reefer Transit (10.0%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2F7D4A]" />
                  <span>Pre-Cooling & Cold Storage Facility (5.0%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2F7D4A]" />
                  <span>Quality Assurance & Digital Escrow Protocol (5.0%)</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#7DBA52] text-xs text-[#123C2A]">
              <strong>Farmer Retained Share:</strong> ₹32.00/kg (80% of total capital credited directly to producer bank account)
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Audit Ledger */}
      <div className="bg-white rounded-xl border border-[#D8DFD5] p-6 shadow-sm overflow-hidden">
        <h4 className="text-base font-serif font-bold text-[#17201B] mb-4">
          Itemized Financial Audit Ledger (2,000 kg Consolidated Tomato Contract #FD-TOM-1026)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D8DFD5] text-[#66736A] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Payee / Stakeholder</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DFD5]">
              {audit.allLineItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F3EA]/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#17201B]">{item.party}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#E8EFE4] text-[10px] font-bold text-[#123C2A] uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#66736A]">{item.description}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#123C2A]">
                    ₹{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceTransparencyScreen;
