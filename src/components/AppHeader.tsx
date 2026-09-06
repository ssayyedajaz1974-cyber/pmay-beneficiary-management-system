import React from 'react';
import { FileSpreadsheet, Home, ListFilter, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExcelData } from '../context/ExcelDataContext';

interface AppHeaderProps {
  currentView: 'home' | 'list';
  onSelectView: (view: 'home' | 'list') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentView, onSelectView }) => {
  const { fileName, totalRecords, columns } = useExcelData();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Main Title Block */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-6 h-6 text-amber-600" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  प्रधानमंत्री आवास योजना शहरी
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  अंतर्गत व्यवस्थापन
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-700">
                महानगरपालिका छत्रपती संभाजीनगर
              </div>
              <div className="text-xs text-amber-700 font-medium mt-0.5 flex items-center gap-1.5">
                <span>लाभार्थी यादी व्यवस्थापन प्रणाली</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Excel Data Manager</span>
              </div>
            </div>
          </div>

          {/* Navigation and File Status */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Excel Status Pill */}
            <div
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center space-x-2 transition ${
                fileName
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {fileName ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium truncate max-w-[160px] sm:max-w-[200px]" title={fileName}>
                    {fileName}
                  </span>
                  <span className="text-emerald-600 font-bold">({totalRecords} नोंदी)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>एक्सेल फाईलची प्रतीक्षा आहे</span>
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <nav className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 space-x-1" aria-label="मुख्य नेव्हिगेशन">
              <button
                id="nav-home-btn"
                type="button"
                onClick={() => onSelectView('home')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  currentView === 'home'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>मुख्यपृष्ठ (Home)</span>
              </button>

              <button
                id="nav-beneficiary-list-btn"
                type="button"
                onClick={() => onSelectView('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  currentView === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>लाभार्थी यादी (List)</span>
                {totalRecords > 0 && (
                  <span className="ml-1 bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {totalRecords}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
