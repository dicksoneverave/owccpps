import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { supabase } from '../../services/supabase';
import NewForm3 from './NewForm3';

interface SearchForm3Props {
  onClose: () => void;
  onSelectIRN?: (irn: string) => void;
  formType?: 'new' | 'view' | 'edit' | 'injury-case';
}

interface SearchResult {
  DisplayIRN: string;
  IRN: string;
  IncidentType: string;
  WorkerID: string;
  workerpersonaldetails: {
    WorkerFirstName: string;
    WorkerLastName: string;
  };
}

const SearchForm3: React.FC<SearchForm3Props> = ({ 
  onClose, 
  onSelectIRN,
  formType = 'new'
}) => {
  const [irn, setIrn] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showNotFound, setShowNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm3, setShowNewForm3] = useState(false);
  const [selectedIRN, setSelectedIRN] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowNotFound(false);
    setSearchResults([]);

    if (!irn && !firstName && !lastName) {
      setError('Please enter a Display IRN, First Name, or Last Name to search');
      return;
    }

    try {
      setLoading(true);

      // Build the base query
      let query = supabase
        .from('form1112master')
        .select(`
          DisplayIRN,
          IRN,
          IncidentType,
          WorkerID,
          workerpersonaldetails!inner (
            WorkerFirstName,
            WorkerLastName
          )
        `)
        .eq('IncidentType', 'Injury');

      // Add filters based on search criteria
      if (irn) {
        query = query.ilike('DisplayIRN', `%${irn}%`);
      }
      
      if (firstName) {
        query = query.ilike('workerpersonaldetails.WorkerFirstName', `%${firstName}%`);
      }
      
      if (lastName) {
        query = query.ilike('workerpersonaldetails.WorkerLastName', `%${lastName}%`);
      }

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;

      if (!data || data.length === 0) {
        setShowNotFound(true);
        return;
      }

      setSearchResults(data);
    } catch (err) {
      console.error('Error searching for records:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (irn: string) => {
    setSelectedIRN(irn);
    setShowNewForm3(true);
  };

  if (showNewForm3 && selectedIRN) {
    return (
      <NewForm3 
        workerId={selectedIRN} 
        onClose={() => {
          setShowNewForm3(false);
          setSelectedIRN(null);
          onClose();
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Search Form 3</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="irn" className="block text-sm font-medium text-gray-700 mb-1">
                Display IRN
              </label>
              <input
                type="text"
                id="irn"
                value={irn}
                onChange={(e) => setIrn(e.target.value)}
                className="input"
                placeholder="Enter Display IRN"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Search Results */}
          <div className="mt-6 max-h-[400px] overflow-y-auto">
            {searchResults.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Display IRN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IRN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((result) => (
                      <tr key={result.IRN} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.DisplayIRN}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.IRN}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.workerpersonaldetails.WorkerFirstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.workerpersonaldetails.WorkerLastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleView(result.IRN)}
                            className="font-medium text-sm text-primary hover:text-primary-dark"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showNotFound && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No records found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm3;
