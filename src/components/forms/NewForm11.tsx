import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface NewForm11Props {
  workerId: string;
  onClose: () => void;
}

interface Form11Data {
  // Worker Personal Details (pre-filled)
  WorkerID: string;
  WorkerFirstName: string;
  WorkerLastName: string;
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

  // Employment Details
  EmploymentID: string;
  Occupation: string;
  PlaceOfEmployment: string;
  NatureOfEmployment: string;
  AverageWeeklyWage: number;
  WeeklyPaymentRate: number;
  WorkedUnderSubContractor: boolean;
  SubContractorOrganizationName: string;
  SubContractorLocation: string;
  SubContractorNatureOfBusiness: string;

  // Incident Details
  IncidentDate: string;
  IncidentLocation: string;
  IncidentProvince: string;
  IncidentRegion: string;
  NatureExtentInjury: string;
  InjuryCause: string;
  HandInjury: boolean;
  InjuryMachinery: boolean;
  MachineType: string;
  MachinePartResponsible: string;
  MachinePowerSource: string;
  GradualProcessInjury: boolean;

  // Dependant Details
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
  WorkerHaveDependants: boolean;

  // Insurance Details
  InsuranceProviderIPACode: string;
  InsuranceCompanyOrganizationName: string;
  InsuranceCompanyAddress1: string;
  InsuranceCompanyAddress2: string;
  InsuranceCompanyCity: string;
  InsuranceCompanyProvince: string;
  InsuranceCompanyPOBox: string;
  InsuranceCompanyLandLine: string;

  // Form Attachments
  ImageName: string;
  ImageName2: string;
  IMR: string; // Interim medical report
  FMR: string; // Final medical report
  SEC43: string; // Section 43 application form
  SS: string; // Supervisor statement
  WS: string; // Witness statement
  IWS: string; // Injured worker's statement
  PTA: string; // Payslip at time of accident
  TR: string; // Treatment records
  PAR: string; // Police accident report
  
  // System fields
  DisplayIRN: string;
  TimeBarred: boolean;
  FirstSubmissionDate: string;
  IncidentType: string;
}

