import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Form133CPOForm18InjuryEmployerResponseReview from './133CPOForm18InjuryEmployerResponseReview';
import Form213CPOForm18DeathEmployerResponseReview from './213CPOForm18DeathEmployerResponseReview';

interface ListForm18EmployerAcceptedProps {
  onClose: () => void;
  onSelectIRN?: (irn: string, incidentType: string) => void;
}

interface Form18Data {
  IRN: string;
  DisplayIRN: string;
  WorkerFirstName: string;
  WorkerLastName: string;
  EmployerAcceptedDate: string;
  IncidentType: string;
  F18MID: string;
  Status: string;
}

const ListForm18EmployerAccepted: React.FC<ListForm18EmployerAcceptedProps> = ({ 
  onClose,
  onSelectIRN 
}) => {
  const { profile, group } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form18List, setForm18List] = useState<Form18Data[]>([]);
  const [searchIRN, setSearchIRN] = useState('');
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage] = useState(20);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [groupID, setGroupID] = useState<number | null>(null);
  const [selectedIRN, setSelectedIRN] = useState('');
  const [selectedIncidentType, setSelectedIncidentType] = useState('');
  const [showForm133, setShowForm133] = useState(false);
  const [showForm213, setShowForm213] = useState(false);

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
          setUserRegion('Momase Region');
        }

        if (group) {
          setGroupID(group.id);
        }
      } catch (err) {
        setError('Failed to fetch region information. Please try again later.');
        setUserRegion('Momase Region');
      }
    };

    fetchUserRegion();
  }, [profile, group]);

  useEffect(() => {
    if (userRegion) {
      fetchForm18List();
    }
  }, [userRegion, currentPage, searchIRN, searchFirstName, searchLastName]);

  const fetchForm18List = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userRegion) {
        setError('Please wait while we load your region information.');
        return;
      }

      const { data: form1112Data, error: form1112Error } = await supabase
        .from('form1112master')
        .select('IRN')
        .eq('IncidentRegion', userRegion);

      if (form1112Error) throw form1112Error;

      if (!form1112Data || form1112Data.length === 0) {
        setForm18List([]);
        setTotalPages(1);
        setTotalRecords(0);
        return;
      }

      const regionIRNs = form1112Data.map(item => item.IRN);

      const { count, error: countError } = await supabase
        .from('form18master')
        .select('IRN', { count: 'exact', head: true })
        .eq('F18MStatus', 'EmployerAccepted')
        .in('IRN', regionIRNs);

      if (countError) throw countError;

      const totalCount = count || 0;
      setTotalRecords(totalCount);
      setTotalPages(Math.ceil(totalCount / recordsPerPage));

      const start = (currentPage - 1) * recordsPerPage;

      const { data: form18Data, error: form18Error } = await supabase
        .from('form18master')
        .select(`
          IRN,
          F18MEmployerAcceptedDate,
          IncidentType,
          F18MID,
          F18MStatus
        `)
        .eq('F18MStatus', 'EmployerAccepted')
        .in('IRN', regionIRNs)
        .range(start, start + recordsPerPage - 1)
        .order('F18MEmployerAcceptedDate', { ascending: false });

      if (form18Error) throw form18Error;

      if (!form18Data || form18Data.length === 0) {
        setForm18List([]);
        return;
      }

      const irns = form18Data.map(item => item.IRN);

      const { data: detailedForm1112Data, error: detailedForm1112Error } = await supabase
        .from('form1112master')
        .select(`
          IRN,
          DisplayIRN,
          WorkerID
        `)
        .in('IRN', irns);

      if (detailedForm1112Error) throw detailedForm1112Error;

      const form1112Map = new Map();
      detailedForm1112Data.forEach(item => {
        form1112Map.set(item.IRN, item);
      });

      const workerIds = detailedForm1112Data.map(item => item.WorkerID).filter(Boolean);

      if (workerIds.length === 0) {
        setForm18List([]);
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

      const workerMap = new Map();
      workerData.forEach(item => {
        workerMap.set(item.WorkerID, item);
      });

      const formattedData = form18Data.map(item => {
        const form1112 = form1112Map.get(item.IRN);
        const worker = form1112 ? workerMap.get(form1112.WorkerID) : null;

        return {
          IRN: item.IRN?.toString() || 'N/A',
          DisplayIRN: form1112?.DisplayIRN || 'N/A',
          WorkerFirstName: worker?.WorkerFirstName || 'N/A',
          WorkerLastName: worker?.WorkerLastName || 'N/A',
          EmployerAcceptedDate: item.F18MEmployerAcceptedDate ? new Date(item.F18MEmployerAcceptedDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : 'N/A',
          IncidentType: item.IncidentType || 'N/A',
          F18MID: item.F18MID,
          Status: item.F18MStatus
        };
      });

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

      setForm18List(filteredData);
    } catch (err: any) {
      setError(err.message || 'Failed to load Form18 list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleView = (irn: string, incidentType: string) => {
    if (typeof irn !== 'string' || !irn || irn.trim() === '') {
      setError('Invalid IRN. Please select a valid claim to view.');
      return;
    }

    setSelectedIRN(irn);
    setSelectedIncidentType(incidentType);

    if (incidentType === 'Injury') {
      setShowForm133(true);
    } else if (incidentType === 'Death') {
      // Future implementation
      // setShowForm213(true);
    }
  };

  const handleCloseForm133 = () => {
    setShowForm133(false);
    setSelectedIRN('');
    setSelectedIncidentType('');
  };


	  const handleCloseForm213 = () => {
    setShowForm213(false);
    setSelectedIRN('');
    setSelectedIncidentType('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Form 18 - Employer Accepted
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
          ) : form18List.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      CRN
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      First Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Last Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Accepted Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Incident Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {form18List.map((form, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                        {form.DisplayIRN}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {form.WorkerFirstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {form.WorkerLastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {form.EmployerAcceptedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {form.IncidentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${form.Status === 'EmployerAccepted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {form.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                        <button
                          onClick={() => handleView(form.IRN, form.IncidentType)}
                          className="text-sm font-medium bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No Notifications to Display.</p>
            </div>
          )}

          {/* Modal for Form 133 */}
          {showForm133 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <Form133CPOForm18InjuryEmployerResponseReview
                  irn={selectedIRN}
                  incidentType={selectedIncidentType}
                  onClose={handleCloseForm133}
                  onSubmit={() => console.log('Form 133 submitted')}
                  onBack={() => console.log('Back from Form 133')}
                />
              </div>
            </div>
          )}


					{/* Modal for Form213 */}
          {showForm213 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <Form213CPOForm18DeathEmployerResponseReview
                  irn={selectedIRN}
                  incidentType={selectedIncidentType}
                  onClose={handleCloseForm213}
                  onSubmit={() => console.log('Form 133 submitted')}
                  onBack={() => console.log('Back from Form 133')}
                />
              </div>
            </div>
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

export default ListForm18EmployerAccepted;
