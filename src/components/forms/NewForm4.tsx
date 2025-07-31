import React, { useState, useEffect } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface NewForm4Props {
  workerId: string;
  onClose: () => void;
}

interface Form4Data {
  // Worker Personal Details (pre-filled)
  WorkerID: string;
  F4MRecordID: string;
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
  WorkerPassportPhoto: string;
  WorkerAddress1: string;
  WorkerAddress2: string;
  WorkerCity: string;
  WorkerProvince: string;
  WorkerPOBox: string;
  WorkerEmail: string;
  WorkerMobile: string;
  WorkerLandline: string;

  // Form 4 Specific Fields
  AnnualEarningsAtDeath: number;
  CompensationBenefitsPriorToDeath: string;
  CompensationBenefitDetails: string;
  IncidentDescription: string;
  CompensationClaimed: string;
  MedicalExpenseDetails: string;
  FuneralExpenseDetails: string;
  
  // Applicant Details
  ApplicantFirstName: string;
  ApplicantLastName: string;
  ApplicantAddress1: string;
  ApplicantAddress2: string;
  ApplicantCity: string;
  ApplicantProvince: string;
  ApplicantPOBox: string;
  ApplicantEmail: string;
  ApplicantMobile: string;
  ApplicantLandline: string;
  
  // Form Attachments
  Form4ImageName: string;
  
  // System fields
  Form4SubmissionDate: string;
  IRN: string;
  DisplayIRN: string;
  TimeBarred: boolean;
  
  // Spouse Details
  SpouseFirstName: string;
  SpouseLastName: string;
  SpouseDOB: string;
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
  
  // Dependent Details
  WorkerHaveDependants: boolean;
  
  // Employment Details
  EmploymentID: string;
  Occupation: string;
  PlaceOfEmployment: string;
  NatureOfEmployment: string;
  SubContractorOrganizationName: string;
  SubContractorLocation: string;
  SubContractorNatureOfBusiness: string;
  
  // Injury Details
  IncidentDate: string;
  IncidentLocation: string;
  IncidentProvince: string;
  IncidentRegion: string;
  NatureExtentInjury: string;
  InjuryCause: string;
  
  // Insurance Details
  InsuranceProviderIPACode: string;
  InsuranceCompanyOrganizationName: string;
  InsuranceCompanyAddress1: string;
  InsuranceCompanyAddress2: string;
  InsuranceCompanyCity: string;
  InsuranceCompanyProvince: string;
  InsuranceCompanyPOBox: string;
  InsuranceCompanyLandLine: string;
  
  // Hidden fields for attachments
  DCHidden: string;
  PMRHidden: string;
  SEC43Hidden: string;
  SSHidden: string;
  WSHidden: string;
  DDHidden: string;
  PTAHidden: string;
  PIRHidden: string;
  FERHidden: string;
  MERSHidden: string;
  MCEHidden: string;
  DEDHidden: string;
  Form18ScanHidden: string;
  
  // Attachment fields
  DC: string;
  PMR: string;
  SEC43: string;
  SS: string;
  WS: string;
  DD: string;
  PTA: string;
  PIR: string;
  FER: string;
  MERS: string;
  MEC: string;
  DED: string;
  Form18Scan: string;
  
  // Work History
  GradualProcessInjury: boolean;
  
  // Flags
  IsCompBenefit: boolean;
}

