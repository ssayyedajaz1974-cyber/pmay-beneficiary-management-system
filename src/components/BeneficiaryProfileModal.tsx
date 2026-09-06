import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit2,
  Save,
  User,
  Phone,
  FileText,
  Building,
  CreditCard,
  Landmark,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  IndianRupee,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  BeneficiaryRecord,
  PROJECT_SITES,
  calculateBeneficiaryFinancials,
  computeStageLabel,
  AcceptanceStatusType,
  Payment10StatusType,
  Payment20StatusType,
  Payment20Mode,
  LoanStatusType
} from '../types/pmay';
import { useBeneficiary } from '../context/BeneficiaryContext';

interface BeneficiaryProfileModalProps {
  beneficiary: BeneficiaryRecord;
  onClose: () => void;
  onOpenPrint: (b: BeneficiaryRecord) => void;
}

export const BeneficiaryProfileModal: React.FC<BeneficiaryProfileModalProps> = ({
  beneficiary,
  onClose,
  onOpenPrint
}) => {
  const { updateBeneficiary, updateAcceptance, updatePayment10, updatePayment20, updateLoanProcess } =
    useBeneficiary();

  const [activeTab, setActiveTab] = useState<
    'basic' | 'acceptance' | 'payment10' | 'payment20' | 'loan' | 'documents' | 'excel'
  >('basic');

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryName: beneficiary.beneficiaryName,
    fatherSpouseName: beneficiary.fatherSpouseName,
    mobileNumber: beneficiary.mobileNumber,
    applicationNumber: beneficiary.applicationNumber,
    projectSite: beneficiary.projectSite,
    groupNumber: beneficiary.groupNumber,
    buildingNumber: beneficiary.buildingNumber,
    wing: beneficiary.wing,
    floor: beneficiary.floor,
    flatHouseNumber: beneficiary.flatHouseNumber,
    generalRemarks: beneficiary.generalRemarks
  });

  // Acceptance local state
  const [accStatus, setAccStatus] = useState<AcceptanceStatusType>(beneficiary.acceptance.status);
  const [accDate, setAccDate] = useState(beneficiary.acceptance.date || '');
  const [accRemarks, setAccRemarks] = useState(beneficiary.acceptance.remarks || '');

  // 10% Payment local state
  const [p10Status, setP10Status] = useState<Payment10StatusType>(beneficiary.payment10Percent.status);
  const [p10Amount, setP10Amount] = useState(beneficiary.payment10Percent.amount);
  const [p10Date, setP10Date] = useState(beneficiary.payment10Percent.paymentDate || '');
  const [p10Txn, setP10Txn] = useState(beneficiary.payment10Percent.transactionRef || '');
  const [p10Receipt, setP10Receipt] = useState(beneficiary.payment10Percent.receiptNo || '');
  const [p10Remarks, setP10Remarks] = useState(beneficiary.payment10Percent.remarks || '');

  // 20% Payment local state
  const [p20Mode, setP20Mode] = useState<Payment20Mode>(beneficiary.payment20Percent.mode);
  const [p20Status, setP20Status] = useState<Payment20StatusType>(beneficiary.payment20Percent.status);
  const [p20Amount, setP20Amount] = useState(beneficiary.payment20Percent.amount);
  const [p20Date, setP20Date] = useState(beneficiary.payment20Percent.paymentDate || '');
  const [p20Txn, setP20Txn] = useState(beneficiary.payment20Percent.transactionRef || '');
  const [p20Receipt, setP20Receipt] = useState(beneficiary.payment20Percent.receiptNo || '');
  const [p20Remarks, setP20Remarks] = useState(beneficiary.payment20Percent.remarks || '');

  // Loan Process local state
  const [loanStatus, setLoanStatus] = useState<LoanStatusType>(beneficiary.loanProcess.status);
  const [loanBank, setLoanBank] = useState(beneficiary.loanProcess.bankName || '');
  const [loanBranch, setLoanBranch] = useState(beneficiary.loanProcess.bankBranch || '');
  const [loanFileSentDate, setLoanFileSentDate] = useState(beneficiary.loanProcess.fileSentDate || '');
  const [loanFileNo, setLoanFileNo] = useState(beneficiary.loanProcess.loanFileNumber || '');
  const [loanAmt, setLoanAmt] = useState(beneficiary.loanProcess.loanAmount || 0);
  const [loanSanctionDate, setLoanSanctionDate] = useState(beneficiary.loanProcess.sanctionDate || '');
  const [loanRejReason, setLoanRejReason] = useState(beneficiary.loanProcess.rejectionReason || '');
  const [loanRejRemarks, setLoanRejRemarks] = useState(beneficiary.loanProcess.rejectionRemarks || '');
  const [loanRejDate, setLoanRejDate] = useState(beneficiary.loanProcess.rejectionDate || '');
  const [loanBankRemarks, setLoanBankRemarks] = useState(beneficiary.loanProcess.bankRemarks || '');
  const [loanStaffRemarks, setLoanStaffRemarks] = useState(beneficiary.loanProcess.staffRemarks || '');
  const [loanImportantRemarks, setLoanImportantRemarks] = useState(beneficiary.loanProcess.importantRemarks || '');

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const financials = calculateBeneficiaryFinancials(beneficiary);
  const stageInfo = computeStageLabel(beneficiary);

  const showSavedNotification = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleSaveBasic = () => {
    updateBeneficiary(beneficiary.id, formData);
    setIsEditingBasic(false);
    showSavedNotification('प्राथमिक माहिती यशस्वीरित्या सेव्ह झाली.');
  };

  const handleSaveAcceptance = () => {
    updateAcceptance(beneficiary.id, accStatus, accDate, accRemarks);
    showSavedNotification('स्वीकृती स्थिती यशस्वीरित्या सेव्ह झाली.');
  };

  const handleSavePayment10 = () => {
    updatePayment10(beneficiary.id, {
      status: p10Status,
      amount: Number(p10Amount),
      paymentDate: p10Date,
      transactionRef: p10Txn,
      receiptNo: p10Receipt,
      remarks: p10Remarks
    });
    showSavedNotification('१०% हप्ता माहिती सेव्ह झाली.');
  };

  const handleSavePayment20 = () => {
    updatePayment20(beneficiary.id, {
      mode: p20Mode,
      status: p20Status,
      amount: Number(p20Amount),
      paymentDate: p20Date,
      transactionRef: p20Txn,
      receiptNo: p20Receipt,
      remarks: p20Remarks
    });
    showSavedNotification('२०% हप्ता माहिती सेव्ह झाली.');
  };

  const handleSaveLoan = () => {
    updateLoanProcess(beneficiary.id, {
      status: loanStatus,
      bankName: loanBank,
      bankBranch: loanBranch,
      fileSentDate: loanFileSentDate,
      loanFileNumber: loanFileNo,
      loanAmount: Number(loanAmt),
      sanctionDate: loanSanctionDate,
      rejectionReason: loanRejReason,
      rejectionRemarks: loanRejRemarks,
      rejectionDate: loanRejDate,
      bankRemarks: loanBankRemarks,
      staffRemarks: loanStaffRemarks,
      importantRemarks: loanImportantRemarks
    });
    showSavedNotification('कर्ज प्रक्रिया माहिती सेव्ह झाली.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                {beneficiary.applicationNumber}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${stageInfo.color}`}
              >
                {stageInfo.stage}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              {beneficiary.beneficiaryName}
              {beneficiary.fatherSpouseName && (
                <span className="text-sm font-normal text-slate-400">
                  ({beneficiary.fatherSpouseName})
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <span>{beneficiary.projectSite}</span>
              <span>•</span>
              <span>मोबाईल: {beneficiary.mobileNumber || 'उपलब्ध नाही'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="profile-print-btn"
              onClick={() => onOpenPrint(beneficiary)}
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>A4 प्रिंट काढा</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Automatic Financial Breakdown Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">एकूण घर किंमत:</span>
            <span className="font-bold text-slate-900 text-sm">
              ₹{financials.houseCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">१०% रक्कम (Full Cost):</span>
            <span className="font-bold text-blue-700 text-sm">
              ₹{financials.amount10Percent.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {beneficiary.payment10Percent.status === 'PAID' ? '✓ भरले' : 'प्रलंबित'}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">२०% रक्कम (Full Cost):</span>
            <span className="font-bold text-indigo-700 text-sm">
              ₹{financials.amount20Percent.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {beneficiary.payment20Percent.status === 'PAID' ? '✓ भरले' : 'किंवा कर्ज'}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">शासकीय अनुदान:</span>
            <span className="font-bold text-emerald-700 text-sm">
              ₹{financials.subsidyAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block">शेवटी वजा होईल</span>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-slate-500 block text-[11px]">अंदाजे शिल्लक रक्कम:</span>
            <span className="font-bold text-amber-800 text-sm">
              ₹{financials.balancePayable.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block">अनुदान वजा करून</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 overflow-x-auto text-xs font-semibold text-slate-600 gap-1 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'basic'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            प्राथमिक व घराची माहिती
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acceptance')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'acceptance'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            स्वीकृती (Acceptance)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment10')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'payment10'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            १०% हप्ता (10% Payment)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment20')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'payment20'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            २०% हप्ता (20% Payment)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loan')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'loan'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            कर्ज प्रक्रिया (Loan)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
              activeTab === 'documents'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            कागदपत्रे (Docs)
          </button>

          {Object.keys(beneficiary.rawExcelData || {}).length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition ${
                activeTab === 'excel'
                  ? 'border-amber-500 text-amber-700 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              एक्सेल मूळ माहिती ({Object.keys(beneficiary.rawExcelData).length})
            </button>
          )}
        </div>

        {/* Success message banner */}
        {savedSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Basic & Housing Details */}
          {activeTab === 'basic' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  लाभार्थ्याची वैयक्तिक व घराची माहिती
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingBasic) handleSaveBasic();
                    else setIsEditingBasic(true);
                  }}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isEditingBasic
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isEditingBasic ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                  <span>{isEditingBasic ? 'बदल सेव्ह करा' : 'माहिती संपादित करा'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    लाभार्थ्याचे नाव (Beneficiary Name)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    पती / वडिलांचे नाव (Father / Husband Name)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.fatherSpouseName}
                    onChange={(e) => setFormData({ ...formData, fatherSpouseName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    अर्ज क्रमांक (Application Number)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.applicationNumber}
                    onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    मोबाईल नंबर (Mobile Number)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                {/* Project Site Selector */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    प्रकल्प / जागा (Project / Site)
                  </label>
                  {isEditingBasic ? (
                    <select
                      value={formData.projectSite}
                      onChange={(e) => {
                        const selectedSite = e.target.value;
                        const grp = selectedSite.includes('225')
                          ? '225/1'
                          : selectedSite.includes('227')
                          ? '227/1'
                          : '69';
                        setFormData({
                          ...formData,
                          projectSite: selectedSite,
                          groupNumber: grp
                        });
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      {PROJECT_SITES.map((site) => (
                        <option key={site.id} value={site.nameEnglish}>
                          {site.nameMarathi} (किंमत: ₹{site.houseCost.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium">
                      {formData.projectSite}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    गट क्रमांक (Group Number)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.groupNumber}
                    onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    इमारत क्रमांक (Building Number)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.buildingNumber}
                    onChange={(e) => setFormData({ ...formData, buildingNumber: e.target.value })}
                    placeholder="उदा. Building A"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">विंग (Wing)</label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.wing}
                    onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                    placeholder="उदा. Wing 1"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">मजला (Floor)</label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="उदा. 2nd Floor"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    सदनिका / घर क्र. (Flat / House Number)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingBasic}
                    value={formData.flatHouseNumber}
                    onChange={(e) => setFormData({ ...formData, flatHouseNumber: e.target.value })}
                    placeholder="उदा. 204"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  सामान्य शेरा (General Remarks)
                </label>
                <textarea
                  disabled={!isEditingBasic}
                  value={formData.generalRemarks}
                  onChange={(e) => setFormData({ ...formData, generalRemarks: e.target.value })}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-50 text-slate-900"
                  placeholder="काही विशेष नोंद असल्यास येथे नमूद करा..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: Acceptance Process */}
          {activeTab === 'acceptance' && (
            <div className="space-y-4 text-xs max-w-xl">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  लाभार्थी स्वीकृती प्रक्रिया (Acceptance Process)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  प्राथमिक फॉर्म लिस्ट मधील लाभार्थ्याची स्वीकृती निश्चित करा.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    स्वीकृती स्थिती (Status):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['PENDING', 'ACCEPT', 'REJECT', 'NO RESPONSE'] as AcceptanceStatusType[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAccStatus(st)}
                          className={`py-2 px-3 rounded-lg font-semibold text-center border transition ${
                            accStatus === st
                              ? st === 'ACCEPT'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : st === 'REJECT'
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : st === 'NO RESPONSE'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'ACCEPT'
                            ? 'ACCEPT'
                            : st === 'REJECT'
                            ? 'REJECT'
                            : st === 'NO RESPONSE'
                            ? 'NO RESPONSE'
                            : 'PENDING'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    स्वीकृती / संपर्क दिनांक (Date):
                  </label>
                  <input
                    type="date"
                    value={accDate}
                    onChange={(e) => setAccDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    आवश्यक शेरा (Remarks):
                  </label>
                  <textarea
                    value={accRemarks}
                    onChange={(e) => setAccRemarks(e.target.value)}
                    rows={3}
                    placeholder="उदा. लाभार्थीशी दूरध्वनीवरून संपर्क झाला, कागदपत्रांची पूर्तता करण्यास सहमती दर्शवली..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveAcceptance}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition"
                >
                  स्वीकृती बदल सेव्ह करा
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 10% Payment Process */}
          {activeTab === 'payment10' && (
            <div className="space-y-4 text-xs max-w-xl">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  १०% हप्ता भरण्याची प्रक्रिया (10% Payment Process)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  स्वीकृत (ACCEPT) झालेल्या लाभार्थ्यांसाठी पूर्ण घराच्या किमतीवर १०% रक्कम भरण्याची नोंद.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                  <div className="flex justify-between items-center">
                    <span>नियोजित १०% रक्कम:</span>
                    <strong className="text-base font-bold">
                      ₹{financials.amount10Percent.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <span className="text-[11px] text-blue-700 block mt-0.5">
                    (पूर्ण घर किंमत ₹{financials.houseCost.toLocaleString('en-IN')} वर आधारित)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    १०% पेमेंट स्थिती (Payment Status):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['PENDING', 'PAID', 'REJECT', 'NO RESPONSE'] as Payment10StatusType[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setP10Status(st)}
                          className={`py-2 px-2.5 rounded-lg font-semibold text-center border transition ${
                            p10Status === st
                              ? st === 'PAID'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st === 'REJECT'
                                ? 'bg-red-600 text-white border-red-600'
                                : st === 'NO RESPONSE'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      भरलेली रक्कम (Amount in ₹):
                    </label>
                    <input
                      type="number"
                      value={p10Amount}
                      onChange={(e) => setP10Amount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      पेमेंट दिनांक (Payment Date):
                    </label>
                    <input
                      type="date"
                      value={p10Date}
                      onChange={(e) => setP10Date(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      पावती क्रमांक (Receipt Number):
                    </label>
                    <input
                      type="text"
                      value={p10Receipt}
                      onChange={(e) => setP10Receipt(e.target.value)}
                      placeholder="उदा. RCP-2025-0012"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      व्यवहार / संदर्भ क्र. (Transaction / Ref No):
                    </label>
                    <input
                      type="text"
                      value={p10Txn}
                      onChange={(e) => setP10Txn(e.target.value)}
                      placeholder="उदा. UTR / Challan / DD No"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">शेरा (Remarks):</label>
                  <textarea
                    value={p10Remarks}
                    onChange={(e) => setP10Remarks(e.target.value)}
                    rows={2}
                    placeholder="१०% पेमेंट बाबत आवश्यक तपशील..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePayment10}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition"
                >
                  १०% पेमेंट तपशील सेव्ह करा
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: 20% Payment Process */}
          {activeTab === 'payment20' && (
            <div className="space-y-4 text-xs max-w-xl">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  २०% हप्ता प्रक्रिया (20% Payment Process)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  ज्या लाभार्थ्यांनी १०% भरले आहे त्यांच्यासाठी २०% रक्कम थेट भरणे किंवा बँक कर्जाची निवड.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900">
                  <div className="flex justify-between items-center">
                    <span>नियोजित २०% रक्कम:</span>
                    <strong className="text-base font-bold">
                      ₹{financials.amount20Percent.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <span className="text-[11px] text-indigo-700 block mt-0.5">
                    (पूर्ण घर किंमत ₹{financials.houseCost.toLocaleString('en-IN')} वर आधारित)
                  </span>
                </div>

                {/* Option: 20% Direct Payment or Loan Process */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    प्रक्रियेचा प्रकार निवडा (Option):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setP20Mode('20% PAYMENT')}
                      className={`p-3 rounded-lg border text-left font-bold transition ${
                        p20Mode === '20% PAYMENT'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div>२०% थेट पेमेंट (20% PAYMENT)</div>
                      <div className="text-[11px] font-normal opacity-80 mt-0.5">
                        लाभार्थी स्वतः २०% रक्कम भरणार
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setP20Mode('LOAN PROCESS');
                        setActiveTab('loan');
                      }}
                      className={`p-3 rounded-lg border text-left font-bold transition ${
                        p20Mode === 'LOAN PROCESS'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div>बँक कर्ज प्रक्रिया (LOAN PROCESS)</div>
                      <div className="text-[11px] font-normal opacity-80 mt-0.5">
                        बँकेमार्फत कर्ज प्रकरण केले जाईल
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    २०% पेमेंट स्थिती (Status):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['PENDING', 'PAID', 'NOT APPLICABLE'] as Payment20StatusType[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setP20Status(st)}
                        className={`py-2 px-2.5 rounded-lg font-semibold text-center border transition ${
                          p20Status === st
                            ? st === 'PAID'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      भरलेली रक्कम (Amount in ₹):
                    </label>
                    <input
                      type="number"
                      value={p20Amount}
                      onChange={(e) => setP20Amount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">पेमेंट दिनांक:</label>
                    <input
                      type="date"
                      value={p20Date}
                      onChange={(e) => setP20Date(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">पावती क्रमांक:</label>
                    <input
                      type="text"
                      value={p20Receipt}
                      onChange={(e) => setP20Receipt(e.target.value)}
                      placeholder="उदा. RCP-2025-0098"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      व्यवहार / संदर्भ क्रमांक:
                    </label>
                    <input
                      type="text"
                      value={p20Txn}
                      onChange={(e) => setP20Txn(e.target.value)}
                      placeholder="उदा. UTR / Cheque No"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">शेरा (Remarks):</label>
                  <textarea
                    value={p20Remarks}
                    onChange={(e) => setP20Remarks(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    placeholder="२०% हप्त्याबाबत नोंद..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSavePayment20}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition"
                >
                  २०% पेमेंट तपशील सेव्ह करा
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Loan Process */}
          {activeTab === 'loan' && (
            <div className="space-y-4 text-xs max-w-xl">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  बँक कर्ज प्रक्रिया (Loan Process)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  कर्ज मंजुरी, बँकेकडे फाईल पाठवणे, किंवा कर्ज नाकारल्यास कारण व दिनांक नोंद.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    कर्ज स्थिती (Loan Status):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'NOT APPLICABLE',
                      'File Sent to Bank',
                      'Under Process',
                      'Loan Approved',
                      'Loan Rejected'
                    ].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setLoanStatus(st as LoanStatusType)}
                        className={`py-2 px-2.5 rounded-lg font-semibold text-center border transition ${
                          loanStatus === st
                            ? st === 'Loan Approved'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : st === 'Loan Rejected'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : st === 'Under Process' || st === 'File Sent to Bank'
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      बँकेचे नाव (Bank Name):
                    </label>
                    <input
                      type="text"
                      value={loanBank}
                      onChange={(e) => setLoanBank(e.target.value)}
                      placeholder="उदा. State Bank of India, HDFC"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      बँक शाखा (Branch):
                    </label>
                    <input
                      type="text"
                      value={loanBranch}
                      onChange={(e) => setLoanBranch(e.target.value)}
                      placeholder="उदा. छावणी शाखा, क्रांती चौक"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      कर्ज अर्ज / फाईल क्र. (File Number):
                    </label>
                    <input
                      type="text"
                      value={loanFileNo}
                      onChange={(e) => setLoanFileNo(e.target.value)}
                      placeholder="उदा. SBI/2024/CSN/1042"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      बँकेत फाईल पाठवल्याचा दिनांक:
                    </label>
                    <input
                      type="date"
                      value={loanFileSentDate}
                      onChange={(e) => setLoanFileSentDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      कर्ज रक्कम (Loan Amount in ₹):
                    </label>
                    <input
                      type="number"
                      value={loanAmt}
                      onChange={(e) => setLoanAmt(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">बँक शेरा (Bank Remarks):</label>
                    <input
                      type="text"
                      value={loanBankRemarks}
                      onChange={(e) => setLoanBankRemarks(e.target.value)}
                      placeholder="बँकेने दिलेला शेरा"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">कर्मचारी शेरा (Staff Remarks):</label>
                    <input
                      type="text"
                      value={loanStaffRemarks}
                      onChange={(e) => setLoanStaffRemarks(e.target.value)}
                      placeholder="कर्मचारी किंवा कार्यालयीन शेरा"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">महत्त्वाचा शेरा (Important Remarks):</label>
                  <textarea
                    rows={2}
                    value={loanImportantRemarks}
                    onChange={(e) => setLoanImportantRemarks(e.target.value)}
                    placeholder="इतर कोणतीही महत्त्वाची माहिती..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                {loanStatus === 'Loan Approved' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      कर्ज मंजुरी दिनांक (Sanction Date):
                    </label>
                    <input
                      type="date"
                      value={loanSanctionDate}
                      onChange={(e) => setLoanSanctionDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                )}

                {loanStatus === 'Loan Rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                    <div>
                      <label className="block text-red-900 font-semibold mb-1">
                        कर्ज नाकारण्याचे कारण (Rejection Reason):
                      </label>
                      <input
                        type="text"
                        value={loanRejReason}
                        onChange={(e) => setLoanRejReason(e.target.value)}
                        placeholder="उदा. CIBIL Score कमी, उत्पन्न पुरावा अपुरा..."
                        className="w-full p-2 bg-white border border-red-300 rounded-lg text-red-900"
                      />
                    </div>

                    <div>
                      <label className="block text-red-900 font-semibold mb-1">
                        नाकारल्याचा दिनांक (Rejection Date):
                      </label>
                      <input
                        type="date"
                        value={loanRejDate}
                        onChange={(e) => setLoanRejDate(e.target.value)}
                        className="w-full p-2 bg-white border border-red-300 rounded-lg text-red-900"
                      />
                    </div>

                    <div>
                      <label className="block text-red-900 font-semibold mb-1">
                        नाकारल्याबाबत शेरा (Rejection Remarks):
                      </label>
                      <textarea
                        value={loanRejRemarks}
                        onChange={(e) => setLoanRejRemarks(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white border border-red-300 rounded-lg text-red-900"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveLoan}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg transition"
                >
                  कर्ज प्रक्रिया बदल सेव्ह करा
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  कागदपत्रे पडताळणी स्थिती (Documents Checklist)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  लाभार्थ्याकडून जमा झालेली अधिकृत कागदपत्रे व शेरा.
                </p>
              </div>

              <div className="space-y-2">
                {beneficiary.documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{doc.name}</span>
                      {doc.remarks && (
                        <p className="text-slate-500 text-[11px] mt-0.5">{doc.remarks}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {(['Pending', 'Received', 'Verified'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            const updatedDocs = beneficiary.documents.map((d, i) =>
                              i === idx ? { ...d, status: st } : d
                            );
                            updateBeneficiary(beneficiary.id, { documents: updatedDocs });
                            showSavedNotification('कागदपत्र स्थिती अपडेट झाली.');
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                            doc.status === st
                              ? st === 'Verified'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st === 'Received'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'Verified' ? 'तपासले (Verified)' : st === 'Received' ? 'प्राप्त (Received)' : 'प्रलंबित (Pending)'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Original Excel Data & Stage History */}
          {activeTab === 'excel' && (
            <div className="space-y-5 text-xs">
              {/* File source & Stage History */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>आयात केलेली Excel फाईल:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    {beneficiary.importedFileName || 'Manual Entry'}
                  </span>
                </div>

                {beneficiary.stageHistory && beneficiary.stageHistory.length > 0 && (
                  <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                    <div className="font-semibold text-slate-700 text-[11px]">
                      स्टेज इतिहास व प्रगती (Stage Progression History):
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {beneficiary.stageHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2 rounded-lg border border-amber-100 flex items-start justify-between text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{item.stage}</span>
                            <span className="text-slate-500 ml-2">{item.note}</span>
                          </div>
                          <span className="text-slate-400 text-[10px] shrink-0">
                            {item.timestamp?.split('T')[0]} {item.timestamp?.split('T')[1]?.slice(0, 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    एक्सेल फाईलमधील मूळ माहिती (Original Raw Excel Record)
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    आपल्या एक्सेल स्प्रेडशीटमधील सर्व मूळ कॉलम आणि त्यांचे मूल्य जसेच्या तसे जतन केले आहे.
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                  {Object.keys(beneficiary.rawExcelData || {}).length} Columns
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.entries(beneficiary.rawExcelData || {}).map(([key, val], idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="text-[11px] font-semibold text-slate-500 block truncate" title={key}>
                      {key}
                    </span>
                    <span className="text-slate-900 font-medium block mt-0.5 break-words">
                      {val !== undefined && val !== null && String(val).trim() !== ''
                        ? String(val)
                        : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            नोंदणी दिनांक: {beneficiary.createdAt?.split('T')[0] || 'N/A'} • शेवटचा बदल:{' '}
            {beneficiary.updatedAt?.split('T')[0] || 'N/A'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
