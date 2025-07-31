import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WorkerSearchForm from '../../components/forms/WorkerSearchForm';
import SearchForm3 from '../../components/forms/SearchForm3';
import SearchForm4 from '../../components/forms/SearchForm4';

const DataEntryDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showWorkerSearchForm, setShowWorkerSearchForm] = useState(false);
  const [showSearchForm3, setShowSearchForm3] = useState(false);
  const [showSearchForm4, setShowSearchForm4] = useState(false);
  const [currentFormType, setCurrentFormType] = useState<'Form11' | 'Form12' | 'Form3' | 'Form4'>('Form11');
  const [currentSearchFormType, setCurrentSearchFormType] = useState<'new' | 'view' | 'edit' | 'injury-case'>('new');

  const menuItems = {
    'Register Employer': {
      items: ['New', 'Edit', 'View']
    },
    'Register Worker': {
      items: ['New', 'Edit', 'View']
    },
    'Form3': {
      items: ['New', 'Edit', 'View']
    },
    'Form4': {
      items: ['New', 'Edit', 'View']
    },
    'Form11': {
      items: ['New', 'Edit', 'View']
    },
    'Form12': {
      items: ['New', 'Edit', 'View']
    },
    'Attachments': {
      items: ['Death Case', 'Injury Case']
    }
  };

  const recentEntries = [
    {
      id: 'F11-2023-001',
      type: 'Form 11',
      submittedBy: 'John Smith',
      dateSubmitted: '2023-05-15',
      status: 'Pending Entry'
    },
    {
      id: 'F3-2023-002',
      type: 'Form 3',
      submittedBy: 'Mary Johnson',
      dateSubmitted: '2023-05-14',
      status: 'In Progress'
    },
    {
      id: 'F4-2023-003',
      type: 'Form 4',
      submittedBy: 'Peter Wilson',
      dateSubmitted: '2023-05-13',
      status: 'Completed'
    }
  ];

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuItemClick = (menu: string, item: string) => {
    if (menu === 'Form11' && item === 'New') {
      setCurrentFormType('Form11');
      setShowWorkerSearchForm(true);
    } else if (menu === 'Form12' && item === 'New') {
      setCurrentFormType('Form12');
      setShowWorkerSearchForm(true);
    } else if (menu === 'Form3') {
      if (item === 'New') {
        setCurrentSearchFormType('new');
        setShowSearchForm3(true);
      } else if (item === 'View' || item === 'Edit') {
        setCurrentSearchFormType(item.toLowerCase() as 'view' | 'edit');
        setShowSearchForm3(true);
      }
    } else if (menu === 'Form4') {
      if (item === 'New') {
        setShowSearchForm4(true);
      } else if (item === 'View' || item === 'Edit') {
        setShowSearchForm4(true);
      }
    } else if (menu === 'Attachments' && item === 'Injury Case') {
      setCurrentSearchFormType('injury-case');
      setShowSearchForm3(true);
    }
    
    setActiveMenu(null);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Entry Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name || 'Data Entry Officer'}</p>
      </div>

      {/* Navigation Menu */}
      <div className="mb-8 bg-white rounded-lg shadow">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(menuItems).map(([menu, { items }]) => (
            <div key={menu} className="relative">
              <button
                onClick={() => toggleMenu(menu)}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="font-medium">{menu}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    activeMenu === menu ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {activeMenu === menu && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  {items.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleMenuItemClick(menu, item)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-blue-100 mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Entry</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-amber-100 mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="text-2xl font-bold">18m</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-red-100 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errors Found</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {entry.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.dateSubmitted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.status === 'Pending Entry' ? 'bg-yellow-100 text-yellow-800' : 
                      entry.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark">
                      {entry.status === 'Completed' ? 'View' : 'Enter Data'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showWorkerSearchForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <WorkerSearchForm 
            onClose={() => setShowWorkerSearchForm(false)} 
            formType={currentFormType}
          />
        </div>
      )}

      {showSearchForm3 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <SearchForm3 
            onClose={() => setShowSearchForm3(false)}
            formType={currentSearchFormType}
          />
        </div>
      )}

      {showSearchForm4 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <SearchForm4 
            onClose={() => setShowSearchForm4(false)}
          />
        </div>
      )}
    </div>
  );
};

export default DataEntryDashboard;
