import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { AlertCircle } from 'lucide-react';

interface WorkerDetails {
  CCWDWorkerFirstName: string;
  CCWDWorkerLastName: string;
  WorkerDOB: string;
  CCWDAnnualWage: string;
  CCWDCompensationAmount: string;
  CCWDMedicalExpenses: string;
  CCWDMiscExpenses: string;
  CCWDDeductions: string;
  CCWDDeductionsNotes: string;
}

interface InjuryCheckList {
  ICCLCriteria: string;
  ICCLFactor: string;
  ICCLDoctorPercentage: string;
  ICCLCompensationAmount: string;
}

interface PersonalDetails {
  CCPDPersonFirstName: string;
  CCPDPersonLastName: string;
  CCPDPersonDOB: string;
  CCPDRelationToWorker: string;
  CCPDDegreeOfDependance: string;
  CCPDCompensationAmount: string;
}

interface CompensationBreakupDetailsViewProps {
  IRN: string;
  DisplayIRN: string;
  IncidentType: string;
}

const CompensationBreakupDetailsView: React.FC<CompensationBreakupDetailsViewProps> = ({ IRN, DisplayIRN, IncidentType }) => {
  const [workerDetails, setWorkerDetails] = useState<WorkerDetails | null>(null);
  const [injuryCheckList, setInjuryCheckList] = useState<InjuryCheckList[]>([]);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);

        const irnNumber = parseInt(IRN, 10);
        if (isNaN(irnNumber)) {
          throw new Error('Invalid IRN: must be a number');
        }

        // Fetch worker details
        const { data: workerDetails, error: workerError } = await supabase
          .from('claimcompensationworkerdetails')
          .select('*')
          .eq('IRN', irnNumber)
          .maybeSingle();

        if (workerError) {
          throw workerError;
        }
        setWorkerDetails(workerDetails);

        // Fetch injury checklist if incident type is Injury
        if (IncidentType === 'Injury') {
          const { data: injuryCheckList, error: injuryError } = await supabase
            .from('injurycasechecklist')
            .select('*')
            .eq('IRN', irnNumber);

          if (injuryError) {
            throw injuryError;
          }
          setInjuryCheckList(injuryCheckList || []);
        }

        // Fetch personal details
        const { data: personalDetails, error: personalError } = await supabase
          .from('claimcompensationpersonaldetails')
          .select('*')
          .eq('IRN', irnNumber);

        if (personalError) {
          throw personalError;
        }
        setPersonalDetails(personalDetails || []);

        setLoadingData(false);
      } catch (err: any) {
        setError(`Error loading compensation details: ${err.message}`);
        console.error('Breakup data error:', err.message);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [IRN, IncidentType]);

  if (error) {
    return (
      <div className="bg-surface p-8 rounded-lg shadow-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-primary">Compensation Breakup Details</h1>
        <div className="bg-error/10 border border-error text-error p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="bg-surface p-8 rounded-lg shadow-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-primary">Compensation Breakup Details</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!workerDetails) {
    return (
      <div className="bg-surface p-8 rounded-lg shadow-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-primary">Compensation Breakup Details</h1>
        <div className="bg-warning/10 border border-warning text-warning p-4 rounded-md">
          <p>No worker details found for this claim.</p>
        </div>
      </div>
    );
  }

  const data = {
    display_irn: DisplayIRN,
    worker_first_name: workerDetails.CCWDWorkerFirstName,
    worker_last_name: workerDetails.CCWDWorkerLastName,
    date_of_birth: workerDetails.WorkerDOB,
    annual_wage: parseFloat(workerDetails.CCWDAnnualWage) || 0,
    total_compensation: parseFloat(workerDetails.CCWDCompensationAmount) || 0,
    medical_expenses: parseFloat(workerDetails.CCWDMedicalExpenses) || 0,
    miscellaneous_expenses: parseFloat(workerDetails.CCWDMiscExpenses) || 0,
    deductions: parseFloat(workerDetails.CCWDDeductions) || 0,
    deduction_notes: workerDetails.CCWDDeductionsNotes || '',
    is_injury_case: IncidentType === 'Injury',
    dependents: personalDetails.map(detail => ({
      name: `${detail.CCPDPersonFirstName} ${detail.CCPDPersonLastName}`,
      relationship: detail.CCPDRelationToWorker,
      date_of_birth: detail.CCPDPersonDOB,
      degree_of_dependence: detail.CCPDDegreeOfDependance,
      compensation_amount: parseFloat(detail.CCPDCompensationAmount) || 0
    }))
  };

  return (
    <div className="bg-surface p-8 rounded-lg shadow-md w-full">
      <h1 className="text-3xl font-bold mb-6 text-primary">Compensation Breakup Details</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-textSecondary">Claim Reference</h2>
        <div className="bg-surface-dark p-4 rounded-md">
          <p className="text-textSecondary">
            <span className="font-medium">Display IRN (CRN): </span>
            {data.display_irn}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-textSecondary">Worker Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-dark p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3 text-textSecondary">Personal Details</h3>
            <p className="text-textSecondary">
              <span className="font-medium">Name: </span>
              {data.worker_first_name} {data.worker_last_name}
            </p>
            <p className="text-textSecondary mt-2">
              <span className="font-medium">Date of Birth: </span>
              {data.date_of_birth}
            </p>
          </div>

          <div className="bg-surface-dark p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3 text-textSecondary">Financial Details</h3>
            <p className="text-textSecondary">
              <span className="font-medium">Annual Wage: </span>
              ₹{data.annual_wage.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-textSecondary">Compensation Breakup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-dark p-4 rounded-md">
            <p className="text-textSecondary text-sm">Total Compensation</p>
            <p className="text-primary font-bold text-xl mt-1">
              ₹{data.total_compensation.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface-dark p-4 rounded-md">
            <p className="text-textSecondary text-sm">Medical Expenses</p>
            <p className="text-success font-bold text-xl mt-1">
              ₹{data.medical_expenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface-dark p-4 rounded-md">
            <p className="text-textSecondary text-sm">Miscellaneous Expenses</p>
            <p className="text-accent font-bold text-xl mt-1">
              ₹{data.miscellaneous_expenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-surface-dark p-4 rounded-md">
            <p className="text-textSecondary text-sm">Deductions</p>
            <p className="text-error font-bold text-xl mt-1">
              ₹{data.deductions.toLocaleString()}
            </p>
          </div>
        </div>

        {data.deduction_notes && (
          <div className="mt-4 bg-surface-dark p-4 rounded-md border border-gray-700">
            <p className="text-textSecondary text-sm">Deduction Notes:</p>
            <p className="text-textSecondary mt-1">{data.deduction_notes}</p>
          </div>
        )}
      </div>

      {data.is_injury_case && injuryCheckList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-textSecondary">Injury Checklist</h2>
          
          <div className="bg-surface-dark rounded-md overflow-hidden w-full">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Criteria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Factor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Doctor's Percentage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Compensation Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-gray-700">
                {injuryCheckList.map((item, index) => (
                  <tr key={index} className="hover:bg-surface-dark transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{item.ICCLCriteria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{item.ICCLFactor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent font-bold">{item.ICCLDoctorPercentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success font-bold">₹{parseFloat(item.ICCLCompensationAmount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-textSecondary">Dependent/Applicant Details</h2>
        {data.dependents.length > 0 ? (
          <div className="bg-surface-dark rounded-md overflow-hidden w-full">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Relationship
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Date Of Birth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Dependence Degree
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Compensation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-gray-700">
                {data.dependents.map((dependent, index) => (
                  <tr key={index} className="hover:bg-surface-dark transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{dependent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{dependent.relationship}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{dependent.date_of_birth}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{dependent.degree_of_dependence}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-success font-bold">₹{dependent.compensation_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-surface-dark p-4 rounded-md">
            <p className="text-textSecondary">No dependents/applicants found for this claim.</p>
          </div>
        )}
      </div>

    
    
    </div>
  );
};

export default CompensationBreakupDetailsView;
