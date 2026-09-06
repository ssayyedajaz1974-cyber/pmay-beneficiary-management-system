import React from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Wallet,
  Landmark,
  FileSpreadsheet,
  ArrowRight,
  Building2,
  Search,
  PlusCircle,
  FileText,
  CheckSquare,
  Percent,
  Upload,
  Ticket
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { PROJECT_SITES, GOVT_SUBSIDY_AMOUNT, computeStageLabel, STAGE_METAS } from '../types/pmay';

interface DashboardProps {
  onOpenExcelUpload: () => void;
  onAddNewBeneficiary: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenExcelUpload,
  onAddNewBeneficiary
}) => {
  const { beneficiaries, stats, setCurrentNav, setActiveBeneficiary, importedFilesList } = useBeneficiary();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold mb-2">
            <span>महानगरपालिका छत्रपती संभाजीनगर</span>
            <span>•</span>
            <span>अंतर्गत लाभार्थी प्रणाली</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            लाभार्थी व्यवस्थापन डॅशबोर्ड
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            PMAY शहरी अंतर्गत सर्व लाभार्थ्यांची स्वीकृती, १०% व २०% हप्ता, बँक कर्ज प्रक्रिया आणि
            कागदपत्रे व्यवस्थापनाची अद्ययावत माहिती.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="dash-upload-excel-btn"
            onClick={onOpenExcelUpload}
            className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{beneficiaries.length === 0 ? 'Excel फाईल इंपोर्ट करा' : 'नवीन Excel डेटा जोडा'}</span>
          </button>

          <button
            type="button"
            id="dash-add-new-btn"
            onClick={onAddNewBeneficiary}
            className="inline-flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>मॅन्युअल लाभार्थी जोडा</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if no Excel data imported yet */}
      {beneficiaries.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">
            सध्या कोणताही लाभार्थी डेटा उपलब्ध नाही (No Beneficiaries in Database)
          </h3>
          <p className="text-xs text-amber-800 max-w-xl mx-auto">
            आपल्याकडील PMAY फॉर्म भरलेल्या लाभार्थ्यांची प्राथमिक Excel फाईल येथे इंपोर्ट करा. एकदा इंपोर्ट
            केल्यानंतर सर्व डेटा ॲप्लिकेशनमध्ये कायमस्वरूपी सेव्ह होईल व पुढील सर्व प्रक्रिया ॲप्लिकेशनमधूनच करता येईल.
          </p>
          <button
            type="button"
            onClick={onOpenExcelUpload}
            className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>माझी Excel फाईल अपलोड करा (Import Excel)</span>
          </button>
        </div>
      )}

      {/* 5-Stage Sequential Workflow Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>५ टप्प्यांची कार्यप्रणाली (PMAY 5-Stage Sequential Workflow)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Excel फाईलच्या नावानुसार किंवा मॅन्युअल नोंदणीनुसार लाभार्थ्यांची टप्पानिहाय विभागणी:
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            टप्प्यावर क्लिक करून संबंधित यादी उघडा
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Step 1: New Forms Filled */}
          <div
            onClick={() => setCurrentNav('newForms')}
            className="group cursor-pointer p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                टप्पा १
              </span>
              <FileText className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900">नवीन अर्ज (Form Filled)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">प्राथमिक भरलेले फॉर्म</div>
            <div className="mt-2 text-xl font-black text-amber-900 font-mono">
              {stats.newFormsCount}
            </div>
          </div>

          {/* Step 2: Lottery / Lucky Draw */}
          <div
            onClick={() => setCurrentNav('lottery')}
            className="group cursor-pointer p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100/60 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded">
                टप्पा २
              </span>
              <Ticket className="w-4 h-4 text-rose-600 group-hover:scale-110 transition" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900">सोडत (Lottery)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">लकी ड्रॉ निवड यादी</div>
            <div className="mt-2 text-xl font-black text-rose-900 font-mono flex items-baseline gap-1">
              <span>{stats.lotterySelected}</span>
              <span className="text-xs font-normal text-rose-600">/ {stats.lotteryTotal}</span>
            </div>
          </div>

          {/* Step 3: Acceptance Process */}
          <div
            onClick={() => setCurrentNav('acceptance')}
            className="group cursor-pointer p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                टप्पा ३
              </span>
              <CheckSquare className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900">स्वीकृती (Acceptance)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">संमती मिळालेले लाभार्थी</div>
            <div className="mt-2 text-xl font-black text-emerald-900 font-mono">
              {stats.accepted}
            </div>
          </div>

          {/* Step 4: 10% Payment */}
          <div
            onClick={() => setCurrentNav('payment10')}
            className="group cursor-pointer p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-200/80 px-2 py-0.5 rounded">
                टप्पा ४
              </span>
              <Percent className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900">१०% हप्ता भरणा</div>
            <div className="text-[11px] text-slate-500 mt-0.5">१०% रक्कम भरलेले</div>
            <div className="mt-2 text-xl font-black text-blue-900 font-mono">
              {stats.payment10Paid}
            </div>
          </div>

          {/* Step 5: 20% Payment */}
          <div
            onClick={() => setCurrentNav('payment20')}
            className="group cursor-pointer p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/60 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-200/80 px-2 py-0.5 rounded">
                टप्पा ५
              </span>
              <Wallet className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900">२०% हप्ता भरणा</div>
            <div className="text-[11px] text-slate-500 mt-0.5">२०% थेट भरणा केलेले</div>
            <div className="mt-2 text-xl font-black text-indigo-900 font-mono">
              {stats.payment20Paid}
            </div>
          </div>

          {/* Step 6: Loan Process */}
          <div
            onClick={() => setCurrentNav('loan')}
            className="group cursor-pointer p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-100/60 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded">
                टप्पा ६
              </span>
              <Landmark className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900">बँक कर्ज प्रक्रिया</div>
            <div className="text-[11px] text-slate-500 mt-0.5">कर्ज प्रक्रियेत / मंजूर</div>
            <div className="mt-2 text-xl font-black text-purple-900 font-mono">
              {stats.loanUnderProcess + stats.loanApproved}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog of Imported Excel Files */}
      {importedFilesList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>आयात केलेल्या Excel फाईल्स (Imported Excel Catalog)</span>
              </h3>
              <p className="text-xs text-slate-500">
                प्रत्येक Excel फाईलच्या नावानुसार ओळखलेला टप्पा व समाविष्ट लाभार्थी:
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenExcelUpload}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>आणखी फाईल जोडा</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {importedFilesList.map((file, idx) => {
              const stageMeta = STAGE_METAS[file.targetStage];
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentNav(stageMeta?.navTarget || 'list')}
                  className="cursor-pointer p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50/40 hover:border-amber-300 transition space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-xs truncate group-hover:text-amber-800 font-mono" title={file.fileName}>
                      {file.fileName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${stageMeta?.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                      {stageMeta?.marathiTitle || file.targetStage}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600">
                      लाभार्थी संख्या: <strong className="font-mono text-slate-900">{file.recordCount}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {file.importedAt ? file.importedAt.split('T')[0] : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary 11 Required Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            मुख्य स्थिती आकडेवारी (Live Beneficiary Metrics)
          </h3>
          <span className="text-[11px] text-slate-400">स्वयंचलित गणना</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* 1. Total Beneficiaries */}
          <div
            onClick={() => setCurrentNav('list')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">एकूण लाभार्थी (Total)</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {stats.total}
              </span>
              <span className="text-[10px] text-slate-400">सर्व नोंदणीकृत</span>
            </div>
          </div>

          {/* 2. Accepted */}
          <div
            onClick={() => setCurrentNav('acceptance')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">स्वीकृत (Accepted)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                {stats.accepted}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">पुढील टप्प्यासाठी पात्र</span>
            </div>
          </div>

          {/* 3. Rejected */}
          <div
            onClick={() => setCurrentNav('acceptance')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-red-100 shadow-2xs hover:shadow-xs hover:border-red-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-red-800">नाकारलेले (Rejected)</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-red-700 font-mono">
                {stats.rejected}
              </span>
              <span className="text-[10px] text-red-500">अपात्र / रद्द</span>
            </div>
          </div>

          {/* 4. No Response */}
          <div
            onClick={() => setCurrentNav('acceptance')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-amber-100 shadow-2xs hover:shadow-xs hover:border-amber-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">प्रतिसाद नाही (No Response)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-amber-700 font-mono">
                {stats.noResponse}
              </span>
              <span className="text-[10px] text-amber-600">संपर्क प्रलंबित</span>
            </div>
          </div>

          {/* 5. 10% Pending */}
          <div
            onClick={() => setCurrentNav('payment10')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs hover:border-blue-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-800">१०% प्रलंबित (10% Pending)</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-blue-700 font-mono">
                {stats.payment10Pending}
              </span>
              <span className="text-[10px] text-blue-600">रक्कम भरलेली नाही</span>
            </div>
          </div>

          {/* 6. 10% Paid */}
          <div
            onClick={() => setCurrentNav('payment10')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-teal-100 shadow-2xs hover:shadow-xs hover:border-teal-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-teal-800">१०% पूर्ण (10% Paid)</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-teal-700 font-mono">
                {stats.payment10Paid}
              </span>
              <span className="text-[10px] text-teal-600">१०% भरणा जमा</span>
            </div>
          </div>

          {/* 7. 20% Pending */}
          <div
            onClick={() => setCurrentNav('payment20')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-800">२०% प्रलंबित (20% Pending)</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-indigo-700 font-mono">
                {stats.payment20Pending}
              </span>
              <span className="text-[10px] text-indigo-600">२०% भरणा बाकी</span>
            </div>
          </div>

          {/* 8. 20% Paid */}
          <div
            onClick={() => setCurrentNav('payment20')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-cyan-100 shadow-2xs hover:shadow-xs hover:border-cyan-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-cyan-800">२०% पूर्ण (20% Paid)</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-cyan-700 font-mono">
                {stats.payment20Paid}
              </span>
              <span className="text-[10px] text-cyan-600">२०% भरणा जमा</span>
            </div>
          </div>

          {/* 9. Loan Under Process */}
          <div
            onClick={() => setCurrentNav('loan')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs hover:border-purple-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-800">कर्ज प्रक्रियेत (Under Process)</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-purple-700 font-mono">
                {stats.loanUnderProcess}
              </span>
              <span className="text-[10px] text-purple-600">बँक तपासणी सुरू</span>
            </div>
          </div>

          {/* 10. Loan Approved */}
          <div
            onClick={() => setCurrentNav('loan')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">कर्ज मंजूर (Loan Approved)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                {stats.loanApproved}
              </span>
              <span className="text-[10px] text-emerald-600">बँकेकडून संमती</span>
            </div>
          </div>

          {/* 11. Loan Rejected */}
          <div
            onClick={() => setCurrentNav('loan')}
            className="cursor-pointer bg-white p-4 rounded-xl border border-rose-100 shadow-2xs hover:shadow-xs hover:border-rose-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-800">कर्ज नाकारले (Loan Rejected)</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-rose-700 font-mono">
                {stats.loanRejected}
              </span>
              <span className="text-[10px] text-rose-600">बँकेकडून रद्द</span>
            </div>
          </div>

          {/* Quick Search Card */}
          <div
            onClick={() => setCurrentNav('search')}
            className="cursor-pointer bg-slate-900 text-white p-4 rounded-xl shadow-2xs hover:bg-slate-800 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-400">लाभार्थी शोध</span>
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-slate-300 mt-2">
              नाव, अर्ज क्रमांक किंवा मोबाईलने शोधा
            </div>
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <span>शोध केंद्र उघडा</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* House Cost Rules & Projects Breakdown Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>प्रकल्प निहाय घराची किंमत व हप्ता नियमावली (House Cost & Payment Rules)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              १०% आणि २०% रक्कम ही पूर्ण House Cost वर Calculate होते. शासकीय अनुदान ₹२,५०,००० प्रति लाभार्थी शेवटी वजा होते.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
            शासकीय अनुदान: ₹२,५०,०००
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {PROJECT_SITES.map((site) => {
            const cost10 = Math.round(site.houseCost * 0.10);
            const cost20 = Math.round(site.houseCost * 0.20);
            const bal = site.houseCost - cost10 - cost20 - GOVT_SUBSIDY_AMOUNT;

            return (
              <div
                key={site.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 text-sm">{site.nameMarathi}</span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">{site.nameEnglish}</div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>House Cost:</span>
                    <strong className="font-bold text-slate-900">
                      ₹{site.houseCost.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="flex justify-between text-blue-700">
                    <span>१०% हप्ता (Full Cost):</span>
                    <strong className="font-bold font-mono">
                      ₹{cost10.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="flex justify-between text-indigo-700">
                    <span>२०% हप्ता (Full Cost):</span>
                    <strong className="font-bold font-mono">
                      ₹{cost20.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="flex justify-between text-emerald-700">
                    <span>Govt Subsidy:</span>
                    <span className="font-mono">₹२,५०,०००</span>
                  </div>

                  <div className="flex justify-between text-amber-900 pt-1 border-t border-dashed border-slate-300 font-bold">
                    <span>अंदाजे उर्वरित रक्कम:</span>
                    <span className="font-mono">₹{bal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Beneficiaries Overview */}
      {beneficiaries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                नुकतेच जोडलेले / अपडेट झालेले लाभार्थी (Recent Beneficiaries)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                कोणत्याही लाभार्थ्यावर क्लिक करून त्याचा संपूर्ण प्रोफाईल उघडा व प्रक्रिया नोंदवा.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentNav('list')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>सर्व यादी पहा ({beneficiaries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">अर्ज क्रमांक</th>
                  <th className="p-3">लाभार्थ्याचे नाव</th>
                  <th className="p-3">मोबाईल</th>
                  <th className="p-3">प्रकल्प / जागा</th>
                  <th className="p-3">स्वीकृती</th>
                  <th className="p-3">१०% हप्ता</th>
                  <th className="p-3">२०% हप्ता / कर्ज</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beneficiaries.slice(0, 6).map((b) => {
                  const stage = computeStageLabel(b);
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setActiveBeneficiary(b)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {b.applicationNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{b.beneficiaryName}</div>
                        {b.fatherSpouseName && (
                          <div className="text-[11px] text-slate-500">{b.fatherSpouseName}</div>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">{b.mobileNumber || '-'}</td>
                      <td className="p-3 text-slate-700">{b.projectSite}</td>
                      <td className="p-3">
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
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stage.color}`}
                        >
                          {stage.stage}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-amber-700 font-semibold hover:underline">
                          प्रोफाईल पहा →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
