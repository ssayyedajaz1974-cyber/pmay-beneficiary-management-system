import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Eye,
  Filter,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Layers,
  ChevronRight,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { BeneficiaryRecord, AcceptanceStatusType } from '../types/pmay';

interface NewBeneficiariesViewProps {
  onOpenExcelUpload: () => void;
  onAddNewBeneficiary: () => void;
}

export const NewBeneficiariesView: React.FC<NewBeneficiariesViewProps> = ({
  onOpenExcelUpload,
  onAddNewBeneficiary
}) => {
  const {
    beneficiaries,
    updateAcceptance,
    setActiveBeneficiary,
    setCurrentNav,
    importedFilesList
  } = useBeneficiary();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPT' | 'REJECT' | 'NO RESPONSE'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Primary list: Form Filled / New Beneficiaries
  const list = useMemo(() => {
    return beneficiaries.filter((b) => {
      // If file filter is active
      if (selectedFileFilter !== 'ALL' && b.importedFileName !== selectedFileFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && b.acceptance.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const nameMatch = (b.beneficiaryName || '').toLowerCase().includes(term);
        const appMatch = (b.applicationNumber || '').toLowerCase().includes(term);
        const mobMatch = (b.mobileNumber || '').toLowerCase().includes(term);
        const fileMatch = (b.importedFileName || '').toLowerCase().includes(term);
        if (!nameMatch && !appMatch && !mobMatch && !fileMatch) return false;
      }

      return true;
    });
  }, [beneficiaries, selectedFileFilter, statusFilter, searchTerm]);

  // Unique list of imported files present in beneficiaries
  const availableFiles = useMemo(() => {
    const set = new Set<string>();
    beneficiaries.forEach((b) => {
      if (b.importedFileName) set.add(b.importedFileName);
    });
    return Array.from(set);
  }, [beneficiaries]);

  const handleQuickAccept = (id: string, name: string) => {
    updateAcceptance(id, 'ACCEPT', new Date().toISOString().split('T')[0], 'नवीन अर्जावरून स्वीकृत');
    setActionSuccessMsg(`'${name}' यांना ACCEPT केले. पुढील टप्पा: १०% हप्ता भरणा.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleQuickReject = (id: string, name: string) => {
    updateAcceptance(id, 'REJECT', new Date().toISOString().split('T')[0], 'नवीन अर्जावरून नाकारले');
    setActionSuccessMsg(`'${name}' यांचा अर्ज REJECT करण्यात आला.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleQuickNoResponse = (id: string, name: string) => {
    updateAcceptance(id, 'NO RESPONSE', new Date().toISOString().split('T')[0], 'संपर्क / प्रतिसाद नाही');
    setActionSuccessMsg(`'${name}' यांच्या अर्जावर NO RESPONSE नोंदवला.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleBatchAccept = () => {
    if (selectedIds.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    selectedIds.forEach((id) => {
      updateAcceptance(id, 'ACCEPT', today, 'एकत्रित बॅच स्वीकृती');
    });
    setActionSuccessMsg(`${selectedIds.length} लाभार्थ्यांना एकत्रित ACCEPT केले गेले!`);
    setSelectedIds([]);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((b) => b.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Workflow Stage Navigation Strip */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          लाभार्थी प्रक्रिया टप्पे (Workflow Pipeline):
        </div>
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold py-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white shadow-xs shrink-0">
            <span>१. नवीन अर्ज (Form Filled)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          <button
            type="button"
            onClick={() => setCurrentNav('acceptance')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
          >
            <span>२. स्वीकृती (Acceptance)</span>
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          <button
            type="button"
            onClick={() => setCurrentNav('payment10')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
          >
            <span>३. १०% हप्ता</span>
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          <button
            type="button"
            onClick={() => setCurrentNav('payment20')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
          >
            <span>४. २०% हप्ता</span>
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

          <button
            type="button"
            onClick={() => setCurrentNav('loan')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
          >
            <span>५. बँक कर्ज (Loan)</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>नवीन लाभार्थी / Form Filled List (टप्पा १)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Excel मधून आयात केलेले किंवा नवीन अर्ज भरलेले लाभार्थी. येथून थेट Acceptance निश्चित करा.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenExcelUpload}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>नवीन Excel अपलोड</span>
            </button>
            <button
              type="button"
              onClick={onAddNewBeneficiary}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>मॅन्युअल नोंद</span>
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3.5 py-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMsg('')}
              className="text-emerald-700 hover:text-emerald-900 text-xs"
            >
              बंद
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="नाव, अर्ज क्र., मोबाईल, फाईल नावाने शोधा..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Excel File Filter Dropdown */}
            {availableFiles.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 whitespace-nowrap">मूळ Excel फाईल:</span>
                <select
                  value={selectedFileFilter}
                  onChange={(e) => setSelectedFileFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">सर्व फाईल्स ({beneficiaries.length})</option>
                  {availableFiles.map((fn) => (
                    <option key={fn} value={fn}>
                      {fn} ({beneficiaries.filter((b) => b.importedFileName === fn).length})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {[
                { id: 'ALL', label: `सर्व अर्ज (${beneficiaries.length})` },
                {
                  id: 'PENDING',
                  label: `प्रलंबित निर्णय (${beneficiaries.filter((b) => b.acceptance.status === 'PENDING').length})`,
                  color: 'text-amber-700'
                },
                {
                  id: 'ACCEPT',
                  label: `स्वीकृत (${beneficiaries.filter((b) => b.acceptance.status === 'ACCEPT').length})`,
                  color: 'text-emerald-700'
                },
                {
                  id: 'REJECT',
                  label: `नाकारलेले (${beneficiaries.filter((b) => b.acceptance.status === 'REJECT').length})`,
                  color: 'text-red-700'
                },
                {
                  id: 'NO RESPONSE',
                  label: `प्रतिसाद नाही (${beneficiaries.filter((b) => b.acceptance.status === 'NO RESPONSE').length})`,
                  color: 'text-orange-700'
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Batch Accept Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBatchAccept}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>निवडलेले {selectedIds.length} अर्ज ACCEPT करा</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Beneficiaries Table / Cards */}
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchTerm || selectedFileFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'निवडलेल्या फिल्टरनुसार कोणताही लाभार्थी आढळला नाही.'
              : 'नवीन अर्ज यादीमध्ये सध्या कोणताही डेटा उपलब्ध नाही.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? 'कृपया वेगळा शोध शब्द वापरून पहा किंवा फिल्टर रीसेट करा.'
              : 'नवीन अर्ज भरलेले लाभार्थी जोडण्यासाठी “नवीन लाभार्थीची यादी.xlsx” किंवा आपल्याकडील कोणतीही एक्सेल फाईल अपलोड करा.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={onOpenExcelUpload}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel फाईल आयात करा</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === list.length && list.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-amber-600"
                    />
                  </th>
                  <th className="py-3 px-3">अर्ज क्र. / फाईल</th>
                  <th className="py-3 px-3">लाभार्थ्याचे नाव व नातेवाईक</th>
                  <th className="py-3 px-3">मोबाईल</th>
                  <th className="py-3 px-3">प्रकल्प व जागा</th>
                  <th className="py-3 px-3 text-center">स्वीकृती स्थिती</th>
                  <th className="py-3 px-3 text-right">कृती (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {list.map((b) => {
                  const isSelected = selectedIds.includes(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-amber-50/40 transition ${
                        isSelected ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(b.id)}
                          className="rounded text-amber-600"
                        />
                      </td>

                      {/* App No & Source File */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{b.applicationNumber}</div>
                        {b.importedFileName && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 max-w-[170px] truncate">
                            <FileSpreadsheet className="w-3 h-3 shrink-0" />
                            <span className="truncate">{b.importedFileName}</span>
                          </div>
                        )}
                      </td>

                      {/* Beneficiary Name */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setActiveBeneficiary(b)}
                          className="text-left font-bold text-slate-900 hover:text-amber-600 hover:underline"
                        >
                          {b.beneficiaryName}
                        </button>
                        {b.fatherSpouseName && (
                          <div className="text-[11px] text-slate-500">
                            वडिलांचे/पतीचे नाव: {b.fatherSpouseName}
                          </div>
                        )}
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {b.mobileNumber || '—'}
                      </td>

                      {/* Project Site */}
                      <td className="py-3 px-3">
                        <div className="text-slate-900 font-semibold">{b.projectSite}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.flatHouseNumber ? `सदनिका: ${b.flatHouseNumber}` : ''}{' '}
                          {b.buildingNumber ? `इमारत: ${b.buildingNumber}` : ''}
                        </div>
                      </td>

                      {/* Acceptance Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {b.acceptance.status === 'ACCEPT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACCEPT (स्वीकृत)</span>
                          </span>
                        )}
                        {b.acceptance.status === 'REJECT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3" />
                            <span>REJECT (नाकारले)</span>
                          </span>
                        )}
                        {b.acceptance.status === 'NO RESPONSE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            <HelpCircle className="w-3 h-3" />
                            <span>NO RESPONSE</span>
                          </span>
                        )}
                        {b.acceptance.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>प्रलंबित (Pending)</span>
                          </span>
                        )}
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.acceptance.status !== 'ACCEPT' && (
                            <button
                              type="button"
                              onClick={() => handleQuickAccept(b.id, b.beneficiaryName)}
                              title="ACCEPT करा"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ACCEPT</span>
                            </button>
                          )}

                          {b.acceptance.status === 'ACCEPT' && (
                            <button
                              type="button"
                              onClick={() => setCurrentNav('payment10')}
                              title="१०% हप्ता विभागाकडे जा"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition flex items-center gap-1"
                            >
                              <span>१०% हप्ता →</span>
                            </button>
                          )}

                          {b.acceptance.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickReject(b.id, b.beneficiaryName)}
                                title="REJECT करा"
                                className="px-2 py-1 bg-slate-100 hover:bg-red-50 text-red-700 rounded-lg text-[11px] transition"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickNoResponse(b.id, b.beneficiaryName)}
                                title="प्रतिसाद नाही"
                                className="px-2 py-1 bg-slate-100 hover:bg-orange-50 text-orange-700 rounded-lg text-[11px] transition"
                              >
                                No Resp
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setActiveBeneficiary(b)}
                            title="पूर्ण प्रोफाईल पाहा"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
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

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <div>एकूण दाखवलेले: <strong>{list.length}</strong> लाभार्थी</div>
            <div>टप्पा १: नवीन अर्ज → टप्पा २: Acceptance कडे पाठवण्यासाठी 'ACCEPT' करा.</div>
          </div>
        </div>
      )}
    </div>
  );
};
