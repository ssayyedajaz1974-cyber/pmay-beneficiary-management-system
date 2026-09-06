import React, { useState, useMemo } from 'react';
import {
  Search,
  User,
  Phone,
  FileText,
  Building,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { BeneficiaryRecord, computeStageLabel, calculateBeneficiaryFinancials } from '../types/pmay';

export const BeneficiarySearch: React.FC = () => {
  const { beneficiaries, setActiveBeneficiary } = useBeneficiary();
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [acceptanceFilter, setAcceptanceFilter] = useState('ALL');

  const filteredResults = useMemo(() => {
    if (!searchTerm && siteFilter === 'ALL' && acceptanceFilter === 'ALL') {
      return beneficiaries.slice(0, 20); // Show first 20 if no search term yet
    }

    const term = searchTerm.trim().toLowerCase();

    return beneficiaries.filter((b) => {
      // 2. लाभार्थी शोधण्याची सुविधा:
      // Beneficiary Name, Application Number, Mobile Number
      const nameMatch = (b.beneficiaryName || '').toLowerCase().includes(term);
      const appMatch = (b.applicationNumber || '').toLowerCase().includes(term);
      const mobileMatch = (b.mobileNumber || '').toLowerCase().includes(term);
      const fatherMatch = (b.fatherSpouseName || '').toLowerCase().includes(term);
      const textMatches = !term || nameMatch || appMatch || mobileMatch || fatherMatch;

      const siteMatches =
        siteFilter === 'ALL' || (b.projectSite || '').toLowerCase().includes(siteFilter.toLowerCase());

      const accMatches =
        acceptanceFilter === 'ALL' || b.acceptance.status === acceptanceFilter;

      return textMatches && siteMatches && accMatches;
    });
  }, [beneficiaries, searchTerm, siteFilter, acceptanceFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-600" />
            <span>लाभार्थी शोध केंद्र (Search Beneficiary)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            लाभार्थ्याचे नाव, अर्ज क्रमांक (Application Number) किंवा मोबाईल नंबर टाकून तात्काळ शोध घ्या.
            शोध निकालावर क्लिक केल्यास त्या लाभार्थ्याचा संपूर्ण प्रोफाईल उघडेल.
          </p>
        </div>

        {/* Search input bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="beneficiary-main-search-input"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="उदा. Ramesh, 9822XXXXXX, किंवा PMAY अर्ज क्रमांक..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-semibold px-2 py-1 rounded"
            >
              साफ करा (Clear)
            </button>
          )}
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">प्रकल्प निवडा:</span>
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

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">स्वीकृती स्थिती:</span>
            <select
              value={acceptanceFilter}
              onChange={(e) => setAcceptanceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
            >
              <option value="ALL">सर्व स्थिती (All Status)</option>
              <option value="ACCEPT">ACCEPT (स्वीकृत)</option>
              <option value="REJECT">REJECT (नाकारलेले)</option>
              <option value="NO RESPONSE">NO RESPONSE (प्रतिसाद नाही)</option>
              <option value="PENDING">PENDING (प्रलंबित)</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400 font-mono text-[11px]">
            {filteredResults.length} निकाल सापडले
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              दिलेल्या माहितीनुसार कोणताही लाभार्थी सापडला नाही.
            </p>
            <p className="text-xs text-slate-500">
              कृपया नाव, अर्ज क्रमांक किंवा मोबाईल नंबर पुन्हा तपासा.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredResults.map((b) => {
              const financials = calculateBeneficiaryFinancials(b);
              const stage = computeStageLabel(b);

              return (
                <div
                  key={b.id}
                  id={`search-card-${b.id}`}
                  onClick={() => setActiveBeneficiary(b)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-400 cursor-pointer transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {b.applicationNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.color}`}
                        >
                          {stage.stage}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-amber-700 transition">
                        {b.beneficiaryName}
                      </h3>
                      {b.fatherSpouseName && (
                        <div className="text-xs text-slate-500">
                          पती/वडिलांचे नाव: {b.fatherSpouseName}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        ₹{financials.houseCost.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400">घर किंमत</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">प्रकल्प:</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {b.projectSite}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">मोबाईल:</span>
                      <span className="font-medium text-slate-800 font-mono">
                        {b.mobileNumber || 'नोंद नाही'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">१०% हप्ता:</span>
                      <span
                        className={`font-bold ${
                          b.payment10Percent.status === 'PAID'
                            ? 'text-teal-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {b.payment10Percent.status} (₹
                        {financials.amount10Percent.toLocaleString('en-IN')})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">२०% / कर्ज:</span>
                      <span className="font-bold text-indigo-700 truncate block">
                        {b.loanProcess.status !== 'NOT APPLICABLE'
                          ? b.loanProcess.status
                          : b.payment20Percent.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span>क्लिक करून पूर्ण Profile उघडा</span>
                    <span className="text-amber-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      <span>Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
