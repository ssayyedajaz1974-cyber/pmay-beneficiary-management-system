import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  BeneficiaryRecord,
  AcceptanceStatusType,
  Payment10StatusType,
  Payment20StatusType,
  Payment20Mode,
  LoanStatusType,
  LotteryResultType,
  LotteryResponseType,
  BeneficiaryLotteryRecord,
  createDefaultBeneficiaryLotteryRecord,
  LotteryEvent,
  ImportTargetStage,
  STAGE_METAS,
  detectStageFromFileName,
  BeneficiaryStageHistoryItem,
  getHouseCostForSite,
  GOVT_SUBSIDY_AMOUNT
} from '../types/pmay';

export type NavItem =
  | 'dashboard'
  | 'newForms'
  | 'lottery'
  | 'acceptance'
  | 'payment10'
  | 'payment20'
  | 'loan'
  | 'list'
  | 'search'
  | 'documents'
  | 'reports'
  | 'print'
  | 'settings';

export interface BeneficiaryStats {
  total: number;
  newFormsCount: number;
  lotteryTotal: number;
  lotterySelected: number;
  lotteryWaiting: number;
  lotteryNotSelected: number;
  accepted: number;
  rejected: number;
  noResponse: number;
  pendingAcceptance: number;
  payment10Pending: number;
  payment10Paid: number;
  payment20Pending: number;
  payment20Paid: number;
  loanUnderProcess: number;
  loanApproved: number;
  loanRejected: number;
}

export interface ImportOptions {
  targetStage?: ImportTargetStage;
  duplicateHandling?: 'update_stage' | 'add_new' | 'skip';
  customFileName?: string;
}

export interface ImportResult {
  success: boolean;
  count: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  targetStage: ImportTargetStage;
  fileName: string;
  message: string;
}

export interface ExcelAnalysis {
  fileName: string;
  suggestedStage: ImportTargetStage;
  totalRows: number;
  detectedCols: string[];
  sampleRows: Record<string, any>[];
  duplicatesCount: number;
  newCount: number;
  duplicateNames: string[];
}

export interface ImportedFileRecord {
  fileName: string;
  stage: ImportTargetStage;
  stageTitle: string;
  count: number;
  importedAt: string;
}

interface BeneficiaryContextType {
  beneficiaries: BeneficiaryRecord[];
  activeBeneficiary: BeneficiaryRecord | null;
  setActiveBeneficiary: (b: BeneficiaryRecord | null) => void;
  currentNav: NavItem;
  setCurrentNav: (nav: NavItem) => void;
  stats: BeneficiaryStats;

  // CRUD Operations
  addBeneficiary: (data: Partial<BeneficiaryRecord>) => BeneficiaryRecord;
  updateBeneficiary: (id: string, updates: Partial<BeneficiaryRecord>) => void;
  deleteBeneficiary: (id: string) => void;

  // Workflow updates
  updateAcceptance: (
    id: string,
    status: AcceptanceStatusType,
    date?: string,
    remarks?: string
  ) => void;
  updatePayment10: (
    id: string,
    payment: Partial<BeneficiaryRecord['payment10Percent']>
  ) => void;
  updatePayment20: (
    id: string,
    payment: Partial<BeneficiaryRecord['payment20Percent']>
  ) => void;
  updateLoanProcess: (
    id: string,
    loan: Partial<BeneficiaryRecord['loanProcess']>
  ) => void;

  // Lottery Management (सोडत व्यवस्थापन)
  lotteries: LotteryEvent[];
  addLottery: (lottery: Omit<LotteryEvent, 'id' | 'createdAt'>) => LotteryEvent;
  updateLottery: (id: string, updates: Partial<LotteryEvent>) => void;
  deleteLottery: (id: string) => void;
  updateBeneficiaryLottery: (
    beneficiaryId: string,
    lotteryData: Partial<BeneficiaryLotteryRecord>
  ) => void;
  batchAssignLottery: (
    beneficiaryIds: string[],
    lotteryInfo: { id: string; number: string; name: string; date: string },
    defaultResult?: LotteryResultType
  ) => void;
  batchUpdateLotteryResults: (
    beneficiaryIds: string[],
    updates: Partial<BeneficiaryLotteryRecord>
  ) => void;
  pushLotterySelectedToAcceptance: (beneficiaryIds: string[]) => void;

  // Excel Analysis & Import
  analyzeExcelFile: (file: File) => Promise<ExcelAnalysis | null>;
  importExcelFile: (file: File, options?: ImportOptions) => Promise<ImportResult>;
  importedFilesList: ImportedFileRecord[];
  lastImportedInfo: { fileName: string; stageTitle: string; count: number } | null;
  clearLastImportedInfo: () => void;

  // Export & Storage
  exportToExcel: (dataToExport?: BeneficiaryRecord[], fileName?: string) => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;
  clearAllData: () => void;
  rawExcelColumns: string[];
}

const STORAGE_KEY = 'pmay_csn_working_db_v5';
const COLUMNS_KEY = 'pmay_csn_excel_cols_v5';
const FILES_KEY = 'pmay_csn_imported_files_v5';
const LOTTERIES_KEY = 'pmay_csn_lotteries_v5';

const BeneficiaryContext = createContext<BeneficiaryContextType | undefined>(undefined);

