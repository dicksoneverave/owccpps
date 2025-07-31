import React, { useState, useEffect, useCallback } from 'react';
import { X, Info, AlertCircle, Save, Calculator, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './compensation-calculation.css';

interface CompensationCalculationProps {
  irn?: string;
  onClose: () => void;
}

interface WorkerDetails {
  WorkerID: string;
  WorkerFirstName: string;
  WorkerLastName: string;
  WorkerAliasName?: string;
  WorkerDOB: string;
  WorkerGender: string;
  WorkerMarried: string;
  WorkerHanded: string;
  SpouseFirstName?: string;
  SpouseLastName?: string;
}

interface InjuryDetails {
  IRN: string;
  DisplayIRN: string;
  IncidentDate: string;
  IncidentType: string;
  NatureExtentInjury: string;
  InjuryCause: string;
  HandInjury: boolean;
}

interface EmploymentDetails {
  Occupation: string;
  AverageWeeklyWage: number;
  PlaceOfEmployment: string;
  NatureOfEmployment: string;
}

interface InjuryCriteria {
  ID: number;
  DKey: string;
  DValue: string;
}

interface DependantDetails {
  DependantID: string;
  DependantFirstName: string;
  DependantLastName: string;
  DependantDOB: string;
  DependantType: string;
  DependantGender: string;
  DependanceDegree: number;
}

interface CalculationData {
  IRN: string;
  WorkerID: string;
  IncidentType: string;
  ClaimType: string;
  InjuryCriteria: string;
  InjuryFactor: number;
  DoctorPercentage: number;
  CompensationAmount: number;
  LockedByCPOID?: string | null;
}

const CompensationCalculation: React.FC<CompensationCalculationProps> = ({ irn, onClose }) => {
  const [searchIRN, setSearchIRN] = useState(irn || '');
  const [workerDetails, setWorkerDetails] = useState<WorkerDetails | null>(null);
  const [injuryDetails, setInjuryDetails] = useState<InjuryDetails | null>(null);
  const [dependants, setDependants] = useState<DependantDetails[]>([]);
  const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetails | null>(null);
  const [calculationData, setCalculationData] = useState<CalculationData>({
    IRN: '',
    WorkerID: '',
    IncidentType: '',
    ClaimType: '',
    InjuryCriteria: '',
    InjuryFactor: 0,
    DoctorPercentage: 0,
    CompensationAmount: 0,
    LockedByCPOID: null
  });
  
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCriteriaList, setShowCriteriaList] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Reference data
  const [criteriaList, setCriteriaList] = useState<InjuryCriteria[]>([]);
  const [claimTypes, setClaimTypes] = useState<{ID: number, DKey: string, DValue: string}[]>([]);
  const [systemParams, setSystemParams] = useState<{[key: string]: string}>({});
  
  // Additional expenses
  const [medicalExpenses, setMedicalExpenses] = useState<number>(0);
  const [miscExpenses, setMiscExpenses] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  
  // Findings and recommendations
  const [findings, setFindings] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [emailList, setEmailList] = useState<string>('');
  
  // Calculation factors
  const [baseCompensationAmount, setBaseCompensationAmount] = useState<number>(10000); // Base amount for calculation
  const [selectedCriteria, setSelectedCriteria] = useState<{[key: string]: boolean}>({});
  const [criteriaCalculations, setCriteriaCalculations] = useState<{[key: string]: {calculation: string, amount: number}}>({});
  const [mandatoryDocuments, setMandatoryDocuments] = useState<{required: string[], available: string[]}>({
    required: [],
    available: []
  });
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [userStaffID, setUserStaffID] = useState<string | null>(null);
  const [lockedByName, setLockedByName] = useState<string | null>(null);

  // State for injury checklist
  const [injuryChecklist, setInjuryChecklist] = useState<{id: number, criteria: string, factor: number, checked: boolean, doctorPercentage: number, calculation: string, compensation: number}[]>([]);
  const [baseAnnualWage, setBaseAnnualWage] = useState<number>(3125);
  
  // State for dependants
  const [dependantData, setDependantData] = useState<{name: string, dob: string, age: number, daysUntil16: number, weeksUntil16: number, benefit: number}[]>([]);
  const [weeklyBenefitRate, setWeeklyBenefitRate] = useState<number>(10);

  // Death case specific state
  const [deathCaseData, setDeathCaseData] = useState({
    annualEarnings: 0,
    calculatedAmount: 0,
    spousePercentage: 50,
    childrenPercentage: 50,
    weeklyBenefitForChildren: [] as {
      name: string,
      dob: string,
      age: number,
      daysUntil16: number,
      weeksUntil16: number,
      benefit: number
    }[]
  });

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (irn) {
      fetchInitialData();
    }
  }, [irn]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch reference data
      const fetchReferenceData = async () => {
        try {
          // Fetch injury criteria from dictionary
          const { data: criteriaData, error: criteriaError } = await supabase
            .from('dictionary')
            .select('ID, DKey, DValue')
            .eq('DType', 'InjuryPercent')
            .order('DKey');

          if (criteriaError) throw criteriaError;
          setCriteriaList(criteriaData || []);

          // Fetch system parameters
          const { data: systemParams, error: systemParamsError } = await supabase
            .from('dictionary')
            .select('DKey, DValue')
            .eq('DType', 'SystemParameter');

          if (systemParamsError) throw systemParamsError;
          
          // Set system parameters
          const paramsObj: {[key: string]: string} = {};
          systemParams?.forEach(param => {
            paramsObj[param.DKey] = param.DValue;
          });
          setSystemParams(paramsObj);
          
          // Set base compensation amount from system parameters
          const baseAmountParam = systemParams?.find(param => param.DKey === 'BaseCompensationAmount');
          if (baseAmountParam) {
            setBaseCompensationAmount(parseFloat(baseAmountParam.DValue) || 10000);
          }

          // Fetch claim types from dictionary
          const { data: claimTypeData, error: claimTypeError } = await supabase
            .from('dictionary')
            .select('ID, DKey, DValue')
            .eq('DType', 'ClaimType')
            .order('DKey');

          if (claimTypeError) throw claimTypeError;
          setClaimTypes(claimTypeData || []);

          // Get current user's staff ID
          const session = localStorage.getItem('session');
          if (session) {
            const { user } = JSON.parse(session);
            
            const { data: staffData, error: staffError } = await supabase
              .from('owcstaffmaster')
              .select('OSMStaffID')
              .eq('cppsid', user.id)
              .maybeSingle();
            
            if (staffError) throw staffError;
            
            if (staffData && staffData.OSMStaffID) {
              setUserStaffID(staffData.OSMStaffID.toString());
            }
          }

        } catch (err: any) {
          console.error('Error fetching reference data:', err);
          setError('Failed to load reference data');
        }
      };

      await fetchReferenceData();
      
      // If IRN is provided, search for it
      if (irn) {
        await handleSearch();
      }
    } catch (err: any) {
      console.error('Error initializing data:', err);
      setError('Failed to initialize data');
    } finally {
      setLoading(false);
    }
  };

  // Main search function to find and load claim data
  const handleSearch = async () => {
    if (!searchIRN) {
      setError('Please enter an IRN to search');
      return;
    }
    
    try {
      setSearchLoading(true);
      setError(null);
      
      // Fetch worker and injury details
      const { data: form1112Data, error: form1112Error } = await supabase
        .from('form1112master')
        .select(`
          IRN,
          DisplayIRN,
          WorkerID,
          IncidentDate,
          IncidentType,
          NatureExtentInjury,
          InjuryCause,
          HandInjury,
          InsuranceProviderIPACode
        `)
        .eq('IRN', searchIRN)
        .single();

      if (form1112Error) {
        if (form1112Error.code === 'PGRST116') {
          throw new Error('No claim found with this IRN');
        }
        throw form1112Error;
      }

      // Fetch injury checklist from dictionary
      const { data: injuryChecklistData, error: injuryChecklistError } = await supabase
        .from('dictionary')
        .select('ID, DKey, DValue')
        .eq('DType', 'InjuryPercent')
        .order('DKey');

      if (injuryChecklistError) throw injuryChecklistError;
      
      // Format injury checklist data
      const formattedInjuryChecklist = injuryChecklistData?.map(item => ({
        id: item.ID,
        criteria: item.DKey,
        factor: parseFloat(item.DValue),
        checked: false,
        doctorPercentage: 0,
        calculation: '--',
        compensation: 0
      })) || [];
      
      setInjuryChecklist(formattedInjuryChecklist);

      // Fetch worker details
      const { data: workerData, error: workerError } = await supabase
        .from('workerpersonaldetails')
        .select('*')
        .eq('WorkerID', form1112Data?.WorkerID)
        .single();

      if (workerError) {
        throw workerError;
      }

      // Fetch dependants
      const { data: dependantData, error: dependantError } = await supabase
        .from('dependantpersonaldetails')
        .select('*')
        .eq('WorkerID', form1112Data?.WorkerID);

      if (dependantError) {
        throw dependantError;
      }
      setDependants(dependantData || []);

      // Process dependant data for weekly benefit calculation
      if (form1112Data.IncidentType === 'Death' && dependantData) {
        const incidentDate = new Date(form1112Data.IncidentDate);
        const childDependants = dependantData.filter(dep => dep.DependantType === 'Child');
        
        const processedDependants = childDependants.map(child => {
          const dob = new Date(child.DependantDOB);
          const age = calculateAge(dob, incidentDate);
          
          // Calculate age 16 date
          const age16Date = new Date(dob);
          age16Date.setFullYear(age16Date.getFullYear() + 16);
          
          // Only process if child is under 16
          if (age < 16) {
            // Calculate days and weeks until age 16
            const diffMs = age16Date.getTime() - incidentDate.getTime();
            const daysUntil16 = Math.round(diffMs / (1000 * 60 * 60 * 24));
            const weeksUntil16 = parseFloat((daysUntil16 / 7).toFixed(3));
            const benefit = parseFloat((weeklyBenefitRate * weeksUntil16).toFixed(2));
            
            return {
              name: `${child.DependantFirstName} ${child.DependantLastName}`,
              dob: formatDate(dob),
              age,
              daysUntil16,
              weeksUntil16,
              benefit
            };
          }
          return null;
        }).filter(Boolean);
        
        if (processedDependants.length > 0) {
          setDependantData(processedDependants);
        }
      }

      // Fetch employment details
      const { data: employmentData, error: employmentError } = await supabase
        .from('currentemploymentdetails')
        .select('AverageWeeklyWage')
        .eq('WorkerID', form1112Data?.WorkerID)
        .maybeSingle();

      if (employmentError && employmentError.code !== 'PGRST116') {
        throw employmentError;
      }

      // Fetch system parameters
      // Check for mandatory documents
      const mandatoryDocs = form1112Data.IncidentType === 'Injury' 
        ? ['Supervisor statement', 'Final medical report'] 
        : ['Supervisor statement', 'Death Certificate'];
      
      // Add payslip requirement for state employers
      const { data: employerData, error: employerError } = await supabase
        .from('employermaster')
        .select('OrganizationType')
        .eq('CPPSID', employmentData?.EmployerCPPSID || '')
        .maybeSingle();

      if (!employerError && employerData && employerData.OrganizationType === 'State') {
        mandatoryDocs.push('Payslip at the time of accident');
      }

      // Check which documents are available
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('formattachments')
        .select('AttachmentType')
        .eq('IRN', searchIRN);

      if (attachmentError) {
        throw attachmentError;
      }

      const availableDocs = attachmentData?.map(doc => doc.AttachmentType) || [];
      const missingDocs = mandatoryDocs.filter(doc => !availableDocs.includes(doc));

      setMandatoryDocuments({
        required: mandatoryDocs,
        available: availableDocs
      });
      setMissingDocuments(missingDocs);

      // Check for existing calculation
      const { data: existingCalc, error: calcError } = await supabase
        .from('injurycasechecklist')
        .select('*')
        .eq('IRN', searchIRN)
        .maybeSingle();

      // Set the data
      setWorkerDetails({
        WorkerID: workerData.WorkerID,
        WorkerFirstName: workerData.WorkerFirstName,
        WorkerLastName: workerData.WorkerLastName,
        WorkerAliasName: workerData.WorkerAliasName,
        WorkerDOB: workerData.WorkerDOB,
        WorkerGender: workerData.WorkerGender,
        WorkerMarried: workerData.WorkerMarried,
        WorkerHanded: workerData.WorkerHanded,
        SpouseFirstName: workerData.SpouseFirstName,
        SpouseLastName: workerData.SpouseLastName
      });

      setInjuryDetails({
        IRN: form1112Data.IRN,
        DisplayIRN: form1112Data.DisplayIRN,
        IncidentDate: form1112Data.IncidentDate,
        IncidentType: form1112Data.IncidentType,
        NatureExtentInjury: form1112Data.NatureExtentInjury,
        InjuryCause: form1112Data.InjuryCause,
        HandInjury: form1112Data.HandInjury === '1' || form1112Data.HandInjury === true
      });

      setEmploymentDetails({
        Occupation: employmentData?.Occupation || '',
        AverageWeeklyWage: employmentData?.AverageWeeklyWage || 0,
        PlaceOfEmployment: employmentData?.PlaceOfEmployment || '',
        NatureOfEmployment: employmentData?.NatureOfEmployment || ''
      });

      // If existing calculation found, update injury checklist
      if (existingCalc && existingCalc.ICCLCriteria) {
        // Find the matching criteria in the injury checklist
        const updatedChecklist = formattedInjuryChecklist.map(item => {
          if (item.criteria === existingCalc.ICCLCriteria) {
            const doctorPercentage = existingCalc.ICCLDoctorPercentage || 0;
            const calculation = `((${baseAnnualWage}*8*${doctorPercentage}*${item.factor})/100)/100`;
            const compensation = Math.ceil(((baseAnnualWage * 8 * doctorPercentage * item.factor) / 100) / 100);
            
            return {
              ...item,
              checked: true,
              doctorPercentage,
              calculation,
              compensation
            };
          }
          return item;
        });
        setInjuryChecklist(updatedChecklist);
      }

      // Check if a record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('injurycasechecklist')
        .select('ICCLID, ICCLCriteria, ICCLFactor, ICCLDoctorPercentage, ICCLCompensationAmount')
        .eq('IRN', searchIRN)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If existing calculation found, populate the form
      if (existingRecord) {
        setCalculationData({
          IRN: searchIRN,
          WorkerID: form1112Data.WorkerID,
          IncidentType: form1112Data.IncidentType,
          ClaimType: '',
          InjuryCriteria: existingRecord.ICCLCriteria || '',
          InjuryFactor: existingRecord.ICCLFactor || 0,
          DoctorPercentage: existingRecord.ICCLDoctorPercentage || 0,
          CompensationAmount: existingRecord.ICCLCompensationAmount || 0
        });
        
        // Set selected criteria
        if (existingRecord.ICCLCriteria) {
          setSelectedCriteria({ [existingRecord.ICCLCriteria]: true });
          
          // Calculate and set the calculation display
          const weeklyWage = employmentData?.AverageWeeklyWage || 0;
          const annualWage = weeklyWage * 52;
          const factor = existingRecord.ICCLFactor || 0;
          const doctorPercentage = existingRecord.ICCLDoctorPercentage || 0;
          
          const calculationText = `(${annualWage} * 8 * ${factor} * ${doctorPercentage}) / 10000`;
          const amount = Math.round((annualWage * 8 * factor * doctorPercentage) / 10000);
          
          setCriteriaCalculations({
            [existingRecord.ICCLCriteria]: {
              calculation: calculationText,
              amount: amount
            }
          });
        }
      } else {
        // Initialize with default values
        setCalculationData({
          IRN: searchIRN,
          WorkerID: form1112Data.WorkerID,
          IncidentType: form1112Data.IncidentType,
          ClaimType: '',
          InjuryCriteria: '',
          InjuryFactor: 0,
          DoctorPercentage: 0,
          CompensationAmount: 0
        });
        
        // Reset selected criteria
        setSelectedCriteria({});
        setCriteriaCalculations({});
      }

      // For death cases, calculate additional data
      if (form1112Data.IncidentType === 'Death') {
        calculateDeathCaseData(form1112Data, employmentData, dependantData || []);
      }

    } catch (err: any) {
      console.error('Error searching for IRN:', err);
      setError(err.message || 'Failed to find claim with this IRN');
      setWorkerDetails(null);
      setInjuryDetails(null);
      setEmploymentDetails(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const calculateDeathCaseData = (
    form1112Data: any, 
    employmentData: any, 
    dependants: DependantDetails[]
  ) => {
    // Get annual earnings
    const weeklyWage = employmentData?.AverageWeeklyWage || 0;
    const annualEarnings = weeklyWage * 52;
    
    // Get system parameters
    const minCompensationAmount = parseFloat(systemParams['MinCompensationAmountDeath'] || '0');
    const maxCompensationAmount = parseFloat(systemParams['MaxCompensationAmountDeath'] || '0');
    const weeklyBenefitPerChild = parseFloat(systemParams['WeeklyCompensationPerChildDeath'] || '0');
    
    // Calculate compensation amount
    let calculatedAmount = 0;
    if (annualEarnings < minCompensationAmount) {
      calculatedAmount = 8 * annualEarnings;
    } else {
      calculatedAmount = maxCompensationAmount;
    }
    
    // Calculate weekly benefit for children
    const childrenBenefits = dependants
      .filter(d => d.DependantType === 'Child')
      .map(child => {
        const dob = new Date(child.DependantDOB);
        const incidentDate = new Date(form1112Data.IncidentDate);
        const age = calculateAge(dob, incidentDate);
        
        // Calculate age 16 date
        const age16 = new Date(dob);
        age16.setFullYear(age16.getFullYear() + 16);
        
        // Calculate days and weeks until age 16
        const daysUntil16 = Math.max(0, Math.round((age16.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24)));
        const weeksUntil16 = parseFloat((daysUntil16 / 7).toFixed(3));
        
        // Calculate benefit
        const benefit = weeklyBenefitPerChild * weeksUntil16;
        
        return {
          name: `${child.DependantFirstName} ${child.DependantLastName}`,
          dob: formatDate(dob),
          age,
          daysUntil16,
          weeksUntil16,
          benefit
        };
      });
    
    setDeathCaseData({
      annualEarnings,
      calculatedAmount,
      spousePercentage: 50, // Default values
      childrenPercentage: 50,
      weeklyBenefitForChildren: childrenBenefits
    });
  };

  // Helper function to calculate age
  const calculateAge = (dob: Date, referenceDate: Date): number => {
    let age = referenceDate.getFullYear() - dob.getFullYear();
    const m = referenceDate.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && referenceDate.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to format date
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle input changes for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setCalculationData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle injury checklist changes
  const handleInjuryChecklistChange = (index: number, field: 'checked' | 'doctorPercentage', value: boolean | number) => {
    const updatedChecklist = [...injuryChecklist];
    
    if (field === 'checked') {
      updatedChecklist[index].checked = value as boolean;
      
      // If unchecked, reset doctor percentage and calculation
      if (!(value as boolean)) {
        updatedChecklist[index].doctorPercentage = 0;
        updatedChecklist[index].calculation = '--';
        updatedChecklist[index].compensation = 0;
      }
    } else if (field === 'doctorPercentage') {
      const percentage = value as number;
      
      // Validate percentage is between 0 and 100
      if (percentage >= 0 && percentage <= 100) {
        updatedChecklist[index].doctorPercentage = percentage;
        
        // Auto-check the checkbox if percentage > 0
        if (percentage > 0) {
          updatedChecklist[index].checked = true;
        }
        
        // Update calculation and compensation
        if (updatedChecklist[index].checked) {
          const factor = updatedChecklist[index].factor;
          updatedChecklist[index].calculation = `((${baseAnnualWage}*8*${percentage}*${factor})/100)/100`;
          updatedChecklist[index].compensation = Math.ceil(((baseAnnualWage * 8 * percentage * factor) / 100) / 100);
        }
      }
    }
    
    setInjuryChecklist(updatedChecklist);
  };

  // Handle expense changes and recalculate total
  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'medical' | 'misc' | 'deductions') => {
    const value = parseFloat(e.target.value) || 0;
    
    if (type === 'medical') {
      setMedicalExpenses(value);
    } else if (type === 'misc') {
      setMiscExpenses(value);
    } else {
      setDeductions(value);
    }
    
    // Recalculate total
    calculateCompensation();
  };

  // Handle doctor percentage change for a specific criteria
  const handleDoctorPercentageChange = (criteriaKey: string, factor: number, value: number) => {
    // Update the doctor percentage in the state
    setCalculationData(prev => ({
      ...prev,
      DoctorPercentage: value,
      InjuryCriteria: criteriaKey,
      InjuryFactor: factor
    }));
    
    // Check the checkbox for this criteria and uncheck others
    const newSelectedCriteria: {[key: string]: boolean} = {};
    newSelectedCriteria[criteriaKey] = true;
    setSelectedCriteria(newSelectedCriteria);
    
    // Calculate the compensation for this criteria
    if (employmentDetails) {
      const weeklyWage = employmentDetails.AverageWeeklyWage || 0;
      const annualWage = weeklyWage * 52;
      
      const calculationText = `(${annualWage} * 8 * ${factor} * ${value}) / 10000`;
      const amount = Math.round((annualWage * 8 * factor * value) / 10000);
      
      const newCalculations: {[key: string]: {calculation: string, amount: number}} = {};
      newCalculations[criteriaKey] = {
        calculation: calculationText,
        amount: amount
      };
      
      setCriteriaCalculations(newCalculations);
      
      // Update the total compensation amount
      setCalculationData(prev => ({
        ...prev,
        CompensationAmount: amount + medicalExpenses + miscExpenses - deductions
      }));
    }
  };

  // Calculate compensation based on selected criteria and factors
  const calculateCompensation = () => {
    // Basic calculation formula
    let compensation = 0;

    // For injury case, sum up all selected injury compensations
    if (injuryDetails?.IncidentType === 'Injury') {
      injuryChecklist.forEach(item => {
        if (item.checked) {
          compensation += item.compensation;
        }
      });
    } else {
      // For death case, use the calculation from the form
      const factor = calculationData.InjuryFactor || 1;
      const percentage = calculationData.DoctorPercentage / 100 || 0;
      compensation = baseCompensationAmount * factor * (1 + percentage);
    }

    // Add additional expenses for both cases
    compensation += medicalExpenses;
    compensation += miscExpenses;
    compensation -= deductions;
    
    setCalculationData(prev => ({
      ...prev,
      CompensationAmount: Math.max(0, compensation)
    }));
  };

  useEffect(() => {
    calculateCompensation();
  }, [injuryChecklist, medicalExpenses, miscExpenses, deductions]);

  // Submit the calculation to the database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculationData.IRN || !calculationData.InjuryCriteria || calculationData.CompensationAmount <= 0) {
      setError('Please complete all required fields and calculate compensation amount');
      return;
    } 
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate that all required fields are filled
      if (!calculationData.ClaimType) {
        setError('Please select a claim type');
        setLoading(false);
        return;
      }

      // For injury cases, validate that at least one injury criteria is selected
      if (injuryDetails?.IncidentType === 'Injury' && !calculationData.InjuryCriteria) {
        setError('Please select at least one injury criteria');
        setLoading(false);
        return;
      }

      // Validate doctor percentage is between 0 and 100
      if (calculationData.DoctorPercentage < 0 || calculationData.DoctorPercentage > 100) {
        setError('Doctor percentage must be between 0 and 100');
        setLoading(false);
        return;
      }
      
      // Calculate total compensation from injury checklist
      let totalCompensation = 0;
      injuryChecklist.forEach(item => {
        if (item.checked) {
          totalCompensation += item.compensation;
        }
      });
      
      totalCompensation += medicalExpenses + miscExpenses - deductions;
      
      // Check if a record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('injurycasechecklist')
        .select('ICCLID')
        .eq('IRN', calculationData.IRN)
        .maybeSingle();
      
      // Prepare data for saving
      const saveData = {
        ICCLCriteria: calculationData.InjuryCriteria,
        ICCLFactor: calculationData.InjuryFactor,
        ICCLDoctorPercentage: calculationData.DoctorPercentage,
        ICCLCompensationAmount: totalCompensation,
        CCWDMedicalExpenses: medicalExpenses.toString(),
        CCWDMiscExpenses: miscExpenses.toString(),
        CCWDDeductions: deductions.toString()
      };

      // Add findings and recommendations if provided
      if (findings) {
        Object.assign(saveData, { CCWDFindings: findings });
      }

      if (recommendations) {
        Object.assign(saveData, { CCWDRecommendations: recommendations });
      }

      let result;
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('injurycasechecklist')
          .update(saveData)
          .eq('ICCLID', existingRecord.ICCLID)
          .select();
        
        if (error) throw error;
        result = data;
        setSuccess('Compensation calculation updated successfully');
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('injurycasechecklist') 
          .insert({
            IRN: calculationData.IRN,
            ...saveData
          })
          .select();
        
        if (error) throw error;
        result = data;
        setSuccess('Compensation calculation saved successfully');
      }
      
      // Update the status in approvedclaimscporeview table
      const { error: statusError } = await supabase
        .from('approvedclaimscporeview')
        .update({
          CPORStatus: 'CompensationCalculated'
        })
        .eq('IRN', calculationData.IRN);
      
      if (statusError) {
        console.error('Error updating status:', statusError);
        // Continue anyway as the main record was saved
      }

      // Save worker compensation details for death cases
      if (injuryDetails?.IncidentType === 'Death' && dependants.length > 0) {
        try {
          // Save worker compensation details
          const { error: workerCompError } = await supabase
            .from('claimcompensationworkerdetails')
            .upsert({
              CCWDID: existingRecord ? existingRecord.ICCLID : result[0].ICCLID,
              IRN: calculationData.IRN,
              CCWDWorkerFirstName: workerDetails?.WorkerFirstName,
              CCWDWorkerLastName: workerDetails?.WorkerLastName,
              CCWDWorkerDOB: workerDetails?.WorkerDOB,
              CCWDCompensationAmount: calculationData.CompensationAmount,
              CCWDMedicalExpenses: medicalExpenses.toString(),
              CCWDMiscExpenses: miscExpenses.toString(),
              CCWDDeductions: deductions.toString(),
              CCWDFindings: findings,
              CCWDRecommendations: recommendations
            });

          if (workerCompError) {
            console.error('Error saving worker compensation details:', workerCompError);
          }

          // Save dependant compensation details
          for (const dependant of dependants) {
            // Calculate dependant compensation based on degree of dependence
            const dependantCompensation = (calculationData.CompensationAmount * (dependant.DependanceDegree / 100)).toFixed(2);
            
            const { error: dependantCompError } = await supabase
              .from('claimcompensationpersonaldetails')
              .upsert({
                CCPDID: parseInt(dependant.DependantID),
                IRN: calculationData.IRN,
                CCPDPersonFirstName: dependant.DependantFirstName,
                CCPDPersonLastName: dependant.DependantLastName,
                CCPDPersonDOB: dependant.DependantDOB,
                CCPDRelationToWorker: dependant.DependantType,
                CCPDDegreeOfDependance: dependant.DependanceDegree,
                CCPDCompensationAmount: dependantCompensation
              });

            if (dependantCompError) {
              console.error('Error saving dependant compensation details:', dependantCompError);
            }
          }
        } catch (err) {
          console.error('Error saving compensation details:', err);
        }
      }
      
      // Create a new record in compensationcalculationcpmreview
      const { error: cpmError } = await supabase
        .from('compensationcalculationcpmreview')
        .insert({
          IRN: calculationData.IRN,
          CPMRStatus: 'Pending',
          CPMRSubmissionDate: new Date().toISOString(),
          IncidentType: calculationData.IncidentType
        });
      
      if (cpmError) {
        console.error('Error creating CPM review record:', cpmError);
        // Continue anyway as the main record was saved
      }

      // Unlock the record
      if (userStaffID) {
        const { error: unlockError } = await supabase
          .from('approvedclaimscporeview')
          .update({ LockedByCPOID: 0 })
          .eq('IRN', calculationData.IRN);

        if (unlockError) {
          console.error('Error unlocking record:', unlockError);
        }
      }
      
      console.log('Saved calculation:', result);
      setSuccess('Compensation calculation saved successfully and forwarded to the Claims Manager for review.');
      
    } catch (err: any) {
      console.error('Error saving calculation:', err);
      setError(err.message || 'Failed to save compensation calculation');
    } finally {
      setLoading(false);
    }
  };

  // If the record is locked by another user, show a message
  if (isLocked && lockedByName) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 w-full">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Record Locked</h3>
          </div>
          <p className="text-gray-700 mb-4">
            This record is currently being processed by {lockedByName}. Please try again later.
          </p>
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
    );
  }

  // Main component render
  return (
    <div className="bg-white rounded-lg shadow-xl w-full">
      <div className="p-6">
          {/* Search Section */}
          {!irn && (
            <div className="mb-6">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label htmlFor="searchIRN" className="block text-sm font-medium text-gray-700 mb-1">
                    Search by IRN
                  </label>
                  <input
                    type="text"
                    id="searchIRN"
                    value={searchIRN}
                    onChange={(e) => setSearchIRN(e.target.value)}
                    className="input"
                    placeholder="Enter IRN"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="btn btn-primary h-[42px]"
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                        Searching...
                      </span>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {workerDetails && injuryDetails && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Worker and Injury Details Section */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold mb-4 text-primary">Claim Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display IRN</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{injuryDetails.DisplayIRN}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Incident Type</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">{injuryDetails.IncidentType}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Worker Name</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">
                      {workerDetails.WorkerFirstName} {workerDetails.WorkerLastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Incident Date</label>
                    <p className="mt-1 p-2 border rounded-md bg-white">
                      {injuryDetails.IncidentDate ? new Date(injuryDetails.IncidentDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nature & Extent of Injury</label>
                  <p className="mt-1 p-2 border rounded-md bg-white">{injuryDetails.NatureExtentInjury || 'N/A'}</p>
                </div>
              </div>

              {/* Compensation Calculation Section */}
              <div className="card bg-white p-6 border border-gray-200 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4 text-primary">Compensation Calculation</h3>

                {injuryDetails?.IncidentType === 'Injury' ? (
                  // Injury Case Calculation
                  <div>
                    <div className="bg-[#fffcf6] p-4 rounded-lg border border-gray-200 mb-4">
                      <h4 className="text-[#ba372a] font-semibold mb-3">Compensation Calculation Follows</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p><span className="font-medium">Worker weekly wage:</span> {employmentDetails?.AverageWeeklyWage || 0} K</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Final worker weekly wage:</span> {employmentDetails?.AverageWeeklyWage || 0} K</p>
                        </div>
                      </div>
                      <div>
                        <p><span className="font-medium">Final worker annual wage:</span> {(employmentDetails?.AverageWeeklyWage || 0) * 52} K</p>
                      </div>
                    </div>

                    <h4 className="text-[#ba372a] font-semibold mb-3">Compensation For Specified Injuries</h4>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-[#ba372a] text-yellow-300">
                          <tr>
                            <th className="px-4 py-2 text-left w-1/2">Criteria</th>
                            <th className="px-4 py-2 text-center w-12">Factor</th>
                            <th className="px-4 py-2 text-center w-12">Apply</th>
                            <th className="px-4 py-2 text-center w-20">Doctor %</th>
                            <th className="px-4 py-2 text-left w-1/4">Calculation</th>
                            <th className="px-4 py-2 text-right w-24">Compensation</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#fffcf6]">
                          {injuryChecklist.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-[#fef9e7]">
                              <td className="px-4 py-2">{item.criteria}</td>
                              <td className="px-4 py-2 text-center">{item.factor}</td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={(e) => handleInjuryChecklistChange(index, 'checked', e.target.checked)}
                                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                              </td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="number"
                                  value={item.doctorPercentage}
                                  onChange={(e) => handleInjuryChecklistChange(index, 'doctorPercentage', parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                  min="0"
                                  max="100"
                                />
                              </td>
                              <td className="px-4 py-2">{item.calculation}</td>
                              <td className="px-4 py-2 text-right">{item.compensation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Death Case Calculation
                  <div>
                    <div className="bg-[#fffcf6] p-4 rounded-lg border border-gray-200 mb-4">
                      <h4 className="text-[#ba372a] font-semibold mb-3">Compensation Calculation Follows</h4>
                      <div className="mb-3">
                        <p><span className="font-medium">Annual earnings at death:</span> {calculationData.AnnualEarningsAtDeath || 0}</p>
                      </div>
                      <div className="mb-3">
                        <p><span className="font-medium">Is worker annual wage less than system defined minimum 3125K:</span> {((calculationData.AnnualEarningsAtDeath || 0) < 3125) ? 'YES' : 'NO'}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Calculated compensation amount is:</span> {calculationData.CompensationAmount}</p>
                      </div>
                    </div>

                    <h4 className="text-[#ba372a] font-semibold mb-3">Compensation Amount Breakup Follows</h4>
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-[#ba372a] text-yellow-300">
                          <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-center">Age</th>
                            <th className="px-4 py-2 text-center">Age at Incident Date</th>
                            <th className="px-4 py-2 text-left">Relation</th>
                            <th className="px-4 py-2 text-right">Amt</th>
                            <th className="px-4 py-2 text-center">Percentage</th>
                            <th className="px-4 py-2 text-right">Org Amt</th>
                            <th className="px-4 py-2 text-center">Org Percentage</th>
                            <th className="px-4 py-2 text-center">Weekly Compensation Benefit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#fffcf6]">
                          {/* Spouse row if available */}
                          {workerDetails?.SpouseFirstName && (
                            <tr className="border-b border-gray-200 hover:bg-[#fef9e7]">
                              <td className="px-4 py-2">{workerDetails.SpouseFirstName} {workerDetails.SpouseLastName}</td>
                              <td className="px-4 py-2 text-center">
                                {workerDetails.SpouseDOB ? calculateAge(new Date(workerDetails.SpouseDOB), new Date()) : 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {workerDetails.SpouseDOB && injuryDetails?.IncidentDate ? 
                                  calculateAge(new Date(workerDetails.SpouseDOB), new Date(injuryDetails.IncidentDate)) : 'N/A'}
                              </td>
                              <td className="px-4 py-2">Spouse</td>
                              <td className="px-4 py-2 text-right">{Math.round(calculationData.CompensationAmount / 2)}</td>
                              <td className="px-4 py-2 text-center">50%</td>
                              <td className="px-4 py-2 text-right">{Math.round(calculationData.CompensationAmount / 2)}</td>
                              <td className="px-4 py-2 text-center">50%</td>
                              <td className="px-4 py-2 text-center">No</td>
                            </tr>
                          )}
                          
                          {/* Child rows if available */}
                          {dependants.filter(d => d.DependantType === 'Child').map((child, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-[#fef9e7]">
                              <td className="px-4 py-2">{child.DependantFirstName} {child.DependantLastName}</td>
                              <td className="px-4 py-2 text-center">
                                {calculateAge(new Date(child.DependantDOB), new Date())}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {injuryDetails?.IncidentDate ? 
                                  calculateAge(new Date(child.DependantDOB), new Date(injuryDetails.IncidentDate)) : 'N/A'}
                              </td>
                              <td className="px-4 py-2">Child</td>
                              <td className="px-4 py-2 text-right">
                                {Math.round(calculationData.CompensationAmount / 2 / 
                                  dependants.filter(d => d.DependantType === 'Child').length)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {Math.round(50 / dependants.filter(d => d.DependantType === 'Child').length)}%
                              </td>
                              <td className="px-4 py-2 text-right">
                                {Math.round(calculationData.CompensationAmount / 2 / 
                                  dependants.filter(d => d.DependantType === 'Child').length)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {Math.round(50 / dependants.filter(d => d.DependantType === 'Child').length)}%
                              </td>
                              <td className="px-4 py-2 text-center">
                                {calculateAge(new Date(child.DependantDOB), new Date()) < 16 ? '10 K' : 'No'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Weekly Benefit Lumpsum For Children */}
                {injuryDetails?.IncidentType === 'Injury' && dependantData.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[#ba372a] font-semibold mb-3">Weekly Benefit Lumpsum For Children</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-[#ba372a] text-yellow-300">
                          <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-center">DOB</th>
                            <th className="px-4 py-2 text-center">Age at Incident Date</th>
                            <th className="px-4 py-2 text-center">No. Of Days Until Age 16</th>
                            <th className="px-4 py-2 text-center">No. Of Weeks Until Age 16</th>
                            <th className="px-4 py-2 text-right">Weekly Benefit Lumpsum For Children</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#fffcf6]">
                          {dependantData.map((child, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-[#fef9e7]">
                              <td className="px-4 py-2">{child.name}</td>
                              <td className="px-4 py-2 text-center">{child.dob}</td>
                              <td className="px-4 py-2 text-center">{child.age}</td>
                              <td className="px-4 py-2 text-center">{child.daysUntil16}</td>
                              <td className="px-4 py-2 text-center">{child.weeksUntil16}</td>
                              <td className="px-4 py-2 text-right">{child.benefit} K</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Additional Expenses */}
                <h4 className="font-medium text-primary mb-3 mt-6">Additional Expenses</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="CCWDMedicalExpenses" className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Expenses (+)
                    </label>
                    <input
                      type="number"
                      id="CCWDMedicalExpenses"
                      value={medicalExpenses}
                      onChange={(e) => handleExpenseChange(e, 'medical')}
                      className="input"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="CCWDMiscExpenses" className="block text-sm font-medium text-gray-700 mb-1">
                      Misc Expenses (+)
                    </label>
                    <input
                      type="number"
                      id="CCWDMiscExpenses"
                      value={miscExpenses}
                      onChange={(e) => handleExpenseChange(e, 'misc')}
                      className="input"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="CCWDDeductions" className="block text-sm font-medium text-gray-700 mb-1">
                      Deductions (-)
                    </label>
                    <input
                      type="number"
                      id="CCWDDeductions"
                      value={deductions}
                      onChange={(e) => handleExpenseChange(e, 'deductions')}
                      className="input"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4 mt-6">
                  <div className="bg-[#fffcf6] p-4 rounded-lg border border-gray-200">
                    <h4 className="text-[#ba372a] font-semibold mb-3">Final Compensation Amount:</h4>
                    <div id="fca" className="text-2xl font-bold">
                      {calculationData.CompensationAmount}
                    </div>
                  </div>
                </div>
                
                {/* Missing Documents Warning */}
                {missingDocuments.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Missing Required Documents</p>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        {missingDocuments.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                      <p className="text-sm mt-2">
                        These documents are required before the calculation can be submitted.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Findings and Recommendations */}
                <div className="mb-4">
                  <label htmlFor="CCWDFindings" className="block text-sm font-medium text-gray-700 mb-1">
                    Findings
                  </label>
                  <textarea
                    id="CCWDFindings"
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="input"
                    rows={3}
                    disabled={missingDocuments.length > 0}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="CCWDRecommendations" className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendations
                  </label>
                  <textarea
                    id="CCWDRecommendations"
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="input"
                    rows={3}
                    disabled={missingDocuments.length > 0}
                  />
                </div>

                {/* Email List for Notifications */}
                <div className="mb-4">
                  <label htmlFor="emailList" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Notifications (comma separated)
                  </label>
                  <input
                    type="text"
                    id="emailList"
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    className="input"
                    placeholder="email1@example.com, email2@example.com"
                    disabled={missingDocuments.length > 0}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter email addresses to notify when this calculation is approved
                  </p>
                </div>

                {/* Document Status */}
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-primary mb-3">Document Status</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-medium mb-2">The following attachments are REQUIRED for this claim:</p>
                    <div className="border-t border-b border-dashed border-gray-300 py-2 mb-2">
                      {mandatoryDocuments.required.map((doc, index) => (
                        <div key={index} className="flex items-center mb-1">
                          {mandatoryDocuments.available.includes(doc) ? (
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <span className={mandatoryDocuments.available.includes(doc) ? 'text-green-700' : 'text-yellow-700'}>
                            {index + 1}. {doc}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-sm font-medium mb-2">The following attachments are SUBMITTED for this claim:</p>
                    <div className="border-t border-b border-dashed border-gray-300 py-2 mb-2">
                      {mandatoryDocuments.available.map((doc, index) => (
                        <div key={index} className="flex items-center mb-1">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-green-700">
                            {index + 1}. {doc}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {missingDocuments.length > 0 && (
                    <>
                      <p className="text-sm font-medium mb-2">The following attachments are MISSING for this claim:</p>
                      <div className="border-t border-b border-dashed border-gray-300 py-2">
                        {missingDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-yellow-700">
                          {index + 1}. {doc}
                        </span>
                      </div>
                      ))}
                      </div>
                    </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={loading || missingDocuments.length > 0 || !findings || !recommendations}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Calculation
                    </>
                  )}
                </button>
                {(missingDocuments.length > 0 || !findings || !recommendations) && (
                  <div className="text-xs text-yellow-600 mt-2">
                    {missingDocuments.length > 0 && <p>Cannot submit until all required documents are available</p>}
                    {(!findings || !recommendations) && <p>Please fill in both Findings and Recommendations fields</p>}
                  </div>
                )}
              </div>
            </form>
          )}
      </div>
    </div>
  );
};

export default CompensationCalculation;
