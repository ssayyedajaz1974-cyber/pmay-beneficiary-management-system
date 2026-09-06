import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Search,
  CheckSquare,
  Percent,
  Wallet,
  Landmark,
  FileCheck,
  FileBarChart2,
  Printer,
  Settings,
  Database,
  FileSpreadsheet,
  Ticket
} from 'lucide-react';
import { useBeneficiary, NavItem } from '../context/BeneficiaryContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentNav, setCurrentNav, stats, importedFilesList } = useBeneficiary();

  const navItems: {
    id: NavItem;
    labelMarathi: string;
    labelEnglish: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      labelMarathi: 'डॅशबोर्ड',
      labelEnglish: 'Overview Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'newForms',
      labelMarathi: '१. नवीन अर्ज (Form Filled)',
      labelEnglish: '1. New Forms Filled',
      icon: FileText,
      badge: stats.newFormsCount > 0 ? stats.newFormsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 font-bold'
    },
    {
      id: 'lottery',
      labelMarathi: '२. सोडत व्यवस्थापन (Lottery)',
      labelEnglish: '2. Lottery / Lucky Draw',
      icon: Ticket,
      badge: stats.lotteryTotal > 0 ? `${stats.lotterySelected} निवड / ${stats.lotteryTotal}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold'
    },
    {
      id: 'acceptance',
      labelMarathi: '३. स्वीकृती (Acceptance)',
      labelEnglish: '3. Acceptance Process',
      icon: CheckSquare,
      badge: stats.accepted > 0 ? `${stats.accepted} Accept` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'payment10',
      labelMarathi: '४. १०% हप्ता प्रक्रिया',
      labelEnglish: '4. 10% Payment Process',
      icon: Percent,
      badge: stats.payment10Paid > 0 ? `${stats.payment10Paid} Paid` : undefined,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'payment20',
      labelMarathi: '५. २०% हप्ता प्रक्रिया',
      labelEnglish: '5. 20% Payment Process',
      icon: Wallet,
      badge: stats.payment20Paid > 0 ? `${stats.payment20Paid} Paid` : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'loan',
      labelMarathi: '६. बँक कर्ज प्रक्रिया',
      labelEnglish: '6. Loan Process',
      icon: Landmark,
      badge: stats.loanUnderProcess > 0 ? `${stats.loanUnderProcess} Under Proc` : undefined,
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'list',
      labelMarathi: 'सर्व लाभार्थी मास्टर यादी',
      labelEnglish: 'Master Beneficiary List',
      icon: Users,
      badge: stats.total > 0 ? stats.total : undefined,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'search',
      labelMarathi: 'लाभार्थी शोध',
      labelEnglish: 'Search Beneficiary',
      icon: Search
    },
    {
      id: 'documents',
      labelMarathi: 'कागदपत्रे तपासणी',
      labelEnglish: 'Documents Verification',
      icon: FileCheck
    },
    {
      id: 'reports',
      labelMarathi: 'अहवाल व आकडेवारी',
      labelEnglish: 'Reports & Analytics',
      icon: FileBarChart2
    },
    {
      id: 'print',
      labelMarathi: 'प्रिंट केंद्र',
      labelEnglish: 'Print Hub (A4)',
      icon: Printer
    },
    {
      id: 'settings',
      labelMarathi: 'सेटिंग्ज व बॅकअप',
      labelEnglish: 'Settings & Data Backup',
      icon: Settings
    }
  ];

  const handleSelect = (id: NavItem) => {
    setCurrentNav(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-2xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } no-print`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              PM
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                PMAY - CSN
              </div>
              <div className="text-[11px] text-slate-400">कार्यप्रणाली नियंत्रण</div>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-[11px] font-mono opacity-50 w-4 text-left">
                    {index + 1}.
                  </span>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  />
                  <div className="text-left truncate">
                    <div className="leading-tight truncate">{item.labelMarathi}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {item.labelEnglish}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>स्थानिक डेटाबेस</span>
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">सुरक्षित</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              सर्व माहिती स्थानिक ब्राउझर मेमरीमध्ये सेव्ह होते. रिफ्रेश केल्यावर डेटा नष्ट होत नाही.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