export const BeneficiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Master Working Database in LocalStorage (No Fake Data!)
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem('pmay_csn_working_db_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            lottery: item.lottery || createDefaultBeneficiaryLotteryRecord()
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse working beneficiary database', e);
    }
    return [];
  });

  // Dynamic Lotteries Management
  const [lotteries, setLotteries] = useState<LotteryEvent[]>(() => {
    try {
      const saved = localStorage.getItem(LOTTERIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse lotteries', e);
    }
    return [
      {
        id: 'lottery_1',
        lotteryNumber: 'सोडत १',
        lotteryName: 'सोडत क्रमांक १ (Lottery 1)',
        drawDate: '2024-01-15',
        locationOrVenue: 'महानगरपालिका मुख्य प्रशासकीय इमारत, छत्रपती संभाजीनगर',
        projectSite: 'ALL',
        description: 'PMAY प्रथम टप्पा अधिकृत सोडत',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'lottery_2',
        lotteryNumber: 'सोडत २',
        lotteryName: 'सोडत क्रमांक २ (Lottery 2)',
        drawDate: '2024-03-20',
        locationOrVenue: 'महानगरपालिका मुख्य प्रशासकीय इमारत',
        projectSite: 'Padegaon Group No. 69',
        description: 'पडेगाव गट क्र. ६९ विशेष सोडत',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'lottery_3',
        lotteryNumber: 'सोडत ३',
        lotteryName: 'सोडत क्रमांक ३ (Lottery 3)',
        drawDate: '2024-06-10',
        locationOrVenue: 'महानगरपालिका सभागृह',
        projectSite: 'Tisgaon Group No. 225/1',
        description: 'तिसगाव प्रकल्पासाठी तिसरी सोडत',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOTTERIES_KEY, JSON.stringify(lotteries));
    } catch (e) {
      console.error('Could not save lotteries to localStorage', e);
    }
  }, [lotteries]);

  const [rawExcelColumns, setRawExcelColumns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_KEY) || localStorage.getItem('pmay_csn_excel_cols_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse columns', e);
    }
    return [];
  });

  const [importedFilesList, setImportedFilesList] = useState<ImportedFileRecord[]>(() => {
    try {
      const saved = localStorage.getItem(FILES_KEY) || localStorage.getItem('pmay_csn_imported_files_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse imported files', e);
    }
    return [];
  });

  const [lastImportedInfo, setLastImportedInfo] = useState<{
    fileName: string;
    stageTitle: string;
    count: number;
  } | null>(null);

  const [activeBeneficiary, setActiveBeneficiary] = useState<BeneficiaryRecord | null>(null);
  const [currentNav, setCurrentNav] = useState<NavItem>('dashboard');

  // Durable Persistence across page refresh & restart
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(beneficiaries));
    } catch (e) {
      console.error('Could not save beneficiaries to localStorage', e);
    }
  }, [beneficiaries]);

  useEffect(() => {
    try {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(rawExcelColumns));
    } catch (e) {
      console.error('Could not save columns to localStorage', e);
    }
  }, [rawExcelColumns]);

  useEffect(() => {
    try {
      localStorage.setItem(FILES_KEY, JSON.stringify(importedFilesList));
    } catch (e) {
      console.error('Could not save imported files to localStorage', e);
    }
  }, [importedFilesList]);

  // Keep activeBeneficiary in sync if it gets updated in the array
  useEffect(() => {
    if (activeBeneficiary) {
      const updated = beneficiaries.find((b) => b.id === activeBeneficiary.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(activeBeneficiary)) {
        setActiveBeneficiary(updated);
      }
    }
  }, [beneficiaries, activeBeneficiary]);

  // Dynamic Dashboard Stats
  const stats = useMemo<BeneficiaryStats>(() => {
    let accepted = 0;
    let rejected = 0;
    let noResponse = 0;
    let pendingAcceptance = 0;
    let newFormsCount = 0;

    let lotteryTotal = 0;
    let lotterySelected = 0;
    let lotteryWaiting = 0;
    let lotteryNotSelected = 0;

    let payment10Pending = 0;
    let payment10Paid = 0;

    let payment20Pending = 0;
    let payment20Paid = 0;

    let loanUnderProcess = 0;
    let loanApproved = 0;
    let loanRejected = 0;

    for (const b of beneficiaries) {
      // Lottery metrics
      if (b.lottery && (b.lottery.lotteryNumber || b.lottery.lotteryName || b.lottery.result !== 'NOT_PARTICIPATED')) {
        lotteryTotal++;
        if (b.lottery.result === 'SELECTED') lotterySelected++;
        else if (b.lottery.result === 'WAITING') lotteryWaiting++;
        else if (b.lottery.result === 'NOT_SELECTED') lotteryNotSelected++;
      }

      // New Form Filled or Pending Acceptance
      if (b.importStage === 'NEW_FORM_FILLED' || b.acceptance.status === 'PENDING') {
        newFormsCount++;
      }

      // Acceptance
      if (b.acceptance.status === 'ACCEPT') accepted++;
      else if (b.acceptance.status === 'REJECT') rejected++;
      else if (b.acceptance.status === 'NO RESPONSE') noResponse++;
      else pendingAcceptance++;

      // 10% Payment
      if (b.payment10Percent.status === 'PAID') payment10Paid++;
      else if (b.payment10Percent.status === 'PENDING' && b.acceptance.status === 'ACCEPT') payment10Pending++;

      // 20% Payment
      if (b.payment20Percent.status === 'PAID') payment20Paid++;
      else if (b.payment20Percent.status === 'PENDING') payment20Pending++;

      // Loan
      if (
        b.loanProcess.status === 'File Sent to Bank' ||
        b.loanProcess.status === 'Under Process'
      ) {
        loanUnderProcess++;
      } else if (b.loanProcess.status === 'Loan Approved') {
        loanApproved++;
      } else if (b.loanProcess.status === 'Loan Rejected') {
        loanRejected++;
      }
    }

    return {
      total: beneficiaries.length,
      newFormsCount,
      lotteryTotal,
      lotterySelected,
      lotteryWaiting,
      lotteryNotSelected,
      accepted,
      rejected,
      noResponse,
      pendingAcceptance,
      payment10Pending,
      payment10Paid,
      payment20Pending,
      payment20Paid,
      loanUnderProcess,
      loanApproved,
      loanRejected
    };
  }, [beneficiaries]);

  // Helper to find value from row by fuzzy matching column names
  const findVal = (row: Record<string, any>, candidates: string[]): string => {
    const keys = Object.keys(row);
    for (const c of candidates) {
      const matchedKey = keys.find((k) => k.toLowerCase().trim() === c.toLowerCase().trim());
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        const val = String(row[matchedKey]).trim();
        if (val !== '') return val;
      }
    }
    // Partial substring fallback
    for (const c of candidates) {
      const matchedKey = keys.find((k) => k.toLowerCase().includes(c.toLowerCase()));
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        const val = String(row[matchedKey]).trim();
        if (val !== '') return val;
      }
    }
    return '';
  };

  /**
   * Analyze an Excel file prior to import: detects file name, suggests stage, previews columns and counts duplicates.
   */
  const analyzeExcelFile = async (file: File): Promise<ExcelAnalysis | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            resolve(null);
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            defval: '',
            raw: false
          });

          if (!rawRows || rawRows.length === 0) {
            resolve(null);
            return;
          }

          const detectedCols = Object.keys(rawRows[0] || {});
          const suggestedStage = detectStageFromFileName(file.name);

          // Find duplicates
          let duplicatesCount = 0;
          const duplicateNames: string[] = [];

          rawRows.forEach((row, idx) => {
            const appNo = findVal(row, ['application', 'app no', 'form no', 'अर्ज क्रमांक', 'क्रमांक', 'sr no']);
            const mobile = findVal(row, ['mobile', 'phone', 'contact', 'मोबाईल', 'संपर्क']);
            const name = findVal(row, ['beneficiary name', 'applicant name', 'name', 'नाव', 'लाभार्थी']);

            const isDuplicate = beneficiaries.some((b) => {
              if (appNo && b.applicationNumber && b.applicationNumber.toLowerCase() === appNo.toLowerCase()) {
                return true;
              }
              if (mobile && mobile.length >= 10 && b.mobileNumber && b.mobileNumber === mobile) {
                return true;
              }
              if (name && b.beneficiaryName && b.beneficiaryName.toLowerCase() === name.toLowerCase()) {
                return true;
              }
              return false;
            });

            if (isDuplicate) {
              duplicatesCount++;
              if (duplicateNames.length < 5 && name) {
                duplicateNames.push(name);
              }
            }
          });

          resolve({
            fileName: file.name,
            suggestedStage,
            totalRows: rawRows.length,
            detectedCols,
            sampleRows: rawRows.slice(0, 4),
            duplicatesCount,
            newCount: rawRows.length - duplicatesCount,
            duplicateNames
          });
        } catch (err) {
          console.error('Error analyzing Excel file', err);
          resolve(null);
        }
      };

      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Import an Excel file with specific stage routing and duplicate resolution
   */
  const importExcelFile = async (
    file: File,
    options?: ImportOptions
  ): Promise<ImportResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            resolve({
              success: false,
              count: 0,
              newCount: 0,
              updatedCount: 0,
              skippedCount: 0,
              targetStage: 'NEW_FORM_FILLED',
              fileName: file.name,
              message: 'एक्सेल फाईलमध्ये शीट आढळली नाही.'
            });
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            defval: '',
            raw: false
          });

          if (!rawRows || rawRows.length === 0) {
            resolve({
              success: false,
              count: 0,
              newCount: 0,
              updatedCount: 0,
              skippedCount: 0,
              targetStage: 'NEW_FORM_FILLED',
              fileName: file.name,
              message: 'एक्सेल फाईल रिकामी आहे किंवा कोणताही डेटा सापडला नाही.'
            });
            return;
          }

          const fileName = options?.customFileName || file.name;
          const targetStage: ImportTargetStage =
            options?.targetStage || detectStageFromFileName(fileName);
          const duplicateHandling = options?.duplicateHandling || 'update_stage';

          const detectedCols = Object.keys(rawRows[0] || {});
          setRawExcelColumns((prev) => Array.from(new Set([...prev, ...detectedCols])));

          const stageMeta = STAGE_METAS[targetStage];
          const stageTitle = stageMeta.titleMarathi;

          let updatedCount = 0;
          let newCount = 0;
          let skippedCount = 0;

          // Copy working beneficiaries
          const workingList = [...beneficiaries];

          rawRows.forEach((row, index) => {
            const name =
              findVal(row, ['beneficiary name', 'applicant name', 'name', 'नाव', 'लाभार्थी']) ||
              `Beneficiary ${index + 1}`;

            const fatherSpouse =
              findVal(row, ['father', 'husband', 'spouse', 'वडिलांचे', 'पतीचे', 'नातेवाईक']) || '';

            const appNo =
              findVal(row, ['application', 'app no', 'form no', 'अर्ज क्रमांक', 'क्रमांक', 'sr no']) ||
              `PMAY-${new Date().getFullYear()}-${String(index + 1).padStart(5, '0')}`;

            const mobile =
              findVal(row, ['mobile', 'phone', 'contact', 'मोबाईल', 'संपर्क']) || '';

            const site =
              findVal(row, ['project', 'site', 'location', 'प्रकल्प', 'जागा', 'गट']) ||
              'Padegaon Group No. 69';

            const group =
              findVal(row, ['group', 'गट']) ||
              (site.includes('225') ? '225/1' : site.includes('227') ? '227/1' : '69');

            const building = findVal(row, ['building', 'इमारत']) || '';
            const wing = findVal(row, ['wing', 'विंग']) || '';
            const floor = findVal(row, ['floor', 'मजला']) || '';
            const flat = findVal(row, ['flat', 'house', 'सदनिका', 'घर']) || '';

            const houseCost = getHouseCostForSite(site);
            const amount10 = Math.round(houseCost * 0.10);
            const amount20 = Math.round(houseCost * 0.20);

            // Additional extracted fields
            const extractedBank = findVal(row, ['bank name', 'बँकेचे नाव', 'बँक', 'bank']);
            const extractedBranch = findVal(row, ['branch', 'शाखा', 'बँक शाखा']);
            const extractedLoanFileNo = findVal(row, ['loan file', 'file no', 'loan no', 'कर्ज फाईल', 'फाईल क्र']);
            const extractedSentDate = findVal(row, ['file sent', 'पाठवल्याचा दिनांक', 'sent date']);
            const extractedDate = findVal(row, ['date', 'दिनांक', 'तारीख', 'payment date', 'sanction date']);
            const extractedReceipt = findVal(row, ['receipt', 'पावती', 'पावती क्र', 'receipt no']);
            const extractedTxn = findVal(row, ['transaction', 'utr', 'ref no', 'व्यवहार क्र']);
            const extractedRemarks = findVal(row, ['remark', 'शेरा', 'remarks']);
            const extractedRejReason = findVal(row, ['rejection reason', 'कारण', 'नाकारण्याचे कारण']);

            // Lottery specific extractions
            const extractedLotteryNo = findVal(row, ['सोडत', 'सोडत क्र', 'lottery', 'lottery no', 'draw', 'सोडत क्रमांक', 'सोडतीचे नाव', 'सोडत नाव']);
            const extractedLotteryToken = findVal(row, ['टोकन', 'token', 'draw no', 'ड्रॉ क्र', 'ड्रॉ क्रमांक', 'टोकन क्र', 'token no', 'लकी ड्रॉ क्र']);
            const extractedLotteryResultVal = findVal(row, ['सोडत निकाल', 'निकाल', 'result', 'lottery result', 'निवड', 'सोडत स्थिती']);
            const extractedLotteryResponseVal = findVal(row, ['सोडत प्रतिसाद', 'प्रतिसाद', 'response', 'lottery response', 'संमती']);

            let parsedResult: LotteryResultType = 'NOT_PARTICIPATED';
            if (extractedLotteryResultVal) {
              const low = extractedLotteryResultVal.toLowerCase();
              if (low.includes('select') || low.includes('निवड') || low.includes('पात्र') || low.includes('winner') || low.includes('यशस्वी')) {
                parsedResult = 'SELECTED';
              } else if (low.includes('wait') || low.includes('प्रतीक्षा') || low.includes('वेटिंग')) {
                parsedResult = 'WAITING';
              } else if (low.includes('not') || low.includes('नाही') || low.includes('नाकार') || low.includes('अपात्र')) {
                parsedResult = 'NOT_SELECTED';
              } else {
                parsedResult = 'PENDING';
              }
            } else if (targetStage === 'LOTTERY_LIST' || extractedLotteryNo) {
              parsedResult = 'SELECTED';
            }

            let parsedResponse: LotteryResponseType = 'PENDING';
            if (extractedLotteryResponseVal) {
              const low = extractedLotteryResponseVal.toLowerCase();
              if (low.includes('accept') || low.includes('संमती') || low.includes('मान्य')) parsedResponse = 'ACCEPT';
              else if (low.includes('reject') || low.includes('नकार') || low.includes('रद्द')) parsedResponse = 'REJECT';
              else if (low.includes('no response') || low.includes('प्रतिसाद नाही')) parsedResponse = 'NO RESPONSE';
            }

            // Check if beneficiary already exists
            const existingIndex = workingList.findIndex((b) => {
              if (appNo && b.applicationNumber && b.applicationNumber.toLowerCase() === appNo.toLowerCase()) {
                return true;
              }
              if (mobile && mobile.length >= 10 && b.mobileNumber && b.mobileNumber === mobile) {
                return true;
              }
              if (name && b.beneficiaryName && b.beneficiaryName.toLowerCase() === name.toLowerCase()) {
                return true;
              }
              return false;
            });

            if (existingIndex !== -1) {
              // Existing Beneficiary Found!
              if (duplicateHandling === 'skip') {
                skippedCount++;
                return;
              }

              if (duplicateHandling === 'update_stage') {
                const b = workingList[existingIndex];
                const nowStr = new Date().toISOString();
                const todayStr = nowStr.split('T')[0];

                // Merge row data and update stage based on targetStage
                const updatedStageHistory: BeneficiaryStageHistoryItem[] = [
                  ...(b.stageHistory || []),
                  {
                    stage: stageTitle,
                    timestamp: nowStr,
                    note: `Excel द्वारे आयात (${fileName}) - स्थिती अपडेट`,
                    fileName
                  }
                ];

                // Apply updates to the existing record
                b.importedFileName = fileName;
                b.importStage = targetStage;
                b.stageHistory = updatedStageHistory;
                b.rawExcelData = { ...b.rawExcelData, ...row };
                b.updatedAt = nowStr;

                if (site) b.projectSite = site;
                if (group) b.groupNumber = group;
                if (building) b.buildingNumber = building;
                if (wing) b.wing = wing;
                if (floor) b.floor = floor;
                if (flat) b.flatHouseNumber = flat;

                // Stage-specific updates
                if (targetStage === 'ACCEPTED') {
                  b.acceptance.status = 'ACCEPT';
                  b.acceptance.date = extractedDate || b.acceptance.date || todayStr;
                  if (extractedRemarks) b.acceptance.remarks = extractedRemarks;
                } else if (targetStage === 'REJECTED') {
                  b.acceptance.status = 'REJECT';
                  b.acceptance.date = extractedDate || b.acceptance.date || todayStr;
                  if (extractedRemarks) b.acceptance.remarks = extractedRemarks;
                } else if (targetStage === 'NO_RESPONSE') {
                  b.acceptance.status = 'NO RESPONSE';
                  b.acceptance.date = extractedDate || b.acceptance.date || todayStr;
                } else if (targetStage === 'PAYMENT_10_PAID') {
                  b.acceptance.status = 'ACCEPT';
                  b.payment10Percent.status = 'PAID';
                  b.payment10Percent.paymentDate = extractedDate || b.payment10Percent.paymentDate || todayStr;
                  if (extractedReceipt) b.payment10Percent.receiptNo = extractedReceipt;
                  if (extractedTxn) b.payment10Percent.transactionRef = extractedTxn;
                  if (extractedRemarks) b.payment10Percent.remarks = extractedRemarks;
                } else if (targetStage === 'PAYMENT_10_PENDING') {
                  b.acceptance.status = 'ACCEPT';
                  b.payment10Percent.status = 'PENDING';
                } else if (targetStage === 'PAYMENT_20_PAID') {
                  b.acceptance.status = 'ACCEPT';
                  b.payment10Percent.status = 'PAID';
                  b.payment20Percent.status = 'PAID';
                  b.payment20Percent.mode = '20% PAYMENT';
                  b.payment20Percent.paymentDate = extractedDate || b.payment20Percent.paymentDate || todayStr;
                  if (extractedReceipt) b.payment20Percent.receiptNo = extractedReceipt;
                  if (extractedTxn) b.payment20Percent.transactionRef = extractedTxn;
                  if (extractedRemarks) b.payment20Percent.remarks = extractedRemarks;
                } else if (targetStage === 'LOAN_UNDER_PROCESS') {
                  b.acceptance.status = 'ACCEPT';
                  b.payment10Percent.status = 'PAID';
                  b.payment20Percent.mode = 'LOAN PROCESS';
                  b.loanProcess.status = 'Under Process';
                  if (extractedBank) b.loanProcess.bankName = extractedBank;
                  if (extractedBranch) b.loanProcess.bankBranch = extractedBranch;
                  if (extractedLoanFileNo) b.loanProcess.loanFileNumber = extractedLoanFileNo;
                  if (extractedSentDate) b.loanProcess.fileSentDate = extractedSentDate;
                  if (extractedRemarks) b.loanProcess.staffRemarks = extractedRemarks;
                  b.loanProcess.lastUpdatedDate = todayStr;
                } else if (targetStage === 'LOAN_APPROVED') {
                  b.acceptance.status = 'ACCEPT';
                  b.payment10Percent.status = 'PAID';
                  b.payment20Percent.mode = 'LOAN PROCESS';
                  b.loanProcess.status = 'Loan Approved';
                  if (extractedBank) b.loanProcess.bankName = extractedBank;
                  if (extractedBranch) b.loanProcess.bankBranch = extractedBranch;
                  if (extractedDate) b.loanProcess.sanctionDate = extractedDate;
                  b.loanProcess.lastUpdatedDate = todayStr;
                } else if (targetStage === 'LOAN_REJECTED') {
                  b.acceptance.status = 'ACCEPT';
                  b.payment10Percent.status = 'PAID';
                  b.payment20Percent.mode = 'LOAN PROCESS';
                  b.loanProcess.status = 'Loan Rejected';
                  if (extractedBank) b.loanProcess.bankName = extractedBank;
                  if (extractedRejReason) b.loanProcess.rejectionReason = extractedRejReason;
                  if (extractedDate) b.loanProcess.rejectionDate = extractedDate;
                  b.loanProcess.lastUpdatedDate = todayStr;
                } else if (targetStage === 'LOTTERY_LIST' || extractedLotteryNo) {
                  const lotNum = extractedLotteryNo || 'सोडत १';
                  b.lottery = {
                    lotteryId: b.lottery?.lotteryId || 'lottery_1',
                    lotteryNumber: lotNum,
                    lotteryName: lotNum,
                    lotteryDate: extractedDate || b.lottery?.lotteryDate || todayStr,
                    drawTokenNumber: extractedLotteryToken || b.lottery?.drawTokenNumber || '',
                    isWinner: parsedResult === 'SELECTED',
                    result: parsedResult !== 'NOT_PARTICIPATED' ? parsedResult : 'SELECTED',
                    response: parsedResponse,
                    remarks: extractedRemarks || b.lottery?.remarks || '',
                    updatedAt: todayStr
                  };
                }

                updatedCount++;
                return;
              }
            }

            // Otherwise, create a new Beneficiary Record
            const now = new Date().toISOString();
            const today = now.split('T')[0];

            const initialHistory: BeneficiaryStageHistoryItem[] = [
              {
                stage: stageTitle,
                timestamp: now,
                note: `Excel द्वारे आयात (${fileName})`,
                fileName
              }
            ];

            const record: BeneficiaryRecord = {
              id: `BEN-${Date.now().toString().slice(-6)}-${workingList.length + newCount + 1}`,
              applicationNumber: appNo,
              beneficiaryName: name,
              fatherSpouseName: fatherSpouse,
              mobileNumber: mobile,
              projectSite: site,
              groupNumber: group,
              buildingNumber: building,
              wing: wing,
              floor: floor,
              flatHouseNumber: flat,
              houseCost: houseCost,
              subsidyAmount: GOVT_SUBSIDY_AMOUNT,
              acceptance: {
                status:
                  targetStage === 'ACCEPTED' ||
                  targetStage === 'PAYMENT_10_PAID' ||
                  targetStage === 'PAYMENT_10_PENDING' ||
                  targetStage === 'PAYMENT_20_PAID' ||
                  targetStage.startsWith('LOAN_')
                    ? 'ACCEPT'
                    : targetStage === 'REJECTED'
                    ? 'REJECT'
                    : targetStage === 'NO_RESPONSE'
                    ? 'NO RESPONSE'
                    : 'PENDING',
                date: targetStage === 'ACCEPTED' ? extractedDate || today : '',
                remarks: targetStage === 'ACCEPTED' ? extractedRemarks : ''
              },
              payment10Percent: {
                status:
                  targetStage === 'PAYMENT_10_PAID' ||
                  targetStage === 'PAYMENT_20_PAID' ||
                  targetStage.startsWith('LOAN_')
                    ? 'PAID'
                    : 'PENDING',
                amount: amount10,
                paymentDate: targetStage === 'PAYMENT_10_PAID' ? extractedDate || today : '',
                transactionRef: targetStage === 'PAYMENT_10_PAID' ? extractedTxn : '',
                receiptNo: targetStage === 'PAYMENT_10_PAID' ? extractedReceipt : '',
                remarks: targetStage === 'PAYMENT_10_PAID' ? extractedRemarks : ''
              },
              payment20Percent: {
                mode: targetStage.startsWith('LOAN_')
                  ? 'LOAN PROCESS'
                  : targetStage === 'PAYMENT_20_PAID'
                  ? '20% PAYMENT'
                  : 'NONE',
                status: targetStage === 'PAYMENT_20_PAID' ? 'PAID' : 'PENDING',
                amount: amount20,
                paymentDate: targetStage === 'PAYMENT_20_PAID' ? extractedDate || today : '',
                transactionRef: targetStage === 'PAYMENT_20_PAID' ? extractedTxn : '',
                receiptNo: targetStage === 'PAYMENT_20_PAID' ? extractedReceipt : '',
                remarks: targetStage === 'PAYMENT_20_PAID' ? extractedRemarks : ''
              },
              loanProcess: {
                status:
                  targetStage === 'LOAN_APPROVED'
                    ? 'Loan Approved'
                    : targetStage === 'LOAN_REJECTED'
                    ? 'Loan Rejected'
                    : targetStage === 'LOAN_UNDER_PROCESS'
                    ? 'Under Process'
                    : 'NOT APPLICABLE',
                bankName: extractedBank || '',
                bankBranch: extractedBranch || '',
                fileSentDate: extractedSentDate || (targetStage.startsWith('LOAN_') ? today : ''),
                loanFileNumber: extractedLoanFileNo || '',
                loanAmount: amount20,
                applicationDate: targetStage.startsWith('LOAN_') ? today : '',
                sanctionDate: targetStage === 'LOAN_APPROVED' ? extractedDate || today : '',
                rejectionReason: targetStage === 'LOAN_REJECTED' ? extractedRejReason || 'बँकेकडून कर्ज नाकारले' : '',
                rejectionRemarks: '',
                rejectionDate: targetStage === 'LOAN_REJECTED' ? extractedDate || today : '',
                bankRemarks: '',
                staffRemarks: extractedRemarks || '',
                importantRemarks: '',
                lastUpdatedDate: targetStage.startsWith('LOAN_') ? today : ''
              },
              lottery: {
                lotteryId: extractedLotteryNo ? 'lottery_imported' : (targetStage === 'LOTTERY_LIST' ? 'lottery_1' : ''),
                lotteryNumber: extractedLotteryNo || (targetStage === 'LOTTERY_LIST' ? 'सोडत १' : ''),
                lotteryName: extractedLotteryNo || (targetStage === 'LOTTERY_LIST' ? 'सोडत १' : ''),
                lotteryDate: extractedDate || (targetStage === 'LOTTERY_LIST' ? today : ''),
                drawTokenNumber: extractedLotteryToken || '',
                isWinner: parsedResult === 'SELECTED',
                result: parsedResult !== 'NOT_PARTICIPATED' ? parsedResult : (targetStage === 'LOTTERY_LIST' ? 'SELECTED' : 'NOT_PARTICIPATED'),
                response: parsedResponse,
                remarks: extractedRemarks || '',
                updatedAt: today
              },
              documents: [
                { id: 'doc_aadhaar', name: 'आधार कार्ड (Aadhaar Card)', status: 'Pending', remarks: '' },
                { id: 'doc_pan', name: 'पॅन कार्ड / उत्पन्न पुरावा (Income Proof)', status: 'Pending', remarks: '' },
                { id: 'doc_bank', name: 'बँक पासबुक (Bank Passbook)', status: 'Pending', remarks: '' },
                { id: 'doc_residence', name: 'रहिवासी दाखला (Residence Proof)', status: 'Pending', remarks: '' },
                { id: 'doc_photo', name: 'पासपोर्ट फोटो (Photograph)', status: 'Pending', remarks: '' }
              ],
              importedFileName: fileName,
              importStage: targetStage,
              importedAt: now,
              stageHistory: initialHistory,
              rawExcelData: row,
              generalRemarks: '',
              createdAt: now,
              updatedAt: now
            };

            workingList.push(record);
            newCount++;
          });

          // Save to database
          setBeneficiaries(workingList);

          // Record in importedFilesList
          const newFileRecord: ImportedFileRecord = {
            fileName,
            stage: targetStage,
            stageTitle,
            count: newCount + updatedCount,
            importedAt: new Date().toISOString()
          };

          setImportedFilesList((prev) => [
            newFileRecord,
            ...prev.filter((f) => f.fileName !== fileName)
          ]);

          setLastImportedInfo({
            fileName,
            stageTitle,
            count: newCount + updatedCount
          });

          // Navigate directly to the target view
          setCurrentNav(stageMeta.targetNav as NavItem);

          resolve({
            success: true,
            count: newCount + updatedCount,
            newCount,
            updatedCount,
            skippedCount,
            targetStage,
            fileName,
            message: `यशस्वी! '${fileName}' मधील डेटा '${stageTitle}' विभागात आयात झाला (${newCount} नवीन, ${updatedCount} अद्यतनित).`
          });
        } catch (err: any) {
          console.error('Error importing Excel file', err);
          resolve({
            success: false,
            count: 0,
            newCount: 0,
            updatedCount: 0,
            skippedCount: 0,
            targetStage: 'NEW_FORM_FILLED',
            fileName: file.name,
            message: `एक्सेल वाचताना त्रुटी: ${err?.message || 'अवैध फाईल'}`
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          count: 0,
          newCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          targetStage: 'NEW_FORM_FILLED',
          fileName: file.name,
          message: 'फाईल वाचताना त्रुटी आली.'
        });
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const clearLastImportedInfo = () => {
    setLastImportedInfo(null);
  };

  const addBeneficiary = (data: Partial<BeneficiaryRecord>): BeneficiaryRecord => {
    const site = data.projectSite || 'Padegaon Group No. 69';
    const cost = getHouseCostForSite(site, data.houseCost);
    const amount10 = Math.round(cost * 0.10);
    const amount20 = Math.round(cost * 0.20);
    const now = new Date().toISOString();

    const newRecord: BeneficiaryRecord = {
      id: `BEN-${Date.now().toString().slice(-6)}-${beneficiaries.length + 1}`,
      applicationNumber: data.applicationNumber || `PMAY-NEW-${Date.now().toString().slice(-4)}`,
      beneficiaryName: data.beneficiaryName || 'नवीन लाभार्थी',
      fatherSpouseName: data.fatherSpouseName || '',
      mobileNumber: data.mobileNumber || '',
      projectSite: site,
      groupNumber: data.groupNumber || (site.includes('225') ? '225/1' : site.includes('227') ? '227/1' : '69'),
      buildingNumber: data.buildingNumber || '',
      wing: data.wing || '',
      floor: data.floor || '',
      flatHouseNumber: data.flatHouseNumber || '',
      houseCost: cost,
      subsidyAmount: GOVT_SUBSIDY_AMOUNT,
      acceptance: data.acceptance || {
        status: 'PENDING',
        date: '',
        remarks: ''
      },
      payment10Percent: data.payment10Percent || {
        status: 'PENDING',
        amount: amount10,
        paymentDate: '',
        transactionRef: '',
        receiptNo: '',
        remarks: ''
      },
      payment20Percent: data.payment20Percent || {
        mode: 'NONE',
        status: 'PENDING',
        amount: amount20,
        paymentDate: '',
        transactionRef: '',
        receiptNo: '',
        remarks: ''
      },
      loanProcess: data.loanProcess || {
        status: 'NOT APPLICABLE',
        bankName: '',
        bankBranch: '',
        fileSentDate: '',
        loanFileNumber: '',
        loanAmount: amount20,
        applicationDate: '',
        sanctionDate: '',
        rejectionReason: '',
        rejectionRemarks: '',
        rejectionDate: '',
        bankRemarks: '',
        staffRemarks: '',
        importantRemarks: '',
        lastUpdatedDate: ''
      },
      lottery: data.lottery || createDefaultBeneficiaryLotteryRecord(),
      documents: data.documents || [
        { id: 'doc_aadhaar', name: 'आधार कार्ड (Aadhaar Card)', status: 'Pending', remarks: '' },
        { id: 'doc_pan', name: 'पॅन कार्ड / उत्पन्न पुरावा (Income Proof)', status: 'Pending', remarks: '' },
        { id: 'doc_bank', name: 'बँक पासबुक (Bank Passbook)', status: 'Pending', remarks: '' },
        { id: 'doc_residence', name: 'रहिवासी दाखला (Residence Proof)', status: 'Pending', remarks: '' }
      ],
      importedFileName: data.importedFileName || 'Manual Entry',
      importStage: data.importStage || 'NEW_FORM_FILLED',
      importedAt: now,
      stageHistory: [
        {
          stage: 'नवीन लाभार्थी / Form Filled',
          timestamp: now,
          note: 'मॅन्युअली नोंदणी केली'
        }
      ],
      rawExcelData: data.rawExcelData || {},
      generalRemarks: data.generalRemarks || '',
      createdAt: now,
      updatedAt: now
    };

    setBeneficiaries((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateBeneficiary = (id: string, updates: Partial<BeneficiaryRecord>) => {
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = {
          ...b,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        // Re-calculate houseCost if projectSite changed
        if (updates.projectSite && updates.projectSite !== b.projectSite) {
          updated.houseCost = getHouseCostForSite(updates.projectSite);
          if (updated.payment10Percent.status !== 'PAID') {
            updated.payment10Percent.amount = Math.round(updated.houseCost * 0.10);
          }
          if (updated.payment20Percent.status !== 'PAID') {
            updated.payment20Percent.amount = Math.round(updated.houseCost * 0.20);
          }
        }
        return updated;
      })
    );
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    if (activeBeneficiary?.id === id) {
      setActiveBeneficiary(null);
    }
  };

  const updateAcceptance = (
    id: string,
    status: AcceptanceStatusType,
    date?: string,
    remarks?: string
  ) => {
    const now = new Date().toISOString();
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newHist = [
          ...(b.stageHistory || []),
          {
            stage: `Acceptance: ${status}`,
            timestamp: now,
            note: remarks ? `शेरा: ${remarks}` : 'स्थिती बदलण्यात आली'
          }
        ];
        return {
          ...b,
          acceptance: {
            status,
            date: date || (status !== 'PENDING' ? now.split('T')[0] : ''),
            remarks: remarks !== undefined ? remarks : b.acceptance.remarks
          },
          stageHistory: newHist,
          updatedAt: now
        };
      })
    );
  };

  const updatePayment10 = (
    id: string,
    payment: Partial<BeneficiaryRecord['payment10Percent']>
  ) => {
    const now = new Date().toISOString();
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newHist = [
          ...(b.stageHistory || []),
          {
            stage: `10% Payment: ${payment.status || b.payment10Percent.status}`,
            timestamp: now,
            note: payment.receiptNo ? `पावती क्र: ${payment.receiptNo}` : '१०% हप्ता अपडेट'
          }
        ];
        return {
          ...b,
          payment10Percent: {
            ...b.payment10Percent,
            ...payment,
            paymentDate:
              payment.paymentDate ||
              (payment.status === 'PAID' && !b.payment10Percent.paymentDate
                ? now.split('T')[0]
                : b.payment10Percent.paymentDate)
          },
          stageHistory: newHist,
          updatedAt: now
        };
      })
    );
  };

  const updatePayment20 = (
    id: string,
    payment: Partial<BeneficiaryRecord['payment20Percent']>
  ) => {
    const now = new Date().toISOString();
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newHist = [
          ...(b.stageHistory || []),
          {
            stage: `20% Payment: ${payment.status || b.payment20Percent.status} (${payment.mode || b.payment20Percent.mode})`,
            timestamp: now,
            note: payment.receiptNo ? `पावती क्र: ${payment.receiptNo}` : '२०% हप्ता अपडेट'
          }
        ];
        return {
          ...b,
          payment20Percent: {
            ...b.payment20Percent,
            ...payment,
            paymentDate:
              payment.paymentDate ||
              (payment.status === 'PAID' && !b.payment20Percent.paymentDate
                ? now.split('T')[0]
                : b.payment20Percent.paymentDate)
          },
          stageHistory: newHist,
          updatedAt: now
        };
      })
    );
  };

  const updateLoanProcess = (
    id: string,
    loan: Partial<BeneficiaryRecord['loanProcess']>
  ) => {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newStatus = loan.status || b.loanProcess.status;
        const newHist = [
          ...(b.stageHistory || []),
          {
            stage: `Loan Process: ${newStatus}`,
            timestamp: now,
            note: loan.bankName ? `बँक: ${loan.bankName} | ${loan.bankRemarks || loan.staffRemarks || ''}` : 'कर्ज प्रक्रिया अपडेट'
          }
        ];
        return {
          ...b,
          loanProcess: {
            ...b.loanProcess,
            ...loan,
            applicationDate:
              loan.applicationDate !== undefined
                ? loan.applicationDate
                : b.loanProcess.applicationDate,
            rejectionDate:
              newStatus === 'Loan Rejected' && !b.loanProcess.rejectionDate
                ? today
                : b.loanProcess.rejectionDate,
            lastUpdatedDate: today
          },
          stageHistory: newHist,
          updatedAt: now
        };
      })
    );
  };

  // Lottery Management Methods
  const addLottery = (lottery: Omit<LotteryEvent, 'id' | 'createdAt'>): LotteryEvent => {
    const newLottery: LotteryEvent = {
      ...lottery,
      id: `lottery_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLotteries((prev) => [...prev, newLottery]);
    return newLottery;
  };

  const updateLottery = (id: string, updates: Partial<LotteryEvent>) => {
    setLotteries((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const deleteLottery = (id: string) => {
    setLotteries((prev) => prev.filter((l) => l.id !== id));
  };

  const updateBeneficiaryLottery = (
    beneficiaryId: string,
    lotteryData: Partial<BeneficiaryLotteryRecord>
  ) => {
    const now = new Date().toISOString();
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== beneficiaryId) return b;
        const currentLottery = b.lottery || createDefaultBeneficiaryLotteryRecord();
        const updatedLottery: BeneficiaryLotteryRecord = {
          ...currentLottery,
          ...lotteryData,
          isWinner: lotteryData.result ? lotteryData.result === 'SELECTED' : currentLottery.isWinner,
          updatedAt: now
        };
        const newHist = [
          ...(b.stageHistory || []),
          {
            stage: `सोडत (Lottery): ${updatedLottery.lotteryNumber || 'सोडत'}`,
            timestamp: now,
            note: `निकाल: ${updatedLottery.result}, प्रतिसाद: ${updatedLottery.response}${updatedLottery.drawTokenNumber ? `, टोकन क्र: ${updatedLottery.drawTokenNumber}` : ''}`
          }
        ];
        return {
          ...b,
          lottery: updatedLottery,
          stageHistory: newHist,
          updatedAt: now
        };
      })
    );
  };

  const batchAssignLottery = (
    beneficiaryIds: string[],
    lotteryInfo: { id: string; number: string; name: string; date: string },
    defaultResult: LotteryResultType = 'PENDING'
  ) => {
    const now = new Date().toISOString();
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (!beneficiaryIds.includes(b.id)) return b;
        const currentLottery = b.lottery || createDefaultBeneficiaryLotteryRecord();
        const updatedLottery: BeneficiaryLotteryRecord = {
          ...currentLottery,
          lotteryId: lotteryInfo.id,
          lotteryNumber: lotteryInfo.number,
          lotteryName: lotteryInfo.name,
          lotteryDate: lotteryInfo.date,
          result: defaultResult,
          isWinner: defaultResult === 'SELECTED',
          updatedAt: now
        };
        return {
          ...b,
          lottery: updatedLottery,
          stageHistory: [
            ...(b.stageHistory || []),
            {
              stage: `सोडत नोंद: ${lotteryInfo.number}`,
              timestamp: now,
              note: `${lotteryInfo.name} मध्ये सहभागी करण्यात आले.`
            }
          ],
          updatedAt: now
        };
      })
    );
  };

  const batchUpdateLotteryResults = (
    beneficiaryIds: string[],
    updates: Partial<BeneficiaryLotteryRecord>
  ) => {
    const now = new Date().toISOString();
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (!beneficiaryIds.includes(b.id)) return b;
        const currentLottery = b.lottery || createDefaultBeneficiaryLotteryRecord();
        const updatedLottery: BeneficiaryLotteryRecord = {
          ...currentLottery,
          ...updates,
          isWinner: updates.result ? updates.result === 'SELECTED' : currentLottery.isWinner,
          updatedAt: now
        };
        return {
          ...b,
          lottery: updatedLottery,
          stageHistory: [
            ...(b.stageHistory || []),
            {
              stage: `सोडत निकाल नोंद`,
              timestamp: now,
              note: `निकाल: ${updatedLottery.result}, प्रतिसाद: ${updatedLottery.response}`
            }
          ],
          updatedAt: now
        };
      })
    );
  };

  const pushLotterySelectedToAcceptance = (beneficiaryIds: string[]) => {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (!beneficiaryIds.includes(b.id)) return b;
        const currentLottery = b.lottery || createDefaultBeneficiaryLotteryRecord();
        return {
          ...b,
          lottery: {
            ...currentLottery,
            response: currentLottery.response === 'PENDING' ? 'ACCEPT' : currentLottery.response,
            responseDate: currentLottery.responseDate || today
          },
          acceptance: {
            status: 'ACCEPT',
            date: b.acceptance.date || today,
            remarks: b.acceptance.remarks || `${currentLottery.lotteryNumber || 'सोडत'} मध्ये निवड झाल्याने स्वीकृती प्रक्रियेत वर्ग केले.`
          },
          stageHistory: [
            ...(b.stageHistory || []),
            {
              stage: 'स्वीकृती प्रक्रिया (Acceptance)',
              timestamp: now,
              note: `${currentLottery.lotteryNumber || 'सोडत'} मध्ये निवड झाल्याने स्वीकृती प्रक्रियेत वर्ग केले.`
            }
          ],
          updatedAt: now
        };
      })
    );
  };

  const clearAllData = () => {
    if (
      window.confirm(
        'सावधान: तुम्ही ॲप्लिकेशनमधील सर्व डेटाबेस हटवू इच्छिता का? हा डेटा पुन्हा मिळवता येणार नाही.'
      )
    ) {
      setBeneficiaries([]);
      setRawExcelColumns([]);
      setImportedFilesList([]);
      setActiveBeneficiary(null);
      setLastImportedInfo(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLUMNS_KEY);
      localStorage.removeItem(FILES_KEY);
    }
  };

  const exportToExcel = (dataToExport?: BeneficiaryRecord[], fileName?: string) => {
    const list = dataToExport || beneficiaries;
    if (list.length === 0) {
      alert('एक्सपोर्ट करण्यासाठी डेटा उपलब्ध नाही.');
      return;
    }

    const flatRows = list.map((b) => ({
      'अर्ज क्रमांक (App No)': b.applicationNumber,
      'लाभार्थ्याचे नाव (Name)': b.beneficiaryName,
      'पती/वडिलांचे नाव': b.fatherSpouseName,
      'मोबाईल नंबर': b.mobileNumber,
      'प्रकल्प / जागा (Site)': b.projectSite,
      'गट क्र. (Group No)': b.groupNumber,
      'इमारत (Building)': b.buildingNumber,
      'विंग (Wing)': b.wing,
      'मजला (Floor)': b.floor,
      'सदनिका/घर क्र. (Flat/House)': b.flatHouseNumber,
      'घर किंमत (House Cost)': b.houseCost,
      'सोडत क्रमांक / नाव': b.lottery?.lotteryNumber || b.lottery?.lotteryName || '',
      'सोडत टोकन क्र.': b.lottery?.drawTokenNumber || '',
      'सोडत निकाल (Result)': b.lottery?.result || '',
      'सोडत प्रतिसाद (Response)': b.lottery?.response || '',
      'सोडत दिनांक': b.lottery?.lotteryDate || '',
      'सोडत शेरा': b.lottery?.remarks || '',
      'आयात केलेली फाईल (Source File)': b.importedFileName || '',
      'सध्याची स्टेज': b.importStage || '',
      'स्वीकृती स्थिती (Acceptance)': b.acceptance.status,
      'स्वीकृती दिनांक': b.acceptance.date,
      '१०% हप्ता स्थिती': b.payment10Percent.status,
      '१०% भरलेली रक्कम': b.payment10Percent.status === 'PAID' ? b.payment10Percent.amount : 0,
      '१०% पावती क्रमांक': b.payment10Percent.receiptNo,
      '२०% हप्ता स्थिती': b.payment20Percent.status,
      '२०% भरलेली रक्कम': b.payment20Percent.status === 'PAID' ? b.payment20Percent.amount : 0,
      '२०% प्रक्रिया प्रकार': b.payment20Percent.mode,
      'कर्ज स्थिती (Loan Status)': b.loanProcess.status,
      'बँकेचे नाव (Bank Name)': b.loanProcess.bankName,
      'बँक शाखा (Bank Branch)': b.loanProcess.bankBranch || '',
      'कर्ज फाईल क्र. (Loan File No)': b.loanProcess.loanFileNumber || '',
      'फाईल पाठवल्याचा दिनांक': b.loanProcess.fileSentDate || '',
      'कर्ज मंजूर रक्कम': b.loanProcess.loanAmount,
      'कर्ज नाकारण्याचे कारण': b.loanProcess.rejectionReason || '',
      'बँक शेरा': b.loanProcess.bankRemarks || '',
      'कर्मचारी शेरा': b.loanProcess.staffRemarks || '',
      'शासकीय अनुदान': b.subsidyAmount,
      'नोंदणी दिनांक': b.createdAt?.split('T')[0] || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(flatRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Beneficiaries');
    XLSX.writeFile(
      workbook,
      fileName || `PMAY_CSN_Beneficiaries_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const exportBackupJSON = () => {
    const backupData = {
      version: '5.0',
      exportedAt: new Date().toISOString(),
      beneficiaries,
      lotteries,
      rawExcelColumns,
      importedFilesList
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PMAY_CSN_DATABASE_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.beneficiaries)) {
        setBeneficiaries(
          data.beneficiaries.map((item: any) => ({
            ...item,
            lottery: item.lottery || createDefaultBeneficiaryLotteryRecord()
          }))
        );
        if (Array.isArray(data.lotteries) && data.lotteries.length > 0) {
          setLotteries(data.lotteries);
        }
        if (Array.isArray(data.rawExcelColumns)) {
          setRawExcelColumns(data.rawExcelColumns);
        }
        if (Array.isArray(data.importedFilesList)) {
          setImportedFilesList(data.importedFilesList);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
    }
    return false;
  };

  return (
    <BeneficiaryContext.Provider
      value={{
        beneficiaries,
        activeBeneficiary,
        setActiveBeneficiary,
        currentNav,
        setCurrentNav,
        stats,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        updateAcceptance,
        updatePayment10,
        updatePayment20,
        updateLoanProcess,
        lotteries,
        addLottery,
        updateLottery,
        deleteLottery,
        updateBeneficiaryLottery,
        batchAssignLottery,
        batchUpdateLotteryResults,
        pushLotterySelectedToAcceptance,
        analyzeExcelFile,
        importExcelFile,
        importedFilesList,
        lastImportedInfo,
        clearLastImportedInfo,
        exportToExcel,
        exportBackupJSON,
        importBackupJSON,
        clearAllData,
        rawExcelColumns
      }}
    >
      {children}
    </BeneficiaryContext.Provider>
  );
};

export const useBeneficiary = () => {
  const context = useContext(BeneficiaryContext);
  if (!context) {
    throw new Error('useBeneficiary must be used within a BeneficiaryProvider');
  }
  return context;
};