const NewForm4: React.FC<NewForm4Props> = ({ workerId, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [formData, setFormData] = useState<Form4Data>({
    // Initialize with default values
    WorkerID: '',
    F4MRecordID: '',
    IRN: '',
    DisplayIRN: '',
    WorkerFirstName: '',
    WorkerLastName: '',
    WorkerAliasName: '',
    WorkerDOB: '',
    WorkerGender: '',
    WorkerMarried: '',
    WorkerHanded: 'Right',
    WorkerPlaceOfOriginVillage: '',
    WorkerPlaceOfOriginDistrict: '',
    WorkerPlaceOfOriginProvince: '',
    WorkerPassportPhoto: '',
    WorkerAddress1: '',
    WorkerAddress2: '',
    WorkerCity: '',
    WorkerProvince: '',
    WorkerPOBox: '',
    WorkerEmail: '',
    WorkerMobile: '',
    WorkerLandline: '',
    AnnualEarningsAtDeath: 0,
    CompensationBenefitsPriorToDeath: '',
    CompensationBenefitDetails: '',
    IncidentDescription: '',
    CompensationClaimed: '',
    MedicalExpenseDetails: '',
    FuneralExpenseDetails: '',
    ApplicantFirstName: '',
    ApplicantLastName: '',
    ApplicantAddress1: '',
    ApplicantAddress2: '',
    ApplicantCity: '',
    ApplicantProvince: '',
    ApplicantPOBox: '',
    ApplicantEmail: '',
    ApplicantMobile: '',
    ApplicantLandline: '',
    Form4ImageName: '',
    Form4SubmissionDate: new Date().toISOString(),
    TimeBarred: false,
    SpouseFirstName: '',
    SpouseLastName: '',
    SpouseDOB: '',
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
    WorkerHaveDependants: false,
    EmploymentID: '',
    Occupation: '',
    PlaceOfEmployment: '',
    NatureOfEmployment: '',
    SubContractorOrganizationName: '',
    SubContractorLocation: '',
    SubContractorNatureOfBusiness: '',
    IncidentDate: '',
    IncidentLocation: '',
    IncidentProvince: '',
    IncidentRegion: '',
    NatureExtentInjury: '',
    InjuryCause: '',
    InsuranceProviderIPACode: '',
    InsuranceCompanyOrganizationName: '',
    InsuranceCompanyAddress1: '',
    InsuranceCompanyAddress2: '',
    InsuranceCompanyCity: '',
    InsuranceCompanyProvince: '',
    InsuranceCompanyPOBox: '',
    InsuranceCompanyLandLine: '',
    DCHidden: '',
    PMRHidden: '',
    SEC43Hidden: '',
    SSHidden: '',
    WSHidden: '',
    DDHidden: '',
    PTAHidden: '',
    PIRHidden: '',
    FERHidden: '',
    MERSHidden: '',
    MCEHidden: '',
    DEDHidden: '',
    Form18ScanHidden: '',
    DC: '',
    PMR: '',
    SEC43: '',
    SS: '',
    WS: '',
    DD: '',
    PTA: '',
    PIR: '',
    FER: '',
    MERS: '',
    MEC: '',
    DED: '',
    Form18Scan: '',
    GradualProcessInjury: false,
    IsCompBenefit: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<{ DValue: string }[]>([]);
  const [provinceRegions, setProvinceRegions] = useState<{ DKey: string; DValue: string }[]>([]);
  const [dependants, setDependants] = useState<any[]>([]);
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [existingForm4, setExistingForm4] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // First get the WorkerID from workerirn using IRN
        const { data: workerIrnData, error: workerIrnError } = await supabase
          .from('workerirn')
          .select('WorkerID, FirstName, LastName, DisplayIRN')
          .eq('IRN', workerId)
          .single();

        if (workerIrnError) {
          if (workerIrnError.code === 'PGRST116') {
            throw new Error('Worker not found');
          }
          throw workerIrnError;
        }

        if (!workerIrnData) {
          throw new Error('Worker not found');
        }

        // Check if Form4 already exists for this IRN
        const { data: form4Data, error: form4Error } = await supabase
          .from('form4master')
          .select('*')
          .eq('IRN', workerId);

        if (form4Error) throw form4Error;

        // Check if any form4 records were returned
        if (form4Data && form4Data.length > 0) {
          setExistingForm4(true);
          setFormData(prev => ({
            ...prev,
            ...form4Data[0] // Use the first record if multiple exist
          }));
        }

        // Check if claim is time-barred
        const { data: form1112Data, error: form1112Error } = await supabase
          .from('form1112master')
          .select('TimeBarred, IncidentDate, IncidentLocation, IncidentProvince, IncidentRegion, NatureExtentInjury, InjuryCause, InsuranceProviderIPACode')
          .eq('IRN', workerId)
          .single();

        if (form1112Error) {
          if (form1112Error.code === 'PGRST116') {
            throw new Error('Form 1112 not found');
          }
          throw form1112Error;
        }

        const isTimeBarred = form1112Data?.TimeBarred === '1' || form1112Data?.TimeBarred === true;
        
        // Now get the full worker details using the WorkerID
        const { data: workerData, error: workerError } = await supabase
          .from('workerpersonaldetails')
          .select('*')
          .eq('WorkerID', workerIrnData.WorkerID)
          .single();

        if (workerError) {
          if (workerError.code === 'PGRST116') {
            throw new Error('Worker personal details not found');
          }
          throw workerError;
        }

        // Fetch current employment details
        const { data: employmentData, error: employmentError } = await supabase
          .from('currentemploymentdetails')
          .select('*')
          .eq('WorkerID', workerIrnData.WorkerID)
          .maybeSingle(); // Use maybeSingle() instead of single()

        if (employmentError && employmentError.code !== 'PGRST116') {
          throw employmentError;
        }

        // Fetch provinces
        const { data: provinceData, error: provinceError } = await supabase
          .from('dictionary')
          .select('DValue')
          .eq('DType', 'Province')
          .order('DValue');

        if (provinceError) throw provinceError;
        setProvinces(provinceData || []);

        // Fetch province regions
        const { data: regionData, error: regionError } = await supabase
          .from('dictionary')
          .select('DKey, DValue')
          .eq('DType', 'ProvinceRegion');

        if (regionError) throw regionError;
        setProvinceRegions(regionData || []);

        // Fetch dependants
        const { data: dependantData, error: dependantError } = await supabase
          .from('dependantpersonaldetails')
          .select('*')
          .eq('WorkerID', workerIrnData.WorkerID);

        if (dependantError) throw dependantError;
        setDependants(dependantData || []);

        // Fetch work history
        const { data: historyData, error: historyError } = await supabase
          .from('workhistory')
          .select('*')
          .eq('WorkerID', workerIrnData.WorkerID);

        if (historyError) throw historyError;
        setWorkHistory(historyData || []);

        // Fetch insurance providers
        const { data: insuranceData, error: insuranceError } = await supabase
          .from('insurancecompanymaster')
          .select('*');

        if (insuranceError) throw insuranceError;
        setInsuranceProviders(insuranceData || []);

        // If form1112Data has insurance provider, get insurance details
        let insuranceDetails = null;
        if (form1112Data?.InsuranceProviderIPACode) {
          const { data: insData, error: insError } = await supabase
            .from('insurancecompanymaster')
            .select('*')
            .eq('IPACODE', form1112Data.InsuranceProviderIPACode)
            .single();
          
          if (!insError) {
            insuranceDetails = insData;
          }
        }

        // Update form data with fetched details
        setFormData(prev => ({
          ...prev,
          WorkerID: workerIrnData.WorkerID,
          IRN: workerId,
          DisplayIRN: workerIrnData.DisplayIRN,
          WorkerFirstName: workerData.WorkerFirstName || workerIrnData.FirstName,
          WorkerLastName: workerData.WorkerLastName || workerIrnData.LastName,
          WorkerAliasName: workerData.WorkerAliasName || '',
          WorkerDOB: workerData.WorkerDOB || '',
          WorkerGender: workerData.WorkerGender || '',
          WorkerMarried: workerData.WorkerMarried || '',
          WorkerHanded: workerData.WorkerHanded || 'Right',
          WorkerPlaceOfOriginVillage: workerData.WorkerPlaceOfOriginVillage || '',
          WorkerPlaceOfOriginDistrict: workerData.WorkerPlaceOfOriginDistrict || '',
          WorkerPlaceOfOriginProvince: workerData.WorkerPlaceOfOriginProvince || '',
          WorkerPassportPhoto: workerData.WorkerPassportPhoto || '',
          WorkerAddress1: workerData.WorkerAddress1 || '',
          WorkerAddress2: workerData.WorkerAddress2 || '',
          WorkerCity: workerData.WorkerCity || '',
          WorkerProvince: workerData.WorkerProvince || '',
          WorkerPOBox: workerData.WorkerPOBox || '',
          WorkerEmail: workerData.WorkerEmail || '',
          WorkerMobile: workerData.WorkerMobile || '',
          WorkerLandline: workerData.WorkerLandline || '',
          SpouseFirstName: workerData.SpouseFirstName || '',
          SpouseLastName: workerData.SpouseLastName || '',
          SpouseDOB: workerData.SpouseDOB || '',
          SpousePlaceOfOriginVillage: workerData.SpousePlaceOfOriginVillage || '',
          SpousePlaceOfOriginDistrict: workerData.SpousePlaceOfOriginDistrict || '',
          SpousePlaceOfOriginProvince: workerData.SpousePlaceOfOriginProvince || '',
          SpouseAddress1: workerData.SpouseAddress1 || '',
          SpouseAddress2: workerData.SpouseAddress2 || '',
          SpouseCity: workerData.SpouseCity || '',
          SpouseProvince: workerData.SpouseProvince || '',
          SpousePOBox: workerData.SpousePOBox || '',
          SpouseEmail: workerData.SpouseEmail || '',
          SpouseMobile: workerData.SpouseMobile || '',
          SpouseLandline: workerData.SpouseLandline || '',
          WorkerHaveDependants: dependantData && dependantData.length > 0,
          EmploymentID: employmentData?.EmploymentID || '',
          Occupation: employmentData?.Occupation || '',
          PlaceOfEmployment: employmentData?.PlaceOfEmployment || '',
          NatureOfEmployment: employmentData?.NatureOfEmployment || '',
          SubContractorOrganizationName: employmentData?.SubContractorOrganizationName || '',
          SubContractorLocation: employmentData?.SubContractorLocation || '',
          SubContractorNatureOfBusiness: employmentData?.SubContractorNatureOfBusiness || '',
          GradualProcessInjury: historyData && historyData.length > 0,
          IncidentDate: form1112Data?.IncidentDate || '',
          IncidentLocation: form1112Data?.IncidentLocation || '',
          IncidentProvince: form1112Data?.IncidentProvince || '',
          IncidentRegion: form1112Data?.IncidentRegion || '',
          NatureExtentInjury: form1112Data?.NatureExtentInjury || '',
          InjuryCause: form1112Data?.InjuryCause || '',
          InsuranceProviderIPACode: form1112Data?.InsuranceProviderIPACode || '',
          TimeBarred: isTimeBarred,
          // Pre-fill applicant details with first dependant's details if available
          ...(dependantData && dependantData.length > 0 ? {
            ApplicantFirstName: dependantData[0].DependantFirstName,
            ApplicantLastName: dependantData[0].DependantLastName,
            ApplicantAddress1: dependantData[0].DependantAddress1,
            ApplicantAddress2: dependantData[0].DependantAddress2,
            ApplicantCity: dependantData[0].DependantCity,
            ApplicantProvince: dependantData[0].DependantProvince,
            ApplicantPOBox: dependantData[0].DependantPOBox,
            ApplicantEmail: dependantData[0].DependantEmail,
            ApplicantMobile: dependantData[0].DependantMobile,
            ApplicantLandline: dependantData[0].DependantLandline
          } : {})
        }));

        // If insurance details were found, update form data
        if (insuranceDetails) {
          setFormData(prev => ({
            ...prev,
            InsuranceCompanyOrganizationName: insuranceDetails.InsuranceCompanyOrganizationName || '',
            InsuranceCompanyAddress1: insuranceDetails.InsuranceCompanyAddress1 || '',
            InsuranceCompanyAddress2: insuranceDetails.InsuranceCompanyAddress2 || '',
            InsuranceCompanyCity: insuranceDetails.InsuranceCompanyCity || '',
            InsuranceCompanyProvince: insuranceDetails.InsuranceCompanyProvince || '',
            InsuranceCompanyPOBox: insuranceDetails.InsuranceCompanyPOBox || '',
            InsuranceCompanyLandLine: insuranceDetails.InsuranceCompanyLandLine || ''
          }));
        }

        // Disable form if it's time-barred or if Form4 already exists
        setIsFormDisabled(isTimeBarred || existingForm4);

      } catch (err: any) {
        console.error('Error fetching initial data:', err);
        setError(err.message || 'Failed to load worker details');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [workerId, existingForm4]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if death date is more than 365 days old
      const deathDate = new Date(formData.IncidentDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24));
      const isTimeBarred = daysDiff > 365;

      // Save to form4master
      const { data: form4Data, error: form4Error } = await supabase
        .from('form4master')
        .insert([{
          ...formData,
          TimeBarred: isTimeBarred,
          Form4SubmissionDate: new Date().toISOString()
        }])
        .select()
        .single();

      if (form4Error) throw form4Error;

      // If time barred, create entry in timebarredclaimsregistrarreview
      if (isTimeBarred) {
        const { error: timeBarredError } = await supabase
          .from('timebarredclaimsregistrarreview')
          .insert([{
            IRN: form4Data.IRN,
            TBCRRSubmissionDate: new Date().toISOString(),
            TBCRRFormType: 'Form4',
            TBCRRReviewStatus: 'Pending'
          }]);

        if (timeBarredError) throw timeBarredError;
      } else {
        // If not time barred, create entry in prescreeningreview
        const { error: prescreeningError } = await supabase
          .from('prescreeningreviewhistory')
          .insert([{
            IRN: form4Data.IRN,
            PRHSubmissionDate: new Date().toISOString(),
            PRHFormType: 'Form4',
            PRHDecisionReason: 'Automatically Approved'
          }]);

        if (prescreeningError) throw prescreeningError;
      }

      // Save form attachments
      const attachments = [
        { type: 'Death Certificate', file: formData.DC },
        { type: 'Post Mortem report', file: formData.PMR },
        { type: 'Section 43 application form', file: formData.SEC43 },
        { type: 'Supervisor statement', file: formData.SS },
        { type: 'Witness statement', file: formData.WS },
        { type: 'Dependency declaration', file: formData.DD },
        { type: 'Payslip at the time of accident', file: formData.PTA },
        { type: 'Police incident report', file: formData.PIR },
        { type: 'Funeral expenses receipts', file: formData.FER },
        { type: 'MedicalExpenses', file: formData.MERS },
        { type: 'MiscExpenses', file: formData.MEC },
        { type: 'Deductions', file: formData.DED },
        { type: 'Form 18 Scan', file: formData.Form18Scan }
      ];

      for (const attachment of attachments) {
        if (attachment.file) {
          const { error: attachmentError } = await supabase
            .from('formattachments')
            .insert([{
              IRN: form4Data.IRN,
              AttachmentType: attachment.type,
              FileName: attachment.file
            }]);

          if (attachmentError) throw attachmentError;
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving form:', err);
      setError('Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: isChecked
      }));
      
      // Special handling for CompensationBenefitsPriorToDeath
      if (name === 'CompensationBenefitsPriorToDeath') {
        setFormData(prev => ({
          ...prev,
          IsCompBenefit: isChecked ? true : false,
          CompensationBenefitDetails: isChecked ? prev.CompensationBenefitDetails : ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fieldName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('formattachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update form data with file path
      setFormData(prev => ({
        ...prev,
        [fieldName]: filePath
      }));
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the province value
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If this is the incident province, also update the region
    if (name === 'IncidentProvince') {
      // Find the corresponding region
      let region = '';
      if (value.includes('Papua')) {
        region = 'Papua Region';
      } else if (value.includes('Highlands')) {
        region = 'Highlands Region';
      } else if (value.includes('Islands')) {
        region = 'Islands Region';
      } else if (value.includes('Momase')) {
        region = 'Momase Region';
      }
      
      setFormData(prev => ({
        ...prev,
        IncidentRegion: region
      }));
    }
  };

  const handleCopyWorkerAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        ApplicantAddress1: prev.WorkerAddress1,
        ApplicantAddress2: prev.WorkerAddress2,
        ApplicantCity: prev.WorkerCity,
        ApplicantProvince: prev.WorkerProvince,
        ApplicantPOBox: prev.WorkerPOBox
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ApplicantAddress1: '',
        ApplicantAddress2: '',
        ApplicantCity: '',
        ApplicantProvince: '',
        ApplicantPOBox: ''
      }));
    }
  };

  const handleCopySpouseAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        SpouseAddress1: prev.WorkerAddress1,
        SpouseAddress2: prev.WorkerAddress2,
        SpouseCity: prev.WorkerCity,
        SpouseProvince: prev.WorkerProvince,
        SpousePOBox: prev.WorkerPOBox
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        SpouseAddress1: '',
        SpouseAddress2: '',
        SpouseCity: '',
        SpouseProvince: '',
        SpousePOBox: ''
      }));
    }
  };

  const renderWorkerPersonalDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="WorkerFirstName"
            value={formData.WorkerFirstName}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="WorkerLastName"
            value={formData.WorkerLastName}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alias Name</label>
          <input
            type="text"
            name="WorkerAliasName"
            value={formData.WorkerAliasName}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="WorkerDOB"
            value={formData.WorkerDOB}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="WorkerGender"
            value={formData.WorkerGender}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Marital Status</label>
          <select
            name="WorkerMarried"
            value={formData.WorkerMarried}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          >
            <option value="1">Married</option>
            <option value="0">Single</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Dominant Hand</label>
          <select
            name="WorkerHanded"
            value={formData.WorkerHanded}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          >
            <option value="Right">Right</option>
            <option value="Left">Left</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin Village</label>
          <input
            type="text"
            name="WorkerPlaceOfOriginVillage"
            value={formData.WorkerPlaceOfOriginVillage}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin District</label>
          <input
            type="text"
            name="WorkerPlaceOfOriginDistrict"
            value={formData.WorkerPlaceOfOriginDistrict}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Place of Origin Province</label>
        <select
          name="WorkerPlaceOfOriginProvince"
          value={formData.WorkerPlaceOfOriginProvince}
          onChange={handleInputChange}
          className="input"
          disabled={isFormDisabled}
        >
          <option value="">Select Province</option>
          {provinces.map(province => (
            <option key={province.DValue} value={province.DValue}>
              {province.DValue}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <textarea
            name="WorkerAddress1"
            value={formData.WorkerAddress1}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <textarea
            name="WorkerAddress2"
            value={formData.WorkerAddress2}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="WorkerCity"
            value={formData.WorkerCity}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <select
            name="WorkerProvince"
            value={formData.WorkerProvince}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
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
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <input
            type="text"
            name="WorkerPOBox"
            value={formData.WorkerPOBox}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="WorkerEmail"
            value={formData.WorkerEmail}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="tel"
            name="WorkerMobile"
            value={formData.WorkerMobile}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Landline</label>
          <input
            type="tel"
            name="WorkerLandline"
            value={formData.WorkerLandline}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>
    </div>
  );

  const renderEmploymentAndInjuryDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Occupation</label>
          <input
            type="text"
            name="Occupation"
            value={formData.Occupation}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Employment</label>
          <input
            type="text"
            name="PlaceOfEmployment"
            value={formData.PlaceOfEmployment}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nature of Employment</label>
        <input
          type="text"
          name="NatureOfEmployment"
          value={formData.NatureOfEmployment}
          onChange={handleInputChange}
          className="input"
          disabled={isFormDisabled}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="WorkedUnderSubContractor"
            checked={formData.SubContractorOrganizationName !== ''}
            onChange={(e) => {
              if (!e.target.checked) {
                setFormData(prev => ({
                  ...prev,
                  SubContractorOrganizationName: '',
                  SubContractorLocation: '',
                  SubContractorNatureOfBusiness: ''
                }));
              }
            }}
            className="h-4 w-4 text-primary border-gray-300 rounded"
            disabled={isFormDisabled}
          />
          <label className="ml-2 block text-sm text-gray-900">
            Worked Under Sub-Contractor
          </label>
        </div>

        {formData.SubContractorOrganizationName !== '' && (
          <div className="space-y-4 pl-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-Contractor Organization Name</label>
              <input
                type="text"
                name="SubContractorOrganizationName"
                value={formData.SubContractorOrganizationName}
                onChange={handleInputChange}
                className="input"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-Contractor Location</label>
              <input
                type="text"
                name="SubContractorLocation"
                value={formData.SubContractorLocation}
                onChange={handleInputChange}
                className="input"
                disabled={isFormDisabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nature of Business</label>
              <input
                type="text"
                name="SubContractorNatureOfBusiness"
                value={formData.SubContractorNatureOfBusiness}
                onChange={handleInputChange}
                className="input"
                disabled={isFormDisabled}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Death</label>
          <input
            type="date"
            name="IncidentDate"
            value={formData.IncidentDate}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Death</label>
          <input
            type="text"
            name="IncidentLocation"
            value={formData.IncidentLocation}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <select
            name="IncidentProvince"
            value={formData.IncidentProvince}
            onChange={handleProvinceChange}
            className="input"
            required
            disabled={isFormDisabled}
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
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <input
            type="text"
            name="IncidentRegion"
            value={formData.IncidentRegion}
            onChange={handleInputChange}
            className="input"
            readOnly
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cause of the injury</label>
        <input
          type="text"
          name="InjuryCause"
          value={formData.InjuryCause}
          onChange={handleInputChange}
          className="input"
          disabled={isFormDisabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nature and Extent of Injury</label>
        <input
          type="text"
          name="NatureExtentInjury"
          value={formData.NatureExtentInjury}
          onChange={handleInputChange}
          className="input"
          disabled={isFormDisabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description of Incident</label>
        <textarea
          name="IncidentDescription"
          value={formData.IncidentDescription}
          onChange={handleInputChange}
          className="input"
          rows={4}
          required
          disabled={isFormDisabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Earnings at Death</label>
          <input
            type="number"
            name="AnnualEarningsAtDeath"
            value={formData.AnnualEarningsAtDeath}
            onChange={handleInputChange}
            className="input"
            required
            min="7280"
            disabled={isFormDisabled}
          />
          <p className="text-xs text-gray-500 mt-1">Minimum value: K7,280</p>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="CompensationBenefitsPriorToDeath"
          checked={formData.IsCompBenefit}
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              IsCompBenefit: e.target.checked,
              CompensationBenefitDetails: e.target.checked ? prev.CompensationBenefitDetails : ''
            }));
          }}
          className="h-4 w-4 text-primary border-gray-300 rounded"
          disabled={isFormDisabled}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Compensation Benefits Prior To Death
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Compensation Benefit Details</label>
        <input
          type="text"
          name="CompensationBenefitDetails"
          value={formData.CompensationBenefitDetails}
          onChange={handleInputChange}
          className="input"
          disabled={!formData.IsCompBenefit || isFormDisabled}
        />
      </div>
    </div>
  );

  const renderWorkerHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="GradualProcessInjury"
          checked={formData.GradualProcessInjury}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary border-gray-300 rounded"
          disabled={isFormDisabled}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Gradual Process Injury
        </label>
      </div>

      {formData.GradualProcessInjury && workHistory.length > 0 && (
        <div className="space-y-4">
          {workHistory.map((history, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <p className="mt-1 text-sm text-gray-900">{history.OrganizationName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Period</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {history.WorkerJoiningDate ? new Date(history.WorkerJoiningDate).toLocaleDateString() : 'N/A'} - 
                    {history.WorkerLeavingDate ? new Date(history.WorkerLeavingDate).toLocaleDateString() : 'Present'}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {history.OrganizationAddress1}
                  {history.OrganizationAddress2 && <>, {history.OrganizationAddress2}</>}
                  {history.OrganizationCity && <>, {history.OrganizationCity}</>}
                  {history.OrganizationProvince && <>, {history.OrganizationProvince}</>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {formData.GradualProcessInjury && workHistory.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No work history records found.</p>
        </div>
      )}
    </div>
  );

  const renderSpouseDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="SpouseFirstName"
            value={formData.SpouseFirstName}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="SpouseLastName"
            value={formData.SpouseLastName}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="WorkerAddressCheck"
          onChange={handleCopySpouseAddress}
          className="h-4 w-4 text-primary border-gray-300 rounded"
          disabled={formData.WorkerMarried !== '1' || isFormDisabled}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Same as Worker Address
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <textarea
            name="SpouseAddress1"
            value={formData.SpouseAddress1}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <textarea
            name="SpouseAddress2"
            value={formData.SpouseAddress2}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="SpouseCity"
            value={formData.SpouseCity}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <select
            name="SpouseProvince"
            value={formData.SpouseProvince}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
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
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <input
            type="text"
            name="SpousePOBox"
            value={formData.SpousePOBox}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="SpouseEmail"
            value={formData.SpouseEmail}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="tel"
            name="SpouseMobile"
            value={formData.SpouseMobile}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Landline</label>
          <input
            type="tel"
            name="SpouseLandline"
            value={formData.SpouseLandline}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin Village</label>
          <input
            type="text"
            name="SpousePlaceOfOriginVillage"
            value={formData.SpousePlaceOfOriginVillage}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin District</label>
          <input
            type="text"
            name="SpousePlaceOfOriginDistrict"
            value={formData.SpousePlaceOfOriginDistrict}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Origin Province</label>
          <select
            name="SpousePlaceOfOriginProvince"
            value={formData.SpousePlaceOfOriginProvince}
            onChange={handleInputChange}
            className="input"
            disabled={formData.WorkerMarried !== '1' || isFormDisabled}
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
  );

  const renderDependantDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="WorkerHaveDependants"
          checked={formData.WorkerHaveDependants}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary border-gray-300 rounded"
          disabled={isFormDisabled}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Worker has dependants
        </label>
      </div>

      {formData.WorkerHaveDependants && dependants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dependant Details</h3>
          {dependants.filter(d => d.DependantType === 'Child').map((dependant, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantFirstName} {dependant.DependantLastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantDOB ? new Date(dependant.DependantDOB).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantGender === 'M' ? 'Male' : 'Female'}</p>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dependant.DependantAddress1}
                  {dependant.DependantAddress2 && <>, {dependant.DependantAddress2}</>}
                  {dependant.DependantCity && <>, {dependant.DependantCity}</>}
                  {dependant.DependantProvince && <>, {dependant.DependantProvince}</>}
                </p>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dependant.DependantEmail && <span>Email: {dependant.DependantEmail}<br /></span>}
                  {dependant.DependantMobile && <span>Mobile: {dependant.DependantMobile}<br /></span>}
                  {dependant.DependantLandline && <span>Landline: {dependant.DependantLandline}</span>}
                </p>
              </div>
              {dependant.DependanceDegree && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Degree of Dependance</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependanceDegree}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formData.WorkerHaveDependants && dependants.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No dependant records found.</p>
        </div>
      )}
    </div>
  );

  const renderOtherDependants = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Other Dependants</h3>
      
      {dependants.filter(d => d.DependantType !== 'Child' && d.DependantType !== 'Nominee').length > 0 ? (
        <div className="space-y-4">
          {dependants.filter(d => d.DependantType !== 'Child' && d.DependantType !== 'Nominee').map((dependant, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantFirstName} {dependant.DependantLastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantGender === 'M' ? 'Male' : 'Female'}</p>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900">{dependant.DependantDOB ? new Date(dependant.DependantDOB).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dependant.DependantAddress1}
                  {dependant.DependantAddress2 && <>, {dependant.DependantAddress2}</>}
                  {dependant.DependantCity && <>, {dependant.DependantCity}</>}
                  {dependant.DependantProvince && <>, {dependant.DependantProvince}</>}
                </p>
              </div>
              {dependant.DependanceDegree && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Degree of Dependance</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependanceDegree}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No other dependant records found.</p>
        </div>
      )}
    </div>
  );

  const renderNomineeDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Nominee Details</h3>
      
      {dependants.filter(d => d.DependantType === 'Nominee').length > 0 ? (
        <div className="space-y-4">
          {dependants.filter(d => d.DependantType === 'Nominee').map((dependant, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantFirstName} {dependant.DependantLastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantDOB ? new Date(dependant.DependantDOB).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependantGender === 'M' ? 'Male' : 'Female'}</p>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dependant.DependantAddress1}
                  {dependant.DependantAddress2 && <>, {dependant.DependantAddress2}</>}
                  {dependant.DependantCity && <>, {dependant.DependantCity}</>}
                  {dependant.DependantProvince && <>, {dependant.DependantProvince}</>}
                </p>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <p className="mt-1 text-sm text-gray-900">
                  {dependant.DependantEmail && <span>Email: {dependant.DependantEmail}<br /></span>}
                  {dependant.DependantMobile && <span>Mobile: {dependant.DependantMobile}<br /></span>}
                  {dependant.DependantLandline && <span>Landline: {dependant.DependantLandline}</span>}
                </p>
              </div>
              {dependant.DependanceDegree && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Degree of Dependance</label>
                  <p className="mt-1 text-sm text-gray-900">{dependant.DependanceDegree}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">No nominee records found.</p>
        </div>
      )}
    </div>
  );

  const renderCompensationClaimed = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Details of Compensation Claimed</label>
        <textarea
          name="CompensationClaimed"
          value={formData.CompensationClaimed}
          onChange={handleInputChange}
          className="input"
          rows={4}
          required
          disabled={isFormDisabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Medical Expense Details</label>
        <textarea
          name="MedicalExpenseDetails"
          value={formData.MedicalExpenseDetails}
          onChange={handleInputChange}
          className="input"
          rows={4}
          disabled={isFormDisabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Funeral Expense Details</label>
        <textarea
          name="FuneralExpenseDetails"
          value={formData.FuneralExpenseDetails}
          onChange={handleInputChange}
          className="input"
          rows={4}
          disabled={isFormDisabled}
        />
      </div>
    </div>
  );

  const renderInsuranceDetails = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
        <select
          name="InsuranceProviderIPACode"
          value={formData.InsuranceProviderIPACode}
          onChange={async (e) => {
            const ipaCode = e.target.value;
            setFormData(prev => ({
              ...prev,
              InsuranceProviderIPACode: ipaCode
            }));
            
            if (ipaCode) {
              try {
                const { data, error } = await supabase
                  .from('insurancecompanymaster')
                  .select('*')
                  .eq('IPACODE', ipaCode)
                  .single();
                
                if (!error && data) {
                  setFormData(prev => ({
                    ...prev,
                    InsuranceCompanyOrganizationName: data.InsuranceCompanyOrganizationName || '',
                    InsuranceCompanyAddress1: data.InsuranceCompanyAddress1 || '',
                    InsuranceCompanyAddress2: data.InsuranceCompanyAddress2 || '',
                    InsuranceCompanyCity: data.InsuranceCompanyCity || '',
                    InsuranceCompanyProvince: data.InsuranceCompanyProvince || '',
                    InsuranceCompanyPOBox: data.InsuranceCompanyPOBox || '',
                    InsuranceCompanyLandLine: data.InsuranceCompanyLandLine || ''
                  }));
                }
              } catch (err) {
                console.error('Error fetching insurance details:', err);
              }
            } else {
              // Clear insurance details if no provider selected
              setFormData(prev => ({
                ...prev,
                InsuranceCompanyOrganizationName: '',
                InsuranceCompanyAddress1: '',
                InsuranceCompanyAddress2: '',
                InsuranceCompanyCity: '',
                InsuranceCompanyProvince: '',
                InsuranceCompanyPOBox: '',
                InsuranceCompanyLandLine: ''
              }));
            }
          }}
          className="input"
          required
          disabled={isFormDisabled}
        >
          <option value="">Select Insurance Provider</option>
          {insuranceProviders.map(provider => (
            <option key={provider.IPACODE} value={provider.IPACODE}>
              {provider.InsuranceCompanyOrganizationName}
            </option>
          ))}
        </select>
      </div>

      {formData.InsuranceProviderIPACode && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="InsuranceCompanyOrganizationName"
              value={formData.InsuranceCompanyOrganizationName}
              onChange={handleInputChange}
              className="input"
              readOnly
              disabled={isFormDisabled}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <textarea
                name="InsuranceCompanyAddress1"
                value={formData.InsuranceCompanyAddress1}
                onChange={handleInputChange}
                className="input"
                rows={3}
                readOnly
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <textarea
                name="InsuranceCompanyAddress2"
                value={formData.InsuranceCompanyAddress2}
                onChange={handleInputChange}
                className="input"
                rows={3}
                readOnly
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="InsuranceCompanyCity"
                value={formData.InsuranceCompanyCity}
                onChange={handleInputChange}
                className="input"
                readOnly
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Province</label>
              <input
                type="text"
                name="InsuranceCompanyProvince"
                value={formData.InsuranceCompanyProvince}
                onChange={handleInputChange}
                className="input"
                readOnly
                disabled={isFormDisabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
              <input
                type="text"
                name="InsuranceCompanyPOBox"
                value={formData.InsuranceCompanyPOBox}
                onChange={handleInputChange}
                className="input"
                readOnly
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Landline</label>
            <input
              type="text"
              name="InsuranceCompanyLandLine"
              value={formData.InsuranceCompanyLandLine}
              onChange={handleInputChange}
              className="input"
              readOnly
              disabled={isFormDisabled}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderApplicantDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="ApplicantFirstName"
            value={formData.ApplicantFirstName}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="ApplicantLastName"
            value={formData.ApplicantLastName}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="ApplicantAddressCheck"
          onChange={handleCopyWorkerAddress}
          className="h-4 w-4 text-primary border-gray-300 rounded"
          disabled={isFormDisabled}
        />
        <label className="ml-2 block text-sm text-gray-900">
          Same as Worker Address
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <textarea
            name="ApplicantAddress1"
            value={formData.ApplicantAddress1}
            onChange={handleInputChange}
            className="input"
            rows={3}
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <textarea
            name="ApplicantAddress2"
            value={formData.ApplicantAddress2}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            name="ApplicantCity"
            value={formData.ApplicantCity}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <select
            name="ApplicantProvince"
            value={formData.ApplicantProvince}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
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
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <input
            type="text"
            name="ApplicantPOBox"
            value={formData.ApplicantPOBox}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="ApplicantEmail"
            value={formData.ApplicantEmail}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="tel"
            name="ApplicantMobile"
            value={formData.ApplicantMobile}
            onChange={handleInputChange}
            className="input"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Landline</label>
          <input
            type="tel"
            name="ApplicantLandline"
            value={formData.ApplicantLandline}
            onChange={handleInputChange}
            className="input"
            disabled={isFormDisabled}
          />
        </div>
      </div>
    </div>
  );

  const renderScannedImage = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Form 4 Scanned Image</label>
        <input
          type="file"
          name="Form4ImageName"
          onChange={(e) => handleFileChange(e, 'Form4ImageName')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          required={!existingForm4}
          disabled={isFormDisabled}
        />
      </div>
      
      {formData.Form4ImageName && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Current Scanned Image:</p>
          <p className="text-sm text-gray-500">{formData.Form4ImageName}</p>
        </div>
      )}
    </div>
  );

  const renderSupportingDocuments = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 mb-4">
        Note: Images attached here must be more than 5 KB and less than 500 KB.
      </p>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Death Certificate</h3>
        <input
          type="file"
          name="DC"
          onChange={(e) => handleFileChange(e, 'DC')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          required={!existingForm4 && !formData.DCHidden}
          disabled={isFormDisabled}
        />
        {(formData.DC || formData.DCHidden) && (
          <p className="text-sm text-gray-500">File: {formData.DC || formData.DCHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Post Mortem Report (optional)</h3>
        <input
          type="file"
          name="PMR"
          onChange={(e) => handleFileChange(e, 'PMR')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.PMR || formData.PMRHidden) && (
          <p className="text-sm text-gray-500">File: {formData.PMR || formData.PMRHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Section 43 Application Form</h3>
        <input
          type="file"
          name="SEC43"
          onChange={(e) => handleFileChange(e, 'SEC43')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.SEC43 || formData.SEC43Hidden) && (
          <p className="text-sm text-gray-500">File: {formData.SEC43 || formData.SEC43Hidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Supervisor Statement (letter head)</h3>
        <input
          type="file"
          name="SS"
          onChange={(e) => handleFileChange(e, 'SS')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.SS || formData.SSHidden) && (
          <p className="text-sm text-gray-500">File: {formData.SS || formData.SSHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Witness Statement</h3>
        <input
          type="file"
          name="WS"
          onChange={(e) => handleFileChange(e, 'WS')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.WS || formData.WSHidden) && (
          <p className="text-sm text-gray-500">File: {formData.WS || formData.WSHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Dependency Declaration</h3>
        <input
          type="file"
          name="DD"
          onChange={(e) => handleFileChange(e, 'DD')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.DD || formData.DDHidden) && (
          <p className="text-sm text-gray-500">File: {formData.DD || formData.DDHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Payslip at the time of accident</h3>
        <input
          type="file"
          name="PTA"
          onChange={(e) => handleFileChange(e, 'PTA')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.PTA || formData.PTAHidden) && (
          <p className="text-sm text-gray-500">File: {formData.PTA || formData.PTAHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Police incident report (if Police matter)</h3>
        <input
          type="file"
          name="PIR"
          onChange={(e) => handleFileChange(e, 'PIR')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.PIR || formData.PIRHidden) && (
          <p className="text-sm text-gray-500">File: {formData.PIR || formData.PIRHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Funeral Expenses Receipts</h3>
        <input
          type="file"
          name="FER"
          onChange={(e) => handleFileChange(e, 'FER')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.FER || formData.FERHidden) && (
          <p className="text-sm text-gray-500">File: {formData.FER || formData.FERHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Form 18 Scan</h3>
        <input
          type="file"
          name="Form18Scan"
          onChange={(e) => handleFileChange(e, 'Form18Scan')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.Form18Scan || formData.Form18ScanHidden) && (
          <p className="text-sm text-gray-500">File: {formData.Form18Scan || formData.Form18ScanHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Medical Expenses Receipt</h3>
        <input
          type="file"
          name="MERS"
          onChange={(e) => handleFileChange(e, 'MERS')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.MERS || formData.MERSHidden) && (
          <p className="text-sm text-gray-500">File: {formData.MERS || formData.MERSHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Misc. Expenses Receipt</h3>
        <input
          type="file"
          name="MEC"
          onChange={(e) => handleFileChange(e, 'MEC')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.MEC || formData.MCEHidden) && (
          <p className="text-sm text-gray-500">File: {formData.MEC || formData.MCEHidden}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-700">Deductions Receipts</h3>
        <input
          type="file"
          name="DED"
          onChange={(e) => handleFileChange(e, 'DED')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          disabled={isFormDisabled}
        />
        {(formData.DED || formData.DEDHidden) && (
          <p className="text-sm text-gray-500">File: {formData.DED || formData.DEDHidden}</p>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 1:
        return renderWorkerPersonalDetails();
      case 2:
        return renderEmploymentAndInjuryDetails();
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
        return renderCompensationClaimed();
      case 9:
        return renderInsuranceDetails();
      case 10:
        return renderApplicantDetails();
      case 11:
        return renderScannedImage();
      case 12:
        return renderSupportingDocuments();
      default:
        return null;
    }
  };

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

  if (loading) {
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
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingForm4 ? 'View Form 4' : 'New Form 4'}
            {isFormDisabled && !existingForm4 && ' (Time-barred)'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {existingForm4 && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-start">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>This Form 4 has already been submitted. You are viewing it in read-only mode.</span>
            </div>
          )}

          {!existingForm4 && isFormDisabled && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>This claim is time-barred and requires review by the Registrar before Form 4 can be submitted.</span>
            </div>
          )}

          <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setCurrentTab(index + 1)}
                className={`px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors
                  ${currentTab === index + 1 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {renderTabContent()}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              {!isFormDisabled && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Submit Form'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewForm4;