const NewForm11: React.FC<NewForm11Props> = ({ workerId, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [formData, setFormData] = useState<Form11Data>({
    // Initialize with default values
    WorkerID: workerId,
    WorkerFirstName: '',
    WorkerLastName: '',
    WorkerDOB: '',
    WorkerGender: '',
    WorkerMarried: '',
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
    EmploymentID: '',
    Occupation: '',
    PlaceOfEmployment: '',
    NatureOfEmployment: '',
    AverageWeeklyWage: 0,
    WeeklyPaymentRate: 0,
    WorkedUnderSubContractor: false,
    SubContractorOrganizationName: '',
    SubContractorLocation: '',
    SubContractorNatureOfBusiness: '',
    IncidentDate: '',
    IncidentLocation: '',
    IncidentProvince: '',
    IncidentRegion: '',
    NatureExtentInjury: '',
    InjuryCause: '',
    HandInjury: false,
    InjuryMachinery: false,
    MachineType: '',
    MachinePartResponsible: '',
    MachinePowerSource: '',
    GradualProcessInjury: false,
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
    InsuranceProviderIPACode: '',
    InsuranceCompanyOrganizationName: '',
    InsuranceCompanyAddress1: '',
    InsuranceCompanyAddress2: '',
    InsuranceCompanyCity: '',
    InsuranceCompanyProvince: '',
    InsuranceCompanyPOBox: '',
    InsuranceCompanyLandLine: '',
    ImageName: '',
    ImageName2: '',
    IMR: '',
    FMR: '',
    SEC43: '',
    SS: '',
    WS: '',
    IWS: '',
    PTA: '',
    TR: '',
    PAR: '',
    DisplayIRN: '',
    TimeBarred: false,
    FirstSubmissionDate: new Date().toISOString(),
    IncidentType: 'Injury'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<{ DKey: string; DValue: string }[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<any[]>([]);
  const [dependants, setDependants] = useState<any[]>([]);
  const [workHistory, setWorkHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch worker personal details
        const { data: workerData, error: workerError } = await supabase
          .from('workerpersonaldetails')
          .select('*')
          .eq('WorkerID', workerId)
          .single();

        if (workerError) throw workerError;

        // Fetch current employment details
        const { data: employmentData, error: employmentError } = await supabase
          .from('currentemploymentdetails')
          .select('*')
          .eq('WorkerID', workerId)
          .single();

        if (employmentError) throw employmentError;

        // Fetch provinces
        const { data: provinceData, error: provinceError } = await supabase
          .from('dictionary')
          .select('DKey, DValue')
          .eq('DType', 'Province');

        if (provinceError) throw provinceError;
        setProvinces(provinceData || []);

        // Fetch insurance providers
        const { data: insuranceData, error: insuranceError } = await supabase
          .from('insurancecompanymaster')
          .select('*');

        if (insuranceError) throw insuranceError;
        setInsuranceProviders(insuranceData || []);

        // Fetch dependants
        const { data: dependantData, error: dependantError } = await supabase
          .from('dependantpersonaldetails')
          .select('*')
          .eq('WorkerID', workerId);

        if (dependantError) throw dependantError;
        setDependants(dependantData || []);

        // Fetch work history
        const { data: historyData, error: historyError } = await supabase
          .from('workhistory')
          .select('*')
          .eq('WorkerID', workerId);

        if (historyError) throw historyError;
        setWorkHistory(historyData || []);

        // Update form data with fetched details
        setFormData(prev => ({
          ...prev,
          ...workerData,
          ...employmentData,
          WorkerHaveDependants: (dependantData || []).length > 0
        }));

      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load worker details');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [workerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if incident date is more than 365 days old
      const incidentDate = new Date(formData.IncidentDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
      const isTimeBarred = daysDiff > 365;

      // Save to form1112master
      const { data: form1112Data, error: form1112Error } = await supabase
        .from('form1112master')
        .insert([{
          ...formData,
          TimeBarred: isTimeBarred,
          FirstSubmissionDate: new Date().toISOString()
        }])
        .select()
        .single();

      if (form1112Error) throw form1112Error;

      // If time barred, create entry in timebarredclaimsregistrarreview
      if (isTimeBarred) {
        const { error: timeBarredError } = await supabase
          .from('timebarredclaimsregistrarreview')
          .insert([{
            IRN: form1112Data.IRN,
            TBCRRSubmissionDate: new Date().toISOString(),
            TBCRRFormType: 'Form11',
            TBCRRReviewStatus: 'Pending'
          }]);

        if (timeBarredError) throw timeBarredError;
      } else {
        // If not time barred, create entry in prescreeningreview
        const { error: prescreeningError } = await supabase
          .from('prescreeningreviewhistory')
          .insert([{
            IRN: form1112Data.IRN,
            PRHSubmissionDate: new Date().toISOString(),
            PRHFormType: 'Form11',
            PRHDecisionReason: 'Automatically Approved'
          }]);

        if (prescreeningError) throw prescreeningError;
      }

      // Save form attachments
      const attachments = [
        { type: 'Interim medical report', file: formData.IMR },
        { type: 'Final medical report', file: formData.FMR },
        { type: 'Section 43 application form', file: formData.SEC43 },
        { type: 'Supervisor statement', file: formData.SS },
        { type: 'Witness statement', file: formData.WS },
        { type: 'Injured workers statement', file: formData.IWS },
        { type: 'Payslip at time of accident', file: formData.PTA },
        { type: 'Treatment records', file: formData.TR },
        { type: 'Police accident report', file: formData.PAR }
      ];

      for (const attachment of attachments) {
        if (attachment.file) {
          const { error: attachmentError } = await supabase
            .from('formattachments')
            .insert([{
              IRN: form1112Data.IRN,
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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
            disabled
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
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="WorkerDOB"
            value={formData.WorkerDOB}
            onChange={handleInputChange}
            className="input"
            disabled
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="WorkerGender"
            value={formData.WorkerGender}
            onChange={handleInputChange}
            className="input"
            disabled
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
            disabled
          >
            <option value="1">Married</option>
            <option value="0">Single</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dominant Hand</label>
          <select
            name="WorkerHanded"
            value={formData.WorkerHanded}
            onChange={handleInputChange}
            className="input"
            disabled
          >
            <option value="Right">Right</option>
            <option value="Left">Left</option>
          </select>
        </div>
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
            disabled
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
            disabled
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
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <input
            type="text"
            name="WorkerProvince"
            value={formData.WorkerProvince}
            onChange={handleInputChange}
            className="input"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <input
            type="text"
            name="WorkerPOBox"
            value={formData.WorkerPOBox}
            onChange={handleInputChange}
            className="input"
            disabled
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
            disabled
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
            disabled
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
            disabled
          />
        </div>
      </div>
    </div>
  );

  const renderEmploymentDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employment ID</label>
          <input
            type="text"
            name="EmploymentID"
            value={formData.EmploymentID}
            onChange={handleInputChange}
            className="input"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Occupation</label>
          <input
            type="text"
            name="Occupation"
            value={formData.Occupation}
            onChange={handleInputChange}
            className="input"
            disabled
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Place of Employment</label>
        <input
          type="text"
          name="PlaceOfEmployment"
          value={formData.PlaceOfEmployment}
          onChange={handleInputChange}
          className="input"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nature of Employment</label>
        <input
          type="text"
          name="NatureOfEmployment"
          value={formData.NatureOfEmployment}
          onChange={handleInputChange}
          className="input"
          disabled
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Average Weekly Wage</label>
          <input
            type="number"
            name="AverageWeeklyWage"
            value={formData.AverageWeeklyWage}
            onChange={handleInputChange}
            className="input"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Weekly Payment Rate</label>
          <input
            type="number"
            name="WeeklyPaymentRate"
            value={formData.WeeklyPaymentRate}
            onChange={handleInputChange}
            className="input"
            disabled
          />
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="WorkedUnderSubContractor"
            checked={formData.WorkedUnderSubContractor}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Worked Under Sub-Contractor
          </label>
        </div>

        {formData.WorkedUnderSubContractor && (
          <div className="space-y-4 pl-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sub-Contractor Organization Name</label>
              <input
                type="text"
                name="SubContractorOrganizationName"
                value={formData.SubContractorOrganizationName}
                onChange={handleInputChange}
                className="input"
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderInjuryDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Incident Date</label>
          <input
            type="date"
            name="IncidentDate"
            value={formData.IncidentDate}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Incident Location</label>
          <input
            type="text"
            name="IncidentLocation"
            value={formData.IncidentLocation}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <select
            name="IncidentProvince"
            value={formData.IncidentProvince}
            onChange={handleInputChange}
            className="input"
            required
          >
            <option value="">Select Province</option>
            {provinces.map(province => (
              <option key={province.DValue} value={province.DValue}>
                {province.DKey}
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
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nature and Extent of Injury</label>
        <textarea
          name="NatureExtentInjury"
          value={formData.NatureExtentInjury}
          onChange={handleInputChange}
          className="input"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cause of Injury</label>
        <textarea
          name="InjuryCause"
          value={formData.InjuryCause}
          onChange={handleInputChange}
          className="input"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="HandInjury"
            checked={formData.HandInjury}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Hand Injury
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="InjuryMachinery"
            checked={formData.InjuryMachinery}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Injury due to Machinery
          </label>
        </div>
      </div>

      {formData.InjuryMachinery && (
        <div className="space-y-4 border-l-4 border-primary pl-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Machine Type</label>
            <input
              type="text"
              name="MachineType"
              value={formData.MachineType}
              onChange={handleInputChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Machine Part Responsible</label>
            <input
              type="text"
              name="MachinePartResponsible"
              value={formData.MachinePartResponsible}
              onChange={handleInputChange}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Machine Power Source</label>
            <input
              type="text"
              name="MachinePowerSource"
              value={formData.MachinePowerSource}
              onChange={handleInputChange}
              className="input"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderDependantDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Spouse First Name</label>
          <input
            type="text"
            name="SpouseFirstName"
            value={formData.SpouseFirstName}
            onChange={handleInputChange}
            className="input"
            disabled={!formData.WorkerMarried}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Spouse Last Name</label>
          <input
            type="text"
            name="SpouseLastName"
            value={formData.SpouseLastName}
            onChange={handleInputChange}
            className="input"
            disabled={!formData.WorkerMarried}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Spouse Date of Birth</label>
          <input
            type="date"
            name="SpouseDOB"
            value={formData.SpouseDOB}
            onChange={handleInputChange}
            className="input"
            disabled={!formData.WorkerMarried}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Spouse Address Line 1</label>
          <textarea
            name="SpouseAddress1"
            value={formData.SpouseAddress1}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={!formData.WorkerMarried}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Spouse Address Line 2</label>
          <textarea
            name="SpouseAddress2"
            value={formData.SpouseAddress2}
            onChange={handleInputChange}
            className="input"
            rows={3}
            disabled={!formData.WorkerMarried}
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
            disabled={!formData.WorkerMarried}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <input
            type="text"
            name="SpouseProvince"
            value={formData.SpouseProvince}
            onChange={handleInputChange}
            className="input"
            disabled={!formData.WorkerMarried}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">P.O. Box</label>
          <input
            type="text"
            name="SpousePOBox"
            value={formData.SpousePOBox}
            onChange={handleInputChange}
            className="input"
            disabled={!formData.WorkerMarried}
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
            disabled={!formData.WorkerMarried}
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
            disabled={!formData.WorkerMarried}
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
            disabled={!formData.WorkerMarried}
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Other Dependants</h3>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="WorkerHaveDependants"
            checked={formData.WorkerHaveDependants}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Worker has other dependants
          </label>
        </div>

        {formData.WorkerHaveDependants && dependants.length > 0 && (
          <div className="space-y-4">
            {dependants.map((dependant, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{dependant.DependantFirstName} {dependant.DependantLastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <p className="mt-1 text-sm text-gray-900">{dependant.DependantType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(dependant.DependantDOB).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderWorkHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="GradualProcessInjury"
          checked={formData.GradualProcessInjury}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary border-gray-300 rounded"
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
                    {new Date(history.WorkerJoiningDate).toLocaleDateString()} - 
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
    </div>
  );

  const renderInsuranceDetails = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
        <select
          name="InsuranceProviderIPACode"
          value={formData.InsuranceProviderIPACode}
          onChange={handleInputChange}
          className="input"
          required
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
            />
          </div>
        </>
      )}
    </div>
  );

  const renderWeeklyPayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Weekly Payment Rate</label>
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
  );

  const renderForm11Scan = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Form 11 Scanned Image</label>
        <input
          type="file"
          name="ImageName"
          onChange={(e) => handleFileChange(e, 'ImageName')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Additional Form 11 Scan (Optional)</label>
        <input
          type="file"
          name="ImageName2"
          onChange={(e) => handleFileChange(e, 'ImageName2')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>
    </div>
  );

  const renderSupportingDocuments = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Note: Images attached here must be more than 5 KB and less than 500 KB.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interim medical report</label>
        <input
          type="file"
          name="IMR"
          onChange={(e) => handleFileChange(e, 'IMR')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Final medical report</label>
        <input
          type="file"
          name="FMR"
          onChange={(e) => handleFileChange(e, 'FMR')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Section 43 application form</label>
        <input
          type="file"
          name="SEC43"
          onChange={(e) => handleFileChange(e, 'SEC43')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Supervisor statement (letter head)</label>
        <input
          type="file"
          name="SS"
          onChange={(e) => handleFileChange(e, 'SS')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Witness statement</label>
        <input
          type="file"
          name="WS"
          onChange={(e) => handleFileChange(e, 'WS')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Injured worker's statement</label>
        <input
          type="file"
          name="IWS"
          onChange={(e) => handleFileChange(e, 'IWS')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Payslip at the time of accident</label>
        <input
          type="file"
          name="PTA"
          onChange={(e) => handleFileChange(e, 'PTA')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Treatment records</label>
        <input
          type="file"
          name="TR"
          onChange={(e) => handleFileChange(e, 'TR')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Police accident report (if Police matter)</label>
        <input
          type="file"
          name="PAR"
          onChange={(e) => handleFileChange(e, 'PAR')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 1:
        return renderWorkerPersonalDetails();
      case 2:
        return renderEmploymentDetails();
      case 3:
        return renderInjuryDetails();
      case 4:
        return renderDependantDetails();
      case 5:
        return renderWorkHistory();
      case 6:
        return renderInsuranceDetails();
      case 7:
        return renderWeeklyPayment();
      case 8:
        return renderForm11Scan();
      case 9:
        return renderSupportingDocuments();
      default:
        return null;
    }
  };

  const tabs = [
    'Worker Personal Details',
    'Details of Employment',
    'Details of Injury',
    'Details of Dependants',
    'Other Employment Details',
    'Insurance Details',
    'Weekly Payment',
    'Form11 Scan',
    'Supporting Documents'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">New Form 11</h2>
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Submit Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewForm11;
