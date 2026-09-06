export type AcceptanceStatusType = 'PENDING' | 'ACCEPT' | 'REJECT' | 'NO RESPONSE';

export type Payment10StatusType = 'PENDING' | 'PAID' | 'REJECT' | 'NO RESPONSE';

export type Payment20StatusType = 'PENDING' | 'PAID' | 'NOT APPLICABLE';

export type Payment20Mode = '20% PAYMENT' | 'LOAN PROCESS' | 'NONE';

export type LoanStatusType =
  | 'NOT APPLICABLE'
  | 'File Sent to Bank'
  | 'Under Process'
  | 'Loan Approved'
  | 'Loan Rejected';

// Lottery / Lucky Draw types
export type LotteryResultType =
  | 'SELECTED'          // निवड झाली (Selected)
  | 'WAITING'           // प्रतीक्षा यादी (Waiting List)
  | 'NOT_SELECTED'      // निवड झाली नाही (Not Selected)
  | 'PENDING'           // निकाल प्रलंबित (Pending)
  | 'NOT_PARTICIPATED'; // सोडतीत सहभागी नाही

export type LotteryResponseType =
  | 'ACCEPT'            // संमती / ACCEPT
  | 'REJECT'            // नकार / REJECT
  | 'NO RESPONSE'       // प्रतिसाद नाही / NO RESPONSE
  | 'PENDING';          // प्रलंबित / PENDING

export interface BeneficiaryLotteryRecord {
  lotteryId: string;
  lotteryNumber: string;      // उदा. "सोडत १", "सोडत २", "सोडत ३"
  lotteryName: string;        // उदा. "सोडत क्रमांक १ - पडेगाव"
  lotteryDate: string;        // उदा. "2024-03-20"
  drawTokenNumber: string;    // Lottery / Draw Number (टोकन/ड्रॉ क्र. उदा. "125")
  isWinner: boolean;          // true जर निवड झाली असेल
  result: LotteryResultType;  // SELECTED / WAITING / NOT_SELECTED / PENDING
  response: LotteryResponseType; // ACCEPT / REJECT / NO RESPONSE / PENDING
  responseDate?: string;
  remarks: string;
  updatedAt?: string;
}

export function createDefaultBeneficiaryLotteryRecord(): BeneficiaryLotteryRecord {
  return {
    lotteryId: '',
    lotteryNumber: '',
    lotteryName: '',
    lotteryDate: '',
    drawTokenNumber: '',
    isWinner: false,
    result: 'NOT_PARTICIPATED',
    response: 'PENDING',
    remarks: '',
    updatedAt: new Date().toISOString()
  };
}

export interface LotteryEvent {
  id: string;
  lotteryNumber: string;      // उदा. "सोडत १", "सोडत २", "सोडत ३"
  lotteryName: string;        // उदा. "सोडत क्रमांक १ - पडेगाव व तीसगाव"
  drawDate: string;           // सोडत तारीख
  locationOrVenue: string;    // सोडत ठिकाण
  projectSite: string;        // संबंधित प्रकल्प जागा किंवा ALL
  description: string;        // सोडतीचे वर्णन व शेरा
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  totalParticipants?: number;
  totalSelected?: number;
  totalWaiting?: number;
  totalAccepted?: number;
  createdAt: string;
}

// Target stage for importing Excel files according to their file name
export type ImportTargetStage =
  | 'NEW_FORM_FILLED'     // नवीन लाभार्थी / Form Filled List
  | 'LOTTERY_LIST'        // सोडत यादी / Lucky Draw List
  | 'ACCEPTED'            // ACCEPTED BENEFICIARIES
  | 'REJECTED'            // REJECTED BENEFICIARIES
  | 'NO_RESPONSE'         // NO RESPONSE
  | 'PAYMENT_10_PAID'     // 10% रक्कम भरलेले लाभार्थी
  | 'PAYMENT_10_PENDING'  // 10% रक्कम बाकी असलेले लाभार्थी
  | 'PAYMENT_20_PAID'     // 20% रक्कम भरलेले लाभार्थी
  | 'LOAN_UNDER_PROCESS'  // Loan Process लाभार्थी
  | 'LOAN_APPROVED'       // Loan Approved
  | 'LOAN_REJECTED';      // Loan Rejected

