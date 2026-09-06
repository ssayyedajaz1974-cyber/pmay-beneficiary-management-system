import React, { useState } from 'react';
import { BeneficiaryProvider, useBeneficiary } from './context/BeneficiaryContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BeneficiaryList } from './components/BeneficiaryList';
import { BeneficiarySearch } from './components/BeneficiarySearch';
import { AcceptanceStatus } from './components/AcceptanceStatus';
import { LotteryManagement } from './components/LotteryManagement';
import { Payment10View } from './components/Payment10View';
import { Payment20View } from './components/Payment20View';
import { LoanProcessView } from './components/LoanProcessView';
import { DocumentStatus } from './components/DocumentStatus';
import { Reports } from './components/Reports';
import { PrintHub } from './components/PrintHub';
import { SettingsView } from './components/SettingsView';
import { BeneficiaryProfileModal } from './components/BeneficiaryProfileModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ManualBeneficiaryModal } from './components/ManualBeneficiaryModal';
import { BeneficiaryRecord } from './types/pmay';

const MainLayout: React.FC = () => {
  const { currentNav, activeBeneficiary, setActiveBeneficiary } = useBeneficiary();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBeneficiary, setPrintBeneficiary] = useState<BeneficiaryRecord | null>(null);
  const [printReportTitle, setPrintReportTitle] = useState<string>('');

  const handleOpenPrint = (b?: BeneficiaryRecord, reportTitle?: string) => {
    setPrintBeneficiary(b || null);
    setPrintReportTitle(reportTitle || '');
    setShowPrintModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-200 selection:text-slate-900">
      {/* Top Navigation */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onOpenExcelUpload={() => setShowExcelModal(true)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentNav === 'dashboard' && (
            <Dashboard
              onOpenExcelUpload={() => setShowExcelModal(true)}
              onAddNewBeneficiary={() => setShowManualModal(true)}
            />
          )}

          {currentNav === 'newForms' && (
            <BeneficiaryList
              initialStageFilter="NEW_FORM_FILLED"
              customTitle="१. नवीन अर्ज भरलेले लाभार्थी (Form Filled Beneficiaries)"
              onAddNewBeneficiary={() => setShowManualModal(true)}
              onOpenExcelUpload={() => setShowExcelModal(true)}
              onOpenPrint={(b) => handleOpenPrint(b)}
            />
          )}

          {currentNav === 'lottery' && <LotteryManagement />}

          {currentNav === 'list' && (
            <BeneficiaryList
              onAddNewBeneficiary={() => setShowManualModal(true)}
              onOpenExcelUpload={() => setShowExcelModal(true)}
              onOpenPrint={(b) => handleOpenPrint(b)}
            />
          )}

          {currentNav === 'search' && <BeneficiarySearch />}

          {currentNav === 'acceptance' && <AcceptanceStatus />}

          {currentNav === 'payment10' && <Payment10View />}

          {currentNav === 'payment20' && <Payment20View />}

          {currentNav === 'loan' && <LoanProcessView />}

          {currentNav === 'documents' && <DocumentStatus />}

          {currentNav === 'reports' && (
            <Reports
              onOpenPrint={(b, reportTitle) => handleOpenPrint(b, reportTitle)}
            />
          )}

          {currentNav === 'print' && (
            <PrintHub
              beneficiaryToPrint={printBeneficiary}
              reportTitle={printReportTitle}
            />
          )}

          {currentNav === 'settings' && (
            <SettingsView onOpenExcelUpload={() => setShowExcelModal(true)} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-800">
            प्रधानमंत्री आवास योजना शहरी • महानगरपालिका छत्रपती संभाजीनगर
          </div>
          <div className="text-slate-500 text-[11px]">
            अंतर्गत लाभार्थी व्यवस्थापन प्रणाली (Internal Management System)
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      {activeBeneficiary && (
        <BeneficiaryProfileModal
          beneficiary={activeBeneficiary}
          onClose={() => setActiveBeneficiary(null)}
          onOpenPrint={(b) => handleOpenPrint(b)}
        />
      )}

      {/* Excel Import Modal */}
      {showExcelModal && (
        <ExcelImportModal onClose={() => setShowExcelModal(false)} />
      )}

      {/* Manual Beneficiary Modal */}
      {showManualModal && (
        <ManualBeneficiaryModal onClose={() => setShowManualModal(false)} />
      )}

      {/* Quick Print Modal (if opened from external action) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="max-w-5xl w-full max-h-[96vh] overflow-y-auto bg-slate-100 rounded-2xl shadow-2xl p-2 sm:p-4">
            <PrintHub
              beneficiaryToPrint={printBeneficiary}
              reportTitle={printReportTitle}
              onClose={() => setShowPrintModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BeneficiaryProvider>
      <MainLayout />
    </BeneficiaryProvider>
  );
}
