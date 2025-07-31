import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';


interface Form124ViewProps {
  irn: string;
  onClose?: () => void;
}

const Form124View: React.FC<Form124ViewProps> = ({ irn, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [dependants, setDependants] = useState<any[]>([]);
  
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any>({});

  useEffect(() => {
    const fetchFormData = async () => {
      try { 
        setLoading(true);
        
        // Fetch form1112master data for death incident
        const { data: form1112Data, error: form1112Error } = await supabase
          .from('form1112master')
          .select('*')
          .eq('IRN', irn)
          .eq('IncidentType', 'Death')
          .single(); 

        if (form1112Error) {
          throw form1112Error;
        }

        if (!form1112Data) {
          throw new Error('Form 12 data not found');
        }

        // Fetch worker details
        const { data: workerData, error: workerError } = await supabase
          .from('workerpersonaldetails')
          .select('*')
          .eq('WorkerID', form1112Data.WorkerID)
          .single();

        if (workerError) {
          throw workerError;
        }

        // Fetch employment details
        const { data: employmentData, error: employmentError } = await supabase
          .from('currentemploymentdetails')
          .select('*')
          .eq('WorkerID', form1112Data.WorkerID)
          .maybeSingle();

        // Fetch form4master data if available
        const { data: form4Data, error: form4Error } = await supabase
          .from('form4master')
          .select('*')
          .eq('IRN', irn)
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
            .single();
          
          if (!insError) {
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
          ...employmentData,
          ...form4Data,
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

    fetchFormData();
  }, [irn]);

  const tabs = [
    'Deceased Worker Details',
    'Employment and Injury Details',
    'Worker History',
    'Spouse Details',
    'Dependant Details',
    'Other Dependants',
    'Nominee Details',
    'Compensation Claimed',
    'Insurance Details',
    'Applicant Details',
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
        return renderEmploymentInjuryDetails();
      case 3:
        return renderWorkerHistory();
      case 4:
        return renderSpouseDetails();
      case 5:
        return renderDependantDetails();
      case 6:
        return renderOtherDependants();
      case 7:
        return renderNomineeDetails();
      case 8:
        return renderCompensationDetails();
      case 9:
        return renderInsuranceDetails();
      case 10:
        return renderApplicantDetails();
      case 11:
        return renderScannedImage();
      case 12:
        return renderSupportingDocuments();
      default:
        return <div>Invalid tab</div>;
    }
  };

  const renderWorkerDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Deceased Worker Details</h3>
      
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
          <label className="block text-sm font-medium text-gray-700">Alias Name</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.WorkerAliasName || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.WorkerDOB ? new Date(formData.WorkerDOB).toLocaleDateString() : 'N/A'}
          </p>
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );

  const renderEmploymentInjuryDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Employment and Injury Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Employment</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.PlaceOfEmployment || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nature of Employment</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.NatureOfEmployment || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Death</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">
            {formData.IncidentDate ? new Date(formData.IncidentDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Death</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncidentLocation || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Earnings at Death</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.AnnualEarningsAtDeath || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <label className="block text-sm font-medium text-gray-700">Nature and Extent of Injury</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.NatureExtentInjury || 'N/A'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cause of Injury</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.InjuryCause || 'N/A'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description of Incident</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.IncidentDescription || 'N/A'}</p>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Compensation Benefits Prior to Death:</label>
        <p className="p-2 border rounded-md bg-gray-50">
          {formData.CompensationBenefitsPriorToDeath ? 'Yes' : 'No'}
        </p>
      </div>

      {formData.CompensationBenefitsPriorToDeath && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Compensation Benefit Details</label>
          <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.CompensationBenefitDetails || 'N/A'}</p>
        </div>
      )}

      <div className="mt-4">
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
    </div>
  );

  const renderWorkerHistory = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Worker History</h3>
      
      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm font-medium text-gray-700">Gradual Process Injury:</label>
        <p className="p-2 border rounded-md bg-gray-50">
          {formData.GradualProcessInjury ? 'Yes' : 'No'}
        </p>
      </div>
      
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
  );

  const renderSpouseDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Spouse Details</h3>
      
      {formData.WorkerMarried !== '1' ? (
        <div className="p-4 bg-gray-100 rounded-md">
          <p className="text-gray-700">Worker was not married. No spouse details available.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseFirstName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseLastName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">
                {formData.SpouseDOB ? new Date(formData.SpouseDOB).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse Address Line 1</label>
              <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.SpouseAddress1 || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse Address Line 2</label>
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

  const renderDependantDetails = () => {
    // Filter dependants to only show those with type 'Child'
    const childDependants = dependants.filter(dep => dep.DependantType === 'Child');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">Dependant Details</h3>
        
        {childDependants.length === 0 ? (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-700">No child dependants found for this worker.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {childDependants.map((dependant, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-primary mb-3">Child Dependant #{index + 1}</h4>
                
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
  };

  const renderOtherDependants = () => {
    // Filter dependants to only show those with type 'Sibling' or 'Parent'
    const otherDependants = dependants.filter(dep => 
      dep.DependantType === 'Sibling' || dep.DependantType === 'Parent'
    );
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">Other Dependants</h3>
        
        {otherDependants.length === 0 ? (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-700">No other dependants (siblings or parents) found for this worker.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {otherDependants.map((dependant, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-primary mb-3">{dependant.DependantType} Dependant #{index + 1}</h4>
                
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
  };

  const renderNomineeDetails = () => {
    // Filter dependants to only show those with type 'Nominee'
    const nominees = dependants.filter(dep => dep.DependantType === 'Nominee');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">Nominee Details</h3>
        
        {nominees.length === 0 ? (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-gray-700">No nominees found for this worker.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nominees.map((nominee, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-primary mb-3">Nominee #{index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantFirstName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantLastName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">
                      {nominee.DependantDOB ? new Date(nominee.DependantDOB).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">
                      {nominee.DependantGender === 'M' ? 'Male' : nominee.DependantGender === 'F' ? 'Female' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree of Dependance</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependanceDegree || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantAddress1 || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantAddress2 || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantCity || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Province</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantProvince || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{nominee.DependantPOBox || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCompensationDetails = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Compensation Claimed</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Details of Compensation Claimed</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.CompensationClaimed || 'N/A'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Medical Expense Details</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.MedicalExpenseDetails || 'N/A'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Funeral Expense Details</label>
        <p className="mt-1 p-2 border rounded-md bg-gray-50">{formData.FuneralExpenseDetails || 'N/A'}</p>
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
      
      {formData.Form4ImageName ? (
        <div className="mt-4">
          <a 
            href={`/attachments/form4scan/${formData.Form4ImageName}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <img 
              src={`/attachments/form4scan/${formData.Form4ImageName}`} 
              alt="Form 4 Scan" 
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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-700">Loading form data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 w-full">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <div className="flex justify-end">
          <button 
            onClick={handleClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg w-full">
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

export default Form124View;
