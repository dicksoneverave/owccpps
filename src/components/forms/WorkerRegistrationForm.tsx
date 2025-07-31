import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface WorkerRegistrationFormProps {
  onClose: () => void;
  employerId?: string;
}

interface FormData {
  // Worker Personal Details
  WorkerFirstName: string;
  WorkerLastName: string;
  WorkerAliasName: string;
  WorkerDOB: string;
  WorkerGender: string;
  WorkerMarried: string;
  WorkerHanded: string;
  WorkerPlaceOfOriginVillage: string;
  WorkerPlaceOfOriginDistrict: string;
  WorkerPlaceOfOriginProvince: string;
  WorkerAddress1: string;
  WorkerAddress2: string;
  WorkerCity: string;
  WorkerProvince: string;
  WorkerPOBox: string;
  WorkerEmail: string;
  WorkerMobile: string;
  WorkerLandline: string;
  WorkerPassportPhoto: File | null;
  
  // Spouse Details
  SpouseFirstName: string;
  SpouseLastName: string;
  SpousePlaceOfOriginVillage: string;
  SpousePlaceOfOriginDistrict: string;
  SpousePlaceOfOriginProvince: string;
  SpouseAddress1: string;
  SpouseAddress2: string;
  SpouseCity: string;
  SpouseProvince: string;
  SpousePOBox: string;
  SpouseEmail: string;
  SpouseMobile: string;
  SpouseLandline: string;
  WorkerAddressCheck: boolean;
  
  // Dependant Details
  WorkerHaveDependants: boolean;
  dependants: Dependant[];
  
  // Employment Details
  EmployerCPPSID: string;
  EmploymentID: string;
  Occupation: string;
  PlaceOfEmployment: string;
  NatureOfEmployment: string;
  AverageWeeklyWage: number;
  WeeklyPaymentRate: number;
  
  // Other Employment Details
  WorkedUnderSubContractor: boolean;
  SubContractorOrganizationName: string;
  SubContractorLocation: string;
  SubContractorNatureOfBusiness: string;
  
  // Work History
  workHistory: WorkHistory[];
  
  // Insurance Details
  InsuranceProviderIPACode: string;
  InsuranceCompanyOrganizationName: string;
  InsuranceCompanyAddress1: string;
  InsuranceCompanyAddress2: string;
  InsuranceCompanyCity: string;
  InsuranceCompanyProvince: string;
  InsuranceCompanyPOBox: string;
  InsuranceCompanyLandLine: string;
  
  // Hidden Fields
  EmployerID: string;
  OrgType: string;
  IsAgent: string;
  IsLawyer: string;
}

interface Dependant {
  DependantFirstName: string;
  DependantLastName: string;
  DependantDOB: string;
  DependantType: string;
  DependantGender: string;
  DependantAddress1: string;
  DependantAddress2: string;
  DependantCity: string;
  DependantProvince: string;
  DependantPOBox: string;
  DependantEmail: string;
  DependantMobile: string;
  DependantLandline: string;
  DependanceDegree: number;
}

interface WorkHistory {
  OrganizationName: string;
  OrganizationAddress1: string;
  OrganizationAddress2: string;
  OrganizationCity: string;
  OrganizationProvince: string;
  OrganizationPOBox: string;
  OrganizationLandline: string;
  OrganizationCPPSID: string;
  WorkerJoiningDate: string;
  WorkerLeavingDate: string;
}

