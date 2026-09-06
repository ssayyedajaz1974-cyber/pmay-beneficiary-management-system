import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
  Layers,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Info
} from 'lucide-react';
import { useExcelData } from '../context/ExcelDataContext';

interface HomePageProps {
  onGoToList: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGoToList }) => {
  const {
    fileName,
    sheetNames,
    activeSheet,
    columns,
    rows,
    totalRecords,
    uploadedAt,
    isLoading,
    error,
    handleFileUpload,
    clearData
  } = useExcelData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>अंतर्गत लाभार्थी डेटा व्यवस्थापन</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            प्रधानमंत्री आवास योजना शहरी
          </h2>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mt-0.5">
            महानगरपालिका छत्रपती संभाजीनगर
          </h3>
          <p className="text-base font-semibold text-amber-700 mt-1">
            लाभार्थी यादी (Beneficiary Management Application)
          </p>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            हे ॲप्लिकेशन महानगरपालिका छत्रपती संभाजीनगर अंतर्गत प्रधानमंत्री आवास योजना (शहरी) च्या लाभार्थींची माहिती आपल्या स्वतःच्या एक्सेल (Excel) फाईलमधून व्यवस्थापित करण्यासाठी तयार करण्यात आले आहे. येथे कोणतीही बनावट माहिती (fake data) दिलेली नाही. आपली एक्सेल फाईल अपलोड केल्यावर त्यातील अचूक कॉलम आणि लाभार्थींची यादी उपलब्ध होईल.
          </p>
        </div>
      </div>

      {/* Main Upload / Status Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                <span>एक्सेल फाईल अपलोड करा (.xlsx, .xls, .csv)</span>
              </h4>
              {fileName && (
                <button
                  type="button"
                  id="reset-excel-data-btn"
                  onClick={clearData}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>फाईल काढून टाका</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Upload Area */}
            <div
              id="excel-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                  : fileName
                  ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
                  : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-amber-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="excel-file-input"
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                onChange={onFileInputChange}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-amber-600 mb-3">
                {isLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                ) : fileName ? (
                  <FileCheck className="w-7 h-7 text-emerald-600" />
                ) : (
                  <UploadCloud className="w-7 h-7 text-amber-600" />
                )}
              </div>

              {isLoading ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800">एक्सेल फाईल वाचली जात आहे...</p>
                  <p className="text-xs text-slate-500 mt-1">कृपया थोडा वेळ प्रतीक्षा करा</p>
                </div>
              ) : fileName ? (
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>फाईल यशस्वीरित्या लोड झाली</span>
                  </div>
                  <h5 className="text-base font-bold text-slate-900">{fileName}</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    {totalRecords} लाभार्थी नोंदी • {columns.length} कॉलम आढळले
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    दुसरी फाईल निवडण्यासाठी येथे क्लिक करा किंवा ड्रॅग करा
                  </p>
                </div>
              ) : (
                <div>
                  <h5 className="text-base font-bold text-slate-800">
                    आपली लाभार्थी एक्सेल फाईल येथे निवडा किंवा ड्रॅग करा
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    समर्थित फाईल प्रकार: Microsoft Excel (.xlsx, .xls) किंवा Comma Separated Values (.csv)
                  </p>
                  <button
                    type="button"
                    id="browse-file-btn"
                    className="mt-4 inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>संगणकावरून फाईल निवडा</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {uploadedAt ? `अपलोड वेळ: ${uploadedAt}` : 'सध्या कोणतीही फाईल निवडलेली नाही'}
              </span>
            </div>

            <button
              id="goto-beneficiary-list-btn"
              type="button"
              onClick={onGoToList}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
            >
              <span>लाभार्थी यादी रचना पहा (View Beneficiary List)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Guidance Side Panel */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Info className="w-4 h-4 text-amber-600" />
              <span>प्रणाली मार्गदर्शक सूचना</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>१. कोणतीही बनावट माहिती नाही</span>
                </div>
                <p>
                  प्रणालीमध्ये कोणताही बनावट डेटा समाविष्ट केलेला नाही. तुमची प्रत्यक्ष माहितीच यादीत दिसेल.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>२. स्वयंचलित कॉलम मॅपिंग</span>
                </div>
                <p>
                  आपल्या एक्सेल फाईलमध्ये असलेले सर्व हेडिंग्स / कॉलम (उदा. नाव, अर्ज क्रमांक, प्रभाग, बँक माहिती) आपोआप यादीत स्तंभ म्हणून तयार होतील.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>३. अंतर्गत आणि खाजगी व्यवस्थापन</span>
                </div>
                <p>
                  हा अनुप्रयोग पूर्णपणे आपल्या अंतर्गत कामासाठी असून कोणत्याही अधिकृत शासकीय बाह्य पोर्टलशी जोडलेला नाही.
                </p>
              </div>
            </div>
          </div>

          {/* Active File Metadata Badge */}
          {fileName && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                शोधलेले कॉलम ({columns.length}):
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {columns.map((col, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono truncate max-w-[120px]"
                    title={col}
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
