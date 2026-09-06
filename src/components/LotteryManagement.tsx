import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  UserCheck,
  Calendar,
  MapPin,
  Building,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  Save,
  X,
  Layers,
  ChevronRight,
  Download
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import {
  BeneficiaryRecord,
  LotteryEvent,
  LotteryResultType,
  LotteryResponseType,
  PROJECT_SITES
} from '../types/pmay';

export const LotteryManagement: React.FC = () => {
  const {
    beneficiaries,
    lotteries,
    addLottery,
    updateLottery,
    deleteLottery,
    updateBeneficiaryLottery,
    batchAssignLottery,
    batchUpdateLotteryResults,
    pushLotterySelectedToAcceptance,
    exportToExcel,
    setActiveBeneficiary,
    setCurrentNav
  } = useBeneficiary();

  // Selected Lottery tab
  const [selectedLotteryId, setSelectedLotteryId] = useState<string>('ALL');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [responseFilter, setResponseFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');

  // Multi-selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [showAddLotteryModal, setShowAddLotteryModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBatchResultModal, setShowBatchResultModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<BeneficiaryRecord | null>(null);

  // New Lottery Form State
  const [newLotteryForm, setNewLotteryForm] = useState({
    lotteryNumber: `सोडत ${lotteries.length + 1}`,
    lotteryName: `सोडत क्रमांक ${lotteries.length + 1}`,
    drawDate: new Date().toISOString().split('T')[0],
    locationOrVenue: 'महानगरपालिका मुख्यालय, छत्रपती संभाजीनगर',
    projectSite: 'ALL',
    description: '',
    status: 'ACTIVE' as const
  });

  // Current active lottery event object
  const currentLottery = useMemo(() => {
    if (selectedLotteryId === 'ALL') return null;
    return lotteries.find((l) => l.id === selectedLotteryId) || null;
  }, [lotteries, selectedLotteryId]);

  // Beneficiaries list filtered by lottery and sub-filters
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      // Lottery event filter
      if (selectedLotteryId !== 'ALL') {
        const lotNum = currentLottery?.lotteryNumber || '';
        const lotName = currentLottery?.lotteryName || '';
        const matchesEvent =
          b.lottery?.lotteryId === selectedLotteryId ||
          (lotNum && b.lottery?.lotteryNumber?.includes(lotNum)) ||
          (lotName && b.lottery?.lotteryName?.includes(lotName));
        if (!matchesEvent) return false;
      } else {
        // In "ALL", include those who have any lottery info, or all if none exists
        const hasAnyLottery = Boolean(
          b.lottery?.lotteryNumber || b.lottery?.lotteryName || b.lottery?.result !== 'NOT_PARTICIPATED'
        );
        // If some beneficiaries have lottery, prioritize showing them; if none do, show all
        const anyHasLottery = beneficiaries.some((item) => item.lottery?.lotteryNumber);
        if (anyHasLottery && !hasAnyLottery) return false;
      }

      // Result filter
      if (resultFilter !== 'ALL') {
        const res = b.lottery?.result || 'PENDING';
        if (res !== resultFilter) return false;
      }

      // Response filter
      if (responseFilter !== 'ALL') {
        const resp = b.lottery?.response || 'PENDING';
        if (resp !== responseFilter) return false;
      }

      // Project Site filter
      if (siteFilter !== 'ALL' && b.projectSite !== siteFilter) {
        return false;
      }

      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = (b.beneficiaryName || '').toLowerCase().includes(term);
        const matchApp = (b.applicationNumber || '').toLowerCase().includes(term);
        const matchMobile = (b.mobileNumber || '').includes(term);
        const matchToken = (b.lottery?.drawTokenNumber || '').toLowerCase().includes(term);
        const matchFather = (b.fatherSpouseName || '').toLowerCase().includes(term);
        if (!matchName && !matchApp && !matchMobile && !matchToken && !matchFather) {
          return false;
        }
      }

      return true;
    });
  }, [beneficiaries, selectedLotteryId, currentLottery, resultFilter, responseFilter, siteFilter, searchTerm]);

  // Statistics for current view
  const lotteryMetrics = useMemo(() => {
    let total = filteredBeneficiaries.length;
    let selectedCount = 0;
    let waitingCount = 0;
    let notSelectedCount = 0;
    let pendingResultCount = 0;

    let responseAcceptCount = 0;
    let responseRejectCount = 0;
    let responseNoReplyCount = 0;
    let responsePendingCount = 0;

    filteredBeneficiaries.forEach((b) => {
      const res = b.lottery?.result;
      if (res === 'SELECTED') selectedCount++;
      else if (res === 'WAITING') waitingCount++;
      else if (res === 'NOT_SELECTED') notSelectedCount++;
      else pendingResultCount++;

      const resp = b.lottery?.response;
      if (resp === 'ACCEPT') responseAcceptCount++;
      else if (resp === 'REJECT') responseRejectCount++;
      else if (resp === 'NO RESPONSE') responseNoReplyCount++;
      else responsePendingCount++;
    });

    return {
      total,
      selectedCount,
      waitingCount,
      notSelectedCount,
      pendingResultCount,
      responseAcceptCount,
      responseRejectCount,
      responseNoReplyCount,
      responsePendingCount
    };
  }, [filteredBeneficiaries]);

  // Multi-select toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBeneficiaries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBeneficiaries.map((b) => b.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle move selected to Acceptance workflow
  const handlePushSelectedToAcceptance = () => {
    const idsToMove = selectedIds.length > 0
      ? selectedIds
      : filteredBeneficiaries.filter((b) => b.lottery?.result === 'SELECTED').map((b) => b.id);

    if (idsToMove.length === 0) {
      alert('कृपया प्रथम निवड झालेल्या लाभार्थ्यांची निवड करा.');
      return;
    }

    if (
      window.confirm(
        `निवड झालेल्या ${idsToMove.length} लाभार्थ्यांना "स्वीकृती (Acceptance) प्रक्रियेत" वर्ग करायचे आहे का?`
      )
    ) {
      pushLotterySelectedToAcceptance(idsToMove);
      setSelectedIds([]);
      alert(`${idsToMove.length} लाभार्थी यशस्वीरीत्या स्वीकृती प्रक्रियेत समाविष्ट करण्यात आले आहेत.`);
    }
  };

  // Handle Add Lottery submission
  const handleCreateLottery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotteryForm.lotteryNumber.trim() || !newLotteryForm.lotteryName.trim()) {
      alert('कृपया सोडत क्रमांक व नाव प्रविष्ट करा.');
      return;
    }

    const created = addLottery(newLotteryForm);
    setSelectedLotteryId(created.id);
    setShowAddLotteryModal(false);
    setNewLotteryForm({
      lotteryNumber: `सोडत ${lotteries.length + 2}`,
      lotteryName: `सोडत क्रमांक ${lotteries.length + 2}`,
      drawDate: new Date().toISOString().split('T')[0],
      locationOrVenue: 'महानगरपालिका सभागृह',
      projectSite: 'ALL',
      description: '',
      status: 'ACTIVE'
    });
  };

  // Beneficiaries eligible for assignment into this lottery
  const unassignedBeneficiaries = useMemo(() => {
    if (!currentLottery) return [];
    return beneficiaries.filter((b) => {
      // If b is already in this lottery, skip
      if (b.lottery?.lotteryId === currentLottery.id) return false;
      if (b.lottery?.lotteryNumber === currentLottery.lotteryNumber) return false;
      return true;
    });
  }, [beneficiaries, currentLottery]);

  const [assignSearch, setAssignSearch] = useState('');
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  const filteredUnassigned = useMemo(() => {
    return unassignedBeneficiaries.filter((b) => {
      if (!assignSearch) return true;
      const term = assignSearch.toLowerCase();
      return (
        (b.beneficiaryName || '').toLowerCase().includes(term) ||
        (b.applicationNumber || '').toLowerCase().includes(term) ||
        (b.mobileNumber || '').includes(term)
      );
    });
  }, [unassignedBeneficiaries, assignSearch]);

  const handleConfirmAssign = () => {
    if (!currentLottery) return;
    if (assignSelectedIds.length === 0) {
      alert('कृपया सोडतीत सहभागी करण्यासाठी किमान एका लाभार्थ्याची निवड करा.');
      return;
    }

    batchAssignLottery(
      assignSelectedIds,
      {
        id: currentLottery.id,
        number: currentLottery.lotteryNumber,
        name: currentLottery.lotteryName,
        date: currentLottery.drawDate
      },
      'PENDING'
    );

    alert(`${assignSelectedIds.length} लाभार्थी ${currentLottery.lotteryNumber} मध्ये जोडण्यात आले.`);
    setAssignSelectedIds([]);
    setShowAssignModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <Ticket className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  सोडत / Lottery Management
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                    PMAY CSN टप्पा क्र. २
                  </span>
                </h1>
                <p className="text-sm text-slate-500">
                  प्रधानमंत्री आवास योजना (शहरी) - लाभार्थी सोडत / लकी ड्रॉ निकाल व स्वीकृती व्यवस्थापन
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddLotteryModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              नवीन सोडत जोडा (Add Lottery)
            </button>

            {currentLottery && (
              <button
                onClick={() => {
                  setAssignSelectedIds([]);
                  setShowAssignModal(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                लाभार्थी जोडा (Assign)
              </button>
            )}

            <button
              onClick={handlePushSelectedToAcceptance}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              title="निवड झालेल्या लाभार्थ्यांना स्वीकृती प्रक्रियेत पाठवा"
            >
              <ArrowRight className="w-4 h-4" />
              स्वीकृतीत पाठवा ({selectedIds.length > 0 ? selectedIds.length : lotteryMetrics.selectedCount})
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
              title="सोडत यादी प्रिंट करा"
            >
              <Printer className="w-4 h-4" />
              प्रिंट (A4)
            </button>

            <button
              onClick={() =>
                exportToExcel(
                  filteredBeneficiaries,
                  `PMAY_Lottery_List_${currentLottery?.lotteryNumber || 'All'}.xlsx`
                )
              }
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
              title="Excel मध्ये डाउनलोड करा"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {/* Lottery Events Switcher Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm scrollbar-thin">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              सोडत निवडा:
            </span>

            <button
              onClick={() => setSelectedLotteryId('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs flex items-center gap-1.5 ${
                selectedLotteryId === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              सर्व सोडती (All Lotteries)
            </button>

            {lotteries.map((lottery) => {
              const isSelected = selectedLotteryId === lottery.id;
              const countInLottery = beneficiaries.filter(
                (b) =>
                  b.lottery?.lotteryId === lottery.id ||
                  b.lottery?.lotteryNumber === lottery.lotteryNumber
              ).length;

              return (
                <button
                  key={lottery.id}
                  onClick={() => setSelectedLotteryId(lottery.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs flex items-center gap-2 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{lottery.lotteryNumber}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {countInLottery}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setShowAddLotteryModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 border border-dashed border-rose-300 hover:bg-rose-100 whitespace-nowrap flex items-center gap-1 transition-colors ml-1"
            >
              <Plus className="w-3.5 h-3.5" />
              नवीन सोडत
            </button>
          </div>
        </div>
      </div>

      {/* Current Lottery Banner (if specific lottery is selected) */}
      {currentLottery && (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                  {currentLottery.lotteryNumber}
                </span>
                <h2 className="text-base font-bold text-slate-800">
                  {currentLottery.lotteryName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {currentLottery.status === 'COMPLETED' ? 'संपन्न' : 'सक्रिय'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  सोडत दिनांक: <strong>{currentLottery.drawDate || 'नोंद नाही'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  स्थळ: <strong>{currentLottery.locationOrVenue || 'मुख्यालय'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-rose-600" />
                  प्रकल्प: <strong>{currentLottery.projectSite}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newName = prompt('सोडतीचे नाव बदला:', currentLottery.lotteryName);
                  if (newName && newName.trim()) {
                    updateLottery(currentLottery.id, { lotteryName: newName.trim() });
                  }
                }}
                className="text-xs px-2.5 py-1 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                बदला
              </button>
              {lotteries.length > 1 && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `तुम्ही "${currentLottery.lotteryNumber}" सोडत हटवू इच्छिता का?`
                      )
                    ) {
                      deleteLottery(currentLottery.id);
                      setSelectedLotteryId('ALL');
                    }
                  }}
                  className="text-xs px-2.5 py-1 text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  हटवा
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards: Detailed Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => {
            setResultFilter('ALL');
            setResponseFilter('ALL');
          }}
          className={`bg-white p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
            resultFilter === 'ALL' && responseFilter === 'ALL'
              ? 'border-slate-800 ring-2 ring-slate-400'
              : 'border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">एकूण सोडत लाभार्थी</div>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {lotteryMetrics.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">यादीतील एकूण अर्ज</div>
        </div>

        <div
          onClick={() => {
            setResultFilter('SELECTED');
            setResponseFilter('ALL');
          }}
          className={`bg-emerald-50/70 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
            resultFilter === 'SELECTED'
              ? 'border-emerald-600 ring-2 ring-emerald-300'
              : 'border-emerald-200'
          }`}
        >
          <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            निवड झाले (Selected)
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {lotteryMetrics.selectedCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">लकी ड्रॉ विजेते</div>
        </div>

        <div
          onClick={() => {
            setResultFilter('WAITING');
            setResponseFilter('ALL');
          }}
          className={`bg-amber-50/70 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
            resultFilter === 'WAITING'
              ? 'border-amber-600 ring-2 ring-amber-300'
              : 'border-amber-200'
          }`}
        >
          <div className="text-xs text-amber-800 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            प्रतीक्षा यादी (Waiting)
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {lotteryMetrics.waitingCount}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">वेटिंग लिस्ट</div>
        </div>

        <div
          onClick={() => {
            setResultFilter('NOT_SELECTED');
            setResponseFilter('ALL');
          }}
          className={`bg-rose-50/70 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
            resultFilter === 'NOT_SELECTED'
              ? 'border-rose-600 ring-2 ring-rose-300'
              : 'border-rose-200'
          }`}
        >
          <div className="text-xs text-rose-800 font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            निवड न झालेले
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {lotteryMetrics.notSelectedCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">नाव न आलेले</div>
        </div>

        <div
          onClick={() => {
            setResultFilter('ALL');
            setResponseFilter('ACCEPT');
          }}
          className={`bg-blue-50/70 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
            responseFilter === 'ACCEPT'
              ? 'border-blue-600 ring-2 ring-blue-300'
              : 'border-blue-200'
          }`}
        >
          <div className="text-xs text-blue-800 font-semibold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            संमती मिळालेले
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {lotteryMetrics.responseAcceptCount}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">घर घेण्यास इच्छुक</div>
        </div>

        <div
          onClick={() => {
            setResultFilter('ALL');
            setResponseFilter('REJECT');
          }}
          className={`bg-slate-50 p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
            responseFilter === 'REJECT'
              ? 'border-slate-600 ring-2 ring-slate-300'
              : 'border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-700 font-semibold flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            नकार / प्रतिसाद नाही
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {lotteryMetrics.responseRejectCount + lotteryMetrics.responseNoReplyCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {lotteryMetrics.responseRejectCount} नकार, {lotteryMetrics.responseNoReplyCount} संपर्क नाही
          </div>
        </div>
      </div>

      {/* Filter and Bulk Action Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="नाव, अर्ज क्र., मोबाईल, किंवा टोकन/ड्रॉ क्रमांक शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>निकाल:</span>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium text-slate-700"
              >
                <option value="ALL">सर्व निकाल</option>
                <option value="SELECTED">निवड झाली (Selected)</option>
                <option value="WAITING">प्रतीक्षा यादी (Waiting List)</option>
                <option value="NOT_SELECTED">निवड झाली नाही (Not Selected)</option>
                <option value="PENDING">अनिर्णीत (Pending)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>प्रतिसाद:</span>
              <select
                value={responseFilter}
                onChange={(e) => setResponseFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium text-slate-700"
              >
                <option value="ALL">सर्व प्रतिसाद</option>
                <option value="ACCEPT">संमती (Accept)</option>
                <option value="REJECT">नकार (Reject)</option>
                <option value="NO RESPONSE">प्रतिसाद नाही (No Response)</option>
                <option value="PENDING">प्रलंबित (Pending)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>प्रकल्प:</span>
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium text-slate-700 max-w-[160px] truncate"
              >
                <option value="ALL">सर्व प्रकल्प जागा</option>
                {PROJECT_SITES.map((site) => (
                  <option key={site.id} value={site.nameEnglish}>
                    {site.nameMarathi}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || resultFilter !== 'ALL' || responseFilter !== 'ALL' || siteFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setResultFilter('ALL');
                  setResponseFilter('ALL');
                  setSiteFilter('ALL');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 bg-rose-50 rounded hover:bg-rose-100 transition-colors"
              >
                फिल्टर काढा
              </button>
            )}
          </div>
        </div>

        {/* Selected Rows Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-rose-50/50 p-2.5 rounded-lg">
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-rose-600" />
              {selectedIds.length} लाभार्थी निवडले आहेत
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBatchResultModal(true)}
                className="px-2.5 py-1.5 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded shadow-xs flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                निकाल नोंदवा (Set Result)
              </button>

              <button
                onClick={handlePushSelectedToAcceptance}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3" />
                स्वीकृती प्रक्रियेत पाठवा
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                निवड रद्द
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-500 hover:text-slate-800"
                    title="सर्व निवडा / रद्द"
                  >
                    {selectedIds.length > 0 &&
                    selectedIds.length === filteredBeneficiaries.length ? (
                      <CheckSquare className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">अनु. क्र.</th>
                <th className="py-3 px-3">अर्ज क्र. (App No)</th>
                <th className="py-3 px-3">लाभार्थ्याचे नाव व संपर्क</th>
                <th className="py-3 px-3">प्रकल्प व सदनिका</th>
                <th className="py-3 px-3">सोडत क्रमांक</th>
                <th className="py-3 px-3">ड्रॉ / टोकन क्र.</th>
                <th className="py-3 px-3">सोडत निकाल (Result)</th>
                <th className="py-3 px-3">प्रतिसाद (Response)</th>
                <th className="py-3 px-3">शेरा / तारीख</th>
                <th className="py-3 px-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBeneficiaries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ticket className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-sm">या निकषांनुसार कोणतेही लाभार्थी आढळले नाहीत.</p>
                      {currentLottery && (
                        <button
                          onClick={() => {
                            setAssignSelectedIds([]);
                            setShowAssignModal(true);
                          }}
                          className="mt-2 text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                        >
                          + या सोडतीमध्ये लाभार्थी जोडा
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBeneficiaries.map((b, index) => {
                  const isSelected = selectedIds.includes(b.id);
                  const result = b.lottery?.result || 'PENDING';
                  const response = b.lottery?.response || 'PENDING';

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleSelectOne(b.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        {b.applicationNumber}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{b.beneficiaryName}</div>
                        {b.fatherSpouseName && (
                          <div className="text-[11px] text-slate-500">
                            नातेवाईक: {b.fatherSpouseName}
                          </div>
                        )}
                        {b.mobileNumber && (
                          <div className="text-[11px] text-indigo-600 font-mono">
                            {b.mobileNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-700 truncate max-w-[140px]" title={b.projectSite}>
                          {b.projectSite}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.buildingNumber ? `इमारत: ${b.buildingNumber}` : ''}
                          {b.flatHouseNumber ? ` | सदनिका: ${b.flatHouseNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                        {b.lottery?.lotteryNumber || currentLottery?.lotteryNumber || 'सोडत १'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                        {b.lottery?.drawTokenNumber ? (
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                            {b.lottery.drawTokenNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {result === 'SELECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            निवड झाली
                          </span>
                        )}
                        {result === 'WAITING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            प्रतीक्षा यादी
                          </span>
                        )}
                        {result === 'NOT_SELECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" />
                            निवड नाही
                          </span>
                        )}
                        {result === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                            <HelpCircle className="w-3 h-3" />
                            अनिर्णीत
                          </span>
                        )}
                        {result === 'NOT_PARTICIPATED' && (
                          <span className="text-slate-400 text-[11px]">सहभाग नाही</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {response === 'ACCEPT' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            मान्य / संमती
                          </span>
                        )}
                        {response === 'REJECT' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            नकार दिला
                          </span>
                        )}
                        {response === 'NO RESPONSE' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            प्रतिसाद नाही
                          </span>
                        )}
                        {response === 'PENDING' && (
                          <span className="text-slate-400 text-[11px]">प्रलंबित</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {b.lottery?.remarks ? (
                          <div className="truncate max-w-[120px]" title={b.lottery.remarks}>
                            {b.lottery.remarks}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                        {b.lottery?.lotteryDate && (
                          <div className="text-[10px] text-slate-400">
                            {b.lottery.lotteryDate}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingBeneficiary(b)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="सोडत नोंद बदला (Edit Result / Token)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {result === 'SELECTED' && (
                            <button
                              onClick={() => {
                                pushLotterySelectedToAcceptance([b.id]);
                                alert(`${b.beneficiaryName} यांना स्वीकृती प्रक्रियेत समाविष्ट केले आहे.`);
                              }}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                              title="स्वीकृती प्रक्रियेत वर्ग करा"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveBeneficiary(b);
                              setCurrentNav('search');
                            }}
                            className="text-[11px] text-indigo-600 hover:underline ml-1"
                          >
                            तपशील
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            दाखवत आहे: <strong>{filteredBeneficiaries.length}</strong> लाभार्थी (एकूण: {beneficiaries.length})
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              निवड: {lotteryMetrics.selectedCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              प्रतीक्षा: {lotteryMetrics.waitingCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              अपात्र/नकार: {lotteryMetrics.notSelectedCount}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add New Lottery Event */}
      {showAddLotteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <h3 className="font-bold text-base">नवीन सोडत तयार करा (Add Lottery)</h3>
              </div>
              <button
                onClick={() => setShowAddLotteryModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLottery} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  सोडत क्रमांक / ओळख (उदा. सोडत १, सोडत २, सोडत ३...) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सोडत १"
                  value={newLotteryForm.lotteryNumber}
                  onChange={(e) =>
                    setNewLotteryForm({ ...newLotteryForm, lotteryNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  सोडतीचे पूर्ण नाव / शीर्षक *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सोडत क्रमांक १ - पडेगाव गट क्र. ६९"
                  value={newLotteryForm.lotteryName}
                  onChange={(e) =>
                    setNewLotteryForm({ ...newLotteryForm, lotteryName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    सोडत दिनांक
                  </label>
                  <input
                    type="date"
                    value={newLotteryForm.drawDate}
                    onChange={(e) =>
                      setNewLotteryForm({ ...newLotteryForm, drawDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    प्रकल्प जागा
                  </label>
                  <select
                    value={newLotteryForm.projectSite}
                    onChange={(e) =>
                      setNewLotteryForm({ ...newLotteryForm, projectSite: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="ALL">सर्व जागा</option>
                    {PROJECT_SITES.map((s) => (
                      <option key={s.id} value={s.nameEnglish}>
                        {s.nameMarathi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  सोडत स्थळ / सभागृह
                </label>
                <input
                  type="text"
                  placeholder="महानगरपालिका मुख्य प्रशासकीय इमारत"
                  value={newLotteryForm.locationOrVenue}
                  onChange={(e) =>
                    setNewLotteryForm({ ...newLotteryForm, locationOrVenue: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  तपशील किंवा शेरा
                </label>
                <textarea
                  rows={2}
                  placeholder="अधिक माहिती किंवा सोडतीची नोंद..."
                  value={newLotteryForm.description}
                  onChange={(e) =>
                    setNewLotteryForm({ ...newLotteryForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLotteryModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-sm"
                >
                  सोडत सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Beneficiaries to Current Lottery */}
      {showAssignModal && currentLottery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {currentLottery.lotteryNumber} मध्ये लाभार्थी जोडा
                </h3>
                <p className="text-xs text-indigo-100">
                  PMAY चे अर्ज भरलेल्या लाभार्थ्यांना या सोडतीमध्ये समाविष्ट करा
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="नाव, अर्ज क्र. किंवा फोन नंबर शोधा..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <button
                onClick={() => {
                  if (assignSelectedIds.length === filteredUnassigned.length) {
                    setAssignSelectedIds([]);
                  } else {
                    setAssignSelectedIds(filteredUnassigned.map((b) => b.id));
                  }
                }}
                className="text-xs text-indigo-600 font-semibold px-2 py-1.5 bg-white border border-indigo-200 rounded"
              >
                {assignSelectedIds.length === filteredUnassigned.length
                  ? 'सर्व निवड रद्द'
                  : 'सर्व निवडा'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {filteredUnassigned.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  जोडण्यासाठी उपलब्ध लाभार्थी आढळले नाहीत.
                </div>
              ) : (
                filteredUnassigned.map((b) => {
                  const isChecked = assignSelectedIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setAssignSelectedIds((prev) =>
                          prev.includes(b.id)
                            ? prev.filter((id) => id !== b.id)
                            : [...prev, b.id]
                        );
                      }}
                      className={`py-2.5 px-2 flex items-center justify-between cursor-pointer rounded-lg hover:bg-slate-50 ${
                        isChecked ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">
                            {b.beneficiaryName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {b.applicationNumber} | {b.projectSite} | {b.mobileNumber}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {b.lottery?.lotteryNumber ? `पूर्वी: ${b.lottery.lotteryNumber}` : 'सोडत नाही'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">
                निवडलेले: <strong>{assignSelectedIds.length}</strong> लाभार्थी
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  रद्द
                </button>
                <button
                  onClick={handleConfirmAssign}
                  disabled={assignSelectedIds.length === 0}
                  className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded shadow-xs"
                >
                  सोडतीत जोडा ({assignSelectedIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Single Beneficiary Lottery Record */}
      {editingBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">सोडत निकाल नोंदणी (Lottery Entry)</h3>
                <p className="text-xs text-slate-300">
                  {editingBeneficiary.beneficiaryName} ({editingBeneficiary.applicationNumber})
                </p>
              </div>
              <button
                onClick={() => setEditingBeneficiary(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditingBeneficiary(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  सोडतीचा क्रमांक / नाव
                </label>
                <select
                  value={editingBeneficiary.lottery?.lotteryNumber || 'सोडत १'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = lotteries.find((l) => l.lotteryNumber === val);
                    updateBeneficiaryLottery(editingBeneficiary.id, {
                      lotteryNumber: val,
                      lotteryName: matched?.lotteryName || val,
                      lotteryId: matched?.id || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  {lotteries.map((l) => (
                    <option key={l.id} value={l.lotteryNumber}>
                      {l.lotteryNumber} - {l.lotteryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ड्रॉ टोकन क्रमांक (Draw / Token Number)
                </label>
                <input
                  type="text"
                  placeholder="उदा. TKN-458 किंवा 102"
                  value={editingBeneficiary.lottery?.drawTokenNumber || ''}
                  onChange={(e) =>
                    updateBeneficiaryLottery(editingBeneficiary.id, {
                      drawTokenNumber: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    सोडत निकाल (Lottery Result) *
                  </label>
                  <select
                    value={editingBeneficiary.lottery?.result || 'PENDING'}
                    onChange={(e) =>
                      updateBeneficiaryLottery(editingBeneficiary.id, {
                        result: e.target.value as LotteryResultType
                      })
                    }
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    <option value="SELECTED">निवड झाली (Selected)</option>
                    <option value="WAITING">प्रतीक्षा यादी (Waiting List)</option>
                    <option value="NOT_SELECTED">निवड झाली नाही (Not Selected)</option>
                    <option value="PENDING">अनिर्णीत (Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    लाभार्थी प्रतिसाद (Response)
                  </label>
                  <select
                    value={editingBeneficiary.lottery?.response || 'PENDING'}
                    onChange={(e) =>
                      updateBeneficiaryLottery(editingBeneficiary.id, {
                        response: e.target.value as LotteryResponseType
                      })
                    }
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    <option value="PENDING">प्रलंबित (Pending)</option>
                    <option value="ACCEPT">संमती दिली (Accept)</option>
                    <option value="REJECT">नकार दिला (Reject)</option>
                    <option value="NO RESPONSE">प्रतिसाद नाही (No Response)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  सोडत दिनांक
                </label>
                <input
                  type="date"
                  value={editingBeneficiary.lottery?.lotteryDate || ''}
                  onChange={(e) =>
                    updateBeneficiaryLottery(editingBeneficiary.id, {
                      lotteryDate: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  शेरा / टिप्पणी (Remarks)
                </label>
                <textarea
                  rows={2}
                  placeholder="सोडत व निकालासंबंधी शेरा..."
                  value={editingBeneficiary.lottery?.remarks || ''}
                  onChange={(e) =>
                    updateBeneficiaryLottery(editingBeneficiary.id, {
                      remarks: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBeneficiary(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium"
                >
                  पूर्ण झाले
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Batch Update Result */}
      {showBatchResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                निवडलेल्या {selectedIds.length} लाभार्थ्यांचा निकाल नोंदवा
              </h3>
              <button
                onClick={() => setShowBatchResultModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  सोडत निकाल निवडा
                </label>
                <select
                  id="batchResultSelect"
                  defaultValue="SELECTED"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="SELECTED">निवड झाली (Selected / Winners)</option>
                  <option value="WAITING">प्रतीक्षा यादी (Waiting List)</option>
                  <option value="NOT_SELECTED">निवड झाली नाही (Not Selected)</option>
                  <option value="PENDING">अनिर्णीत (Pending)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  लाभार्थी प्रतिसाद (ऐच्छिक)
                </label>
                <select
                  id="batchResponseSelect"
                  defaultValue="PENDING"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="PENDING">प्रलंबित (Pending)</option>
                  <option value="ACCEPT">संमती दिली (Accept)</option>
                  <option value="REJECT">नकार दिला (Reject)</option>
                  <option value="NO RESPONSE">प्रतिसाद नाही (No Response)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowBatchResultModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  रद्द
                </button>
                <button
                  onClick={() => {
                    const resSelect = document.getElementById('batchResultSelect') as HTMLSelectElement;
                    const respSelect = document.getElementById('batchResponseSelect') as HTMLSelectElement;
                    batchUpdateLotteryResults(selectedIds, {
                      result: resSelect.value as LotteryResultType,
                      response: respSelect.value as LotteryResponseType
                    });
                    alert(`${selectedIds.length} लाभार्थ्यांचा निकाल यशस्वीरीत्या सेव्ह झाला.`);
                    setShowBatchResultModal(false);
                    setSelectedIds([]);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded shadow-xs"
                >
                  निकाल सेव्ह करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: A4 Official Print Layout */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl my-auto overflow-hidden">
            {/* Modal Controls */}
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between print:hidden">
              <span className="text-xs font-semibold">
                सोडत यादी प्रिंट पूर्वावलोकन (A4 Print Preview)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  आता प्रिंट करा
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 text-white/80 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 bg-white text-slate-900 print:p-0">
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-slate-800">
                <h1 className="text-lg font-black tracking-wide">
                  प्रधानमंत्री आवास योजना (शहरी)
                </h1>
                <h2 className="text-base font-bold text-slate-800">
                  महानगरपालिका छत्रपती संभाजीनगर
                </h2>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded border border-slate-300 text-xs font-black uppercase tracking-wider">
                  अधिकृत सोडत यादी - {currentLottery?.lotteryName || 'सर्व सोडती'}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-200">
                  <span>
                    सोडत दिनांक: <strong>{currentLottery?.drawDate || new Date().toISOString().split('T')[0]}</strong>
                  </span>
                  <span>
                    प्रकल्प: <strong>{currentLottery?.projectSite || 'सर्व प्रकल्प'}</strong>
                  </span>
                  <span>
                    यादी मुद्रण दिनांक: <strong>{new Date().toLocaleDateString('mr-IN')}</strong>
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="w-full mt-4 border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border border-slate-400 text-slate-800 font-bold">
                    <th className="p-1.5 border border-slate-300 text-center w-8">क्र.</th>
                    <th className="p-1.5 border border-slate-300 text-left">अर्ज क्रमांक</th>
                    <th className="p-1.5 border border-slate-300 text-left">लाभार्थ्याचे नाव</th>
                    <th className="p-1.5 border border-slate-300 text-left">नातेवाईक</th>
                    <th className="p-1.5 border border-slate-300 text-left">मोबाईल</th>
                    <th className="p-1.5 border border-slate-300 text-center">सोडत क्र.</th>
                    <th className="p-1.5 border border-slate-300 text-center">टोकन क्र.</th>
                    <th className="p-1.5 border border-slate-300 text-center">निकाल</th>
                    <th className="p-1.5 border border-slate-300 text-center">प्रतिसाद</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeneficiaries.map((b, i) => (
                    <tr key={b.id} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="p-1.5 border border-slate-300 text-center">{i + 1}</td>
                      <td className="p-1.5 border border-slate-300 font-mono font-semibold">
                        {b.applicationNumber}
                      </td>
                      <td className="p-1.5 border border-slate-300 font-bold">
                        {b.beneficiaryName}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-slate-600">
                        {b.fatherSpouseName || '-'}
                      </td>
                      <td className="p-1.5 border border-slate-300 font-mono">
                        {b.mobileNumber || '-'}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center">
                        {b.lottery?.lotteryNumber || currentLottery?.lotteryNumber || '-'}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">
                        {b.lottery?.drawTokenNumber || '-'}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-bold">
                        {b.lottery?.result === 'SELECTED'
                          ? 'निवड'
                          : b.lottery?.result === 'WAITING'
                          ? 'प्रतीक्षा'
                          : b.lottery?.result === 'NOT_SELECTED'
                          ? 'नाही'
                          : 'अनिर्णीत'}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center">
                        {b.lottery?.response === 'ACCEPT'
                          ? 'संमती'
                          : b.lottery?.response === 'REJECT'
                          ? 'नकार'
                          : b.lottery?.response === 'NO RESPONSE'
                          ? 'संपर्क नाही'
                          : 'प्रलंबित'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="mt-12 pt-6 flex justify-between items-end text-center text-xs text-slate-700">
                <div className="w-48 border-t border-slate-400 pt-2">
                  प्रकल्प समन्वयक (PMAY)
                </div>
                <div className="w-48 border-t border-slate-400 pt-2">
                  उपायुक्त / नोडल अधिकारी
                </div>
                <div className="w-48 border-t border-slate-400 pt-2">
                  मा. आयुक्त तथा संचालक<br />
                  महानगरपालिका छत्रपती संभाजीनगर
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
