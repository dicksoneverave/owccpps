import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Printer, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

interface ViewForm6Props {
  irn: string;
  onClose: () => void;
}

interface Form6Data {
  IRN: string;
  DisplayIRN: string;
  IncidentType: string;
  F6MStatus: string;
  F6MApprovalDate: string;
  CPOInCharge: string;
  EmployerCPPSID: string;
}

interface WorkerData {
  WorkerID: string;
  WorkerFirstName: string;
  WorkerLastName: string;
  WorkerAddress1: string;
  WorkerAddress2: string;
  WorkerCity: string;
  WorkerProvince: string;
  WorkerPOBox: string;
  WorkerEmail: string;
  WorkerMobile: string;
}

interface EmployerData {
  OrganizationName: string;
  Address1: string;
  Address2: string;
  City: string;
  Province: string;
  POBox: string;
  Website: string;
  MobilePhone: string;
  LandLine: string;
  Fax: string;
  OrganizationType: string;
}

const ViewForm6: React.FC<ViewForm6Props> = ({ irn, onClose }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form6Data, setForm6Data] = useState<Form6Data | null>(null);
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [employerData, setEmployerData] = useState<EmployerData | null>(null);
  const [currentDate] = useState<string>(new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Form6 data
      const { data: form6Data, error: form6Error } = await supabase
        .from('form6master')
        .select('*')
        .eq('IRN', irn)
        .maybeSingle();

      if (form6Error) {
        throw form6Error;
      }

      if (!form6Data) {
        throw new Error('Form 6 data not found');
      }

      setForm6Data(form6Data);

      // Fetch worker data from form1112master to get WorkerID
      const { data: form1112Data, error: form1112Error } = await supabase
        .from('form1112master')
        .select('WorkerID')
        .eq('IRN', irn)
        .single();

      if (form1112Error) {
        throw form1112Error;
      }

      // Fetch worker personal details
      const { data: workerData, error: workerError } = await supabase
        .from('workerpersonaldetails')
        .select('*')
        .eq('WorkerID', form1112Data.WorkerID)
        .single();

      if (workerError) {
        throw workerError;
      }

      setWorkerData(workerData);

      // Fetch employer details
      const { data: employerData, error: employerError } = await supabase
        .from('employermaster')
        .select('*')
        .eq('CPPSID', form6Data.EmployerCPPSID)
        .maybeSingle();

      if (employerError && employerError.code !== 'PGRST116') {
        throw employerError;
      }

      if (employerData) {
        setEmployerData(employerData);
      } else {
        // Try to get employer details from currentemploymentdetails
        const { data: cedData, error: cedError } = await supabase
          .from('currentemploymentdetails')
          .select('PlaceOfEmployment, EmployerCPPSID')
          .eq('WorkerID', form1112Data.WorkerID)
          .maybeSingle();

        if (!cedError && cedData) {
          setEmployerData({
            OrganizationName: cedData.PlaceOfEmployment,
            Address1: '',
            Address2: '',
            City: '',
            Province: '',
            POBox: '',
            Website: '',
            MobilePhone: '',
            LandLine: '',
            Fax: '',
            OrganizationType: ''
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching Form6 data:', err);
      setError(err.message || 'Failed to load Form6 data');
    } finally {
      setLoading(false);
    }
  }, [irn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = document.getElementById('form6-content');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the document');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Form 6 - ${workerData?.WorkerFirstName} ${workerData?.WorkerLastName}</title>
          <style>
            body {
              font-family: serif;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              font-weight: bold;
            }
            .right-align {
              text-align: right;
            }
            .center-align {
              text-align: center;
            }
            .section {
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <div class="footer">
            <button onclick="window.print()">Print</button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-700">Loading Form 6 data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Form 6 - Notice to Employer
            {form6Data && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                {form6Data.DisplayIRN}
              </span>
            )}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrint}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Print"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button 
              onClick={handleDownload}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div id="form6-content" className="bg-white p-8 border border-gray-300 rounded-md">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Workers' Compensation Act 1978</h3>
              <p className="text-sm italic">Reg., Sec. 8(1)(b).</p>
              <p className="text-right text-sm italic">Form 6</p>
            </div>

            <div className="mb-6">
              <p className="text-right">Register No. {form6Data?.DisplayIRN || ''}</p>
              <p className="font-medium mt-4">IN RESPECT OF</p>
              
              <div className="mt-2 mb-4">
                <p>{workerData?.WorkerFirstName} {workerData?.WorkerLastName}</p>
                <p>{workerData?.WorkerAddress1}</p>
                {workerData?.WorkerAddress2 && <p>{workerData.WorkerAddress2}</p>}
                <p>{workerData?.WorkerCity}, {workerData?.WorkerProvince}</p>
                {workerData?.WorkerPOBox && <p>P.O. Box {workerData.WorkerPOBox}</p>}
              </div>
              
              <p className="italic">a worker</p>
              
              <p className="font-medium mt-4">AND</p>
              
              <div className="mt-2 mb-4">
                <p>{employerData?.OrganizationName}</p>
                <p>{employerData?.Address1}</p>
                {employerData?.Address2 && <p>{employerData.Address2}</p>}
                <p>{employerData?.City}, {employerData?.Province}</p>
                {employerData?.POBox && <p>P.O. Box {employerData.POBox}</p>}
              </div>
              
              <p className="italic">the employer</p>
            </div>

            <div className="mb-6">
              <h4 className="text-center font-semibold mb-4">NOTICE TO EMPLOYER AS TO APPLICATION FOR COMPENSATION.</h4>
              
              <p className="mb-4">
                TAKE NOTICE that, if you intend to oppose the application, of which a copy is served with this notice, 
                you must lodge with me, within one calendar month after the service, a written answer to it containing 
                a concise statement of the extent and grounds of your opposition.
              </p>
              
              <p className="mb-6">
                AND FURTHER TAKE NOTICE that in default of your lodging with me, within the time specified, a written 
                answer as required a tribunal may make such an award as it deems just and expedient.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex justify-between">
                <div>
                  <p>Date: {currentDate}</p>
                  <p>Status: {form6Data?.F6MStatus || 'Pending'}</p>
                  {form6Data?.F6MApprovalDate && (
                    <p>Approval Date: {new Date(form6Data.F6MApprovalDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="italic">Registrar</p>
                  {form6Data?.CPOInCharge && <p>Officer: {form6Data.CPOInCharge}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewForm6;