const WorkerRegistrationForm: React.FC<WorkerRegistrationFormProps> = ({ onClose, employerId }) => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [provinces, setProvinces] = useState<{ DValue: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employerDetails, setEmployerDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    // Worker Personal Details
    WorkerFirstName: '',
    WorkerLastName: '',
    WorkerAliasName: '',
    WorkerDOB: '',
    WorkerGender: 'M',
    WorkerMarried: '0',
    WorkerHanded: 'Right',
    WorkerPlaceOfOriginVillage: '',
    WorkerPlaceOfOriginDistrict: '',
    WorkerPlaceOfOriginProvince: '',
    WorkerAddress1: '',
    WorkerAddress2: '',
    WorkerCity: '',
    WorkerProvince: '',
    WorkerPOBox: '',
    WorkerEmail: '',
    WorkerMobile: '',
    WorkerLandline: '',
    WorkerPassportPhoto: null,
    
    // Spouse Details
    SpouseFirstName: '',
    SpouseLastName: '',
    SpousePlaceOfOriginVillage: '',
    SpousePlaceOfOriginDistrict: '',
    SpousePlaceOfOriginProvince: '',
    SpouseAddress1: '',
    SpouseAddress2: '',
    SpouseCity: '',
    SpouseProvince: '',
    SpousePOBox: '',
    SpouseEmail: '',
    SpouseMobile: '',
    SpouseLandline: '',
    WorkerAddressCheck: false,
    
    // Dependant Details
    WorkerHaveDependants: false,
    dependants: [],
    
    // Employment Details
    EmployerCPPSID: '',
    EmploymentID: '',
    Occupation: '',
    PlaceOfEmployment: '',
    NatureOfEmployment: '',
    AverageWeeklyWage: 0,
    WeeklyPaymentRate: 0,
    
    // Other Employment Details
    WorkedUnderSubContractor: false,
    SubContractorOrganizationName: '',
    SubContractorLocation: '',
    SubContractorNatureOfBusiness: '',
    
    // Work History
    workHistory: [],
    
    // Insurance Details
    InsuranceProviderIPACode: '',
    InsuranceCompanyOrganizationName: '',
    InsuranceCompanyAddress1: '',
    InsuranceCompanyAddress2: '',
    InsuranceCompanyCity: '',
    InsuranceCompanyProvince: '',
    InsuranceCompanyPOBox: '',
    InsuranceCompanyLandLine: '',
    
    // Hidden Fields
    EmployerID: employerId || '',
    OrgType: '',
    IsAgent: '',
    IsLawyer: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch provinces
        const { data: provinceData, error: provinceError } = await supabase
          .from('dictionary')
          .select('DValue')
          .eq('DType', 'Province')
          .order('DValue');

        if (provinceError) throw provinceError;
        setProvinces(provinceData || []);
        
        // Fetch employer details if employerId is provided
        if (employerId) {
          const { data: employerData, error: employerError } = await supabase
            .from('employermaster')
            .select('*')
            .eq('EmployerID', employerId)
            .single();
            
          if (employerError) throw employerError;
          
          setEmployerDetails(employerData);
          setFormData(prev => ({
            ...prev,
            EmployerID: employerId,
            EmployerCPPSID: employerData.CPPSID || '',
            InsuranceProviderIPACode: employerData.InsuranceProviderIPACode || '',
            OrgType: employerData.InsuranceProviderIPACode === 'State' ? 'State' : 'Private',
            IsAgent: employerData.IsAgent || '',
            IsLawyer: employerData.IsLawyer || ''
          }));
          
          // If employer has insurance, fetch insurance details
          if (employerData.InsuranceProviderIPACode) {
            const { data: insuranceData, error: insuranceError } = await supabase
              .from('insurancecompanymaster')
              .select('*')
              .eq('IPACODE', employerData.InsuranceProviderIPACode)
              .single();
              
            if (!insuranceError && insuranceData) {
              setFormData(prev => ({
                ...prev,
                InsuranceCompanyOrganizationName: insuranceData.InsuranceCompanyOrganizationName || '',
                InsuranceCompanyAddress1: insuranceData.InsuranceCompanyAddress1 || '',
                InsuranceCompanyAddress2: insuranceData.InsuranceCompanyAddress2 || '',
                InsuranceCompanyCity: insuranceData.InsuranceCompanyCity || '',
                InsuranceCompanyProvince: insuranceData.InsuranceCompanyProvince || '',
                InsuranceCompanyPOBox: insuranceData.InsuranceCompanyPOBox || '',
                InsuranceCompanyLandLine: insuranceData.InsuranceCompanyLandLine || ''
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [employerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData(prev => ({
      ...prev,
      WorkerPassportPhoto: file
    }));
  };
  
  const handleSpouseAddressCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
      ...prev,
      WorkerAddressCheck: isChecked,
      SpouseAddress1: isChecked ? prev.WorkerAddress1 : '',
      SpouseAddress2: isChecked ? prev.WorkerAddress2 : '',
      SpouseCity: isChecked ? prev.WorkerCity : '',
      SpouseProvince: isChecked ? prev.WorkerProvince : '',
      SpousePOBox: isChecked ? prev.WorkerPOBox : ''
    }));
  };
  
  const addDependant = () => {
    setFormData(prev => ({
      ...prev,
      dependants: [
        ...prev.dependants,
        {
          DependantFirstName: '',
          DependantLastName: '',
          DependantDOB: '',
          DependantType: 'Child',
          DependantGender: 'M',
          DependantAddress1: '',
          DependantAddress2: '',
          DependantCity: '',
          DependantProvince: '',
          DependantPOBox: '',
          DependantEmail: '',
          DependantMobile: '',
          DependantLandline: '',
          DependanceDegree: 0
        }
      ]
    }));
  };
  
  const removeDependant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependants: prev.dependants.filter((_, i) => i !== index)
    }));
  };
  
  const handleDependantChange = (index: number, field: keyof Dependant, value: string | number | boolean) => {
    setFormData(prev => {
      const updatedDependants = [...prev.dependants];
      updatedDependants[index] = {
        ...updatedDependants[index],
        [field]: value
      };
      return {
        ...prev,
        dependants: updatedDependants
      };
    });
  };
  
  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [
        ...prev.workHistory,
        {
          OrganizationName: '',
          OrganizationAddress1: '',
          OrganizationAddress2: '',
          OrganizationCity: '',
          OrganizationProvince: '',
          OrganizationPOBox: '',
          OrganizationLandline: '',
          OrganizationCPPSID: '',
          WorkerJoiningDate: '',
          WorkerLeavingDate: ''
        }
      ]
    }));
  };
  
  const removeWorkHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index)
    }));
  };
  
  const handleWorkHistoryChange = (index: number, field: keyof WorkHistory, value: string) => {
    setFormData(prev => {
      const updatedWorkHistory = [...prev.workHistory];
      updatedWorkHistory[index] = {
        ...updatedWorkHistory[index],
        [field]: value
      };
      return {
        ...prev,
        workHistory: updatedWorkHistory
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Upload passport photo if provided
      let photoPath = '';
      if (formData.WorkerPassportPhoto) {
        const fileExt = formData.WorkerPassportPhoto.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `workerpassportphotos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, formData.WorkerPassportPhoto);

        if (uploadError) throw uploadError;
        photoPath = filePath;
      }

      // Save worker personal details
      const { data: workerData, error: workerError } = await supabase
        .from('workerpersonaldetails')
        .insert([{
          WorkerFirstName: formData.WorkerFirstName,
          WorkerLastName: formData.WorkerLastName,
          WorkerAliasName: formData.WorkerAliasName,
          WorkerDOB: formData.WorkerDOB,
          WorkerGender: formData.WorkerGender,
          WorkerMarried: formData.WorkerMarried,
          WorkerHanded: formData.WorkerHanded,
          WorkerPlaceOfOriginVillage: formData.WorkerPlaceOfOriginVillage,
          WorkerPlaceOfOriginDistrict: formData.WorkerPlaceOfOriginDistrict,
          WorkerPlaceOfOriginProvince: formData.WorkerPlaceOfOriginProvince,
          WorkerAddress1: formData.WorkerAddress1,
          WorkerAddress2: formData.WorkerAddress2,
          WorkerCity: formData.WorkerCity,
          WorkerProvince: formData.WorkerProvince,
          WorkerPOBox: formData.WorkerPOBox,
          WorkerEmail: formData.WorkerEmail,
          WorkerMobile: formData.WorkerMobile,
          WorkerLandline: formData.WorkerLandline,
          WorkerPassportPhoto: photoPath,
          SpouseFirstName: formData.WorkerMarried === '1' ? formData.SpouseFirstName : '',
          SpouseLastName: formData.WorkerMarried === '1' ? formData.SpouseLastName : '',
          SpousePlaceOfOriginVillage: formData.WorkerMarried === '1' ? formData.SpousePlaceOfOriginVillage : '',
          SpousePlaceOfOriginDistrict: formData.WorkerMarried === '1' ? formData.SpousePlaceOfOriginDistrict : '',
          SpousePlaceOfOriginProvince: formData.WorkerMarried === '1' ? formData.SpousePlaceOfOriginProvince : '',
          SpouseAddress1: formData.WorkerMarried === '1' ? formData.SpouseAddress1 : '',
          SpouseAddress2: formData.WorkerMarried === '1' ? formData.SpouseAddress2 : '',
          SpouseCity: formData.WorkerMarried === '1' ? formData.SpouseCity : '',
          SpouseProvince: formData.WorkerMarried === '1' ? formData.SpouseProvince : '',
          SpousePOBox: formData.WorkerMarried === '1' ? formData.SpousePOBox : '',
          SpouseEmail: formData.WorkerMarried === '1' ? formData.SpouseEmail : '',
          SpouseMobile: formData.WorkerMarried === '1' ? formData.SpouseMobile : '',
          SpouseLandline: formData.WorkerMarried === '1' ? formData.SpouseLandline : ''
        }])
        .select()
        .single();

      if (workerError) throw workerError;
      
      const workerId = workerData.WorkerID;
      
      // Save employment details
      const { error: employmentError } = await supabase
        .from('currentemploymentdetails')
        .insert([{
          WorkerID: workerId,
          EmploymentID: formData.EmploymentID,
          Occupation: formData.Occupation,
          PlaceOfEmployment: formData.PlaceOfEmployment,
          NatureOfEmployment: formData.NatureOfEmployment,
          AverageWeeklyWage: formData.AverageWeeklyWage,
          WeeklyPaymentRate: formData.WeeklyPaymentRate,
          WorkedUnderSubContractor: formData.WorkedUnderSubContractor ? '1' : '0',
          SubContractorOrganizationName: formData.WorkedUnderSubContractor ? formData.SubContractorOrganizationName : '',
          SubContractorLocation: formData.WorkedUnderSubContractor ? formData.SubContractorLocation : '',
          SubContractorNatureOfBusiness: formData.WorkedUnderSubContractor ? formData.SubContractorNatureOfBusiness : '',
          EmployerCPPSID: formData.EmployerCPPSID,
          OrganizationType: formData.OrgType
        }]);

      if (employmentError) throw employmentError;
      
      // Save dependants if any
      if (formData.WorkerHaveDependants && formData.dependants.length > 0) {
        for (const dependant of formData.dependants) {
          const { error: dependantError } = await supabase
            .from('dependantpersonaldetails')
            .insert([{
              WorkerID: workerId,
              DependantFirstName: dependant.DependantFirstName,
              DependantLastName: dependant.DependantLastName,
              DependantDOB: dependant.DependantDOB,
              DependantType: dependant.DependantType,
              DependantGender: dependant.DependantGender === 'Male' ? 'M' : 'F',
              DependantAddress1: dependant.DependantAddress1,
              DependantAddress2: dependant.DependantAddress2,
              DependantCity: dependant.DependantCity,
              DependantProvince: dependant.DependantProvince,
              DependantPOBox: dependant.DependantPOBox,
              DependantEmail: dependant.DependantEmail,
              DependantMobile: dependant.DependantMobile,
              DependantLandline: dependant.DependantLandline,
              DependanceDegree: dependant.DependanceDegree
            }]);
            
          if (dependantError) throw dependantError;
        }
      }
      
      // Save work history if any
      if (formData.workHistory.length > 0) {
        for (const history of formData.workHistory) {
          const { error: historyError } = await supabase
            .from('workhistory')
            .insert([{
              WorkerID: workerId,
              OrganizationName: history.OrganizationName,
              OrganizationAddress1: history.OrganizationAddress1,
              OrganizationAddress2: history.OrganizationAddress2,
              OrganizationCity: history.OrganizationCity,
              OrganizationProvince: history.OrganizationProvince,
              OrganizationPOBox: history.OrganizationPOBox,
              OrganizationLandline: history.OrganizationLandline,
              OrganizationCPPSID: history.OrganizationCPPSID,
              WorkerJoiningDate: history.WorkerJoiningDate,
              WorkerLeavingDate: history.WorkerLeavingDate
            }]);
            
          if (historyError) throw historyError;
        }
      }

      setSuccess(`Worker ${formData.WorkerFirstName} ${formData.WorkerLastName} registered successfully!`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error registering worker:', err);
      setError('Failed to register worker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Register New Worker</h2>
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
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          {employerDetails && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
              <p className="font-medium">Registering worker for: {employerDetails.OrganizationName}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="tab-container-wrapper mb-6">
            <div className="tab-container">
              <ul className="flex space-x-1 border-b">
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab1' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab1')}
                >
                  Worker Personal Details
                </li>
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab2' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab2')}
                >
                  Spouse Details
                </li>
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab3' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab3')}
                >
                  Dependent Details
                </li>
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab4' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab4')}
                >
                  Employment Details
                </li>
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab5' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab5')}
                >
                  Other Employment Details
                </li>
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab6' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab6')}
                >
                  Work History
                </li>
                <li 
                  className={`px-4 py-2 cursor-pointer ${activeTab === 'tab7' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setActiveTab('tab7')}
                >
                  Insurance Details
                </li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Worker Personal Details Tab */}
            <div className={`${activeTab === 'tab1' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Worker Personal Details:</p>
              <hr className="mb-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="WorkerFirstName"
                    value={formData.WorkerFirstName}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="WorkerLastName"
                    value={formData.WorkerLastName}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias Name</label>
                  <input
                    type="text"
                    name="WorkerAliasName"
                    value={formData.WorkerAliasName}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="WorkerDOB"
                    value={formData.WorkerDOB}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="WorkerGender"
                        value="M"
                        checked={formData.WorkerGender === 'M'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="WorkerGender"
                        value="F"
                        checked={formData.WorkerGender === 'F'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <div className="flex space-x-4 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="WorkerMarried"
                        value="1"
                        checked={formData.WorkerMarried === '1'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2">Married</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="WorkerMarried"
                        value="0"
                        checked={formData.WorkerMarried === '0'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2">Single</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dominant Hand</label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="WorkerHanded"
                      value="Right"
                      checked={formData.WorkerHanded === 'Right'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2">Right</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="WorkerHanded"
                      value="Left"
                      checked={formData.WorkerHanded === 'Left'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="ml-2">Left</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Origin</label>
                  <input
                    type="text"
                    name="WorkerPlaceOfOriginVillage"
                    value={formData.WorkerPlaceOfOriginVillage}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Origin District</label>
                  <input
                    type="text"
                    name="WorkerPlaceOfOriginDistrict"
                    value={formData.WorkerPlaceOfOriginDistrict}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Origin Province</label>
                  <select
                    name="WorkerPlaceOfOriginProvince"
                    value={formData.WorkerPlaceOfOriginProvince}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province.DValue} value={province.DValue}>
                        {province.DValue}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address1</label>
                <textarea
                  name="WorkerAddress1"
                  value={formData.WorkerAddress1}
                  onChange={handleInputChange}
                  className="input"
                  rows={5}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address2</label>
                <textarea
                  name="WorkerAddress2"
                  value={formData.WorkerAddress2}
                  onChange={handleInputChange}
                  className="input"
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="WorkerCity"
                    value={formData.WorkerCity}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <select
                    name="WorkerProvince"
                    value={formData.WorkerProvince}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province.DValue} value={province.DValue}>
                        {province.DValue}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                  <input
                    type="text"
                    name="WorkerPOBox"
                    value={formData.WorkerPOBox}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="WorkerEmail"
                    value={formData.WorkerEmail}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    name="WorkerMobile"
                    value={formData.WorkerMobile}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landline</label>
                  <input
                    type="text"
                    name="WorkerLandline"
                    value={formData.WorkerLandline}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Photo</label>
                <input
                  type="file"
                  name="WorkerPassportPhoto"
                  onChange={handleFileChange}
                  className="input"
                  accept=".png,.jpg,.pdf,.jpeg"
                />
              </div>
            </div>
            
            {/* Spouse Details Tab */}
            <div className={`${activeTab === 'tab2' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Spouse Details:</p>
              <hr className="mb-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="SpouseFirstName"
                    value={formData.SpouseFirstName}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="SpouseLastName"
                    value={formData.SpouseLastName}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="WorkerAddressCheck"
                    checked={formData.WorkerAddressCheck}
                    onChange={handleSpouseAddressCheck}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                    disabled={formData.WorkerMarried === '0'}
                  />
                  <span className="ml-2 text-sm text-gray-700">Same as Worker Address</span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address1</label>
                <textarea
                  name="SpouseAddress1"
                  value={formData.SpouseAddress1}
                  onChange={handleInputChange}
                  className="input"
                  rows={5}
                  disabled={formData.WorkerMarried === '0' || formData.WorkerAddressCheck}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address2</label>
                <textarea
                  name="SpouseAddress2"
                  value={formData.SpouseAddress2}
                  onChange={handleInputChange}
                  className="input"
                  rows={5}
                  disabled={formData.WorkerMarried === '0' || formData.WorkerAddressCheck}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="SpouseCity"
                    value={formData.SpouseCity}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0' || formData.WorkerAddressCheck}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <select
                    name="SpouseProvince"
                    value={formData.SpouseProvince}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0' || formData.WorkerAddressCheck}
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province.DValue} value={province.DValue}>
                        {province.DValue}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                  <input
                    type="text"
                    name="SpousePOBox"
                    value={formData.SpousePOBox}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0' || formData.WorkerAddressCheck}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="SpouseEmail"
                    value={formData.SpouseEmail}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    name="SpouseMobile"
                    value={formData.SpouseMobile}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landline</label>
                  <input
                    type="text"
                    name="SpouseLandline"
                    value={formData.SpouseLandline}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Origin Village</label>
                  <input
                    type="text"
                    name="SpousePlaceOfOriginVillage"
                    value={formData.SpousePlaceOfOriginVillage}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Origin District</label>
                  <input
                    type="text"
                    name="SpousePlaceOfOriginDistrict"
                    value={formData.SpousePlaceOfOriginDistrict}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Origin Province</label>
                  <select
                    name="SpousePlaceOfOriginProvince"
                    value={formData.SpousePlaceOfOriginProvince}
                    onChange={handleInputChange}
                    className="input"
                    disabled={formData.WorkerMarried === '0'}
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province.DValue} value={province.DValue}>
                        {province.DValue}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Dependent Details Tab */}
            <div className={`${activeTab === 'tab3' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Dependent Details:</p>
              <hr className="mb-4" />
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="WorkerHaveDependants"
                    checked={formData.WorkerHaveDependants}
                    onChange={() => setFormData(prev => ({ ...prev, WorkerHaveDependants: true }))}
                    className="h-4 w-4 text-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center mt-2">
                  <input
                    type="radio"
                    name="WorkerHaveDependants"
                    checked={!formData.WorkerHaveDependants}
                    onChange={() => setFormData(prev => ({ ...prev, WorkerHaveDependants: false, dependants: [] }))}
                    className="h-4 w-4 text-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
              
              {formData.WorkerHaveDependants && (
                <div>
                  {formData.dependants.map((dependant, index) => (
                    <div key={index} className="border p-4 rounded-md mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Dependant #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeDependant(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={dependant.DependantFirstName}
                            onChange={(e) => handleDependantChange(index, 'DependantFirstName', e.target.value)}
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={dependant.DependantLastName}
                            onChange={(e) => handleDependantChange(index, 'DependantLastName', e.target.value)}
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={dependant.DependantDOB}
                            onChange={(e) => handleDependantChange(index, 'DependantDOB', e.target.value)}
                            className="input"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dependant Type</label>
                          <select
                            value={dependant.DependantType}
                            onChange={(e) => handleDependantChange(index, 'DependantType', e.target.value)}
                            className="input"
                            required
                          >
                            <option value="Child">Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Parent">Parent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                          <select
                            value={dependant.DependantGender}
                            onChange={(e) => handleDependantChange(index, 'DependantGender', e.target.value)}
                            className="input"
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={dependant.DependantAddress1 === formData.WorkerAddress1}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleDependantChange(index, 'DependantAddress1', formData.WorkerAddress1);
                                handleDependantChange(index, 'DependantAddress2', formData.WorkerAddress2);
                                handleDependantChange(index, 'DependantCity', formData.WorkerCity);
                                handleDependantChange(index, 'DependantProvince', formData.WorkerProvince);
                                handleDependantChange(index, 'DependantPOBox', formData.WorkerPOBox);
                              } else {
                                handleDependantChange(index, 'DependantAddress1', '');
                                handleDependantChange(index, 'DependantAddress2', '');
                                handleDependantChange(index, 'DependantCity', '');
                                handleDependantChange(index, 'DependantProvince', '');
                                handleDependantChange(index, 'DependantPOBox', '');
                              }
                            }}
                            className="h-4 w-4 text-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Same as Worker Address</span>
                        </label>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address1</label>
                        <textarea
                          value={dependant.DependantAddress1}
                          onChange={(e) => handleDependantChange(index, 'DependantAddress1', e.target.value)}
                          className="input"
                          rows={3}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address2</label>
                        <textarea
                          value={dependant.DependantAddress2}
                          onChange={(e) => handleDependantChange(index, 'DependantAddress2', e.target.value)}
                          className="input"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={dependant.DependantCity}
                            onChange={(e) => handleDependantChange(index, 'DependantCity', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                          <select
                            value={dependant.DependantProvince}
                            onChange={(e) => handleDependantChange(index, 'DependantProvince', e.target.value)}
                            className="input"
                          >
                            <option value="">Select Province</option>
                            {provinces.map(province => (
                              <option key={province.DValue} value={province.DValue}>
                                {province.DValue}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                          <input
                            type="text"
                            value={dependant.DependantPOBox}
                            onChange={(e) => handleDependantChange(index, 'DependantPOBox', e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={dependant.DependantEmail}
                            onChange={(e) => handleDependantChange(index, 'DependantEmail', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                          <input
                            type="text"
                            value={dependant.DependantMobile}
                            onChange={(e) => handleDependantChange(index, 'DependantMobile', e.target.value)}
                            className="input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Landline</label>
                          <input
                            type="text"
                            value={dependant.DependantLandline}
                            onChange={(e) => handleDependantChange(index, 'DependantLandline', e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree of Dependance (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={dependant.DependanceDegree}
                          onChange={(e) => handleDependantChange(index, 'DependanceDegree', parseInt(e.target.value))}
                          className="input"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addDependant}
                    className="btn btn-primary"
                  >
                    Add Dependant
                  </button>
                </div>
              )}
            </div>
            
            {/* Employment Details Tab */}
            <div className={`${activeTab === 'tab4' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Employment Details:</p>
              <hr className="mb-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employer CPPSID</label>
                  <input
                    type="text"
                    name="EmployerCPPSID"
                    value={formData.EmployerCPPSID}
                    onChange={handleInputChange}
                    className="input"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment ID</label>
                  <input
                    type="text"
                    name="EmploymentID"
                    value={formData.EmploymentID}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  name="Occupation"
                  value={formData.Occupation}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Place Of Employment</label>
                <input
                  type="text"
                  name="PlaceOfEmployment"
                  value={formData.PlaceOfEmployment}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nature Of Employment</label>
                <input
                  type="text"
                  name="NatureOfEmployment"
                  value={formData.NatureOfEmployment}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Weekly Wage</label>
                  <input
                    type="number"
                    name="AverageWeeklyWage"
                    value={formData.AverageWeeklyWage}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Payment Rate</label>
                  <input
                    type="number"
                    name="WeeklyPaymentRate"
                    value={formData.WeeklyPaymentRate}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Other Employment Details Tab */}
            <div className={`${activeTab === 'tab5' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Other Employment Details:</p>
              <hr className="mb-4" />
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="WorkedUnderSubContractor"
                    checked={formData.WorkedUnderSubContractor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      WorkedUnderSubContractor: e.target.checked,
                      SubContractorOrganizationName: e.target.checked ? prev.SubContractorOrganizationName : '',
                      SubContractorLocation: e.target.checked ? prev.SubContractorLocation : '',
                      SubContractorNatureOfBusiness: e.target.checked ? prev.SubContractorNatureOfBusiness : ''
                    }))}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Worked Under Sub Contractor?</span>
                </label>
              </div>
              
              {formData.WorkedUnderSubContractor && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SubContractor Organization Name</label>
                    <input
                      type="text"
                      name="SubContractorOrganizationName"
                      value={formData.SubContractorOrganizationName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SubContractor Location</label>
                    <input
                      type="text"
                      name="SubContractorLocation"
                      value={formData.SubContractorLocation}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">SubContractor Nature Of Business</label>
                    <input
                      type="text"
                      name="SubContractorNatureOfBusiness"
                      value={formData.SubContractorNatureOfBusiness}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Work History Tab */}
            <div className={`${activeTab === 'tab6' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Work History:</p>
              <hr className="mb-4" />
              
              {formData.workHistory.map((history, index) => (
                <div key={index} className="border p-4 rounded-md mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Work History #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeWorkHistory(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={history.OrganizationName}
                      onChange={(e) => handleWorkHistoryChange(index, 'OrganizationName', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address1</label>
                    <textarea
                      value={history.OrganizationAddress1}
                      onChange={(e) => handleWorkHistoryChange(index, 'OrganizationAddress1', e.target.value)}
                      className="input"
                      rows={3}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address2</label>
                    <textarea
                      value={history.OrganizationAddress2}
                      onChange={(e) => handleWorkHistoryChange(index, 'OrganizationAddress2', e.target.value)}
                      className="input"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={history.OrganizationCity}
                        onChange={(e) => handleWorkHistoryChange(index, 'OrganizationCity', e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <select
                        value={history.OrganizationProvince}
                        onChange={(e) => handleWorkHistoryChange(index, 'OrganizationProvince', e.target.value)}
                        className="input"
                      >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                          <option key={province.DValue} value={province.DValue}>
                            {province.DValue}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                      <input
                        type="text"
                        value={history.OrganizationPOBox}
                        onChange={(e) => handleWorkHistoryChange(index, 'OrganizationPOBox', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landline</label>
                      <input
                        type="text"
                        value={history.OrganizationLandline}
                        onChange={(e) => handleWorkHistoryChange(index, 'OrganizationLandline', e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPPSID</label>
                      <input
                        type="text"
                        value={history.OrganizationCPPSID}
                        onChange={(e) => handleWorkHistoryChange(index, 'OrganizationCPPSID', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={history.WorkerJoiningDate}
                        onChange={(e) => handleWorkHistoryChange(index, 'WorkerJoiningDate', e.target.value)}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leaving Date</label>
                      <input
                        type="date"
                        value={history.WorkerLeavingDate}
                        onChange={(e) => handleWorkHistoryChange(index, 'WorkerLeavingDate', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addWorkHistory}
                className="btn btn-primary"
              >
                Add Work History
              </button>
            </div>
            
            {/* Insurance Details Tab */}
            <div className={`${activeTab === 'tab7' ? 'block' : 'hidden'}`}>
              <p className="font-semibold mb-2">Insurance Details:</p>
              <hr className="mb-4" />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  name="InsuranceCompanyOrganizationName"
                  value={formData.InsuranceCompanyOrganizationName}
                  className="input"
                  disabled
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address1</label>
                <textarea
                  name="InsuranceCompanyAddress1"
                  value={formData.InsuranceCompanyAddress1}
                  className="input"
                  rows={5}
                  disabled
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address2</label>
                <textarea
                  name="InsuranceCompanyAddress2"
                  value={formData.InsuranceCompanyAddress2}
                  className="input"
                  rows={5}
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="InsuranceCompanyCity"
                    value={formData.InsuranceCompanyCity}
                    className="input"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    name="InsuranceCompanyProvince"
                    value={formData.InsuranceCompanyProvince}
                    className="input"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">P.O.Box</label>
                  <input
                    type="text"
                    name="InsuranceCompanyPOBox"
                    value={formData.InsuranceCompanyPOBox}
                    className="input"
                    disabled
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">LandLine No</label>
                <input
                  type="text"
                  name="InsuranceCompanyLandLine"
                  value={formData.InsuranceCompanyLandLine}
                  className="input"
                  disabled
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                onClick={(e) => {
                  if (!confirm('Are you sure you want to submit?')) {
                    e.preventDefault();
                  }
                }}
              >
                {loading ? 'Registering...' : 'Register Worker'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerRegistrationForm;