export interface StageMeta {
  id: ImportTargetStage;
  titleMarathi: string;
  titleEnglish: string;
  targetNav: string;
  badgeColor: string;
  description: string;
}

export const STAGE_METAS: Record<ImportTargetStage, StageMeta> = {
  NEW_FORM_FILLED: {
    id: 'NEW_FORM_FILLED',
    titleMarathi: 'नवीन लाभार्थी / Form Filled List',
    titleEnglish: 'New Beneficiaries / Form Filled',
    targetNav: 'newForms',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'नवीन भरलेले प्राथमिक अर्ज (टप्पा १)'
  },
  LOTTERY_LIST: {
    id: 'LOTTERY_LIST',
    titleMarathi: 'सोडत यादी (Lottery / Lucky Draw)',
    titleEnglish: 'Lottery / Draw List',
    targetNav: 'lottery',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'PMAY सोडत / लकी ड्रॉ यादी (टप्पा २)'
  },
  ACCEPTED: {
    id: 'ACCEPTED',
    titleMarathi: 'ACCEPTED BENEFICIARIES (स्वीकृत लाभार्थी)',
    titleEnglish: 'Accepted Beneficiaries',
    targetNav: 'acceptance',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'महानगरपालिकेकडून स्वीकृत केलेले लाभार्थी (टप्पा २)'
  },
  REJECTED: {
    id: 'REJECTED',
    titleMarathi: 'REJECTED BENEFICIARIES (नाकारलेले लाभार्थी)',
    titleEnglish: 'Rejected Beneficiaries',
    targetNav: 'acceptance',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    description: 'अपात्र किंवा नाकारलेले लाभार्थी'
  },
  NO_RESPONSE: {
    id: 'NO_RESPONSE',
    titleMarathi: 'NO RESPONSE (प्रतिसाद न दिलेले)',
    titleEnglish: 'No Response',
    targetNav: 'acceptance',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'संपर्क न झालेले किंवा प्रतिसाद न दिलेले'
  },
  PAYMENT_10_PAID: {
    id: 'PAYMENT_10_PAID',
    titleMarathi: '१०% रक्कम भरलेले लाभार्थी (10% Paid)',
    titleEnglish: '10% Payment Paid',
    targetNav: 'payment10',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: '१०% हप्ता भरलेले लाभार्थी (टप्पा ३)'
  },
  PAYMENT_10_PENDING: {
    id: 'PAYMENT_10_PENDING',
    titleMarathi: '१०% रक्कम बाकी असलेले लाभार्थी (10% Pending)',
    titleEnglish: '10% Payment Pending',
    targetNav: 'payment10',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'स्वीकृत परंतु १०% हप्ता बाकी असलेले'
  },
  PAYMENT_20_PAID: {
    id: 'PAYMENT_20_PAID',
    titleMarathi: '२०% रक्कम भरलेले लाभार्थी (20% Paid)',
    titleEnglish: '20% Payment Paid',
    targetNav: 'payment20',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: '२०% स्व-हिस्सा पूर्ण भरलेले लाभार्थी (टप्पा ४)'
  },
  LOAN_UNDER_PROCESS: {
    id: 'LOAN_UNDER_PROCESS',
    titleMarathi: 'Loan Process लाभार्थी (बँक कर्ज प्रक्रिया)',
    titleEnglish: 'Loan Under Process',
    targetNav: 'loan',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'बँकेत फाईल पाठवून कर्ज प्रक्रियेत असलेले (टप्पा ५)'
  },
  LOAN_APPROVED: {
    id: 'LOAN_APPROVED',
    titleMarathi: 'Loan Approved (बँक कर्ज मंजूर)',
    titleEnglish: 'Loan Approved Beneficiaries',
    targetNav: 'loan',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'बँकेने कर्ज मंजूर केलेले लाभार्थी'
  },
  LOAN_REJECTED: {
    id: 'LOAN_REJECTED',
    titleMarathi: 'Loan Rejected (बँक कर्ज नाकारलेले)',
    titleEnglish: 'Loan Rejected Beneficiaries',
    targetNav: 'loan',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'बँकेकडून कर्ज नाकारण्यात आलेले लाभार्थी'
  }
};

