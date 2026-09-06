import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Search,
  Calendar,
  Save,
  Eye,
  Filter
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { BeneficiaryRecord, AcceptanceStatusType } from '../types/pmay';

export const AcceptanceStatus: React.FC = () => {
  const { beneficiaries, updateAcceptance, setActiveBeneficiary } = useBeneficiary();

  const [filterTab, setFilterTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick edit draft
  const [draftStatus, setDraftStatus] = useState<AcceptanceStatusType>('ACCEPT');
  const [draftDate, setDraftDate] = useState('');
  const [draftRemarks, setDraftRemarks] = useState('');

  const filteredList = useMemo(() => {
    return beneficiaries.filter((b) => {
      if (filterTab !== 'ALL' && b.acceptance.status !== filterTab) return false;
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
    setEditingId(b.id);
    setDraftStatus(b.acceptance.status === 'PENDING' ? 'ACCEPT' : b.acceptance.status);
    setDraftDate(b.acceptance.date || new Date().toISOString().split('T')[0]);
    setDraftRemarks(b.acceptance.remarks || '');
  };

  const saveEdit = (id: string) => {
    updateAcceptance(id, draftStatus, draftDate, draftRemarks);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-600" />
              <span>स्वीकृती प्रक्रिया (Acceptance Process Workflow)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्राथमिक फॉर्म लिस्ट मधील लाभार्थ्यांचे Acceptance निश्चित करा: ACCEPT, REJECT किंवा NO RESPONSE.
            </p>
          </div>
        </div>

        {/* Tab Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'ALL', label: `सर्व (${beneficiaries.length})` },
              {
                id: 'ACCEPT',
                label: `ACCEPT (${beneficiaries.filter((b) => b.acceptance.status === 'ACCEPT').length})`,
                color: 'text-emerald-700'
              },
              {
                id: 'REJECT',
                label: `REJECT (${beneficiaries.filter((b) => b.acceptance.status === 'REJECT').length})`,
                color: 'text-red-700'
              },
              {
                id: 'NO RESPONSE',
                label: `NO RESPONSE (${beneficiaries.filter((b) => b.acceptance.status === 'NO RESPONSE').length})`,
                color: 'text-amber-700'
              },
              {
                id: 'PENDING',
                label: `PENDING (${beneficiaries.filter((b) => b.acceptance.status === 'PENDING').length})`,
                color: 'text-slate-600'
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

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            या फिल्टरमध्ये कोणतेही लाभार्थी आढळले नाहीत.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-10">क्र.</th>
                  <th className="p-3">अर्ज क्रमांक</th>
                  <th className="p-3">लाभार्थ्याचे नाव</th>
                  <th className="p-3">मोबाईल</th>
                  <th className="p-3">प्रकल्प</th>
                  <th className="p-3">सध्याची स्थिती</th>
                  <th className="p-3">स्वीकृती दिनांक</th>
                  <th className="p-3">शेरा (Remarks)</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((b, idx) => {
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
                        {b.fatherSpouseName && (
                          <div className="text-[11px] text-slate-500">{b.fatherSpouseName}</div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{b.mobileNumber || '-'}</td>
                      <td className="p-3 text-slate-700">{b.projectSite}</td>

                      {/* Status Column */}
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value as AcceptanceStatusType)}
                            className="p-1 border border-slate-300 rounded bg-white text-xs font-bold"
                          >
                            <option value="ACCEPT">ACCEPT</option>
                            <option value="REJECT">REJECT</option>
                            <option value="NO RESPONSE">NO RESPONSE</option>
                            <option value="PENDING">PENDING</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              b.acceptance.status === 'ACCEPT'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.acceptance.status === 'REJECT'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : b.acceptance.status === 'NO RESPONSE'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {b.acceptance.status}
                          </span>
                        )}
                      </td>

                      {/* Date Column */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={draftDate}
                            onChange={(e) => setDraftDate(e.target.value)}
                            className="p-1 border border-slate-300 rounded bg-white text-xs"
                          />
                        ) : (
                          <span className="text-slate-600 font-mono">
                            {b.acceptance.date || '-'}
                          </span>
                        )}
                      </td>

                      {/* Remarks Column */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draftRemarks}
                            onChange={(e) => setDraftRemarks(e.target.value)}
                            placeholder="शेरा प्रविष्ट करा..."
                            className="p-1 border border-slate-300 rounded bg-white text-xs w-full max-w-xs"
                          />
                        ) : (
                          <span className="text-slate-600 truncate max-w-xs block">
                            {b.acceptance.remarks || '-'}
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
                              सेव्ह करा
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] hover:bg-slate-300 transition"
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
                              स्थिती बदला
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBeneficiary(b)}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Profile पहा"
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
