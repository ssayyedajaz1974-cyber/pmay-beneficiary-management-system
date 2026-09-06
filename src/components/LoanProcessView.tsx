import React, { useState, useMemo } from 'react';
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  IndianRupee,
  Eye,
  AlertCircle,
  FileCheck2,
  Calendar,
  Save,
  X,
  FileSpreadsheet,
  Download,
  Building2,
  Send,
  Edit3
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { BeneficiaryRecord, LoanStatusType, calculateBeneficiaryFinancials, ImportTargetStage } from '../types/pmay';

interface LoanProcessViewProps {
  onOpenExcelUpload?: (stage?: ImportTargetStage) => void;
}

export const LoanProcessView: React.FC<LoanProcessViewProps> = ({ onOpenExcelUpload }) => {
  const {
    beneficiaries,
    updateLoanProcess,
    setActiveBeneficiary,
    exportToExcel
  } = useBeneficiary();

  const [filterTab, setFilterTab] = useState<string>('ALL');
  const [bankFilter, setBankFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState<BeneficiaryRecord | null>(null);

  // Edit draft states
  const [draftStatus, setDraftStatus] = useState<LoanStatusType>('Under Process');
  const [draftBank, setDraftBank] = useState('');
  const [draftBranch, setDraftBranch] = useState('');
  const [draftFileSentDate, setDraftFileSentDate] = useState('');
  const [draftLoanFileNo, setDraftLoanFileNo] = useState('');
  const [draftAmt, setDraftAmt] = useState<number>(0);
  const [draftAppDate, setDraftAppDate] = useState('');
  const [draftSanctionDate, setDraftSanctionDate] = useState('');
  const [draftRejReason, setDraftRejReason] = useState('');
  const [draftRejRemarks, setDraftRejRemarks] = useState('');
  const [draftRejDate, setDraftRejDate] = useState('');
  const [draftBankRemarks, setDraftBankRemarks] = useState('');
  const [draftStaffRemarks, setDraftStaffRemarks] = useState('');
  const [draftImportantRemarks, setDraftImportantRemarks] = useState('');

  // Extract unique banks
  const uniqueBanks = useMemo(() => {
    const set = new Set<string>();
    beneficiaries.forEach((b) => {
      if (b.loanProcess.bankName?.trim()) {
        set.add(b.loanProcess.bankName.trim());
      }
    });
    return Array.from(set);
  }, [beneficiaries]);

  const list = useMemo(() => {
    return beneficiaries.filter((b) => {
      // Filter tab
      if (filterTab !== 'ALL' && b.loanProcess.status !== filterTab) return false;

      // Bank filter
      if (bankFilter !== 'ALL' && b.loanProcess.bankName?.trim() !== bankFilter) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = (b.beneficiaryName || '').toLowerCase().includes(term);
        const appMatch = (b.applicationNumber || '').toLowerCase().includes(term);
        const bankMatch = (b.loanProcess.bankName || '').toLowerCase().includes(term);
        const branchMatch = (b.loanProcess.bankBranch || '').toLowerCase().includes(term);
        const loanFileMatch = (b.loanProcess.loanFileNumber || '').toLowerCase().includes(term);
        if (!nameMatch && !appMatch && !bankMatch && !branchMatch && !loanFileMatch) return false;
      }
      return true;
    });
  }, [beneficiaries, filterTab, bankFilter, searchTerm]);

  const startEdit = (b: BeneficiaryRecord) => {
    const fin = calculateBeneficiaryFinancials(b);
    setEditingRecord(b);
    setDraftStatus(
      b.loanProcess.status === 'NOT APPLICABLE' ? 'Under Process' : b.loanProcess.status
    );
    setDraftBank(b.loanProcess.bankName || '');
    setDraftBranch(b.loanProcess.bankBranch || '');
    setDraftFileSentDate(b.loanProcess.fileSentDate || '');
    setDraftLoanFileNo(b.loanProcess.loanFileNumber || '');
    setDraftAmt(b.loanProcess.loanAmount || fin.amount20Percent);
    setDraftAppDate(b.loanProcess.applicationDate || '');
    setDraftSanctionDate(b.loanProcess.sanctionDate || '');
    setDraftRejReason(b.loanProcess.rejectionReason || '');
    setDraftRejRemarks(b.loanProcess.rejectionRemarks || '');
    setDraftRejDate(b.loanProcess.rejectionDate || '');
    setDraftBankRemarks(b.loanProcess.bankRemarks || '');
    setDraftStaffRemarks(b.loanProcess.staffRemarks || '');
    setDraftImportantRemarks(b.loanProcess.importantRemarks || '');
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    updateLoanProcess(editingRecord.id, {
      status: draftStatus,
      bankName: draftBank,
      bankBranch: draftBranch,
      fileSentDate: draftFileSentDate,
      loanFileNumber: draftLoanFileNo,
      loanAmount: Number(draftAmt),
      applicationDate: draftAppDate,
      sanctionDate: draftSanctionDate,
      rejectionReason: draftRejReason,
      rejectionRemarks: draftRejRemarks,
      rejectionDate: draftRejDate,
      bankRemarks: draftBankRemarks,
      staffRemarks: draftStaffRemarks,
      importantRemarks: draftImportantRemarks
    });
    setEditingRecord(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-purple-600" />
              <span>बँक कर्ज प्रक्रिया (Loan Process Workflow)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              बँकेकडे फाईल पाठवणे, कर्ज प्रक्रियेची स्थिती (Under Process / Approved / Rejected), बँक शाखा, फाईल क्र. व शेरा नोंद.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenExcelUpload && (
              <button
                type="button"
                onClick={() => onOpenExcelUpload('LOAN_UNDER_PROCESS')}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>कर्ज यादी Excel अपलोड</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => exportToExcel(list, 'PMAY_Bank_Loan_Beneficiaries.xlsx')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>Excel Export</span>
            </button>
          </div>
        </div>

        {/* Tab Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {[
              { id: 'ALL', label: `सर्व (${beneficiaries.length})` },
              {
                id: 'File Sent to Bank',
                label: `बँकेत पाठवले (${beneficiaries.filter((b) => b.loanProcess.status === 'File Sent to Bank').length})`,
                color: 'text-blue-700'
              },
              {
                id: 'Under Process',
                label: `Under Process (${beneficiaries.filter((b) => b.loanProcess.status === 'Under Process').length})`,
                color: 'text-purple-700'
              },
              {
                id: 'Loan Approved',
                label: `मंजूर (${beneficiaries.filter((b) => b.loanProcess.status === 'Loan Approved').length})`,
                color: 'text-emerald-700'
              },
              {
                id: 'Loan Rejected',
                label: `नाकारले (${beneficiaries.filter((b) => b.loanProcess.status === 'Loan Rejected').length})`,
                color: 'text-rose-700'
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

          <div className="flex items-center gap-2">
            {uniqueBanks.length > 0 && (
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">सर्व बँका</option>
                {uniqueBanks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="नाव, अर्ज, बँक, शाखा किंवा फाईल क्र...."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            या फिल्टरनुसार कर्ज प्रक्रियेत कोणतेही लाभार्थी आढळले नाहीत.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3 w-10">क्र.</th>
                  <th className="p-3">अर्ज क्रमांक</th>
                  <th className="p-3">लाभार्थ्याचे नाव व मोबाईल</th>
                  <th className="p-3">बँकेचे नाव व शाखा</th>
                  <th className="p-3">कर्ज फाईल क्र. / पाठवल्याचा दिनांक</th>
                  <th className="p-3">कर्ज रक्कम (₹)</th>
                  <th className="p-3 text-center">कर्ज स्थिती</th>
                  <th className="p-3">शेरा (Remarks)</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((b, idx) => {
                  const fin = calculateBeneficiaryFinancials(b);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-slate-400 text-center font-mono">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.applicationNumber}</div>
                        {b.importedFileName && (
                          <div className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-0.5 truncate max-w-[140px]">
                            {b.importedFileName}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.beneficiaryName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {b.mobileNumber || 'मोबाईल नाही'}
                        </div>
                      </td>
                      <td className="p-3">
                        {b.loanProcess.bankName ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-purple-900 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-purple-600" />
                              <span>{b.loanProcess.bankName}</span>
                            </div>
                            {b.loanProcess.bankBranch && (
                              <div className="text-[11px] text-slate-500">
                                शाखा: {b.loanProcess.bankBranch}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">नोंद नाही</span>
                        )}
                      </td>
                      <td className="p-3">
                        {b.loanProcess.loanFileNumber ? (
                          <div className="font-mono font-semibold text-slate-800">
                            {b.loanProcess.loanFileNumber}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                        {b.loanProcess.fileSentDate && (
                          <div className="text-[10px] text-slate-500">
                            दिनांक: {b.loanProcess.fileSentDate}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₹
                        {(b.loanProcess.loanAmount || fin.amount20Percent).toLocaleString(
                          'en-IN'
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {b.loanProcess.status === 'Loan Approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved (मंजूर)</span>
                          </span>
                        )}
                        {b.loanProcess.status === 'Loan Rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected (नाकारले)</span>
                          </span>
                        )}
                        {b.loanProcess.status === 'Under Process' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <Clock className="w-3 h-3" />
                            <span>Under Process</span>
                          </span>
                        )}
                        {b.loanProcess.status === 'File Sent to Bank' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Send className="w-3 h-3" />
                            <span>बँकेत पाठवले</span>
                          </span>
                        )}
                        {b.loanProcess.status === 'NOT APPLICABLE' && (
                          <span className="text-slate-400 text-[11px]">लागू नाही</span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="text-[11px] text-slate-700 truncate">
                          {b.loanProcess.bankRemarks ||
                            b.loanProcess.staffRemarks ||
                            b.loanProcess.rejectionReason ||
                            '—'}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => startEdit(b)}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>अपडेट</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveBeneficiary(b)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Drawer/Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    बँक कर्ज प्रक्रिया तपशील अपडेट करा
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {editingRecord.beneficiaryName} ({editingRecord.applicationNumber})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Status Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  कर्ज स्थिती (Loan Status):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'File Sent to Bank', label: 'बँकेत पाठवले' },
                    { id: 'Under Process', label: 'Under Process' },
                    { id: 'Loan Approved', label: 'Approved (मंजूर)' },
                    { id: 'Loan Rejected', label: 'Rejected (नाकारले)' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setDraftStatus(st.id as LoanStatusType)}
                      className={`p-2 rounded-xl border text-center font-bold transition ${
                        draftStatus === st.id
                          ? 'bg-purple-50 text-purple-800 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Name and Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    बँकेचे नाव (Bank Name):
                  </label>
                  <input
                    type="text"
                    value={draftBank}
                    onChange={(e) => setDraftBank(e.target.value)}
                    placeholder="उदा. State Bank of India, Bank of Maharashtra"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    बँक शाखा (Branch):
                  </label>
                  <input
                    type="text"
                    value={draftBranch}
                    onChange={(e) => setDraftBranch(e.target.value)}
                    placeholder="उदा. छावणी शाखा, क्रांती चौक"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Loan File No and File Sent Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    कर्ज अर्ज / फाईल क्र. (Loan File Number):
                  </label>
                  <input
                    type="text"
                    value={draftLoanFileNo}
                    onChange={(e) => setDraftLoanFileNo(e.target.value)}
                    placeholder="उदा. SBI/2024/CSN/1042"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    बँकेत फाईल पाठवल्याचा दिनांक (File Sent Date):
                  </label>
                  <input
                    type="date"
                    value={draftFileSentDate}
                    onChange={(e) => setDraftFileSentDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Loan Amount and Sanction Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    कर्ज रक्कम (Loan Amount ₹):
                  </label>
                  <input
                    type="number"
                    value={draftAmt}
                    onChange={(e) => setDraftAmt(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {draftStatus === 'Loan Approved' ? (
                  <div>
                    <label className="block font-semibold text-emerald-800 mb-1">
                      कर्ज मंजुरी दिनांक (Sanction Date):
                    </label>
                    <input
                      type="date"
                      value={draftSanctionDate}
                      onChange={(e) => setDraftSanctionDate(e.target.value)}
                      className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 text-emerald-950 font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      अर्जाचा दिनांक:
                    </label>
                    <input
                      type="date"
                      value={draftAppDate}
                      onChange={(e) => setDraftAppDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Rejection Details if Rejected */}
              {draftStatus === 'Loan Rejected' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>कर्ज नाकारल्याची माहिती (Rejection Details)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-rose-900 mb-1">
                        नाकारल्याचा दिनांक:
                      </label>
                      <input
                        type="date"
                        value={draftRejDate}
                        onChange={(e) => setDraftRejDate(e.target.value)}
                        className="w-full p-2 bg-white border border-rose-300 rounded-lg text-rose-950"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-rose-900 mb-1">
                        नाकारण्याचे कारण (Reason):
                      </label>
                      <input
                        type="text"
                        value={draftRejReason}
                        onChange={(e) => setDraftRejReason(e.target.value)}
                        placeholder="उदा. CIBIL स्कोर कमी, अपुरे उत्पन्न, कागदपत्रे अपूर्ण"
                        className="w-full p-2 bg-white border border-rose-300 rounded-lg text-rose-950"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks Fields */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    बँकेचा शेरा (Bank Remarks):
                  </label>
                  <input
                    type="text"
                    value={draftBankRemarks}
                    onChange={(e) => setDraftBankRemarks(e.target.value)}
                    placeholder="बँकेने दिलेला शेरा / सूचना"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    कर्मचारी / अंतर्गत शेरा (Staff Remarks):
                  </label>
                  <input
                    type="text"
                    value={draftStaffRemarks}
                    onChange={(e) => setDraftStaffRemarks(e.target.value)}
                    placeholder="कार्यालयीन किंवा कर्मचाऱ्यांचा शेरा"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    महत्त्वाचा शेरा (Important Remarks):
                  </label>
                  <textarea
                    rows={2}
                    value={draftImportantRemarks}
                    onChange={(e) => setDraftImportantRemarks(e.target.value)}
                    placeholder="इतर कोणतीही महत्त्वाची माहिती..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>माहिती सेव्ह करा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
