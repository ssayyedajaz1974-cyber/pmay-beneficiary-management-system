import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Landmark,
  CheckCircle2,
  Clock,
  Search,
  IndianRupee,
  Eye,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import {
  BeneficiaryRecord,
  Payment20StatusType,
  Payment20Mode,
  calculateBeneficiaryFinancials
} from '../types/pmay';

export const Payment20View: React.FC = () => {
  const { beneficiaries, updatePayment20, updateLoanProcess, setActiveBeneficiary, setCurrentNav } =
    useBeneficiary();

  const [filterTab, setFilterTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick draft
  const [draftMode, setDraftMode] = useState<Payment20Mode>('20% PAYMENT');
  const [draftStatus, setDraftStatus] = useState<Payment20StatusType>('PAID');
  const [draftAmount, setDraftAmount] = useState<number>(0);
  const [draftDate, setDraftDate] = useState('');
  const [draftReceipt, setDraftReceipt] = useState('');
  const [draftTxn, setDraftTxn] = useState('');
  const [draftRemarks, setDraftRemarks] = useState('');

  const list = useMemo(() => {
    return beneficiaries.filter((b) => {
      // 10% paid or viewing all
      if (filterTab === 'PAID_10_ONLY' && b.payment10Percent.status !== 'PAID') return false;
      if (filterTab === '20_PAID' && b.payment20Percent.status !== 'PAID') return false;
      if (filterTab === '20_PENDING' && b.payment20Percent.status !== 'PENDING') return false;
      if (filterTab === 'LOAN_MODE' && b.payment20Percent.mode !== 'LOAN PROCESS') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = (b.beneficiaryName || '').toLowerCase().includes(term);
        const appMatch = (b.applicationNumber || '').toLowerCase().includes(term);
        const mobMatch = (b.mobileNumber || '').toLowerCase().includes(term);
        if (!nameMatch && !appMatch && !mobMatch) return false;
      }
      return true;
    });
  }, [beneficiaries, filterTab, searchTerm]);

  const startEdit = (b: BeneficiaryRecord) => {
    const fin = calculateBeneficiaryFinancials(b);
    setEditingId(b.id);
    setDraftMode(b.payment20Percent.mode === 'NONE' ? '20% PAYMENT' : b.payment20Percent.mode);
    setDraftStatus(b.payment20Percent.status === 'PENDING' ? 'PAID' : b.payment20Percent.status);
    setDraftAmount(b.payment20Percent.amount || fin.amount20Percent);
    setDraftDate(b.payment20Percent.paymentDate || new Date().toISOString().split('T')[0]);
    setDraftReceipt(b.payment20Percent.receiptNo || '');
    setDraftTxn(b.payment20Percent.transactionRef || '');
    setDraftRemarks(b.payment20Percent.remarks || '');
  };

  const saveEdit = (id: string) => {
    updatePayment20(id, {
      mode: draftMode,
      status: draftStatus,
      amount: Number(draftAmount),
      paymentDate: draftDate,
      receiptNo: draftReceipt,
      transactionRef: draftTxn,
      remarks: draftRemarks
    });

    if (draftMode === 'LOAN PROCESS') {
      updateLoanProcess(id, {
        status: 'Under Process'
      });
    }

    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" />
              <span>२०% हप्ता / कर्ज निवड प्रक्रिया (20% Payment Process)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ज्या लाभार्थ्यांनी १०% हप्ता भरला आहे त्यांच्यासाठी २०% थेट भरणे किंवा बँक कर्ज प्रक्रिया निवड.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'ALL', label: `सर्व (${beneficiaries.length})` },
              {
                id: 'PAID_10_ONLY',
                label: `१०% भरलेले (${beneficiaries.filter((b) => b.payment10Percent.status === 'PAID').length})`,
                color: 'text-teal-700'
              },
              {
                id: '20_PAID',
                label: `२०% PAID (${beneficiaries.filter((b) => b.payment20Percent.status === 'PAID').length})`,
                color: 'text-cyan-700'
              },
              {
                id: '20_PENDING',
                label: `२०% PENDING (${beneficiaries.filter((b) => b.payment20Percent.status === 'PENDING').length})`,
                color: 'text-indigo-700'
              },
              {
                id: 'LOAN_MODE',
                label: `कर्ज निवडलेले (${beneficiaries.filter((b) => b.payment20Percent.mode === 'LOAN PROCESS').length})`,
                color: 'text-purple-700'
              }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  filterTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="नाव किंवा अर्ज क्र. शोधा..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            कोणतीही नोंद आढळली नाही.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-10">क्र.</th>
                  <th className="p-3">अर्ज क्रमांक</th>
                  <th className="p-3">लाभार्थ्याचे नाव</th>
                  <th className="p-3">प्रकल्प</th>
                  <th className="p-3">१०% स्थिती</th>
                  <th className="p-3">२०% रक्कम (Full Cost)</th>
                  <th className="p-3">प्रक्रियेचा प्रकार</th>
                  <th className="p-3">पेमेंट स्थिती</th>
                  <th className="p-3">पावती / संदर्भ</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((b, idx) => {
                  const fin = calculateBeneficiaryFinancials(b);
                  const isEditing = editingId === b.id;

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50 transition ${
                        isEditing ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {b.applicationNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.beneficiaryName}</div>
                        <div className="text-[10px] text-slate-400">{b.mobileNumber || '-'}</div>
                      </td>
                      <td className="p-3 text-slate-700">{b.projectSite}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.payment10Percent.status === 'PAID'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {b.payment10Percent.status}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-indigo-700">
                        ₹{fin.amount20Percent.toLocaleString('en-IN')}
                      </td>

                      {/* Mode: 20% PAYMENT vs LOAN PROCESS */}
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={draftMode}
                            onChange={(e) => setDraftMode(e.target.value as Payment20Mode)}
                            className="p-1 border border-slate-300 rounded bg-white text-xs font-bold"
                          >
                            <option value="20% PAYMENT">20% PAYMENT (थेट भरणा)</option>
                            <option value="LOAN PROCESS">LOAN PROCESS (बँक कर्ज)</option>
                            <option value="NONE">NONE (प्रलंबित)</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              b.payment20Percent.mode === 'LOAN PROCESS'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : b.payment20Percent.mode === '20% PAYMENT'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {b.payment20Percent.mode}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value as Payment20StatusType)}
                            className="p-1 border border-slate-300 rounded bg-white text-xs font-bold"
                          >
                            <option value="PAID">PAID</option>
                            <option value="PENDING">PENDING</option>
                            <option value="NOT APPLICABLE">NOT APPLICABLE</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              b.payment20Percent.status === 'PAID'
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {b.payment20Percent.status}
                          </span>
                        )}
                      </td>

                      {/* Receipt */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draftReceipt}
                            onChange={(e) => setDraftReceipt(e.target.value)}
                            placeholder="पावती क्र..."
                            className="p-1 border border-slate-300 rounded bg-white text-xs w-28"
                          />
                        ) : (
                          <div className="font-mono text-slate-800">
                            {b.payment20Percent.receiptNo || '-'}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => saveEdit(b.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded font-semibold text-[11px] hover:bg-emerald-700 transition"
                            >
                              सेव्ह
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                            >
                              रद्द
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => startEdit(b)}
                              className="text-indigo-700 hover:text-indigo-800 font-semibold text-xs"
                            >
                              स्थिती बदला
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBeneficiary(b)}
                              className="p-1 text-slate-400 hover:text-slate-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
