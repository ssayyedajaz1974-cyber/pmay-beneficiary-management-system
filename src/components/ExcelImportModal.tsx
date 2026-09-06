import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  ChevronRight,
  Layers,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { useBeneficiary, ExcelAnalysis } from '../context/BeneficiaryContext';
import { ImportTargetStage, STAGE_METAS } from '../types/pmay';

interface ExcelImportModalProps {
  onClose: () => void;
  preSelectedStage?: ImportTargetStage;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ onClose, preSelectedStage }) => {
  const { analyzeExcelFile, importExcelFile, beneficiaries } = useBeneficiary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ExcelAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [targetStage, setTargetStage] = useState<ImportTargetStage>(
    preSelectedStage || 'NEW_FORM_FILLED'
  );
  const [duplicateHandling, setDuplicateHandling] = useState<'update_stage' | 'add_new' | 'skip'>(
    'update_stage'
  );

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    count: number;
    newCount: number;
    updatedCount: number;
    message: string;
    targetStage: ImportTargetStage;
    fileName: string;
  } | null>(null);

  const stageOptions: ImportTargetStage[] = [
    'NEW_FORM_FILLED',
    'ACCEPTED',
    'PAYMENT_10_PAID',
    'PAYMENT_10_PENDING',
    'PAYMENT_20_PAID',
    'LOAN_UNDER_PROCESS',
    'LOAN_APPROVED',
    'LOAN_REJECTED',
    'REJECTED',
    'NO_RESPONSE'
  ];

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    setSelectedFile(file);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await analyzeExcelFile(file);
      if (data) {
        setAnalysis(data);
        // If not preSelectedStage, use the auto-detected stage from file name!
        if (!preSelectedStage) {
          setTargetStage(data.suggestedStage);
        }
      } else {
        alert('एक्सेल फाईल वाचता आली नाही. कृपया वैध .xlsx किंवा .xls फाईल निवडा.');
        setSelectedFile(null);
      }
    } catch (e) {
      console.error(e);
      alert('त्रुटी: फाईल वाचण्यात अडचण आली.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await importExcelFile(selectedFile, {
        targetStage,
        duplicateHandling
      });

      setResult({
        success: res.success,
        count: res.count,
        newCount: res.newCount,
        updatedCount: res.updatedCount,
        message: res.message,
        targetStage: res.targetStage,
        fileName: res.fileName
      });

      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (e: any) {
      setResult({
        success: false,
        count: 0,
        newCount: 0,
        updatedCount: 0,
        message: `त्रुटी: ${e?.message || 'फाईल वाचता आली नाही'}`,
        targetStage,
        fileName: selectedFile.name
      });
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 relative overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                PMAY Excel फाईल आयात (Smart Stage Routing)
              </h3>
              <p className="text-xs text-slate-500">
                फाईलच्या नावावरून योग्य टप्प्यात (Stage) डेटा साठवा आणि व्यवस्थापित करा
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs">
          {/* STEP 1: Uploading / Selection */}
          {!selectedFile && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Info className="w-4 h-4" />
                  <span>Excel File Name नुसार स्टेज ओळख:</span>
                </div>
                <p>
                  उदा. <strong>“नवीन लाभार्थीची यादी.xlsx”</strong>,{' '}
                  <strong>“Accept केलेले लाभार्थी.xlsx”</strong>,{' '}
                  <strong>“10% भरलेले लाभार्थी.xlsx”</strong>,{' '}
                  <strong>“Loan Approved.xlsx”</strong> इ. फाईलच्या नावावरून योग्य स्टेज आपोआप निवडली जाईल.
                </p>
              </div>

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-amber-500 hover:bg-slate-50/80'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      येथे आपली Excel फाईल Drag & Drop करा किंवा निवडा
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      समर्थित प्रकार: Microsoft Excel (.xlsx, .xls) व CSV
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow-xs transition"
                  >
                    संगणकावरून फाईल निवडा
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analyzing Spinner */}
          {isAnalyzing && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-9 h-9 text-amber-600 animate-spin mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">
                Excel फाईलचे नाव आणि कॉलम्स तपासत आहे...
              </p>
            </div>
          )}

          {/* STEP 2: File Analyzed - Confirm Stage & Handling */}
          {selectedFile && analysis && !isAnalyzing && !result && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate max-w-sm">
                      {analysis.fileName}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>एकूण रेकॉर्ड्स: <strong>{analysis.totalRows}</strong></span>
                      <span>•</span>
                      <span>कॉलम्स: <strong>{analysis.detectedCols.length}</strong></span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setAnalysis(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto"
                >
                  दुसरी फाईल निवडा
                </button>
              </div>

              {/* Target Stage Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>फाईलसाठी योग्य स्टेज (Target Stage) निवडा:</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    नावावरून ओळखलेली स्टेज
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stageOptions.map((s) => {
                    const meta = STAGE_METAS[s];
                    const isSelected = targetStage === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTargetStage(s)}
                        className={`text-left p-2.5 rounded-xl border transition flex items-start justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 ring-1 ring-amber-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-900 truncate">
                            {meta.titleMarathi}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {meta.description}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duplicates Handling Notice */}
              {analysis.duplicatesCount > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5 text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        डेटाबेसमध्ये {analysis.duplicatesCount} लाभार्थी आधीपासून उपलब्ध आहेत.
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        (उदा. {analysis.duplicateNames.slice(0, 3).join(', ')}...)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                    <div className="font-semibold text-slate-800 text-[11px]">
                      डुप्लिकेट लाभार्थ्यांसाठी कृती (Duplicate Action):
                    </div>
                    <label className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateHandling"
                        value="update_stage"
                        checked={duplicateHandling === 'update_stage'}
                        onChange={() => setDuplicateHandling('update_stage')}
                        className="mt-0.5 text-amber-600"
                      />
                      <span>
                        <strong className="text-slate-900">
                          विद्यमान लाभार्थ्यांची स्थिती अद्यतनित करा (Merge Stage - शिफारस):
                        </strong>{' '}
                        लाभार्थ्याची एकाच प्रोफाईलमध्ये पूर्ण इतिहास (नवीन अर्ज → ACCEPT → 10% → LOAN)
                        जोडला जाईल.
                      </span>
                    </label>

                    <label className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateHandling"
                        value="add_new"
                        checked={duplicateHandling === 'add_new'}
                        onChange={() => setDuplicateHandling('add_new')}
                        className="mt-0.5 text-amber-600"
                      />
                      <span>
                        <strong className="text-slate-900">नवीन स्वतंत्र रेकॉर्ड म्हणून जोडा</strong>
                      </span>
                    </label>

                    <label className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="duplicateHandling"
                        value="skip"
                        checked={duplicateHandling === 'skip'}
                        onChange={() => setDuplicateHandling('skip')}
                        className="mt-0.5 text-amber-600"
                      />
                      <span>
                        <strong className="text-slate-900">केवळ नवीन आयात करा, जुने वगळा</strong>
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    सर्व <strong>{analysis.totalRows}</strong> लाभार्थी नवीन आहेत. कोणतीही डुप्लिकेट नोंद आढळली नाही.
                  </span>
                </div>
              )}

              {/* Detected Columns Chips */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-700 text-[11px]">
                  Excel मधील ओळखलेले कॉलम्स ({analysis.detectedCols.length}):
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px]">
                  {analysis.detectedCols.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Loading Import */}
          {loading && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto" />
              <div className="font-bold text-slate-900 text-sm">
                डेटाबेसमध्ये डेटा आयात करत आहे...
              </div>
              <p className="text-slate-500 text-xs">
                निवडलेली स्टेज: <strong>{STAGE_METAS[targetStage].titleMarathi}</strong>
              </p>
            </div>
          )}

          {/* STEP 4: Import Result Confirmation */}
          {result && (
            <div className="py-6 text-center space-y-4">
              <div
                className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                  result.success
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {result.success ? 'डेटा यशस्वीरीत्या आयात झाला!' : 'आयात अयशस्वी'}
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {result.message}
                </p>
              </div>

              {result.success && (
                <div className="inline-block text-left bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                  <div>
                    📁 फाईल: <strong>{result.fileName}</strong>
                  </div>
                  <div>
                    🏷️ स्टेज: <strong>{STAGE_METAS[result.targetStage].titleMarathi}</strong>
                  </div>
                  <div>
                    👥 एकूण समाविष्ट लाभार्थी: <strong>{result.count}</strong> (नवीन: {result.newCount}, अद्यतनित: {result.updatedCount})
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {selectedFile && analysis && !result && !loading && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setAnalysis(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition"
            >
              मागे जा
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <span>{STAGE_METAS[targetStage].titleMarathi} मध्ये आयात करा</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
