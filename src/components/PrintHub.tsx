import React, { useState } from 'react';
import {
  Printer,
  FileText,
  User,
  Building,
  CreditCard,
  Landmark,
  ArrowLeft,
  X,
  FileBarChart2
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import {
  BeneficiaryRecord,
  calculateBeneficiaryFinancials,
  computeStageLabel,
  GOVT_SUBSIDY_AMOUNT
} from '../types/pmay';

interface PrintHubProps {
  beneficiaryToPrint?: BeneficiaryRecord | null;
  reportTitle?: string;
  onClose?: () => void;
}

export const PrintHub: React.FC<PrintHubProps> = ({
  beneficiaryToPrint,
  reportTitle,
  onClose
}) => {
  const { beneficiaries, activeBeneficiary } = useBeneficiary();

  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    beneficiaryToPrint?.id || activeBeneficiary?.id || (beneficiaries[0]?.id || '')
  );

  const [printMode, setPrintMode] = useState<'profile' | 'report'>(
    reportTitle ? 'report' : 'profile'
  );

  const selectedBeneficiary =
    beneficiaries.find((b) => b.id === selectedBeneficiaryId) || beneficiaryToPrint || activeBeneficiary;

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Control Bar (Hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-600" />
              <span>प्रिंट केंद्र व A4 पूर्वावलोकन (Print Hub & A4 Preview)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक लाभार्थ्याचा संपूर्ण प्रोफाईल किंवा अहवाल अधिकृत A4 स्वरूपात प्रिंट करा.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                मागे जा
              </button>
            )}

            <button
              type="button"
              id="trigger-browser-print-btn"
              onClick={triggerPrint}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>A4 प्रिंट काढा (Print Now)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">प्रिंट प्रकार:</span>
            <button
              type="button"
              onClick={() => setPrintMode('profile')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                printMode === 'profile'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              व्यक्तिगत लाभार्थी प्रोफाईल (Single Profile)
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('report')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                printMode === 'report'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              एकूण लाभार्थी यादी अहवाल (Summary List)
            </button>
          </div>

          {printMode === 'profile' && beneficiaries.length > 0 && (
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-slate-500">लाभार्थी निवडा:</span>
              <select
                value={selectedBeneficiaryId}
                onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium max-w-xs truncate"
              >
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.applicationNumber} - {b.beneficiaryName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* A4 PRINT CONTAINER (Visible on screen preview & printable via @media print) */}
      <div className="bg-slate-100 p-3 sm:p-6 rounded-2xl flex justify-center overflow-x-auto">
        {printMode === 'profile' && selectedBeneficiary ? (
          <div
            id="a4-printable-beneficiary-sheet"
            className="bg-white w-[210mm] min-h-[297mm] p-[15mm] text-slate-900 shadow-xl border border-slate-300 text-[11px] leading-relaxed flex flex-col justify-between"
          >
            <div>
              {/* Municipal Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <div className="text-[12px] font-bold text-slate-700 tracking-wide">
                  महानगरपालिका छत्रपती संभाजीनगर
                </div>
                <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight mt-0.5">
                  प्रधानमंत्री आवास योजना शहरी
                </h1>
                <div className="text-[12px] font-bold text-amber-800 mt-0.5">
                  लाभार्थी संपूर्ण तपशील व प्रक्रिया पत्रक (Beneficiary Record Sheet)
                </div>
                <div className="text-[9px] text-slate-500 mt-1 font-mono">
                  प्रिंट दिनांक: {new Date().toLocaleDateString('mr-IN')} | वेळ:{' '}
                  {new Date().toLocaleTimeString('mr-IN')}
                </div>
              </div>

              {/* Status and App No Banner */}
              <div className="bg-slate-100 p-2.5 rounded-md border border-slate-300 flex items-center justify-between mb-4 font-semibold">
                <div>
                  <span className="text-slate-500">अर्ज क्रमांक (Application No): </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedBeneficiary.applicationNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">सध्याचा टप्पा: </span>
                  <span className="font-bold text-slate-900">
                    {computeStageLabel(selectedBeneficiary).stage}
                  </span>
                </div>
              </div>

              {/* 1. वैयक्तिक व घराची माहिती */}
              <div className="mb-4">
                <div className="bg-slate-800 text-white font-bold px-2 py-1 text-[11px] uppercase tracking-wider mb-2">
                  १. लाभार्थ्याची वैयक्तिक व घराची माहिती (Personal & Housing Allotment)
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 w-1/4 border-r border-slate-300">
                        लाभार्थ्याचे नाव:
                      </td>
                      <td className="p-1.5 font-bold text-slate-900 w-1/4 border-r border-slate-300">
                        {selectedBeneficiary.beneficiaryName}
                      </td>
                      <td className="p-1.5 font-bold bg-slate-50 w-1/4 border-r border-slate-300">
                        पती / वडिलांचे नाव:
                      </td>
                      <td className="p-1.5 text-slate-900 w-1/4">
                        {selectedBeneficiary.fatherSpouseName || '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">
                        मोबाईल नंबर:
                      </td>
                      <td className="p-1.5 font-mono border-r border-slate-300">
                        {selectedBeneficiary.mobileNumber || '-'}
                      </td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">
                        प्रकल्प / जागा (Site):
                      </td>
                      <td className="p-1.5 font-bold">{selectedBeneficiary.projectSite}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">
                        गट क्रमांक:
                      </td>
                      <td className="p-1.5 border-r border-slate-300">
                        गट नं. {selectedBeneficiary.groupNumber}
                      </td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">
                        इमारत / विंग:
                      </td>
                      <td className="p-1.5">
                        {selectedBeneficiary.buildingNumber || '-'} {selectedBeneficiary.wing ? `(Wing ${selectedBeneficiary.wing})` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">
                        मजला:
                      </td>
                      <td className="p-1.5 border-r border-slate-300">
                        {selectedBeneficiary.floor || '-'}
                      </td>
                      <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-300">
                        सदनिका / घर क्रमांक:
                      </td>
                      <td className="p-1.5 font-bold text-slate-950">
                        {selectedBeneficiary.flatHouseNumber || 'वाटप बाकी'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. आर्थिक तपशील व हिशोब */}
              {(() => {
                const fin = calculateBeneficiaryFinancials(selectedBeneficiary);
                return (
                  <div className="mb-4">
                    <div className="bg-slate-800 text-white font-bold px-2 py-1 text-[11px] uppercase tracking-wider mb-2">
                      २. घराची किंमत व आर्थिक हिशोब (Financial Breakdown & Costing)
                    </div>

                    <table className="w-full border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold">
                          <th className="p-1.5 border-r border-slate-300">तपशील</th>
                          <th className="p-1.5 border-r border-slate-300">नियोजित रक्कम (₹)</th>
                          <th className="p-1.5 border-r border-slate-300">सध्याची स्थिती</th>
                          <th className="p-1.5">पावती क्र. / दिनांक</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-1.5 font-bold border-r border-slate-300">
                            पूर्ण घर किंमत (Full House Cost)
                          </td>
                          <td className="p-1.5 font-mono font-bold text-right border-r border-slate-300">
                            ₹{fin.houseCost.toLocaleString('en-IN')}
                          </td>
                          <td className="p-1.5 text-center border-r border-slate-300">निश्चित</td>
                          <td className="p-1.5 text-slate-500 text-center">-</td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-blue-50/40">
                          <td className="p-1.5 font-bold border-r border-slate-300">
                            १०% हप्ता रक्कम (Full Cost वर)
                          </td>
                          <td className="p-1.5 font-mono font-bold text-right border-r border-slate-300">
                            ₹{fin.amount10Percent.toLocaleString('en-IN')}
                          </td>
                          <td className="p-1.5 text-center font-bold border-r border-slate-300">
                            {selectedBeneficiary.payment10Percent.status}
                          </td>
                          <td className="p-1.5 text-center font-mono">
                            {selectedBeneficiary.payment10Percent.receiptNo ||
                              selectedBeneficiary.payment10Percent.paymentDate ||
                              '-'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-indigo-50/40">
                          <td className="p-1.5 font-bold border-r border-slate-300">
                            २०% हप्ता / कर्ज रक्कम (Full Cost वर)
                          </td>
                          <td className="p-1.5 font-mono font-bold text-right border-r border-slate-300">
                            ₹{fin.amount20Percent.toLocaleString('en-IN')}
                          </td>
                          <td className="p-1.5 text-center font-bold border-r border-slate-300">
                            {selectedBeneficiary.payment20Percent.mode === 'LOAN PROCESS'
                              ? `कर्ज: ${selectedBeneficiary.loanProcess.status}`
                              : selectedBeneficiary.payment20Percent.status}
                          </td>
                          <td className="p-1.5 text-center font-mono">
                            {selectedBeneficiary.payment20Percent.receiptNo ||
                              selectedBeneficiary.loanProcess.bankName ||
                              '-'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-emerald-50/40">
                          <td className="p-1.5 font-bold border-r border-slate-300">
                            शासकीय अनुदान (Govt. Subsidy)
                          </td>
                          <td className="p-1.5 font-mono font-bold text-right border-r border-slate-300">
                            ₹{GOVT_SUBSIDY_AMOUNT.toLocaleString('en-IN')}
                          </td>
                          <td className="p-1.5 text-center font-semibold text-emerald-800 border-r border-slate-300">
                            शेवटी वजा
                          </td>
                          <td className="p-1.5 text-center text-slate-500">केंद्रीत अनुदान</td>
                        </tr>
                        <tr className="bg-amber-50 font-bold">
                          <td className="p-1.5 border-r border-slate-300">
                            अंदाजे उर्वरित शिल्लक रक्कम (Balance Payable):
                          </td>
                          <td className="p-1.5 font-mono text-right border-r border-slate-300 text-amber-900">
                            ₹{fin.balancePayable.toLocaleString('en-IN')}
                          </td>
                          <td className="p-1.5 text-center border-r border-slate-300 text-slate-600">
                            अनुदान वजावट
                          </td>
                          <td className="p-1.5 text-center text-slate-600">देय रक्कम</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* 3. प्रक्रिया स्थिती तपशील */}
              <div className="mb-4">
                <div className="bg-slate-800 text-white font-bold px-2 py-1 text-[11px] uppercase tracking-wider mb-2">
                  ३. प्रक्रिया व शेरा तपशील (Status & Remarks)
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 border border-slate-300 rounded bg-slate-50">
                    <span className="font-bold block text-slate-800">स्वीकृती प्रक्रिया (Acceptance):</span>
                    <div>स्थिती: <strong>{selectedBeneficiary.acceptance.status}</strong></div>
                    <div>दिनांक: {selectedBeneficiary.acceptance.date || '-'}</div>
                    <div>शेरा: {selectedBeneficiary.acceptance.remarks || '-'}</div>
                  </div>

                  <div className="p-2 border border-slate-300 rounded bg-slate-50">
                    <span className="font-bold block text-slate-800">बँक कर्ज प्रक्रिया (Loan Process):</span>
                    <div>स्थिती: <strong>{selectedBeneficiary.loanProcess.status}</strong></div>
                    <div>बँक: {selectedBeneficiary.loanProcess.bankName || '-'}</div>
                    {selectedBeneficiary.loanProcess.status === 'Loan Rejected' && (
                      <div className="text-red-700">
                        नाकारण्याचे कारण: {selectedBeneficiary.loanProcess.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Municipal Signatures at Bottom */}
            <div className="border-t-2 border-slate-900 pt-8 mt-6">
              <div className="grid grid-cols-3 gap-4 text-center font-bold text-[11px]">
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1">तयार करणारा लिपिक</div>
                  <div className="text-[9px] font-normal text-slate-500">PMAY कक्ष</div>
                </div>
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1">सत्यापन अधिकारी</div>
                  <div className="text-[9px] font-normal text-slate-500">म.न.पा. छत्रपती संभाजीनगर</div>
                </div>
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 pt-1">सहाय्यक / उपआयुक्त</div>
                  <div className="text-[9px] font-normal text-slate-500">प्रधानमंत्री आवास योजना</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Report Printable Table */
          <div
            id="a4-printable-report-sheet"
            className="bg-white w-[297mm] min-h-[210mm] p-[10mm] text-slate-900 shadow-xl border border-slate-300 text-[10px] leading-tight flex flex-col justify-between"
          >
            <div>
              <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
                <div className="text-[11px] font-bold text-slate-700">
                  महानगरपालिका छत्रपती संभाजीनगर
                </div>
                <h1 className="text-base font-black text-slate-950 uppercase">
                  प्रधानमंत्री आवास योजना शहरी – लाभार्थी यादी अहवाल
                </h1>
                <div className="text-xs font-bold text-amber-800">
                  {reportTitle || 'सर्व लाभार्थी मास्टर अहवाल'}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                  एकूण लाभार्थी: {beneficiaries.length} | दिनांक:{' '}
                  {new Date().toLocaleDateString('mr-IN')}
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 text-center font-bold">
                    <th className="p-1 border-r border-slate-400 w-8">क्र.</th>
                    <th className="p-1 border-r border-slate-400">अर्ज क्रमांक</th>
                    <th className="p-1 border-r border-slate-400">लाभार्थ्याचे नाव</th>
                    <th className="p-1 border-r border-slate-400">पती/वडिलांचे नाव</th>
                    <th className="p-1 border-r border-slate-400">मोबाईल</th>
                    <th className="p-1 border-r border-slate-400">प्रकल्प (गट नं.)</th>
                    <th className="p-1 border-r border-slate-400">घर किंमत</th>
                    <th className="p-1 border-r border-slate-400">स्वीकृती</th>
                    <th className="p-1 border-r border-slate-400">१०% हप्ता</th>
                    <th className="p-1 border-r border-slate-400">पावती क्र.</th>
                    <th className="p-1">२०% / कर्ज स्थिती</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((b, idx) => {
                    const fin = calculateBeneficiaryFinancials(b);
                    return (
                      <tr key={b.id} className="border-b border-slate-300">
                        <td className="p-1 text-center font-mono border-r border-slate-300">
                          {idx + 1}
                        </td>
                        <td className="p-1 font-mono font-bold border-r border-slate-300">
                          {b.applicationNumber}
                        </td>
                        <td className="p-1 font-bold border-r border-slate-300">
                          {b.beneficiaryName}
                        </td>
                        <td className="p-1 border-r border-slate-300">{b.fatherSpouseName || '-'}</td>
                        <td className="p-1 font-mono border-r border-slate-300">
                          {b.mobileNumber || '-'}
                        </td>
                        <td className="p-1 border-r border-slate-300">{b.projectSite}</td>
                        <td className="p-1 font-mono text-right border-r border-slate-300">
                          ₹{fin.houseCost.toLocaleString('en-IN')}
                        </td>
                        <td className="p-1 text-center font-semibold border-r border-slate-300">
                          {b.acceptance.status}
                        </td>
                        <td className="p-1 text-center font-semibold border-r border-slate-300">
                          {b.payment10Percent.status}
                        </td>
                        <td className="p-1 font-mono text-center border-r border-slate-300">
                          {b.payment10Percent.receiptNo || '-'}
                        </td>
                        <td className="p-1 text-center">
                          {b.loanProcess.status !== 'NOT APPLICABLE'
                            ? b.loanProcess.status
                            : b.payment20Percent.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-400 pt-4 mt-6">
              <div className="grid grid-cols-3 gap-4 text-center font-bold text-[10px]">
                <div>लिपिक स्वाक्षरी</div>
                <div>सत्यापन अधिकारी</div>
                <div>विभाग प्रमुख, PMAY</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
