import React, { useState } from 'react';
import { UserPlus, X, Save, Building } from 'lucide-react';
import { useBeneficiary } from '../context/BeneficiaryContext';
import {
  BeneficiaryRecord,
  PROJECT_SITES,
  ProjectSiteConfig,
  createDefaultLoanProcessRecord,
  createDefaultBeneficiaryLotteryRecord
} from '../types/pmay';

interface ManualBeneficiaryModalProps {
  onClose: () => void;
}

export const ManualBeneficiaryModal: React.FC<ManualBeneficiaryModalProps> = ({ onClose }) => {
  const { addBeneficiary } = useBeneficiary();

  const [formData, setFormData] = useState({
    applicationNumber: `PMAY-CSN-${Math.floor(100000 + Math.random() * 900000)}`,
    beneficiaryName: '',
    fatherSpouseName: '',
    mobileNumber: '',
    aadharNumber: '',
    gender: 'MALE',
    category: 'OPEN',
    projectSite: 'Padegaon Group No. 69',
    buildingNumber: '',
    wing: '',
    floor: '',
    flatHouseNumber: '',
    remarks: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaryName.trim() || !formData.applicationNumber.trim()) {
      alert('कृपया लाभार्थ्याचे नाव आणि अर्ज क्रमांक भरा.');
      return;
    }

    const selectedSite = PROJECT_SITES.find(
      (s) => s.nameEnglish.toLowerCase() === formData.projectSite.toLowerCase()
    );

    const newRecord: BeneficiaryRecord = {
      id: `manual_${Date.now()}`,
      applicationNumber: formData.applicationNumber.trim(),
      beneficiaryName: formData.beneficiaryName.trim(),
      fatherSpouseName: formData.fatherSpouseName.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      projectSite: selectedSite?.nameEnglish || formData.projectSite,
      groupNumber: selectedSite?.groupNo || '69',
      houseCost: selectedSite?.houseCost || 956332,
      subsidyAmount: 250000,
      flatHouseNumber: formData.flatHouseNumber.trim(),
      buildingNumber: formData.buildingNumber.trim(),
      floor: formData.floor.trim(),
      wing: formData.wing.trim(),
      acceptance: {
        status: 'PENDING',
        date: '',
        remarks: ''
      },
      payment10Percent: {
        status: 'PENDING',
        amount: Math.round((selectedSite?.houseCost || 956332) * 0.1),
        paymentDate: '',
        receiptNo: '',
        transactionRef: '',
        remarks: ''
      },
      payment20Percent: {
        mode: 'NONE',
        status: 'PENDING',
        amount: Math.round((selectedSite?.houseCost || 956332) * 0.2),
        paymentDate: '',
        receiptNo: '',
        transactionRef: '',
        remarks: ''
      },
      loanProcess: createDefaultLoanProcessRecord(
        Math.round((selectedSite?.houseCost || 956332) * 0.2)
      ),
      lottery: createDefaultBeneficiaryLotteryRecord(),
      documents: [
        { id: '1', name: 'Aadhar Card (आधार कार्ड)', status: 'Pending', remarks: '' },
        { id: '2', name: 'Ration Card (रेशन कार्ड)', status: 'Pending', remarks: '' },
        { id: '3', name: 'Income Certificate (उत्पन्न दाखला)', status: 'Pending', remarks: '' },
        { id: '4', name: 'Bank Passbook (बँक पासबुक)', status: 'Pending', remarks: '' },
        { id: '5', name: 'Domicile / Resident Certificate (रहिवासी दाखला)', status: 'Pending', remarks: '' }
      ],
      rawExcelData: {},
      importedFileName: 'Manual Entry (थेट नोंदणी)',
      importStage: 'NEW_FORM_FILLED',
      importedAt: new Date().toISOString(),
      stageHistory: [
        {
          stage: 'Form Filled',
          timestamp: new Date().toISOString(),
          note: 'ॲप्लिकेशनमध्ये थेट मॅन्युअल नोंद केली'
        }
      ],
      generalRemarks: formData.remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addBeneficiary(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              नवीन लाभार्थी थेट नोंदणी (Direct Entry)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">अर्ज क्रमांक (App No) *</label>
              <input
                type="text"
                required
                value={formData.applicationNumber}
                onChange={(e) => setFormData({ ...formData, applicationNumber: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">लाभार्थ्याचे नाव *</label>
              <input
                type="text"
                required
                value={formData.beneficiaryName}
                onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                placeholder="उदा. रमेश विठ्ठल पाटील"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">पती किंवा वडिलांचे नाव</label>
              <input
                type="text"
                value={formData.fatherSpouseName}
                onChange={(e) => setFormData({ ...formData, fatherSpouseName: e.target.value })}
                placeholder="उदा. विठ्ठल पाटील"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">मोबाईल क्रमांक</label>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="उदा. 9876543210"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">प्रकल्प व जागा (Project Site) *</label>
              <select
                value={formData.projectSite}
                onChange={(e) => setFormData({ ...formData, projectSite: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                {PROJECT_SITES.map((site) => (
                  <option key={site.id} value={site.nameEnglish}>
                    {site.nameMarathi} (गट नं. {site.groupNo}) - घर किंमत ₹
                    {site.houseCost.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">इमारत क्रमांक / विंग</label>
              <input
                type="text"
                value={formData.buildingNumber}
                onChange={(e) => setFormData({ ...formData, buildingNumber: e.target.value })}
                placeholder="उदा. B-2 किंवा Wing A"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">सदनिका / घर क्रमांक</label>
              <input
                type="text"
                value={formData.flatHouseNumber}
                onChange={(e) => setFormData({ ...formData, flatHouseNumber: e.target.value })}
                placeholder="उदा. 304"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              रद्द करा
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>नोंद जतन करा</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
