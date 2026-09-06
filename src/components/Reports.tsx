import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Wallet,
  Landmark,
  Eye,
  Filter
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { BeneficiaryRecord, calculateBeneficiaryFinancials } from '../types/pmay';

interface ReportsProps {
  onOpenPrint: (b?: BeneficiaryRecord, reportTitle?: string) => void;
}

type ReportType =
  | 'complete'
  | 'accepted'
  | 'rejected'
  | 'no_response'
  | 'p10_paid'
  | 'p10_pending'
  | 'p20_paid'
  | 'loan_process'
  | 'loan_approved'
  | 'loan_rejected';

export const Reports: React.FC<ReportsProps> = ({ onOpenPrint }) => {
  const { beneficiaries, exportToExcel, setActiveBeneficiary } = useBeneficiary();
  const [activeReport, setActiveReport] = useState<ReportType>('complete');
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('ALL');

  const reportConfigs: {
    id: ReportType;
    titleMarathi: string;
    titleEnglish: string;
    description: string;
    filterFn: (b: BeneficiaryRecord) => boolean;
    badgeColor: string;
  }[] = [
    {
      id: 'complete',
      titleMarathi: 'संपूर्ण लाभार्थी यादी',
      titleEnglish: 'Complete Beneficiary List',
      description: 'सर्व नोंदणीकृत लाभार्थ्यांची संपूर्ण यादी',
      filterFn: () => true,
      badgeColor: 'bg-slate-100 text-slate-800'
    },
    {
      id: 'accepted',
      titleMarathi: 'स्वीकृत लाभार्थी यादी',
      titleEnglish: 'Accepted List',
      description: 'Acceptance निश्चित झालेले सर्व लाभार्थी',
      filterFn: (b) => b.acceptance.status === 'ACCEPT',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'rejected',
      titleMarathi: 'नाकारलेली लाभार्थी यादी',
      titleEnglish: 'Rejected List',
      description: 'स्वीकृती रद्द किंवा नाकारलेले लाभार्थी',
      filterFn: (b) => b.acceptance.status === 'REJECT',
      badgeColor: 'bg-red-100 text-red-800'
    },
    {
      id: 'no_response',
      titleMarathi: 'प्रतिसाद नाही यादी',
      titleEnglish: 'No Response List',
      description: 'संपर्क न झालेले किंवा प्रतिसाद न दिलेले लाभार्थी',
      filterFn: (b) => b.acceptance.status === 'NO RESPONSE',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'p10_paid',
      titleMarathi: '१०% भरलेली यादी',
      titleEnglish: '10% Paid List',
      description: '१०% हप्ता पूर्ण भरलेले लाभार्थी',
      filterFn: (b) => b.payment10Percent.status === 'PAID',
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'p10_pending',
      titleMarathi: '१०% प्रलंबित यादी',
      titleEnglish: '10% Pending List',
      description: '१०% हप्ता भरणे बाकी असलेले लाभार्थी',
      filterFn: (b) => b.payment10Percent.status === 'PENDING',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'p20_paid',
      titleMarathi: '२०% भरलेली यादी',
      titleEnglish: '20% Paid List',
      description: '२०% हप्ता थेट पूर्ण भरलेले लाभार्थी',
      filterFn: (b) => b.payment20Percent.status === 'PAID',
      badgeColor: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 'loan_process',
      titleMarathi: 'कर्ज प्रक्रियेत असलेली यादी',
      titleEnglish: 'Loan Under Process List',
      description: 'बँकेकडे फाईल पाठवलेले किंवा तपासणी चालू असलेले लाभार्थी',
      filterFn: (b) =>
        b.loanProcess.status === 'Under Process' || b.loanProcess.status === 'File Sent to Bank',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'loan_approved',
      titleMarathi: 'कर्ज मंजूर यादी',
      titleEnglish: 'Loan Approved List',
      description: 'बँकेकडून कर्ज मंजूर झालेले लाभार्थी',
      filterFn: (b) => b.loanProcess.status === 'Loan Approved',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'loan_rejected',
      titleMarathi: 'कर्ज नाकारलेली यादी',
      titleEnglish: 'Loan Rejected List',
      description: 'बँकेने कर्ज फेटाळलेले लाभार्थी',
      filterFn: (b) => b.loanProcess.status === 'Loan Rejected',
      badgeColor: 'bg-rose-100 text-rose-800'
    }
  ];

  const currentConfig =
    reportConfigs.find((r) => r.id === activeReport) || reportConfigs[0];

  const reportData = useMemo(() => {
    return beneficiaries.filter((b) => {
      // Base report filter
      if (!currentConfig.filterFn(b)) return false;

      // Site filter
      if (siteFilter !== 'ALL') {
        if (!(b.projectSite || '').toLowerCase().includes(siteFilter.toLowerCase())) {
          return false;
        }
      }

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = (b.beneficiaryName || '').toLowerCase().includes(term);
        const appMatch = (b.applicationNumber || '').toLowerCase().includes(term);
        const mobMatch = (b.mobileNumber || '').toLowerCase().includes(term);
        if (!nameMatch && !appMatch && !mobMatch) return false;
      }

      return true;
    });
  }, [beneficiaries, currentConfig, siteFilter, searchTerm]);

  const handleExport = () => {
    const filename = `PMAY_CSN_${currentConfig.id.toUpperCase()}_REPORT_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(reportData, filename);
  };

  const handlePrintReport = () => {
    onOpenPrint(undefined, currentConfig.titleMarathi);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileBarChart2 className="w-5 h-5 text-amber-600" />
              <span>प्रशासकीय अहवाल व सूची (Administrative Reports)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रक्रियेच्या प्रत्येक टप्प्यानुसार स्वतंत्र अहवाल तयार करा, Excel मध्ये एक्सपोर्ट करा किंवा A4 प्रिंट काढा.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="report-export-excel-btn"
              onClick={handleExport}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel Export ({reportData.length})</span>
            </button>

            <button
              type="button"
              id="report-print-btn"
              onClick={handlePrintReport}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 अहवाल प्रिंट करा</span>
            </button>
          </div>
        </div>

        {/* 10 Required Report Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {reportConfigs.map((cfg) => {
            const count = beneficiaries.filter(cfg.filterFn).length;
            const isSelected = activeReport === cfg.id;

            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => setActiveReport(cfg.id)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] truncate">{cfg.titleMarathi}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-amber-400 text-slate-950' : cfg.badgeColor
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {cfg.titleEnglish}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Site filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">प्रकल्प:</span>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
            >
              <option value="ALL">सर्व प्रकल्प (All Sites)</option>
              <option value="Padegaon">पडेगाव गट नं. ६९</option>
              <option value="225">तिसगाव गट नं. २२५/१</option>
              <option value="227">तिसगाव गट नं. २२७/१</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="या अहवालात शोधा..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{currentConfig.titleMarathi}</h3>
            <p className="text-[11px] text-slate-500">{currentConfig.description}</p>
          </div>
          <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700">
            एकूण {reportData.length} लाभार्थी
          </span>
        </div>

        {reportData.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            या अहवालात दाखवण्यासाठी कोणतीही नोंद आढळली नाही.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-10">क्र.</th>
                  <th className="p-3">अर्ज क्रमांक</th>
                  <th className="p-3">लाभार्थ्याचे नाव</th>
                  <th className="p-3">पती/वडिलांचे नाव</th>
                  <th className="p-3">मोबाईल</th>
                  <th className="p-3">प्रकल्प</th>
                  <th className="p-3">सदनिका/घर क्र.</th>
                  <th className="p-3">घर किंमत</th>
                  <th className="p-3">स्वीकृती स्थिती</th>
                  <th className="p-3">१०% स्थिती</th>
                  <th className="p-3">२०% / कर्ज स्थिती</th>
                  <th className="p-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((b, idx) => {
                  const fin = calculateBeneficiaryFinancials(b);

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setActiveBeneficiary(b)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {b.applicationNumber}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{b.beneficiaryName}</td>
                      <td className="p-3 text-slate-600">{b.fatherSpouseName || '-'}</td>
                      <td className="p-3 font-mono text-slate-700">{b.mobileNumber || '-'}</td>
                      <td className="p-3 text-slate-700">{b.projectSite}</td>
                      <td className="p-3 font-medium text-slate-800">
                        {b.flatHouseNumber ? `${b.buildingNumber ? `${b.buildingNumber}-` : ''}${b.flatHouseNumber}` : '-'}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₹{fin.houseCost.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">
                          {b.acceptance.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">
                          {b.payment10Percent.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">
                          {b.loanProcess.status !== 'NOT APPLICABLE'
                            ? b.loanProcess.status
                            : b.payment20Percent.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-amber-700 font-semibold hover:underline">
                          पहा →
                        </span>
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
