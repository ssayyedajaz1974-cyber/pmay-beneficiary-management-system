import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Printer,
  PlusCircle,
  Eye,
  Trash2,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import {
  BeneficiaryRecord,
  PROJECT_SITES,
  calculateBeneficiaryFinancials,
  computeStageLabel,
  AcceptanceStatusType
} from '../types/pmay';

interface BeneficiaryListProps {
  onAddNewBeneficiary: () => void;
  onOpenExcelUpload: () => void;
  onOpenPrint: (b?: BeneficiaryRecord) => void;
  initialStageFilter?: string;
  customTitle?: string;
}

export const BeneficiaryList: React.FC<BeneficiaryListProps> = ({
  onAddNewBeneficiary,
  onOpenExcelUpload,
  onOpenPrint,
  initialStageFilter,
  customTitle
}) => {
  const {
    beneficiaries,
    setActiveBeneficiary,
    deleteBeneficiary,
    exportToExcel
  } = useBeneficiary();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [selectedAcceptance, setSelectedAcceptance] = useState<string>('ALL');
  const [selectedPayment10, setSelectedPayment10] = useState<string>('ALL');
  const [selectedLoanStatus, setSelectedLoanStatus] = useState<string>('ALL');
  const [selectedLotteryFilter, setSelectedLotteryFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const filteredBeneficiaries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return beneficiaries.filter((b) => {
      // Search term
      const nameMatch = (b.beneficiaryName || '').toLowerCase().includes(term);
      const appMatch = (b.applicationNumber || '').toLowerCase().includes(term);
      const mobMatch = (b.mobileNumber || '').toLowerCase().includes(term);
      const fatherMatch = (b.fatherSpouseName || '').toLowerCase().includes(term);
      const flatMatch = (b.flatHouseNumber || '').toLowerCase().includes(term);

      if (term && !nameMatch && !appMatch && !mobMatch && !fatherMatch && !flatMatch) {
        return false;
      }

      // Site Filter
      if (selectedSite !== 'ALL') {
        if (!(b.projectSite || '').toLowerCase().includes(selectedSite.toLowerCase())) {
          return false;
        }
      }

      // Acceptance Filter
      if (selectedAcceptance !== 'ALL') {
        if (b.acceptance.status !== selectedAcceptance) {
          return false;
        }
      }

      // 10% Payment Filter
      if (selectedPayment10 !== 'ALL') {
        if (b.payment10Percent.status !== selectedPayment10) {
          return false;
        }
      }

      // Loan Status Filter
      if (selectedLoanStatus !== 'ALL') {
        if (b.loanProcess.status !== selectedLoanStatus) {
          return false;
        }
      }

      // Initial Stage filter (e.g. for newForms tab)
      if (initialStageFilter === 'NEW_FORM_FILLED') {
        const isNew =
          b.importStage === 'NEW_FORM_FILLED' ||
          (b.acceptance.status === 'PENDING' &&
            (!b.lottery || b.lottery.result === 'PENDING' || b.lottery.result === 'NOT_PARTICIPATED'));
        if (!isNew) return false;
      }

      // Lottery Status Filter
      if (selectedLotteryFilter !== 'ALL') {
        if (selectedLotteryFilter === 'SELECTED') {
          if (b.lottery?.result !== 'SELECTED') return false;
        } else if (selectedLotteryFilter === 'WAITING') {
          if (b.lottery?.result !== 'WAITING') return false;
        } else if (selectedLotteryFilter === 'HAS_LOTTERY') {
          if (!b.lottery?.lotteryNumber) return false;
        } else if (selectedLotteryFilter === 'NO_LOTTERY') {
          if (b.lottery?.lotteryNumber) return false;
        }
      }

      return true;
    });
  }, [
    beneficiaries,
    searchTerm,
    selectedSite,
    selectedAcceptance,
    selectedPayment10,
    selectedLoanStatus,
    selectedLotteryFilter,
    initialStageFilter
  ]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBeneficiaries.slice(start, start + pageSize);
  }, [filteredBeneficiaries, currentPage]);

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`तुम्ही ${name} या लाभार्थ्याची नोंद डेटाबेसमधून हटवू इच्छिता का?`)) {
      deleteBeneficiary(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>{customTitle || 'लाभार्थी मास्टर यादी (Complete Beneficiary List)'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              मास्टर डेटाबेसमधील सर्व लाभार्थ्यांची संपूर्ण माहिती, सोडत, हप्ता स्थिती व घर तपशील.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="list-export-excel-btn"
              onClick={() => exportToExcel(filteredBeneficiaries)}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-xl text-xs transition"
              title="सध्याची यादी एक्सेलमध्ये एक्सपोर्ट करा"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel Export ({filteredBeneficiaries.length})</span>
            </button>

            <button
              type="button"
              id="list-print-btn"
              onClick={() => onOpenPrint()}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट (Print List)</span>
            </button>

            <button
              type="button"
              id="list-add-new-btn"
              onClick={onAddNewBeneficiary}
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>नवीन लाभार्थी जोडा</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="नाव, अर्ज क्र., किंवा मोबाईलने शोधा..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedSite}
              onChange={(e) => {
                setSelectedSite(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            >
              <option value="ALL">सर्व प्रकल्प (All Sites)</option>
              <option value="Padegaon">पडेगाव गट नं. ६९</option>
              <option value="225">तिसगाव गट नं. २२५/१</option>
              <option value="227">तिसगाव गट नं. २२७/१</option>
            </select>
          </div>

          <div>
            <select
              value={selectedAcceptance}
              onChange={(e) => {
                setSelectedAcceptance(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            >
              <option value="ALL">स्वीकृती: सर्व</option>
              <option value="ACCEPT">ACCEPT (स्वीकृत)</option>
              <option value="REJECT">REJECT (नाकारलेले)</option>
              <option value="NO RESPONSE">NO RESPONSE (प्रतिसाद नाही)</option>
              <option value="PENDING">PENDING (प्रलंबित)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPayment10}
              onChange={(e) => {
                setSelectedPayment10(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
            >
              <option value="ALL">१०% हप्ता: सर्व</option>
              <option value="PAID">१०% PAID (भरले)</option>
              <option value="PENDING">१०% PENDING (बाकी)</option>
              <option value="REJECT">१०% REJECT</option>
              <option value="NO RESPONSE">१०% NO RESPONSE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {beneficiaries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              डेटाबेसमध्ये सध्या कोणताही लाभार्थी नाही
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              आपल्या एक्सेल फाईलचा वापर करून एका क्लिकवर सर्व फॉर्म लाभार्थी मास्टर डेटाबेसमध्ये इंपोर्ट करा.
            </p>
            <button
              type="button"
              onClick={onOpenExcelUpload}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Import करा</span>
            </button>
          </div>
        ) : filteredBeneficiaries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            निवडलेल्या फिल्टरनुसार कोणताही लाभार्थी आढळला नाही. कृपया फिल्टर बदला.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-10">क्र.</th>
                  <th className="p-3">अर्ज क्रमांक</th>
                  <th className="p-3">लाभार्थ्याचे नाव व पती/वडिलांचे नाव</th>
                  <th className="p-3">मोबाईल</th>
                  <th className="p-3">प्रकल्प / जागा (गट नं.)</th>
                  <th className="p-3">घर / फ्लॅट क्र.</th>
                  <th className="p-3">सोडत निकाल</th>
                  <th className="p-3">घर किंमत</th>
                  <th className="p-3">स्वीकृती</th>
                  <th className="p-3">१०% हप्ता</th>
                  <th className="p-3">२०% / कर्ज</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.map((b, index) => {
                  const financials = calculateBeneficiaryFinancials(b);
                  const stage = computeStageLabel(b);
                  const serialNo = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setActiveBeneficiary(b)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="p-3 text-slate-400 font-mono text-center">
                        {serialNo}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {b.applicationNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.beneficiaryName}</div>
                        {b.fatherSpouseName && (
                          <div className="text-[11px] text-slate-500">
                            {b.fatherSpouseName}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                        {b.mobileNumber || '-'}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{b.projectSite}</div>
                        <div className="text-[10px] text-slate-400">गट नं. {b.groupNumber}</div>
                      </td>
                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        {b.flatHouseNumber ? (
                          <span className="font-bold">
                            {b.buildingNumber ? `${b.buildingNumber}-` : ''}
                            {b.flatHouseNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">वाटप बाकी</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {b.lottery?.result === 'SELECTED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {b.lottery.lotteryNumber || 'सोडत'}: निवड
                          </span>
                        ) : b.lottery?.result === 'WAITING' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {b.lottery.lotteryNumber || 'सोडत'}: प्रतीक्षा
                          </span>
                        ) : b.lottery?.result === 'NOT_SELECTED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            {b.lottery.lotteryNumber || 'सोडत'}: नाही
                          </span>
                        ) : b.lottery?.lotteryNumber ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {b.lottery.lotteryNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">
                          ₹{financials.houseCost.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          १०%: ₹{financials.amount10Percent.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.payment10Percent.status === 'PAID'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {b.payment10Percent.status}
                        </span>
                        {b.payment10Percent.status === 'PAID' && b.payment10Percent.receiptNo && (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {b.payment10Percent.receiptNo}
                          </div>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stage.color}`}
                        >
                          {b.loanProcess.status !== 'NOT APPLICABLE'
                            ? b.loanProcess.status
                            : b.payment20Percent.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveBeneficiary(b);
                            }}
                            className="p-1.5 text-slate-600 hover:text-amber-700 rounded-lg hover:bg-slate-100"
                            title="Profile पहा"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, b.id, b.beneficiaryName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="नोंद हटवा"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Bar */}
        {filteredBeneficiaries.length > pageSize && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              एकूण {filteredBeneficiaries.length} पैकी {(currentPage - 1) * pageSize + 1} ते{' '}
              {Math.min(currentPage * pageSize, filteredBeneficiaries.length)} लाभार्थी दाखवत आहे.
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50"
              >
                मागे (Prev)
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50"
              >
                पुढे (Next)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