/**
 * Automatically detects the intended stage based on the Excel file name.
 */
export function detectStageFromFileName(fileName: string): ImportTargetStage {
  const lower = (fileName || '').toLowerCase();

  // 1. Bank Loan matching
  if (lower.includes('loan') || lower.includes('कर्ज') || lower.includes('बँक') || lower.includes('bank')) {
    if (lower.includes('approve') || lower.includes('मंजूर') || lower.includes('sanction')) {
      return 'LOAN_APPROVED';
    }
    if (lower.includes('reject') || lower.includes('नाकार') || lower.includes('रद्द')) {
      return 'LOAN_REJECTED';
    }
    return 'LOAN_UNDER_PROCESS';
  }

  // 2. 20% Payment matching
  if (lower.includes('20') || lower.includes('२०')) {
    return 'PAYMENT_20_PAID';
  }

  // 3. 10% Payment matching
  if (lower.includes('10') || lower.includes('१०')) {
    if (lower.includes('बाकी') || lower.includes('pending') || lower.includes('unpaid')) {
      return 'PAYMENT_10_PENDING';
    }
    return 'PAYMENT_10_PAID';
  }

  // 4. Acceptance matching
  if (lower.includes('accept') || lower.includes('स्वीकृत') || lower.includes('पात्र')) {
    return 'ACCEPTED';
  }
  if (lower.includes('reject') || lower.includes('नाकार') || lower.includes('अपात्र')) {
    return 'REJECTED';
  }
  if (lower.includes('no response') || lower.includes('प्रतिसाद')) {
    return 'NO_RESPONSE';
  }

  // 5. Lottery / Lucky Draw matching (सोडत / लकी ड्रॉ)
  if (
    lower.includes('सोडत') ||
    lower.includes('lottery') ||
    lower.includes('draw') ||
    lower.includes('lucky') ||
    lower.includes('लकी')
  ) {
    return 'LOTTERY_LIST';
  }

  // 6. New Beneficiaries / Form Filled matching
  if (
    lower.includes('नवीन') ||
    lower.includes('new') ||
    lower.includes('form') ||
    lower.includes('अर्ज') ||
    lower.includes('भरलेले') ||
    lower.includes('applicant')
  ) {
    return 'NEW_FORM_FILLED';
  }

  // Default fallback
  return 'NEW_FORM_FILLED';
}

export interface BeneficiaryStageHistoryItem {
  stage: string;
  timestamp: string;
  note: string;
  fileName?: string;
}

export interface LoanProcessRecord {
  status: LoanStatusType;
  bankName?: string;
  bankBranch?: string;
  fileSentDate?: string;
  loanFileNumber?: string;
  loanAmount: number;
  applicationDate?: string;
  sanctionDate?: string;
  rejectionReason?: string;
  rejectionRemarks?: string;
  rejectionDate?: string;
  bankRemarks?: string;
  staffRemarks?: string;
  importantRemarks?: string;
  lastUpdatedDate?: string;
}

export function createDefaultLoanProcessRecord(amount: number = 0): LoanProcessRecord {
  return {
    status: 'NOT APPLICABLE',
    bankName: '',
    bankBranch: '',
    fileSentDate: '',
    loanFileNumber: '',
    loanAmount: amount,
    applicationDate: '',
    sanctionDate: '',
    rejectionReason: '',
    rejectionRemarks: '',
    rejectionDate: '',
    bankRemarks: '',
    staffRemarks: '',
    importantRemarks: '',
    lastUpdatedDate: new Date().toISOString()
  };
}

