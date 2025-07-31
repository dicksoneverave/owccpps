import React, { useState } from 'react';
import { Scale, Calendar, Users, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ListPendingHearingsPublic from '../../components/forms/ListPendingHearingsPublic';
import ListPendingHearingsPrivate from '../../components/forms/ListPendingHearingsPrivate';
import PrintListPublic from '../../components/forms/PrintListPublic';
import PrintListPrivate from '../../components/forms/PrintListPrivate';
import PrintListAll from '../../components/forms/PrintListAll';
import SetTribunalHearing from '../../components/forms/SetTribunalHearing';

const TribunalDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showPendingHearingsPublic, setShowPendingHearingsPublic] = useState(false);
  const [showPendingHearingsPrivate, setShowPendingHearingsPrivate] = useState(false);
  const [showPrintListPublic, setShowPrintListPublic] = useState(false);
  const [showPrintListPrivate, setShowPrintListPrivate] = useState(false);
  const [showPrintListAll, setShowPrintListAll] = useState(false);
  const [showSetHearing, setShowSetHearing] = useState(false);
  const [selectedIRN, setSelectedIRN] = useState<string | null>(null);

  const menuItems = {
    'Pre-Hearing': {
      items: [
        'Hearing Pending (Public)',
        'Hearing Pending (Private)',
        'Print List (Public)',
        'Print List (Private)',
        'Print List (All)'
      ]
    },
    'Hearing': {
      items: [
        'Set Hearing',
        'Tribunal Hearing',
        'Hearing Complete'
      ]
    },
    'Hearing Decisions': {
      items: ['Consented', 'Adjourned', 'Dismissed/Appeal'],
      submenus: {
        'Consented': ['Approved List'],
        'Adjourned': ['Adjourned List'],
        'Dismissed/Appeal': ['Dismissed/Appeal List']
      }
    },
    'Time Barred Claims': {
      items: [
        'Approved',
        'Rejected'
      ]
    },
    'Claims': {
      items: ['Form18', 'Form7'],
      submenus: {
        'Form18': [
          'Employer Accepted',
          'Worker'
        ]
      }
    }
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuItemClick = (menu: string, item: string) => {
    console.log(`Selected ${item} from ${menu}`);
    
    if (menu === 'Pre-Hearing' && item === 'Hearing Pending (Public)') {
      setShowPendingHearingsPublic(true);
    } else if (menu === 'Pre-Hearing' && item === 'Hearing Pending (Private)') {
      setShowPendingHearingsPrivate(true);
    } else if (menu === 'Pre-Hearing' && item === 'Print List (Public)') {
      setShowPrintListPublic(true);
    } else if (menu === 'Pre-Hearing' && item === 'Print List (Private)') {
      setShowPrintListPrivate(true);
    } else if (menu === 'Pre-Hearing' && item === 'Print List (All)') {
      setShowPrintListAll(true);
    } else if (menu === 'Hearing' && item === 'Set Hearing') {
      setShowSetHearing(true);
    }
    
    setActiveMenu(null);
  };

  const handleSelectIRN = (irn: string) => {
    setSelectedIRN(irn);
    setShowSetHearing(true);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tribunal Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name || 'Tribunal Officer'}</p>
      </div>

      {/* Navigation Menu */}
      <div className="mb-8 bg-white rounded-lg shadow">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(menuItems).map(([menu, { items, submenus = {}, additionalItems = [] }]) => (
            <div key={menu} className="relative">
              <button
                onClick={() => toggleMenu(menu)}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="font-medium">{menu}</span>
                {(items.length > 0 || Object.keys(submenus).length > 0) && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeMenu === menu ? 'transform rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {activeMenu === menu && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {items.map((item) => (
                    <div key={item}>
                      <button
                        onClick={() => handleMenuItemClick(menu, item)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        {item}
                      </button>
                      {submenus[item] && (
                        <div className="pl-8 bg-gray-50">
                          {submenus[item].map((subitem) => (
                            <button
                              key={subitem}
                              onClick={() => handleMenuItemClick(item, subitem)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                            >
                              {subitem}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {additionalItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleMenuItemClick(menu, item)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Cases</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 mr-4">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled Hearings</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-amber-100 mr-4">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved Cases</p>
              <p className="text-2xl font-bold">126</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Parties</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upcoming Hearings</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Case #{2023100 + index}</p>
                    <p className="text-sm text-gray-500">Claimant vs Employer Name</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Scheduled
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(2023, 5, 15 + index).toLocaleDateString()}
                  <span className="mx-2">•</span>
                  10:00 AM
                </div>
                <button className="btn btn-primary text-sm mt-3">View Details</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Decisions</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Case #{2023097 + index}</p>
                    <p className="text-sm text-gray-500">Decision rendered on {new Date().toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    index === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {index === 1 ? 'Rejected' : 'Approved'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {index === 1 
                    ? 'Claim rejected due to insufficient evidence'
                    : 'Compensation awarded as per guidelines'
                  }
                </p>
                <button className="btn btn-secondary text-sm mt-3">View Full Decision</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Hearings Public Modal */}
      {showPendingHearingsPublic && (
        <ListPendingHearingsPublic 
          onClose={() => setShowPendingHearingsPublic(false)}
          onSelectIRN={handleSelectIRN}
        />
      )}

      {/* Pending Hearings Private Modal */}
      {showPendingHearingsPrivate && (
        <ListPendingHearingsPrivate 
          onClose={() => setShowPendingHearingsPrivate(false)}
          onSelectIRN={handleSelectIRN}
        />
      )}

      {/* Print List Public Modal */}
      {showPrintListPublic && (
        <PrintListPublic 
          onClose={() => setShowPrintListPublic(false)}
        />
      )}

      {/* Print List Private Modal */}
      {showPrintListPrivate && (
        <PrintListPrivate 
          onClose={() => setShowPrintListPrivate(false)}
        />
      )}

      {/* Print List All Modal */}
      {showPrintListAll && (
        <PrintListAll 
          onClose={() => setShowPrintListAll(false)}
        />
      )}

      {/* Set Hearing Modal */}
      {showSetHearing && (
        <SetTribunalHearing 
          irn={selectedIRN || undefined}
          onClose={() => {
            setShowSetHearing(false);
            setSelectedIRN(null);
          }}
        />
      )}
    </div>
  );
};

export default TribunalDashboard;
