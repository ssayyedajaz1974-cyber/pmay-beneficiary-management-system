import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building,
  Save,
  ShieldCheck
} from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import { PROJECT_SITES, GOVT_SUBSIDY_AMOUNT } from '../types/pmay';

interface SettingsViewProps {
  onOpenExcelUpload: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenExcelUpload }) => {
  const {
    beneficiaries,
    rawExcelColumns,
    exportBackupJSON,
    importBackupJSON,
    clearAllData,
    exportToExcel
  } = useBeneficiary();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState('');

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importBackupJSON(text);
        if (ok) {
          setBackupMsg('बॅकअप डेटा यशस्वीरित्या रिस्टोअर झाला!');
          setTimeout(() => setBackupMsg(''), 4000);
        } else {
          alert('अवैध बॅकअप फाईल! कृपया योग्य JSON फाईल निवडा.');
        }
      } catch (err) {
        alert('बॅकअप फाईल वाचताना त्रुटी आली.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" />
          <span>प्रणाली सेटिंग्ज व डेटा सुरक्षा (System Settings & Data Safety)</span>
        </h2>
        <p className="text-xs text-slate-500">
          डेटा कायमस्वरूपी सुरक्षित ठेवण्यासाठी बॅकअप घ्या, एक्सेल फाईल आयात करा किंवा डेटा व्यवस्थापित करा.
        </p>
      </div>

      {backupMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* 1. Excel Master Import Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                १. प्राथमिक Excel फाईल आयात (Initial Master Data Import)
              </h3>
              <p className="text-xs text-slate-500">
                Excel फाईल फक्त सुरुवातीचा स्रोत आहे. एकदा आयात झाल्यावर सर्व काम ॲप्लिकेशनमधूनच होईल.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="settings-import-excel-btn"
            onClick={onOpenExcelUpload}
            className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Upload करा</span>
          </button>
        </div>

        {rawExcelColumns.length > 0 && (
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">
              शेवटच्या एक्सेल फाईलमध्ये आढळलेले {rawExcelColumns.length} Columns:
            </span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {rawExcelColumns.map((col, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Full Local Database Backup & Restore */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              २. डेटा सुरक्षा व बॅकअप (Data Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500">
              सध्याच्या डेटाबेसमध्ये <strong>{beneficiaries.length}</strong> लाभार्थी आहेत. भविष्यातील सुरक्षिततेसाठी बॅकअप फाईल डाउनलोड करून ठेवा.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Download JSON backup */}
          <button
            type="button"
            onClick={exportBackupJSON}
            className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition space-y-1"
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span>डेटाबेस बॅकअप डाउनलोड (.JSON)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              संपूर्ण डेटा, नोंदी आणि प्रक्रियेचा संपूर्ण बॅकअप सेव्ह करा.
            </p>
          </button>

          {/* Export full Excel */}
          <button
            type="button"
            onClick={() => exportToExcel()}
            className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition space-y-1"
          >
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>सर्व डेटा एक्सेलमध्ये एक्सपोर्ट (.XLSX)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              सध्याची सर्व माहिती आणि हप्ता स्थिती एक्सेल स्वरूपात मिळवा.
            </p>
          </button>

          {/* Restore JSON backup */}
          <div className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-left transition space-y-1">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleJsonUpload}
              className="hidden"
              id="restore-json-input"
            />
            <label
              htmlFor="restore-json-input"
              className="cursor-pointer block font-bold text-xs text-slate-900 flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-amber-600" />
              <span>बॅकअप फाईल रिस्टोअर करा</span>
            </label>
            <p className="text-[11px] text-slate-500">
              संगणकावर जतन केलेली .json बॅकअप फाईल पुन्हा लोड करा.
            </p>
          </div>
        </div>
      </div>

      {/* 3. House Cost Rules Reference */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              ३. प्रकल्प निहाय घर किमतीची अधिकृत मानके (Configured Project Rates)
            </h3>
            <p className="text-xs text-slate-500">
              १०% आणि २०% हप्ता या अधिकृत House Cost वर स्वयंचलित Calculate होतो.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {PROJECT_SITES.map((site) => (
            <div key={site.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">{site.nameMarathi}</div>
              <div className="text-[11px] text-slate-500">{site.nameEnglish}</div>
              <div className="text-slate-700 pt-1 font-semibold">
                घर किंमत: <span className="font-bold font-mono">₹{site.houseCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[10px] text-blue-700">
                १०%: ₹{Math.round(site.houseCost * 0.10).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-indigo-700">
                २०%: ₹{Math.round(site.houseCost * 0.20).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Reset & Clear Database */}
      <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>डेटाबेस साफ करा (Reset / Clear Database)</span>
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              ॲप्लिकेशनमधील सर्व लाभार्थ्यांची माहिती कायमस्वरूपी हटवून ० वर रिसेट करण्यासाठी वापरा.
            </p>
          </div>

          <button
            type="button"
            onClick={clearAllData}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
          >
            सर्व डेटा नष्ट करा
          </button>
        </div>
      </div>
    </div>
  );
};
