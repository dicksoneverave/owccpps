import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Form247Form17Injury from './247Form17Injury';
import Form246Form17Death from './246Form17Death';

interface ListForm17Props {
  onClose: () => void;
  onSelectIRN?: (irn: string, incidentType: string) => void;
}

interface Form17Data {
  IRN: string;
  DisplayIRN: string;
  WorkerFirstName: string;
  WorkerLastName: string;
  RejectedDate: string;
  IncidentType: string;
  F17MID: string;
  F17MStatus: string;
}

const ListForm17: React.FC<ListForm17Props> = ({ 
  onClose,
  onSelectIRN 
}) => {
  const { profile, group } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form17List, setForm17List] = useState<Form17Data[]>([]);
  const [searchIRN, setSearchIRN] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage] = useState(20);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [groupID, setGroupID] = useState<number | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFormIRN, setSelectedFormIRN] = useState<string | null>(null);
  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null);
  const [showForm246, setShowForm246] = useState(false);
  const [showForm247, setShowForm247] = useState(false);
  const [selectedIRN, setSelectedIRN] = useState('');
 
	
  useEffect(() => {
    const fetchUserRegion = async () => {
      try {
        if (!profile?.id) {
          console.warn('No profile ID available');
          return;
        }
        
        const { data, error } = await supabase
          .from('owcstaffmaster')
          .select('InchargeRegion')
          .eq('cppsid', profile.id)
          .maybeSingle();
        
        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        if (data) {
          setUserRegion(data.InchargeRegion);
        } else {
          console.warn('No region found for user:', profile.id);
          // Default to a region for testing/development
          setUserRegion('Momase Region');
        }

        if (group) {
          setGroupID(group.id);
        }
      } catch (err) {
        console.error('Error fetching user region:', err);
        setError('Failed to fetch region information. Please try again later.');
        // Default to a region for testing/development
        setUserRegion('Momase Region');
      }
    };
    
    fetchUserRegion();
  }, [profile, group]);

  useEffect(() => {
    if (userRegion) {
      fetchForm17List();
    }
  }, [userRegion, currentPage, searchIRN, searchFirstName, searchLastName]);

  const fetchForm17List = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userRegion) {
        setError('Please wait while we load your region information.');
        return;
      }

      // First, get the IRNs from form1112master for the user's region
      const { data: form1112Data, error: form1112Error } = await supabase
        .from('form1112master')
        .select('IRN')
        .eq('IncidentRegion', userRegion);

      if (form1112Error) throw form1112Error;

      if (!form1112Data || form1112Data.length === 0) {
        setForm17List([]);
        setTotalRecords(0);
        setTotalPages(1);
        return;
      }

      const regionIRNs = form1112Data.map(item => item.IRN);
      
      // Get the count of matching records
      const { count, error: countError } = await supabase
        .from('form17master')
        .select('IRN', { count: 'exact', head: true })
        .in('IRN', regionIRNs);

      if (countError) throw countError;
      
      const totalCount = count || 0;
      setTotalRecords(totalCount);
      setTotalPages(Math.ceil(totalCount / recordsPerPage));
      
      // Calculate pagination
      const start = (currentPage - 1) * recordsPerPage;
      
      // Get form17master data
      const { data: form17Data, error: form17Error } = await supabase
        .from('form17master')
        .select(`
          IRN,
          F17MWorkerRejectedDate,
          IncidentType,
          F17MID,
          F17MStatus
        `)
        .in('IRN', regionIRNs)
        .range(start, start + recordsPerPage - 1)
        .order('F17MWorkerRejectedDate', { ascending: false });

      if (form17Error) throw form17Error;

      if (!form17Data || form17Data.length === 0) {
        setForm17List([]);
        return;
      }

      // Get the IRNs from the result
      const irns = form17Data.map(item => item.IRN);

      // Get the form1112master data for these IRNs
      const { data: detailedForm1112Data, error: detailedForm1112Error } = await supabase
        .from('form1112master')
        .select(`
          IRN,
          DisplayIRN,
          WorkerID
        `)
        .in('IRN', irns);

      if (detailedForm1112Error) throw detailedForm1112Error;

      // Create a map of IRN to form1112master data
      const form1112Map = new Map();
      detailedForm1112Data.forEach(item => {
        form1112Map.set(item.IRN, item);
      });

      // Get worker details for all WorkerIDs
      const workerIds = detailedForm1112Data.map(item => item.WorkerID).filter(Boolean);
      
      if (workerIds.length === 0) {
        setForm17List([]);
        return;
      }

      const { data: workerData, error: workerError } = await supabase
        .from('workerpersonaldetails')
        .select(`
          WorkerID,
          WorkerFirstName,
          WorkerLastName
        `)
        .in('WorkerID', workerIds);

      if (workerError) throw workerError;

      // Create a map of WorkerID to worker data
      const workerMap = new Map();
      workerData.forEach(item => {
        workerMap.set(item.WorkerID, item);
      });

      // Combine all the data
      const formattedData = form17Data.map(item => {
        const form1112 = form1112Map.get(item.IRN);
        const worker = form1112 ? workerMap.get(form1112.WorkerID) : null;

        return {
          IRN: item.IRN,
          DisplayIRN: form1112?.DisplayIRN || 'N/A',
          WorkerFirstName: worker?.WorkerFirstName || 'N/A',
          WorkerLastName: worker?.WorkerLastName || 'N/A',
          RejectedDate: item.F17MWorkerRejectedDate ? new Date(item.F17MWorkerRejectedDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : 'N/A',
          IncidentType: item.IncidentType || 'N/A',
          F17MID: item.F17MID,
          F17MStatus: item.F17MStatus
        };
      });

      // Apply filters if needed
      let filteredData = formattedData;
      
      if (searchIRN) {
        filteredData = filteredData.filter(item => 
          item.DisplayIRN.toLowerCase().includes(searchIRN.toLowerCase())
        );
      }
      
      if (searchFirstName) {
        filteredData = filteredData.filter(item => 
          item.WorkerFirstName.toLowerCase().includes(searchFirstName.toLowerCase())
        );
      }
      
      if (searchLastName) {
        filteredData = filteredData.filter(item => 
          item.WorkerLastName.toLowerCase().includes(searchLastName.toLowerCase())
        );
      }
      
      setForm17List(filteredData);
    } catch (err: any) {
      console.error('Error fetching Form17 list:', err);
      setError(err.message || 'Failed to load Form17 list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleView = (irn: string, incidentType: string) => {
    console.log(`[DEBUG] View clicked - IRN: ${irn}, Incident Type: ${incidentType}`);
  if (onSelectIRN) {
      console.log(`[DEBUG] onSelectIRN callback triggered for IRN: ${irn}, Incident Type: ${incidentType}`);
      onSelectIRN(irn, incidentType);
    } else {
      console.log(`[DEBUG] Displaying form for IRN: ${irn}, Incident Type: ${incidentType}`);
      setSelectedIRN(irn);
      setSelectedIncidentType(incidentType);
      
      if (incidentType === 'Injury') {
        console.log(`[DEBUG] Loading Form 247 for IRN: ${irn}`);
        setShowForm247(true);
      } else if (incidentType === 'Death') {
        console.log(`[DEBUG] Loading Form 246 for IRN: ${irn}`);
        setShowForm246(true);
      }
	}
  };

const handleCloseForm1 = () => {
    setShowForm247(false);
    //setShowForm139(false);
    setSelectedIRN('');
    setSelectedIncidentType('');
    console.log('[DEBUG] Form closed');
  };

const handleCloseForm2 = () => {
    setShowForm246(false);
    //setShowForm139(false);
    setSelectedIRN('');
    setSelectedIncidentType('');
    console.log('[DEBUG] Form closed');
  };


	
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Form 17 List
            {userRegion && <span className="text-sm font-normal ml-2 text-gray-600">({userRegion})</span>}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="searchIRN" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Display IRN
                </label>
                <input
                  type="text"
                  id="searchIRN"
                  value={searchIRN}
                  onChange={(e) => setSearchIRN(e.target.value)}
                  className="input"
                  placeholder="Enter Display IRN"
                />
              </div>
              
              <div>
                <label htmlFor="searchFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by First Name
                </label>
                <input
                  type="text"
                  id="searchFirstName"
                  value={searchFirstName}
                  onChange={(e) => setSearchFirstName(e.target.value)}
                  className="input"
                  placeholder="Enter First Name"
                />
              </div>
              
              <div>
                <label htmlFor="searchLastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Last Name
                </label>
                <input
                  type="text"
                  id="searchLastName"
                  value={searchLastName}
                  onChange={(e) => setSearchLastName(e.target.value)}
                  className="input"
                  placeholder="Enter Last Name"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </form>

          <hr className="mb-6" />

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Total Records Found: {totalRecords} | 
              Total Pages: {totalPages}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : form17List.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CRN
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rejected Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {form17List.map((form, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {form.DisplayIRN}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.WorkerFirstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.WorkerLastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.RejectedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {form.IncidentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleView(form.IRN, form.IncidentType)}
                          className="text-sm font-medium bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No Form 17 Records to Display.</p>
            </div>
          )}

  {showForm247 && (
            < Form247Form17Injury
              irn={selectedIRN} 
              incidentType={selectedIncidentType} 
              onClose={handleCloseForm1} 
              onSubmit={() => console.log('Form 247 submitted')}
              onBack={() => {
                setShowForm247(false);
                console.log('Back to list from Form 247');
              }}
            />
          )}

          {showForm246 && (
            < Form246Form17Death
              irn={selectedIRN} 
              incidentType={selectedIncidentType} 
              onClose={handleCloseForm2} 
              onSubmit={() => console.log('Form 246 submitted')}
              onBack={() => {
                setShowForm246(false);
                console.log('Back to list from Form 246');
              }}
            />
          )}
					
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                {currentPage > 1 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Previous
                    </button>
                  </>
                )}
                
                {currentPage < totalPages && (
                  <>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Last
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListForm17;
