import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Printer, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

interface ViewForm18Props {
  irn: string;
  onClose?: () => void;
}

interface Form18Data {
  IRN: string;
  DisplayIRN: string;
  IncidentType: string;
  F18MStatus: string;
  F18MEmployerAcceptedDate: string;
  F18MEmployerDecisionReason: string;
  F18MWorkerNotifiedDate: string;
  F18MWorkerAcceptedDate: string;
  F18MWorkerDecisionReason: string;
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

const ViewForm18: React.FC<ViewForm18Props> = ({ irn, onClose }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form18Data, setForm18Data] = useState<Form18Data | null>(null);
  const [workerData, setWorkerData] = useState<WorkerData | null>(null);
  const [employerData, setEmployerData] = useState<EmployerData | null>(null);
	 const [message, setMessage] = useState('');
  const [currentDate] = useState<string>(new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Form18 data
      const { data: form18Data, error: form18Error } = await supabase
        .from('form18master')
        .select('*')
        .eq('IRN', irn)
        .maybeSingle();

      if (form18Error) {
        throw form18Error;
      }

      if (!form18Data) {
        throw new Error('Form 18 data not found');
      }

      setForm18Data(form18Data);

      // Fetch worker details from form1112master to get WorkerID
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
        .eq('CPPSID', form18Data.EmployerCPPSID)
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
      console.error('Error fetching Form18 data:', err);
      setError(err.message || 'Failed to load Form18 data');
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
    const content = document.getElementById('form18-content');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the document');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Form 18 - ${workerData?.WorkerFirstName} ${workerData?.WorkerLastName}</title>
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
            .signature-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
            }
            .signature-table td {
              border: 1px solid #000;
              padding: 10px;
              height: 80px;
              vertical-align: bottom;
            }
            .signature-table .witness {
              height: 50px;
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
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        {onClose && (
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-xl font-semibold text-gray-900">
          Form 18 - Application for Award by Consent
          {form18Data && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              {form18Data.DisplayIRN}
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
          {onClose && (
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div id="form18-content" className="bg-[#fffcf6] p-8 border border-gray-300 rounded-md">
          {/* Form Header */}
          <div className="text-center mb-6">
            <p className="italic">Workers' Compensation Act 1978.</p>
            <p className="text-sm">Act, Sec. 74.</p>
            <p className="text-sm">Reg., Sec.25.</p>
            <p className="text-right italic">Form 18</p>
            <p className="text-right">Register No. {form18Data?.DisplayIRN || ''}</p>
          </div>

          {/* Party Information */}
          <div className="mb-6">
            <p className="font-medium mt-4">IN RESPECT OF</p>
            
            <div className="mt-2 mb-4">
              <p className="font-bold">{workerData?.WorkerFirstName} {workerData?.WorkerLastName}</p>
              <p>{workerData?.WorkerAddress1}</p>
              {workerData?.WorkerAddress2 && <p>{workerData.WorkerAddress2}</p>}
              <p>{workerData?.WorkerCity}, {workerData?.WorkerProvince}</p>
              {workerData?.WorkerPOBox && <p>P.O. Box {workerData.WorkerPOBox}</p>}
            </div>
            
            <p className="italic">, a worker</p>
            
            <p className="font-medium mt-4">AND</p>
            
            <div className="mt-2 mb-4">
              <p className="font-bold">{employerData?.OrganizationName}</p>
              <p>{employerData?.Address1}</p>
              {employerData?.Address2 && <p>{employerData.Address2}</p>}
              <p>{employerData?.City}, {employerData?.Province}</p>
              {employerData?.POBox && <p>P.O. Box {employerData.POBox}</p>}
            </div>
            
            <p className="italic">, the employer</p>
          </div>

          {/* Application Content */}
          <div className="mb-6">
            <h4 className="text-center font-semibold mb-4">APPLICATION FOR AN AWARD BY CONSENT.</h4>
            
            <p className="mb-2">The Chief Commissioner,</p>
            <p className="mb-2">Office of Workers' Compensation,</p>
            
            <p className="mb-4">
              Application is made for a consent award by a tribunal in respect of an agreement reached between the abovenamed worker and employer, particulars of the agreement are as follows:—
            </p>
            
            <div className="border p-4 rounded-md bg-white mb-4 min-h-[100px]">
              {form18Data?.F18MEmployerDecisionReason && (
                <div className="mb-4">
                  <p className="font-medium">Employer's Decision Reason:</p>
                  <p>{form18Data.F18MEmployerDecisionReason}</p>
                </div>
              )}
              
              {form18Data?.F18MWorkerDecisionReason && (
                <div>
                  <p className="font-medium">Worker's Decision Reason:</p>
                  <p>{form18Data.F18MWorkerDecisionReason}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <p className="font-medium">Date: {currentDate}</p>
              
              {form18Data?.F18MEmployerAcceptedDate && (
                <p>Employer Accepted Date: {new Date(form18Data.F18MEmployerAcceptedDate).toLocaleDateString()}</p>
              )}
              
              {form18Data?.F18MWorkerAcceptedDate && (
                <p>Worker Accepted Date: {new Date(form18Data.F18MWorkerAcceptedDate).toLocaleDateString()}</p>
              )}
              
              <p>Status: {form18Data?.F18MStatus || 'Pending'}</p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-8">
            <table className="w-full border-collapse border border-gray-400">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-4 w-1/2">
                    <p className="font-medium mb-2">Signed by or on behalf of the worker</p>
                    <div className="h-20"></div>
                  </td>
                  <td className="border border-gray-400 p-4 w-1/2">
                    <p className="font-medium mb-2">Signed by or on behalf of the employer</p>
                    <div className="h-20"></div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-4">
                    <p className="font-medium mb-2">In the presence of</p>
                    <div className="h-10"></div>
                  </td>
                  <td className="border border-gray-400 p-4">
                    <p className="font-medium mb-2">In the presence of</p>
                    <div className="h-10"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
 {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={fetchData}
              className={`bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition-colors ${
                !irn || error ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!irn || error}
            >
              Forward to Worker
            </button>
          </div>

          {/* Success Message */}
          {message && (
            <div className={`mt-4 p-3 ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} rounded-md text-sm`}>
              {message}
            </div>
          )}
        {onClose && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewForm18;
