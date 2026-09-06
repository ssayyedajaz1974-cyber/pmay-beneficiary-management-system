import React, { useState } from 'react';
import { FileCheck, Search, CheckCircle2, Clock, AlertCircle, Eye } from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';

export const DocumentStatus: React.FC = () => {
  const { beneficiaries, updateBeneficiary, setActiveBeneficiary } = useBeneficiary();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = beneficiaries.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.beneficiaryName || '').toLowerCase().includes(term) ||
      (b.applicationNumber || '').toLowerCase().includes(term) ||
      (b.mobileNumber || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <span>कागदपत्रे पडताळणी व्यवस्थापन (Document Verification)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              आधार कार्ड, रहिवासी दाखला, उत्पन्न प्रमाणपत्र, बँक पासबुक व इतर कागदपत्रांची तपासणी.
            </p>
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
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
                  <th className="p-3">कागदपत्रे स्थिती (Checklist)</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b, idx) => {
                  const verifiedCount = b.documents.filter((d) => d.status === 'Verified').length;
                  const totalDocs = b.documents.length;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {b.applicationNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.beneficiaryName}</div>
                        <div className="text-[10px] text-slate-400">{b.mobileNumber || '-'}</div>
                      </td>
                      <td className="p-3 text-slate-700">{b.projectSite}</td>

                      {/* Documents badges */}
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {b.documents.map((doc, dIdx) => (
                            <button
                              key={doc.id || dIdx}
                              type="button"
                              onClick={() => {
                                const nextStatus =
                                  doc.status === 'Pending'
                                    ? 'Received'
                                    : doc.status === 'Received'
                                    ? 'Verified'
                                    : 'Pending';
                                const updated = b.documents.map((d, i) =>
                                  i === dIdx ? { ...d, status: nextStatus } : d
                                );
                                updateBeneficiary(b.id, { documents: updated });
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                                doc.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : doc.status === 'Received'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                              title="क्लिक करून स्थिती बदला (Pending -> Received -> Verified)"
                            >
                              {doc.name.split('(')[0]}: {doc.status}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveBeneficiary(b)}
                          className="text-amber-700 hover:text-amber-800 font-semibold text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>तपासा</span>
                        </button>
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