export interface ProjectSiteConfig {
  id: string;
  nameMarathi: string;
  nameEnglish: string;
  groupNo: string;
  houseCost: number;
}

export const PROJECT_SITES: ProjectSiteConfig[] = [
  {
    id: 'padegaon_69',
    nameMarathi: 'पडेगाव गट नं. ६९ (Padegaon Group No. 69)',
    nameEnglish: 'Padegaon Group No. 69',
    groupNo: '69',
    houseCost: 956332
  },
  {
    id: 'tisgaon_225_1',
    nameMarathi: 'तिसगाव गट नं. २२५/१ (Tisgaon Group No. 225/1)',
    nameEnglish: 'Tisgaon Group No. 225/1',
    groupNo: '225/1',
    houseCost: 926382
  },
  {
    id: 'tisgaon_227_1',
    nameMarathi: 'तिसगाव गट नं. २२७/१ (Tisgaon Group No. 227/1)',
    nameEnglish: 'Tisgaon Group No. 227/1',
    groupNo: '227/1',
    houseCost: 944370
  }
];

export const GOVT_SUBSIDY_AMOUNT = 250000; // ₹2,50,000 per Beneficiary

export interface BeneficiaryRecord {
  id: string; // Unique Internal ID
  applicationNumber: string; // PMAY Form / App No
  beneficiaryName: string;
  fatherSpouseName: string;
  mobileNumber: string;

  // Project & Housing Location
  projectSite: string; // e.g. 'Padegaon Group No. 69'
  groupNumber: string; // e.g. '69' or '225/1'
  buildingNumber: string;
  wing: string;
  floor: string;
  flatHouseNumber: string;

  // Financial Calculations
  houseCost: number;
  subsidyAmount: number; // ₹2,50,000

  // 3. Lottery / Lucky Draw Process (सोडत व्यवस्थापन)
  lottery: BeneficiaryLotteryRecord;

  // 4. Acceptance Process
  acceptance: {
    status: AcceptanceStatusType;
    date: string;
    remarks: string;
  };

  // 5. 10% Payment Process
  payment10Percent: {
    status: Payment10StatusType;
    amount: number; // 10% of full house cost
    paymentDate: string;
    transactionRef: string;
    receiptNo: string;
    remarks: string;
  };

  // 6. 20% Payment Process
  payment20Percent: {
    mode: Payment20Mode;
    status: Payment20StatusType;
    amount: number; // 20% of full house cost
    paymentDate: string;
    transactionRef: string;
    receiptNo: string;
    remarks: string;
  };

  // 7. Loan Process
  loanProcess: LoanProcessRecord;

  // 8. Documents checklist
  documents: {
    id: string;
    name: string;
    status: 'Pending' | 'Received' | 'Verified';
    remarks: string;
  }[];

  // Excel & File Source Tracking
  importedFileName: string;
  importStage: string;
  importedAt: string;
  stageHistory: BeneficiaryStageHistoryItem[];

  // Preserved raw Excel columns & values (nothing lost)
  rawExcelData: Record<string, any>;

