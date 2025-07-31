import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Form113ViewProps {
  irn?: string | number;
  onClose?: () => void;
}

const Form113View: React.FC<Form113ViewProps> = ({ irn, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [dependants, setDependants] = useState<any[]>([]);
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any>({});

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        // Fetch form3master data
        const { data: form3Data, error: form3Error } = await supabase
          .from('form3master')
          .select('*')
          .eq('IRN', irn)
          .maybeSingle(); // Changed from single() to maybeSingle()

        if (form3Error) {
          throw form3Error;
        }

        // Fetch worker details
        const { data: form1112Data, error: form1112Error } = await supabase
          .from('form1112master')
          .select('*')
          .eq('IRN', irn)
          .maybeSingle();

        if (form1112Error) {
          throw form1112Error;
        }

        if (!form1112Data) {
          throw new Error('Form data not found');
        }

        // Fetch worker details
        const { data: workerData, error: workerError } = await supabase
          .from('workerpersonaldetails')
          .select('*')
          .eq('WorkerID', form1112Data.WorkerID)
          .maybeSingle(); // Changed from single() to maybeSingle()

        if (workerError) {
          throw workerError;
        }

        if (!workerData) {
          throw new Error('Worker details not found');
        }

        // Fetch employment details
        const { data: employmentData, error: employmentError } = await supabase
          .from('currentemploymentdetails')
          .select('*')
          .eq('WorkerID', form1112Data.WorkerID)
          .maybeSingle();

        // Fetch dependants
        const { data: dependantData, error: dependantError } = await supabase
          .from('dependantpersonaldetails')
          .select('*')
          .eq('WorkerID', form1112Data.WorkerID);

        if (dependantError) {
          throw dependantError;
        }

        setDependants(dependantData || []);

        // Fetch work history
        const { data: historyData, error: historyError } = await supabase
          .from('workhistory')
          .select('*')
          .eq('WorkerID', form1112Data.WorkerID);

        if (historyError) {
          throw historyError;
        }

        setWorkHistory(historyData || []);

        // Fetch insurance details if available
        let insuranceDetails = null;
        if (form1112Data.InsuranceProviderIPACode) {
          const { data: insData, error: insError } = await supabase
            .from('insurancecompanymaster')
            .select('*')
            .eq('IPACODE', form1112Data.InsuranceProviderIPACode)
            .maybeSingle(); // Changed from single() to maybeSingle()
          
          if (!insError && insData) {
            insuranceDetails = insData;
          }
        }

        // Fetch attachments
        const { data: attachmentData, error: attachmentError } = await supabase
          .from('formattachments')
          .select('AttachmentType, FileName')
          .eq('IRN', irn);

        if (!attachmentError && attachmentData) {
          const attachmentMap: Record<string, string> = {};
          attachmentData.forEach(attachment => {
            attachmentMap[attachment.AttachmentType] = attachment.FileName;
          });
          setAttachments(attachmentMap);
        }

        // Combine all data
        setFormData({
          ...form1112Data,
          ...workerData,
          ...(form3Data || {}),
          ...(employmentData || {}),
          insurance: insuranceDetails,
          hasWorkHistory: historyData && historyData.length > 0,
          hasDependants: dependantData && dependantData.length > 0
        });

      } catch (err: any) {
        console.error('Error fetching form data:', err);
        setError(err.message || 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    if (irn) {
      fetchFormData();
    } else {
      setLoading(false);
    }
  }, [irn]);

  const tabs = [
    'Worker Personal Details',
    'Spouse Details',
    'Dependent Details',
    'Current Employment Details',
    'Injury & Capacity',
    'Compensation Claimed',
    'Insurance Details',
    'Details of Applicant',
    'Scanned Image',
    'Supporting Documents'
  ];

  const handleTabChange = (tabIndex: number) => {
    setCurrentTab(tabIndex);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 1:
        return renderWorkerDetails();
      case 2:
        return renderSpouseDetails();
      case 3:
        return renderDependantDetails();
      case 4:
        return renderEmploymentDetails();
      case 5:
        return renderInjuryDetails();
      case 6:
        return renderCompensationDetails();
      case 7:
        return renderInsuranceDetails();
      case 8:
        return renderApplicantDetails();
      case 9:
        return renderScannedImage();
      case 10:
        return renderSupportingDocuments();
      default:
        return <div>Invalid tab</div>;
    }
  };

  const renderWorkerDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Worker Personal Details</h3>
      
      {formData.WorkerPassportPhoto && (
        <div className="mb-4">
          <img 
            src={`/attachments/workerpassportphotos/${formData.WorkerPassportPhoto}`} 
            alt="Worker Passport" 
            className="w-32 h-32 object-cover border-2 border-gray-300 rounded-md"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerFirstName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerLastName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.WorkerDOB ? new Date(formData.WorkerDOB).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.WorkerGender === 'M' ? 'Male' : formData.WorkerGender === 'F' ? 'Female' : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Marital Status</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.WorkerMarried === '1' ? 'Married' : 'Single'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dominant Hand</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerHanded || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin Village</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerPlaceOfOriginVillage || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin District</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerPlaceOfOriginDistrict || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin Province</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerPlaceOfOriginProvince || 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerAddress1 || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerAddress2 || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerCity || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerProvince || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerPOBox || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerEmail || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerMobile || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Landline</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerLandline || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const renderSpouseDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Spouse Details</h3>
      
      {formData.WorkerMarried !== '1' ? (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">Worker is not married. No spouse details available.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseFirstName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseLastName || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseAddress1 || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseAddress2 || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseCity || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Province</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseProvince || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpousePOBox || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseEmail || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseMobile || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Landline</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseLandline || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Place of Origin Village</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpousePlaceOfOriginVillage || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Place of Origin District</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpousePlaceOfOriginDistrict || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Place of Origin Province</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpousePlaceOfOriginProvince || 'N/A'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderDependantDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Dependant Details</h3>
      
      {dependants.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">No dependants found for this worker.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dependants.map((dependant, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-primary mb-3">Dependant #{index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantFirstName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantLastName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">
                    {dependant.DependantDOB ? new Date(dependant.DependantDOB).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">
                    {dependant.DependantGender === 'M' ? 'Male' : dependant.DependantGender === 'F' ? 'Female' : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree of Dependance</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependanceDegree || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantAddress1 || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantAddress2 || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantCity || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantProvince || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{dependant.DependantPOBox || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEmploymentDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Current Employment Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employment ID</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.EmploymentID || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Occupation</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.Occupation || 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Place of Employment</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.PlaceOfEmployment || 'N/A'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nature of Employment</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.NatureOfEmployment || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Average Weekly Wage</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.AverageWeeklyWage || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Average Earnable Amount</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.AverageEarnableAmount || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Allowance Received</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.AllowanceReceived || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium text-primary mb-3">Subcontractor Information</h4>
        
        {formData.WorkedUnderSubContractor ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SubContractorOrganizationName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SubContractorLocation || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Nature of Business</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SubContractorNatureOfBusiness || 'N/A'}</p>
            </div>
          </>
        ) : (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-700">Worker did not work under a subcontractor.</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h4 className="font-medium text-primary mb-3">Work History</h4>
        
        {workHistory.length === 0 ? (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-700">No work history records found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workHistory.map((history, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h5 className="font-medium mb-2">Organization #{index + 1}</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPPSID</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationCPPSID || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationAddress1 || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationAddress2 || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationCity || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationProvince || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationPOBox || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">
                      {history.WorkerJoiningDate ? new Date(history.WorkerJoiningDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Leaving Date</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">
                      {history.WorkerLeavingDate ? new Date(history.WorkerLeavingDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Landline</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{history.OrganizationLandline || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderInjuryDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Injury & Capacity Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Incident Date</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.IncidentDate ? new Date(formData.IncidentDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Incident Province</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncidentProvince || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Incident Region</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncidentRegion || 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description of Incident</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncidentDescription || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nature & Extent of Injury</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.NatureExtentInjury || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Injury Cause</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.InjuryCause || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hand Injury</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.HandInjury ? 'Yes' : 'No'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Injury due to Machinery</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.InjuryMachinery ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {formData.InjuryMachinery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Machine Type</label>
            <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.MachineType || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Machine Part Responsible</label>
            <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.MachinePartResponsible || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Machine Power Source</label>
            <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.MachinePowerSource || 'N/A'}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Description of Disabilities</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.DisabilitiesDescription || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Extent of Incapacity</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncapacityExtent || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estimated Duration of Incapacity</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.EstimatedIncapacityDuration || 'N/A'}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description of Incapacity</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncapacityDescription || 'N/A'}</p>
      </div>
    </div>
  );

  const renderCompensationDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Compensation Claimed</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Details of Compensation Claimed</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.CompensationClaimDetails || 'N/A'}</p>
      </div>
    </div>
  );

  const renderInsuranceDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Insurance Details</h3>
      
      {!formData.insurance ? (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">No insurance details available.</p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyOrganizationName || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyAddress1 || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyAddress2 || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyCity || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Province</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyProvince || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyPOBox || 'N/A'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Landline</label>
            <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.insurance.InsuranceCompanyLandLine || 'N/A'}</p>
          </div>
        </>
      )}
    </div>
  );

  const renderApplicantDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Applicant Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantFirstName || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantLastName || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantAddress1 || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantAddress2 || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantCity || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantProvince || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantPOBox || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantEmail || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantMobile || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Landline</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.ApplicantLandline || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const renderScannedImage = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Scanned Image</h3>
      
      {formData.Form3ImageName ? (
        <div className="mt-4">
          <a 
            href={`/attachments/form3scan/${formData.Form3ImageName}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <img 
              src={`/attachments/form3scan/${formData.Form3ImageName}`} 
              alt="Form 3 Scan" 
              className="max-w-full h-auto border-2 border-gray-300 rounded-md"
              style={{ maxHeight: '500px' }}
            />
          </a>
          <p className="mt-2 text-sm text-gray-500">Click on the image to view in full size</p>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">No scanned image available.</p>
        </div>
      )}
    </div>
  );

  const renderSupportingDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Supporting Documents</h3>
      
      {Object.keys(attachments).length === 0 ? (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">No supporting documents available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(attachments).map(([type, fileName], index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium text-primary mb-3">{type}</h4>
              <a 
                href={`/attachments/formattachments/${type.replace(/\s+/g, '')}/${fileName}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src={`/attachments/formattachments/${type.replace(/\s+/g, '')}/${fileName}`} 
                  alt={type} 
                  className="max-w-full h-auto border-2 border-gray-300 rounded-md"
                  style={{ maxHeight: '300px' }}
                />
              </a>
              <p className="mt-2 text-sm text-gray-500">Click on the image to view in full size</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex border-b bg-gray-50">
        <div className="flex overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index + 1)}
              className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md mr-2 
                ${currentTab === index + 1 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Form113View;
