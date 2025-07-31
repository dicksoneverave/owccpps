import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface NewForm12Props {
  workerId: string;
  onClose: () => void;
}

interface Form12Data {
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

  // Form12 Specific Fields
  DeathDate: string;
  DeathCause: string;
  DeathLocation: string;
  DeathProvince: string;
  DeathRegion: string;
  DeathRelatedToInjury: boolean;
  DeathCircumstances: string;
  
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
  DeathCertificate: string;
  PostMortemReport: string;
  PoliceReport: string;
  MedicalRecords: string;
  WitnessStatements: string;
  
  // System fields
  DisplayIRN: string;
  TimeBarred: boolean;
  FirstSubmissionDate: string;
  IncidentType: string;
}

const NewForm12: React.FC<NewForm12Props> = ({ workerId, onClose }) => {
  const [currentTab, setCurrentTab] = useState(1);
  const [formData, setFormData] = useState<Form12Data>({
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
    DeathDate: '',
    DeathCause: '',
    DeathLocation: '',
    DeathProvince: '',
    DeathRegion: '',
    DeathRelatedToInjury: false,
    DeathCircumstances: '',
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
    DeathCertificate: '',
    PostMortemReport: '',
    PoliceReport: '',
    MedicalRecords: '',
    WitnessStatements: '',
    DisplayIRN: '',
    TimeBarred: false,
    FirstSubmissionDate: new Date().toISOString(),
    IncidentType: 'Death'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<{ DValue: string }[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<any[]>([]);

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
          .select('DValue')
          .eq('DType', 'Province')
          .order('DValue');

        if (provinceError) throw provinceError;
        setProvinces(provinceData || []);

        // Fetch insurance providers
        const { data: insuranceData, error: insuranceError } = await supabase
          .from('insurancecompanymaster')
          .select('*');

        if (insuranceError) throw insuranceError;
        setInsuranceProviders(insuranceData || []);

        // Update form data with fetched details
        setFormData(prev => ({
          ...prev,
          ...workerData,
          ...employmentData
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
      // Check if death date is more than 365 days old
      const deathDate = new Date(formData.DeathDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24));
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
            TBCRRFormType: 'Form12',
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
            PRHFormType: 'Form12',
            PRHDecisionReason: 'Automatically Approved'
          }]);

        if (prescreeningError) throw prescreeningError;
      }

      // Save form attachments
      const attachments = [
        { type: 'Death Certificate', file: formData.DeathCertificate },
        { type: 'Post Mortem Report', file: formData.PostMortemReport },
        { type: 'Police Report', file: formData.PoliceReport },
        { type: 'Medical Records', file: formData.MedicalRecords },
        { type: 'Witness Statements', file: formData.WitnessStatements }
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

  const renderDeathDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Death</label>
          <input
            type="date"
            name="DeathDate"
            value={formData.DeathDate}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location of Death</label>
          <input
            type="text"
            name="DeathLocation"
            value={formData.DeathLocation}
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
            name="DeathProvince"
            value={formData.DeathProvince}
            onChange={handleInputChange}
            className="input"
            required
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
            name="DeathRegion"
            value={formData.DeathRegion}
            onChange={handleInputChange}
            className="input"
            readOnly
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cause of Death</label>
        <textarea
          name="DeathCause"
          value={formData.DeathCause}
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
            name="DeathRelatedToInjury"
            checked={formData.DeathRelatedToInjury}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Death Related to Work Injury
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Circumstances of Death</label>
        <textarea
          name="DeathCircumstances"
          value={formData.DeathCircumstances}
          onChange={handleInputChange}
          className="input"
          rows={4}
          required
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

  const renderForm12Scan = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Form 12 Scanned Image</label>
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
        <label className="block text-sm font-medium text-gray-700">Additional Form 12 Scan (Optional)</label>
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
        <label className="block text-sm font-medium text-gray-700">Death Certificate</label>
        <input
          type="file"
          name="DeathCertificate"
          onChange={(e) => handleFileChange(e, 'DeathCertificate')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Post Mortem Report</label>
        <input
          type="file"
          name="PostMortemReport"
          onChange={(e) => handleFileChange(e, 'PostMortemReport')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Police Report</label>
        <input
          type="file"
          name="PoliceReport"
          onChange={(e) => handleFileChange(e, 'PoliceReport')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Medical Records</label>
        <input
          type="file"
          name="MedicalRecords"
          onChange={(e) => handleFileChange(e, 'MedicalRecords')}
          className="input"
          accept=".png,.jpg,.pdf,.jpeg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Witness Statements</label>
        
        
        <input
          type="file"
          name="WitnessStatements"
          onChange={(e) => handleFileChange(e, 'WitnessStatements')}
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
        return renderDeathDetails();
      case 4:
        return renderInsuranceDetails();
      case 5:
        return renderForm12Scan();
      case 6:
        return renderSupportingDocuments();
      default:
        return null;
    }
  };

  const tabs = [
    'Worker Personal Details',
    'Details of Employment',
    'Details of Death',
    'Insurance Details',
    'Form12 Scan',
    'Supporting Documents'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">New Form 12</h2>
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

export default NewForm12;
