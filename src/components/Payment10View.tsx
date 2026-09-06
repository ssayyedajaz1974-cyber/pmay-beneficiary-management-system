import React, { useState, useMemo } from 'react';
import {
  Percent,
  Wallet,
  CheckCircle2,
  Clock,
  Search,
  IndianRupee,
  Eye,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { BeneficiaryRecord, Payment10StatusType, calculateBeneficiaryFinancials } from '../types/pmay';

export const Payment10View: React.FC = () => {
  const { beneficiaries, updatePayment10, setActiveBeneficiary } = useBeneficiary();

  const [filterTab, setFilterTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick draft
  const [draftStatus, setDraftStatus] = useState<Payment10StatusType>('PAID');
  const [draftAmount, setDraftAmount] = useState<number>(0);
  const [draftDate, setDraftDate] = useState('');
  const [draftReceipt, setDraftReceipt] = useState('');
  const [draftTxn, setDraftTxn] = useState('');
  const [draftRemarks, setDraftRemarks] = useState('');

  // Accepted beneficiaries are the primary target for 10% payment
  const list = useMemo(() => {
    return beneficiaries.filter((b) => {
      // Must be accepted or allow seeing all
      if (filterTab === 'ACCEPTED_ONLY' && b.acceptance.status !== 'ACCEPT') return false;
      if (filterTab === 'PAID' && b.payment10Percent.status !== 'PAID') return false;
      if (filterTab === 'PENDING' && b.payment10Percent.status !== 'PENDING') return false;
      if (filterTab === 'REJECT' && b.payment10Percent.status !== 'REJECT') return false;
      if (filterTab === 'NO RESPONSE' && b.payment10Percent.status !== 'NO RESPONSE') return false;

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
    setDraftStatus(b.payment10Percent.status === 'PENDING' ? 'PAID' : b.payment10Percent.status);
    setDraftAmount(b.payment10Percent.amount || fin.amount10Percent);
    setDraftDate(b.payment10Percent.paymentDate || new Date().toISOString().split('T')[0]);
    setDraftReceipt(b.payment10Percent.receiptNo || '');
    setDraftTxn(b.payment10Percent.transactionRef || '');
    setDraftRemarks(b.payment10Percent.remarks || '');
  };

  const saveEdit = (id: string) => {
    updatePayment10(id, {
      status: draftStatus,
      amount: Number(draftAmount),
      paymentDate: draftDate,
      receiptNo: draftReceipt,
      transactionRef: draftTxn,
      remarks: draftRemarks
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-600" />
              <span>१०% हप्ता भरण्याची प्रक्रिया (10% Payment Process)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              स्वीकृत झालेल्या लाभार्थ्यांकडून पूर्ण घर किमतीवर १०% रक्कम भरणा नोंदणी. पावती क्रमांक व UTR क्रमांक जतन करा.
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'ALL', label: `सर्व (${beneficiaries.length})` },
              {
                id: 'PAID',
                label: `१०% PAID (${beneficiaries.filter((b) => b.payment10Percent.status === 'PAID').length})`,
                color: 'text-teal-700'
              },
              {
                id: 'PENDING',
                label: `१०% PENDING (${beneficiaries.filter((b) => b.payment10Percent.status === 'PENDING').length})`,
                color: 'text-blue-700'
              },
              {
                id: 'REJECT',
                label: `१०% REJECT (${beneficiaries.filter((b) => b.payment10Percent.status === 'REJECT').length})`,
                color: 'text-red-700'
              },
              {
                id: 'NO RESPONSE',
                label: `१०% NO RESPONSE (${beneficiaries.filter((b) => b.payment10Percent.status === 'NO RESPONSE').length})`,
                color: 'text-amber-700'
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
                  <th className="p-3">पूर्ण घर किंमत</th>
                  <th className="p-3">१०% हप्ता रक्कम</th>
                  <th className="p-3">पेमेंट स्थिती</th>
                  <th className="p-3">पावती क्रमांक / संदर्भ</th>
                  <th className="p-3">पेमेंट दिनांक</th>
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
                        <div className="text-[10px] text-slate-400">
                          स्वीकृती: {b.acceptance.status}
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">{b.projectSite}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₹{fin.houseCost.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-700">
                        ₹{fin.amount10Percent.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value as Payment10StatusType)}
                            className="p-1 border border-slate-300 rounded bg-white text-xs font-bold"
                          >
                            <option value="PAID">PAID</option>
                            <option value="PENDING">PENDING</option>
                            <option value="REJECT">REJECT</option>
                            <option value="NO RESPONSE">NO RESPONSE</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              b.payment10Percent.status === 'PAID'
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : b.payment10Percent.status === 'REJECT'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : b.payment10Percent.status === 'NO RESPONSE'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {b.payment10Percent.status}
                          </span>
                        )}
                      </td>

                      {/* Receipt / Txn */}
                      <td className="p-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={draftReceipt}
                              onChange={(e) => setDraftReceipt(e.target.value)}
                              placeholder="पावती क्र..."
                              className="p-1 border border-slate-300 rounded bg-white text-xs w-28 block"
                            />
                            <input
                              type="text"
                              value={draftTxn}
                              onChange={(e) => setDraftTxn(e.target.value)}
                              placeholder="संदर्भ / UTR..."
                              className="p-1 border border-slate-300 rounded bg-white text-xs w-28 block"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-mono text-slate-800 font-semibold">
                              {b.payment10Percent.receiptNo || '-'}
                            </div>
                            {b.payment10Percent.transactionRef && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {b.payment10Percent.transactionRef}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={draftDate}
                            onChange={(e) => setDraftDate(e.target.value)}
                            className="p-1 border border-slate-300 rounded bg-white text-xs"
                          />
                        ) : (
                          <span className="font-mono text-slate-600">
                            {b.payment10Percent.paymentDate || '-'}
                          </span>
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
                              className="text-amber-700 hover:text-amber-800 font-semibold text-xs"
                            >
                              पेमेंट नोंदवा
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