  // Audit
  generalRemarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialBreakdown {
  houseCost: number;
  amount10Percent: number;
  amount20Percent: number;
  subsidyAmount: number;
  paid10Amount: number;
  paid20Amount: number;
  loanApprovedAmount: number;
  balancePayable: number;
}

export function getHouseCostForSite(siteNameOrId: string, customCost?: number): number {
  if (customCost && customCost > 0) return customCost;
  const lower = (siteNameOrId || '').toLowerCase();

  if (lower.includes('225')) {
    return 926382;
  }
  if (lower.includes('227')) {
    return 944370;
  }
  if (lower.includes('padegaon') || lower.includes('पडेगाव') || lower.includes('69')) {
    return 956332;
  }

  const site = PROJECT_SITES.find(
    (s) =>
      s.id === siteNameOrId ||
      s.nameEnglish.toLowerCase() === lower ||
      s.nameMarathi.toLowerCase() === lower
  );

  return site ? site.houseCost : 956332; // Default to Padegaon 69 if unknown
}

export function calculateBeneficiaryFinancials(b: BeneficiaryRecord): FinancialBreakdown {
  const houseCost = b.houseCost || getHouseCostForSite(b.projectSite);
  const amount10Percent = Math.round(houseCost * 0.10);
  const amount20Percent = Math.round(houseCost * 0.20);
  const subsidyAmount = b.subsidyAmount || GOVT_SUBSIDY_AMOUNT;

  const paid10Amount = b.payment10Percent.status === 'PAID' ? (b.payment10Percent.amount || amount10Percent) : 0;
  const paid20Amount = b.payment20Percent.status === 'PAID' ? (b.payment20Percent.amount || amount20Percent) : 0;
  const loanApprovedAmount = b.loanProcess.status === 'Loan Approved' ? (b.loanProcess.loanAmount || 0) : 0;

  // Subsidy is deducted from the Final Amount (House Cost - Paid 10% - Paid 20% or Loan - Subsidy)
  const totalCovered = paid10Amount + paid20Amount + loanApprovedAmount + subsidyAmount;
  const balancePayable = Math.max(0, houseCost - totalCovered);

  return {
    houseCost,
    amount10Percent,
    amount20Percent,
    subsidyAmount,
    paid10Amount,
    paid20Amount,
    loanApprovedAmount,
    balancePayable
  };
}

export function computeStageLabel(b: BeneficiaryRecord): { stage: string; color: string } {
  if (b.acceptance.status === 'REJECT') {
    return { stage: 'स्वीकृती रद्द (Rejected)', color: 'bg-red-100 text-red-800 border-red-200' };
  }
  if (b.acceptance.status === 'NO RESPONSE') {
    return { stage: 'प्रतिसाद नाही (No Response)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (b.acceptance.status === 'PENDING') {
    if (b.lottery?.result === 'SELECTED') {
      return { stage: 'सोडतीत निवड (Lottery Selected)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
    if (b.lottery?.result === 'WAITING') {
      return { stage: 'सोडत प्रतीक्षा यादी (Waiting List)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (b.lottery?.result === 'NOT_SELECTED') {
      return { stage: 'सोडतीत निवड नाही (Not Selected)', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    if (b.importStage === 'NEW_FORM_FILLED') {
      return { stage: 'नवीन अर्ज (Form Filled)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { stage: 'स्वीकृती प्रलंबित (Acceptance Pending)', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }

  // If Accepted
  if (b.payment10Percent.status === 'PENDING') {
    return { stage: '१०% हप्ता प्रलंबित (10% Pending)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  if (b.payment10Percent.status === 'REJECT') {
    return { stage: '१०% हप्ता रद्द (10% Rejected)', color: 'bg-red-100 text-red-800 border-red-200' };
  }

  // 10% is Paid
  if (b.payment20Percent.mode === 'LOAN PROCESS' || b.loanProcess.status !== 'NOT APPLICABLE') {
    if (b.loanProcess.status === 'Loan Approved') {
      return { stage: 'कर्ज मंजूर (Loan Approved)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    if (b.loanProcess.status === 'Loan Rejected') {
      return { stage: 'कर्ज नाकारले (Loan Rejected)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (b.loanProcess.status === 'File Sent to Bank' || b.loanProcess.status === 'Under Process') {
      return { stage: 'कर्ज प्रक्रियेत (Loan Under Process)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  }

  if (b.payment20Percent.status === 'PAID') {
    return { stage: '२०% हप्ता पूर्ण (20% Paid)', color: 'bg-teal-100 text-teal-800 border-teal-200' };
  }

  if (b.payment20Percent.status === 'PENDING') {
    return { stage: '२०% हप्ता प्रलंबित (20% Pending)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  }

  return { stage: 'स्वीकृत (Accepted)', color: 'bg-green-100 text-green-800 border-green-200' };
}
