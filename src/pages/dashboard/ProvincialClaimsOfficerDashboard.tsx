import React, { useState, useEffect } from 'react';
import { FileText, Users, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import ListPendingRegisteredClaimsCPOReview from '../../components/forms/ListPendingRegisteredClaimsCPOReview';
import ListForm6NotificationEmployerResponsePending from '../../components/forms/ListForm6NotificationEmployerResponsePending';
import ListForm18EmployerAccepted from '../../components/forms/ListForm18EmployerAccepted';
import ListForm18WorkerResponse from '../../components/forms/ListForm18WorkerResponse';
import ListForm17 from '../../components/forms/ListForm17';
import ListForm7 from '../../components/forms/ListForm7';
import CPOClaimReviewForm from '../../components/forms/110cpoclaimreviewform';
import CPODeathClaimReviewForm from '../../components/forms/111cpoclaimreviewform'; 

const ProvincialClaimsOfficerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showPendingClaimsList, setShowPendingClaimsList] = useState(false);
  const [showForm6PendingList, setShowForm6PendingList] = useState(false);
  const [showForm18EmployerAcceptedList, setShowForm18EmployerAcceptedList] = useState(false);
  const [showForm18WorkerResponseList, setShowForm18WorkerResponseList] = useState(false);
  const [showForm17List, setShowForm17List] = useState(false);
  const [showForm7List, setShowForm7List] = useState(false);
  const [showCPOClaimReviewForm, setShowCPOClaimReviewForm] = useState(false);
  const [showCPODeathClaimReviewForm, setShowCPODeathClaimReviewForm] = useState(false);
  const [selectedIRN, setSelectedIRN] = useState<string | null>(null); 
  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null); 
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userStaffID, setUserStaffID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const menuItems = {
    'Claims': {
      items: ['Calculation Pending', 'Form6 Response Pending']
    },
    'Form18': {
      items: ['Employer Accepted', 'Worker Response']
    },
    'Form17': {
      items: []
    },
    'Form7': {
      items: []
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        if (!profile?.id) {
          console.warn('No profile ID available');
          return;
        }
        
        const { data, error } = await supabase
          .from('owcstaffmaster')
          .select('OSMFirstName, OSMLastName, OSMStaffID, InchargeRegion')
          .eq('cppsid', profile.id)
          .maybeSingle();
        
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        if (data) {
          setUserRegion(data.InchargeRegion);
          setUserFullName(`${data.OSMFirstName} ${data.OSMLastName}`);
          setUserStaffID(data.OSMStaffID ? data.OSMStaffID.toString() : null);
        } else {
          console.warn('No staff record found for user:', profile.id);
          // Default values for testing/development
          setUserRegion('Momase Region');
          setUserFullName(profile?.full_name || 'Provincial Officer');
          setUserStaffID('1000');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        // Default values for testing/development
        setUserRegion('Momase Region');
        setUserFullName(profile?.full_name || 'Provincial Officer');
        setUserStaffID('1000');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [profile]);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuItemClick = (menu: string, item: string) => {
    console.log(`Selected ${item} from ${menu}`);
    
    if (menu === 'Claims' && item === 'Calculation Pending') {
      setShowPendingClaimsList(true);
    } else if (menu === 'Claims' && item === 'Form6 Response Pending') {
      setShowForm6PendingList(true);
    } else if (menu === 'Form18' && item === 'Employer Accepted') {
      setShowForm18EmployerAcceptedList(true);
    } else if (menu === 'Form18' && item === 'Worker Response') {
      setShowForm18WorkerResponseList(true);
    } else if (menu === 'Form17') {
      setShowForm17List(true);
    } else if (menu === 'Form7') {
      setShowForm7List(true);
    }
    
    setActiveMenu(null);
  };

  const handleWorkerSelect = (irn: string, incidentType: string) => {
    setSelectedIRN(irn);
    setSelectedIncidentType(incidentType);
    console.log(`Parent received IRN: ${irn}, Incident Type: ${incidentType}`);
    
    if (incidentType === 'Death') {
      console.log('Setting up Death Claim Review Form');
      setShowCPODeathClaimReviewForm(true);
      setShowCPOClaimReviewForm(false);
    } else {
      console.log('Setting up Injury Claim Review Form');
      setShowCPOClaimReviewForm(true);
      setShowCPODeathClaimReviewForm(false);
      console.log(`Showing Injury Claim Review Form (110cpoclaimreviewform.tsx) for IRN: ${irn}`);
    }
  }; 

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Provincial Claims Officer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userFullName || 'Provincial Officer'}</p>
        {userRegion && <p className="text-sm text-gray-500">Region: {userRegion}</p>}
        {userStaffID && <p className="text-sm text-gray-500">Staff ID: {userStaffID}</p>}
      </div>

      {/* Navigation Menu */}
      <div className="mb-8 bg-white rounded-lg shadow">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(menuItems).map(([menu, { items }]) => (
            <div key={menu} className="relative">
              <button
                onClick={() => toggleMenu(menu)}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <span className="font-medium">{menu}</span>
                {items.length > 0 && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeMenu === menu ? 'transform rotate-180' : ''
                    }`}
                  />
                )}
              </button>
              {activeMenu === menu && items.length > 0 && (
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
              {activeMenu === menu && items.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                  <button
                    onClick={() => handleMenuItemClick(menu, '')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                  >
                    View All
                  </button>
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
              <p className="text-sm text-gray-600">Active Claims</p>
              <p className="text-2xl font-bold">28</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processed Today</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-amber-100 mr-4">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Claimants</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md">
          <div className="flex items-center">
            <div className="rounded-full p-3 bg-purple-100 mr-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Processing</p>
              <p className="text-2xl font-bold">3.2d</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Claims</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claimant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
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
              {[
                {
                  id: 'CLM-2023-001',
                  type: 'Injury Claim',
                  claimant: 'John Smith',
                  dateSubmitted: '2023-05-15',
                  status: 'Pending Review'
                },
                {
                  id: 'CLM-2023-002',
                  type: 'Death Claim',
                  claimant: 'Mary Johnson',
                  dateSubmitted: '2023-05-14',
                  status: 'Documentation Required'
                },
                {
                  id: 'CLM-2023-003',
                  type: 'Injury Claim',
                  claimant: 'Peter Wilson',
                  dateSubmitted: '2023-05-13',
                  status: 'Under Review'
                }
              ].map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {claim.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.claimant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.dateSubmitted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      claim.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' : 
                      claim.status === 'Documentation Required' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Claims List Modal */}
      {showPendingClaimsList && (
        <ListPendingRegisteredClaimsCPOReview 
          onClose={() => setShowPendingClaimsList(false)}
          onSelectWorker={handleWorkerSelect}
        />
      )}

      {/* Form6 Pending List Modal */}
      {showForm6PendingList && (
        <ListForm6NotificationEmployerResponsePending 
          onClose={() => setShowForm6PendingList(false)}
        />
      )}

      {/* Form18 Employer Accepted List Modal */}
      {showForm18EmployerAcceptedList && (
        <ListForm18EmployerAccepted 
          onClose={() => setShowForm18EmployerAcceptedList(false)}
        />
      )}

      {/* Form18 Worker Response List Modal */}
      {showForm18WorkerResponseList && (
        <ListForm18WorkerResponse 
          onClose={() => setShowForm18WorkerResponseList(false)}
        />
      )}

      {/* Form17 List Modal */}
      {showForm17List && (
        <ListForm17 
          onClose={() => setShowForm17List(false)}
        />
      )}

      {/* Form7 List Modal */}
      {showForm7List && (
        <ListForm7 
          onClose={() => setShowForm7List(false)}
        />
      )}

 
      {/* CPO Claim Review Form Modal */}
      {showCPOClaimReviewForm && selectedIRN && (
        <CPOClaimReviewForm 
          irn={selectedIRN}
          onClose={() => {
            setShowCPOClaimReviewForm(false);
            setSelectedIRN(null);
            setSelectedIncidentType(null);
          }}
        />
      )}

     {/* CPO Death Claim Review Form Modal */}
      {showCPODeathClaimReviewForm && selectedIRN && (
        <CPODeathClaimReviewForm 
          irn={selectedIRN}
          onClose={() => {
            setShowCPODeathClaimReviewForm(false);
            setSelectedIRN(null);
            setSelectedIncidentType(null);
          }}
        />
      )}
      
    </div>
  );
};

export default ProvincialClaimsOfficerDashboard;
