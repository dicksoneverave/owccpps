import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Search, Filter, Calendar, AlertCircle, FileText } from 'lucide-react';

interface ClaimDecision {
  IRN: string;
  DisplayIRN: string;
  SubmissionType: string;
  Status: string;
  DecisionReason: string;
  DecisionTakenBy: string;
  DecisionDate: string;
}

const ListClaimDecisions: React.FC = () => {
  const [claimDecisions, setClaimDecisions] = useState<ClaimDecision[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<ClaimDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedReviewType, setSelectedReviewType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Filter options
  const [statuses, setStatuses] = useState<string[]>([]);
  const [submissionTypes, setSubmissionTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchClaimDecisions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedStatus, selectedReviewType, dateFrom, dateTo, claimDecisions]);

  const fetchClaimDecisions = async () => {
    try {
      setLoading(true);
      let allDecisions: ClaimDecision[] = [];

      // 1. Fetch from timebarredclaimsregistrarreview
      const { data: timeBarredData, error: timeBarredError } = await supabase
        .from('timebarredclaimsregistrarreview')
        .select('IRN, TBCRRFormType, TBCRRReviewStatus, TBCRRDecisionReason, TBCRRDecisionDate')
        .order('TBCRRDecisionDate', { ascending: false });

      if (timeBarredError) throw timeBarredError;

      const formattedTimeBarredData = timeBarredData?.map(item => ({
        IRN: item.IRN,
        DisplayIRN: '', // Will be populated later
        SubmissionType: `${item.TBCRRFormType} - TimeBarred`,
        Status: item.TBCRRReviewStatus || '',
        DecisionReason: item.TBCRRDecisionReason || '',
        DecisionTakenBy: 'Registrar',
        DecisionDate: item.TBCRRDecisionDate || ''
      })) || [];

      // 2. Fetch from prescreeningreview
      const { data: prescreeningData, error: prescreeningError } = await supabase
        .from('prescreening_view')
        .select('*')
        .eq('IRN', irn)
        .order('PRSubmissionDate', { ascending: false });

      if (prescreeningError) throw prescreeningError;

      const formattedPrescreeningData = prescreeningData?.map(item => ({
        IRN: item.IRN,
        DisplayIRN: '', // Will be populated later
        SubmissionType: item.PRFormType || 'Form Review', 
        Status: item.PRStatus || 'Pending', 
        DecisionReason: item.PRDecisionReason || 'Under Review', 
        DecisionTakenBy: 'Deputy Registrar',
        DecisionDate: item.PRSubmissionDate || ''
      })) || [];

      // 3. Fetch from registrarreview
      const { data: registrarData, error: registrarError } = await supabase
        .from('registrarreview')
        .select('IRN, IncidentType, RRStatus, RRDecisionReason, RRDecisionDate')
        .order('RRDecisionDate', { ascending: false });

      if (registrarError) throw registrarError;

      const formattedRegistrarData = registrarData?.map(item => ({
        IRN: item.IRN,
        DisplayIRN: '', // Will be populated later
        SubmissionType: item.IncidentType || '',
        Status: item.RRStatus || '',
        DecisionReason: item.RRDecisionReason || '',
        DecisionTakenBy: 'Registrar',
        DecisionDate: item.RRDecisionDate || ''
      })) || [];

      // 4. Fetch from approvedclaimscporeview
      const { data: cpoData, error: cpoError } = await supabase
        .from('approvedclaimscporeview')
        .select('IRN, IncidentType, CPORStatus, LockedByCPOID, CPORSubmissionDate')
        .order('CPORSubmissionDate', { ascending: false });

      if (cpoError) throw cpoError;

      // Process CPO data with locked status
      const formattedCPOData = await Promise.all(cpoData?.map(async item => {
        let status = '';
        let decisionReason = '--';
        let decisionTakenBy = 'Provincial Claims Officer';

        if (item.CPORStatus !== 'CompensationCalculated') {
          if (item.LockedByCPOID === 0) {
            status = 'Review Pending';
          } else {
            status = 'Review in Progress';
            
            // Get locked by user name
            if (item.LockedByCPOID) {
              const { data: userData, error: userError } = await supabase
                .from('owcstaffmaster')
                .select('OSMFirstName, OSMLastName')
                .eq('OSMStaffID', item.LockedByCPOID)
                .maybeSingle();
                
              if (!userError && userData) {
                decisionTakenBy = `${userData.OSMFirstName} ${userData.OSMLastName}`;
              }
            }
          }
        } else {
          status = 'Compensation Calculated';
          
          // Get locked by user name
          if (item.LockedByCPOID) {
            const { data: userData, error: userError } = await supabase
              .from('owcstaffmaster')
              .select('OSMFirstName, OSMLastName')
              .eq('OSMStaffID', item.LockedByCPOID)
              .maybeSingle();
              
            if (!userError && userData) {
              decisionTakenBy = `${userData.OSMFirstName} ${userData.OSMLastName}`;
            }
          }
        }

        return {
          IRN: item.IRN,
          DisplayIRN: '', // Will be populated later
          SubmissionType: item.IncidentType || '',
          Status: status,
          DecisionReason: decisionReason,
          DecisionTakenBy: decisionTakenBy,
          DecisionDate: item.CPORSubmissionDate || ''
        };
      }) || []);

      // 5. Fetch from compensationcalculationreview
      const { data: ccrData, error: ccrError } = await supabase
        .from('compensationcalculationreview')
        .select('IRN, IncidentType, CCRReviewStatus, CCRDecisionReason, CCRSubmissionDate')
        .order('CCRSubmissionDate', { ascending: false });

      if (ccrError) throw ccrError;

      const formattedCCRData = ccrData?.map(item => ({
        IRN: item.IRN,
        DisplayIRN: '', // Will be populated later
        SubmissionType: item.IncidentType || '',
        Status: item.CCRReviewStatus || '',
        DecisionReason: item.CCRDecisionReason || '',
        DecisionTakenBy: 'Registrar',
        DecisionDate: item.CCRSubmissionDate || ''
      })) || [];

      // 6. Fetch from compensationcalculationcommissionerreview
      const { data: cccData, error: cccError } = await supabase
        .from('compensationcalculationcommissionersreview')
        .select('IRN, IncidentType, CCCRReviewStatus, CCCRDecisionReason, CCCRSubmissionDate')
        .order('CCCRSubmissionDate', { ascending: false });

      if (cccError) throw cccError;

      const formattedCCCData = cccData?.map(item => {
        let decisionTakenBy = 'Commissioner';
        
        // Check if status contains "Chief" or "Comm"
        if (item.CCCRReviewStatus && item.CCCRReviewStatus.includes('Chief')) {
          decisionTakenBy = 'ChiefCommissioner';
        } else if (item.CCCRReviewStatus && item.CCCRReviewStatus.includes('Comm')) {
          decisionTakenBy = 'Commissioner';
        }
        
        return {
          IRN: item.IRN,
          DisplayIRN: '', // Will be populated later
          SubmissionType: item.IncidentType || '',
          Status: item.CCCRReviewStatus || '',
          DecisionReason: item.CCCRDecisionReason || '',
          DecisionTakenBy: decisionTakenBy,
          DecisionDate: item.CCCRSubmissionDate || ''
        };
      }) || [];

      // 7. Fetch from compensationcalculationcpmreview
      const { data: cpmData, error: cpmError } = await supabase
        .from('compensationcalculationcpmreview')
        .select('IRN, IncidentType, CPMRStatus, CPMRDecisionReason, CPMRSubmissionDate')
        .order('CPMRSubmissionDate', { ascending: false });

      if (cpmError) throw cpmError;

      // Process CPM data with region-based CPM name
      const formattedCPMData = await Promise.all(cpmData?.map(async item => {
        // Get incident region from form1112master
        const { data: form1112Data, error: form1112Error } = await supabase
          .from('form1112master')
          .select('IncidentRegion')
          .eq('IRN', item.IRN)
          .maybeSingle();
          
        let cpmName = 'Claims Manager';
        
        if (!form1112Error && form1112Data && form1112Data.IncidentRegion) {
          // Get CPM details based on region
          const { data: cpmUserData, error: cpmUserError } = await supabase
            .from('owcstaffmaster')
            .select('OSMFirstName, OSMLastName')
            .eq('InchargeRegion', form1112Data.IncidentRegion)
            .eq('OSMDesignation', 'Claims Manager')
            .maybeSingle();
            
          if (!cpmUserError && cpmUserData) {
            cpmName = `${cpmUserData.OSMFirstName} ${cpmUserData.OSMLastName} (Claims Manager)`;
          }
        }
        
        return {
          IRN: item.IRN,
          DisplayIRN: '', // Will be populated later
          SubmissionType: item.IncidentType || '',
          Status: item.CPMRStatus || '',
          DecisionReason: item.CPMRDecisionReason || '',
          DecisionTakenBy: cpmName,
          DecisionDate: item.CPMRSubmissionDate || ''
        };
      }) || []);

      // 8. Fetch from form6master
      const { data: form6Data, error: form6Error } = await supabase
        .from('form6master')
        .select('IRN, IncidentType, F6MStatus, F6MApprovalDate')
        .order('F6MApprovalDate', { ascending: false });

      if (form6Error) throw form6Error;

      const formattedForm6Data = form6Data?.map(item => ({
        IRN: item.IRN,
        DisplayIRN: '', // Will be populated later
        SubmissionType: `${item.IncidentType} - Form6`,
        Status: item.F6MStatus || '',
        DecisionReason: 'Notification Received - Insurance Company',
        DecisionTakenBy: '--',
        DecisionDate: item.F6MApprovalDate || ''
      })) || [];

      // 9. Fetch from form18master
      const { data: form18Data, error: form18Error } = await supabase
        .from('form18master')
        .select('IRN, IncidentType, F18MStatus, F18MEmployerDecisionReason, F18MWorkerDecisionReason, F18MEmployerAcceptedDate, F18MWorkerAcceptedDate')
        .order('F18MEmployerAcceptedDate', { ascending: false });

      if (form18Error) throw form18Error;

      const formattedForm18Data: ClaimDecision[] = [];
      
      // Process Form18 data based on status
      form18Data?.forEach(item => {
        // Employer Accepted
        if (item.F18MStatus === 'EmployerAccepted' || item.F18MStatus === 'NotifiedToWorker' || item.F18MStatus === 'WorkerAccepted') {
          formattedForm18Data.push({
            IRN: item.IRN,
            DisplayIRN: '', // Will be populated later
            SubmissionType: `${item.IncidentType} - Form18 Notification`,
            Status: 'EmployerAccepted',
            DecisionReason: item.F18MEmployerDecisionReason || '',
            DecisionTakenBy: 'Employer',
            DecisionDate: item.F18MEmployerAcceptedDate || ''
          });
        }
        
        // Notified to Worker
        if (item.F18MStatus === 'NotifiedToWorker' || item.F18MStatus === 'WorkerAccepted') {
          // Get locked by user name
          formattedForm18Data.push({
            IRN: item.IRN,
            DisplayIRN: '', // Will be populated later
            SubmissionType: `${item.IncidentType} - Form18 Notification`,
            Status: 'NotifiedToWorker',
            DecisionReason: '--',
            DecisionTakenBy: 'Provincial Claims Officer',
            DecisionDate: item.F18MEmployerAcceptedDate || ''
          });
        }
        
        // Worker Accepted
        if (item.F18MStatus === 'WorkerAccepted') {
          formattedForm18Data.push({
            IRN: item.IRN,
            DisplayIRN: '', // Will be populated later
            SubmissionType: `${item.IncidentType} - Form18 Notification`,
            Status: 'WorkerAccepted',
            DecisionReason: item.F18MWorkerDecisionReason || '',
            DecisionTakenBy: 'Worker',
            DecisionDate: item.F18MWorkerAcceptedDate || ''
          });
        }
      });

      // 10. Fetch from claimsawardedcommissionersreview
      const { data: cacrData, error: cacrError } = await supabase
        .from('claimsawardedcommissionersreview')
        .select('IRN, IncidentType, CACRReviewStatus, CACRDecisionReason, CACRSubmissionDate')
        .order('CACRSubmissionDate', { ascending: false });

      if (cacrError) throw cacrError;

      const formattedCACRData = cacrData?.map(item => {
        let decisionTakenBy = 'Commissioner';
        
        // Check if status contains "Chief"
        if (item.CACRReviewStatus && item.CACRReviewStatus.includes('Chief')) {
          decisionTakenBy = 'Chief Commissioner';
        }
        
        return {
          IRN: item.IRN,
          DisplayIRN: '', // Will be populated later
          SubmissionType: item.IncidentType || '',
          Status: item.CACRReviewStatus || '',
          DecisionReason: item.CACRDecisionReason || '',
          DecisionTakenBy: decisionTakenBy,
          DecisionDate: item.CACRSubmissionDate || ''
        };
      }) || [];

      // 11. Fetch from claimsawardedregistrarreview
      const { data: carrData, error: carrError } = await supabase
        .from('claimsawardedregistrarreview')
        .select('IRN, IncidentType, CARRReviewStatus, CARRDecisionReason, CARRSubmissionDate')
        .order('CARRSubmissionDate', { ascending: false });

      if (carrError) throw carrError;

      const formattedCARRData = carrData?.map(item => ({
        IRN: item.IRN,
        DisplayIRN: '', // Will be populated later
        SubmissionType: item.IncidentType || '',
        Status: item.CARRReviewStatus || '',
        DecisionReason: item.CARRDecisionReason || '',
        DecisionTakenBy: 'Registrar',
        DecisionDate: item.CARRSubmissionDate || ''
      })) || [];

      // Combine all data
      allDecisions = [
        ...formattedTimeBarredData,
        ...formattedPrescreeningData,
        ...formattedRegistrarData,
        ...formattedCPOData,
        ...formattedCCRData,
        ...formattedCCCData,
        ...formattedCPMData,
        ...formattedForm6Data,
        ...formattedForm18Data,
        ...formattedCACRData,
        ...formattedCARRData
      ];

      // Get DisplayIRN for all IRNs
      const irns = allDecisions.map(decision => decision.IRN);
      const { data: irnData, error: irnError } = await supabase
        .from('form1112master')
        .select('IRN, DisplayIRN')
        .in('IRN', irns);

      if (irnError) throw irnError;

      // Create a map of IRN to DisplayIRN
      const irnMap = new Map();
      irnData?.forEach(item => {
        irnMap.set(item.IRN, item.DisplayIRN);
      });

      // Update DisplayIRN in all decisions
      allDecisions = allDecisions.map(decision => ({
        ...decision,
        DisplayIRN: irnMap.get(decision.IRN) || decision.DisplayIRN || 'N/A'
      }));

      // Extract unique values for filters
      const uniqueStatuses = [...new Set(allDecisions.map(item => item.Status))].filter(Boolean);
      const uniqueSubmissionTypes = [...new Set(allDecisions.map(item => item.SubmissionType))].filter(Boolean);

      setStatuses(uniqueStatuses);
      setSubmissionTypes(uniqueSubmissionTypes);
      setClaimDecisions(allDecisions);
      setFilteredDecisions(allDecisions);
    } catch (err: any) {
      console.error('Error fetching claim data:', err);
      setError(err.message || 'Failed to load claim decisions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = claimDecisions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(decision =>
        decision.DisplayIRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decision.SubmissionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decision.Status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decision.DecisionReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decision.DecisionTakenBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(decision => decision.Status === selectedStatus);
    }

    // Review type filter
    if (selectedReviewType) {
      filtered = filtered.filter(decision => decision.SubmissionType === selectedReviewType);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(decision => {
        const decisionDate = new Date(decision.DecisionDate);
        return decisionDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(decision => {
        const decisionDate = new Date(decision.DecisionDate);
        return decisionDate <= new Date(dateTo);
      });
    }

    setFilteredDecisions(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedReviewType('');
    setDateFrom('');
    setDateTo('');
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('accepted')) {
      return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('rejected') || statusLower.includes('denied')) {
      return 'bg-red-100 text-red-800';
    } else if (statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('progress')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
        <p>{error}</p>
        <button 
          onClick={fetchClaimDecisions} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search by IRN, status, reason..." 
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select 
                className="py-2 px-3 border border-gray-300 rounded-md appearance-none pr-8"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select 
                className="py-2 px-3 border border-gray-300 rounded-md appearance-none pr-8"
                value={selectedReviewType}
                onChange={(e) => setSelectedReviewType(e.target.value)}
              >
                <option value="">All Submission Types</option>
                {submissionTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="date" 
                placeholder="From Date" 
                className="pl-10 py-2 px-3 border border-gray-300 rounded-md"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="date" 
                placeholder="To Date" 
                className="pl-10 py-2 px-3 border border-gray-300 rounded-md"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <button 
              onClick={clearFilters}
              className="py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display IRN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status of Approval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision Taken By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDecisions.length > 0 ? (
                filteredDecisions.map((decision, index) => (
                  <tr key={`${decision.IRN}-${decision.SubmissionType}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {decision.DisplayIRN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decision.SubmissionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(decision.Status)}`}>
                        {decision.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decision.DecisionReason || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decision.DecisionTakenBy || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decision.DecisionDate ? new Date(decision.DecisionDate).toLocaleDateString() : '--'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-lg font-medium">No decisions found</p>
                    <p className="text-sm">Try adjusting your filters or search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListClaimDecisions;