import React, { useState, useEffect } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface NewForm3Props {
  workerId: string;
  onClose: () => void;
}

interface Form3Data {
  // Worker Personal Details
  WorkerID: string;
  DisplayIRN: string;
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
  DependantFirstName: string[];
  DependantLastName: string[];
  DependantDOB: string[];
  DependantType: string[];
  DependantGender: string[];
  DependantAddress1: string[];
  DependantAddress2: string[];
  DependantCity: string[];
  DependantProvince: string[];
  DependantPOBox: string[];
  DependantEmail: string[];
  DependantMobile: string[];
  DependantLandline: string[];
  DependanceDegree: number[];
  
  // Employer Details
  EmployerID: string;
  EmployercppsID: string;
  Occupation: string;
  PlaceOfEmployment: string;
  NatureOfEmployment: string;
  AverageWeeklyWage: number;
  SubContractorOrganizationName: string;
  SubContractorLocation: string;
  SubContractorNatureOfBusiness: string;
  
  // Work History
  GradualProcessInjury: boolean;
  OrganizationName: string[];
  OrganizationAddress1: string[];
  OrganizationAddress2: string[];
  OrganizationCity: string[];
  OrganizationProvince: string[];
  OrganizationPOBox: string[];
  OrganizationLandline: string[];
  OrganizationCPPSID: string[];
  WorkerJoiningDate: string[];
  WorkerLeavingDate: string[];
  
  // Injury & Capacity
  IncidentDescription: string;
  IncidentDate: string;
  IncidentLocation: string;
  IncidentProvince: string;
  IncidentRegion: string;
  NatureExtentInjury: string;
  InjuryCause: string;
  DisabilitiesDescription: string;
  IncapacityExtent: string;
  IncapacityDescription: string;
  EstimatedIncapacityDuration: string;
  
  // Compensation Claimed
  CompensationClaimDetails: string;
  AverageEarnableAmount: number;
  AllowanceReceived: string;
  
  // Insurance Details
  InsuranceProviderIPACode: string;
  InsuranceCompanyOrganizationName: string;
  InsuranceCompanyAddress1: string;
  InsuranceCompanyAddress2: string;
  InsuranceCompanyCity: string;
  InsuranceCompanyProvince: string;
  InsuranceCompanyPOBox: string;
  InsuranceCompanyLandLine: string;
  
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
  Form3ImageName: string;
  IMR: string;
  FMR: string;
  SEC43: string;
  SS: string;
  WS: string;
  IWS: string;
  PTA: string;
  TR: string;
  PAR: string;
  MERS: string;
  MCE: string;
  DE: string;
  
  // Hidden fields
  Form3SubmissionDate: string;
  TimeBarred: boolean;
}

const NewForm3: React.FC<NewForm3Props> = ({ workerId, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [formData, setFormData] = useState<Form3Data>({
    // Initialize with default values
    WorkerID: '',
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
    DependantFirstName: [],
    DependantLastName: [],
    DependantDOB: [],
    DependantType: [],
    DependantGender: [],
    DependantAddress1: [],
    DependantAddress2: [],
    DependantCity: [],
    DependantProvince: [],
    DependantPOBox: [],
    DependantEmail: [],
    DependantMobile: [],
    DependantLandline: [],
    DependanceDegree: [],
    EmployerID: '',
    EmployercppsID: '',
    Occupation: '',
    PlaceOfEmployment: '',
    NatureOfEmployment: '',
    AverageWeeklyWage: 0,
    SubContractorOrganizationName: '',
    SubContractorLocation: '',
    SubContractorNatureOfBusiness: '',
    GradualProcessInjury: false,
    OrganizationName: [],
    OrganizationAddress1: [],
    OrganizationAddress2: [],
    OrganizationCity: [],
    OrganizationProvince: [],
    OrganizationPOBox: [],
    OrganizationLandline: [],
    OrganizationCPPSID: [],
    WorkerJoiningDate: [],
    WorkerLeavingDate: [],
    IncidentDescription: '',
    IncidentDate: '',
    IncidentLocation: '',
    IncidentProvince: '',
    IncidentRegion: '',
    NatureExtentInjury: '',
    InjuryCause: '',
    DisabilitiesDescription: '',
    IncapacityExtent: '',
    IncapacityDescription: '',
    EstimatedIncapacityDuration: '',
    CompensationClaimDetails: '',
    AverageEarnableAmount: 0,
    AllowanceReceived: '',
    InsuranceProviderIPACode: '',
    InsuranceCompanyOrganizationName: '',
    InsuranceCompanyAddress1: '',
    InsuranceCompanyAddress2: '',
    InsuranceCompanyCity: '',
    InsuranceCompanyProvince: '',
    InsuranceCompanyPOBox: '',
    InsuranceCompanyLandLine: '',
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
    Form3ImageName: '',
    IMR: '',
    FMR: '',
    SEC43: '',
    SS: '',
    WS: '',
    IWS: '',
    PTA: '',
    TR: '',
    PAR: '',
    MERS: '',
    MCE: '',
    DE: '',
    Form3SubmissionDate: new Date().toISOString(),
    TimeBarred: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<{ DKey: string; DValue: string }[]>([]);
  const [provinceRegions, setProvinceRegions] = useState<{ DKey: string; DValue: string }[]>([]);
  const [dependants, setDependants] = useState<any[]>([]);
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [existingForm3, setExistingForm3] = useState(false);
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

        // Check if Form3 already exists for this IRN
        const { data: form3Data, error: form3Error } = await supabase
          .from('form3master')
          .select('*')
          .eq('IRN', workerId);

        if (form3Error) throw form3Error;

        // Check if any form3 records were returned
        if (form3Data && form3Data.length > 0) {
          setExistingForm3(true);
          setFormData(prev => ({
            ...prev,
            ...form3Data[0] // Use the first record if multiple exist
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

        // Get current employment details
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
          .select('DKey, DValue')
          .eq('DType', 'Province');

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
          EmployerID: employmentData?.EmployerID || '',
          EmployercppsID: employmentData?.EmployerCPPSID || '',
          Occupation: employmentData?.Occupation || '',
          PlaceOfEmployment: employmentData?.PlaceOfEmployment || '',
          NatureOfEmployment: employmentData?.NatureOfEmployment || '',
          AverageWeeklyWage: employmentData?.AverageWeeklyWage || 0,
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
          // Pre-fill applicant details with worker details
          ApplicantFirstName: workerData.WorkerFirstName || '',
          ApplicantLastName: workerData.WorkerLastName || '',
          ApplicantAddress1: workerData.WorkerAddress1 || '',
          ApplicantAddress2: workerData.WorkerAddress2 || '',
          ApplicantCity: workerData.WorkerCity || '',
          ApplicantProvince: workerData.WorkerProvince || '',
          ApplicantPOBox: workerData.WorkerPOBox || '',
          ApplicantEmail: workerData.WorkerEmail || '',
          ApplicantMobile: workerData.WorkerMobile || '',
          ApplicantLandline: workerData.WorkerLandline || ''
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

        // Disable form if it's time-barred or if Form3 already exists
        setIsFormDisabled(isTimeBarred || existingForm3);

      } catch (err: any) {
        console.error('Error fetching initial data:', err);
        setError(err.message || 'Failed to load worker details');
        // Don't close the form, let the user see the error
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [workerId, existingForm3]);

  // ... [Rest of the component code remains unchanged]
};

export default NewForm3;
