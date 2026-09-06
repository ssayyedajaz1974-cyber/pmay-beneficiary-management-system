import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export interface ExcelDataState {
  fileName: string | null;
  sheetNames: string[];
  activeSheet: string | null;
  columns: string[];
  rows: Record<string, any>[];
  totalRecords: number;
  uploadedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ExcelDataContextType extends ExcelDataState {
  handleFileUpload: (file: File) => Promise<boolean>;
  changeSheet: (sheetName: string) => void;
  clearData: () => void;
}

const STORAGE_KEY = 'pmay_csn_excel_data_v1';

const ExcelDataContext = createContext<ExcelDataContextType | undefined>(undefined);

export const ExcelDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExcelDataState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fileName: parsed.fileName || null,
          sheetNames: parsed.sheetNames || [],
          activeSheet: parsed.activeSheet || null,
          columns: parsed.columns || [],
          rows: parsed.rows || [],
          totalRecords: parsed.rows?.length || 0,
          uploadedAt: parsed.uploadedAt || null,
          isLoading: false,
          error: null
        };
      }
    } catch (e) {
      console.error('Could not parse stored excel data', e);
    }

    return {
      fileName: null,
      sheetNames: [],
      activeSheet: null,
      columns: [],
      rows: [],
      totalRecords: 0,
      uploadedAt: null,
      isLoading: false,
      error: null
    };
  });

  // Save to localStorage when updated
  useEffect(() => {
    try {
      if (state.rows.length > 0 && state.fileName) {
        // Only save if data size is reasonable (< 4MB) to avoid quota issues
        const serialized = JSON.stringify({
          fileName: state.fileName,
          sheetNames: state.sheetNames,
          activeSheet: state.activeSheet,
          columns: state.columns,
          rows: state.rows.slice(0, 1000), // store up to 1000 rows locally
          uploadedAt: state.uploadedAt
        });
        localStorage.setItem(STORAGE_KEY, serialized);
      } else if (!state.fileName && state.rows.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Storage limit reached or failed to persist', e);
    }
  }, [state.fileName, state.rows, state.columns, state.activeSheet, state.sheetNames, state.uploadedAt]);

  const parseWorkbook = (workbook: XLSX.WorkBook, fileName: string, sheetNameToUse?: string) => {
    const sheetNames = workbook.SheetNames;
    if (!sheetNames || sheetNames.length === 0) {
      throw new Error('एक्सेल फाईलमध्ये कोणतीही शीट आढळली नाही (No sheets found in Excel file)');
    }

    const selectedSheet = sheetNameToUse && sheetNames.includes(sheetNameToUse) ? sheetNameToUse : sheetNames[0];
    const worksheet = workbook.Sheets[selectedSheet];

    // Read sheet as json array of objects
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
      raw: false
    });

    // Detect columns from first rows or worksheet range
    let detectedColumns: string[] = [];
    if (jsonData.length > 0) {
      detectedColumns = Object.keys(jsonData[0]);
    } else {
      // If empty rows, try reading headers from header row
      const headerRows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
      if (headerRows && headerRows.length > 0 && Array.isArray(headerRows[0])) {
        detectedColumns = headerRows[0].map(c => String(c).trim()).filter(Boolean);
      }
    }

    setState({
      fileName,
      sheetNames,
      activeSheet: selectedSheet,
      columns: detectedColumns,
      rows: jsonData,
      totalRecords: jsonData.length,
      uploadedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      isLoading: false,
      error: null
    });
  };

  const handleFileUpload = async (file: File): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          parseWorkbook(workbook, file.name);
          resolve(true);
        } catch (err: any) {
          console.error('Error reading Excel file:', err);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: `एक्सेल फाईल वाचताना त्रुटी आढळली: ${err?.message || 'अवैध फाईल स्वरूप'}`
          }));
          resolve(false);
        }
      };

      reader.onerror = () => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'फाईल लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
        }));
        resolve(false);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const changeSheet = (sheetName: string) => {
    // If workbook data needs re-parsing, but for now activeSheet can be tracked
    setState(prev => ({ ...prev, activeSheet: sheetName }));
  };

  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      fileName: null,
      sheetNames: [],
      activeSheet: null,
      columns: [],
      rows: [],
      totalRecords: 0,
      uploadedAt: null,
      isLoading: false,
      error: null
    });
  };

  return (
    <ExcelDataContext.Provider
      value={{
        ...state,
        handleFileUpload,
        changeSheet,
        clearData
      }}
    >
      {children}
    </ExcelDataContext.Provider>
  );
};

export const useExcelData = () => {
  const context = useContext(ExcelDataContext);
  if (!context) {
    throw new Error('useExcelData must be used within an ExcelDataProvider');
  }
  return context;
};
