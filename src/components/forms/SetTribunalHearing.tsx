import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface SetTribunalHearingProps {
  irn?: string;
  onClose: () => void;
}

interface FormData {
  THSHHearingRef: string;
  THSHFromDate: string;
  THSHToDate: string;
  THSHTribunalChair: string;
  THSHClaimantRep1: string;
  THSHClaimantRep2: string;
  THSHStateRep1: string;
  THSHStateRep2: string;
  THSHStateRep3: string;
  THSHObserver1: string;
  THSHObserver2: string;
  THSHTribunal1: string;
  THSHTribunal2: string;
  THSHTribunal3: string;
  THSHOfficerAssistTribunal1: string;
  THSHOfficerAssistTribunal2: string;
  THSHVenue: string;
  THSHLocation: string;
  THSHStatus: string;
  THSHID?: string;
}

const SetTribunalHearing: React.FC<SetTribunalHearingProps> = ({ irn, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    THSHHearingRef: '',
    THSHFromDate: '',
    THSHToDate: '',
    THSHTribunalChair: 'Chris Kolias',
    THSHClaimantRep1: '',
    THSHClaimantRep2: '',
    THSHStateRep1: '',
    THSHStateRep2: '',
    THSHStateRep3: '',
    THSHObserver1: '',
    THSHObserver2: '',
    THSHTribunal1: '',
    THSHTribunal2: '',
    THSHTribunal3: '',
    THSHOfficerAssistTribunal1: '',
    THSHOfficerAssistTribunal2: '',
    THSHVenue: '',
    THSHLocation: '',
    THSHStatus: 'Open'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimDetails, setClaimDetails] = useState<any>(null);

  useEffect(() => {
    if (irn) {
      fetchHearingDetails();
      fetchClaimDetails();
    }
  }, [irn]);

  const fetchHearingDetails = async () => {
    if (!irn) return;

    try {
      setLoading(true);
      
      // Check if there's an existing hearing record
      const { data, error } = await supabase
        .from('tribunalhearingsethearing')
        .select('*')
        .eq('THSHID', irn)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Existing record found, populate the form
        setFormData({
          THSHHearingRef: data.THSHHearingRef || '',
          THSHFromDate: data.THSHFromDate ? new Date(data.THSHFromDate).toISOString().split('T')[0] : '',
          THSHToDate: data.THSHToDate ? new Date(data.THSHToDate).toISOString().split('T')[0] : '',
          THSHTribunalChair: data.THSHTribunalChair || 'Chris Kolias',
          THSHClaimantRep1: data.THSHClaimantRep1 || '',
          THSHClaimantRep2: data.THSHClaimantRep2 || '',
          THSHStateRep1: data.THSHStateRep1 || '',
          THSHStateRep2: data.THSHStateRep2 || '',
          THSHStateRep3: data.THSHStateRep3 || '',
          THSHObserver1: data.THSHObserver1 || '',
          THSHObserver2: data.THSHObserver2 || '',
          THSHTribunal1: data.THSHTribunal1 || '',
          THSHTribunal2: data.THSHTribunal2 || '',
          THSHTribunal3: data.THSHTribunal3 || '',
          THSHOfficerAssistTribunal1: data.THSHOfficerAssistTribunal1 || '',
          THSHOfficerAssistTribunal2: data.THSHOfficerAssistTribunal2 || '',
          THSHVenue: data.THSHVenue || '',
          THSHLocation: data.THSHLocation || '',
          THSHStatus: data.THSHStatus || 'Open',
          THSHID: data.THSHID
        });
      }
    } catch (err) {
      console.error('Error fetching hearing details:', err);
      setError('Failed to load hearing details');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimDetails = async () => {
    if (!irn) return;

    try {
      // Get claim details from form1112master
      const { data: claimData, error: claimError } = await supabase
        .from('form1112master')
        .select(`
          DisplayIRN,
          IncidentType,
          WorkerID,
          workerpersonaldetails (
            WorkerFirstName,
            WorkerLastName
          )
        `)
        .eq('IRN', irn)
        .single();

      if (claimError) throw claimError;

      setClaimDetails(claimData);
    } catch (err) {
      console.error('Error fetching claim details:', err);
      // Don't set error state here to avoid blocking the form
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      // Validate required fields
      if (!formData.THSHFromDate || !formData.THSHToDate || !formData.THSHTribunalChair || 
          !formData.THSHClaimantRep1 || !formData.THSHStateRep1 || !formData.THSHObserver1 || 
          !formData.THSHTribunal1 || !formData.THSHOfficerAssistTribunal1) {
        setError('Please fill in all required fields');
        return;
      }

      // Check if we're updating or creating
      if (formData.THSHID) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('tribunalhearingsethearing')
          .update({
            THSHHearingRef: formData.THSHHearingRef,
            THSHFromDate: formData.THSHFromDate,
            THSHToDate: formData.THSHToDate,
            THSHTribunalChair: formData.THSHTribunalChair,
            THSHClaimantRep1: formData.THSHClaimantRep1,
            THSHClaimantRep2: formData.THSHClaimantRep2,
            THSHStateRep1: formData.THSHStateRep1,
            THSHStateRep2: formData.THSHStateRep2,
            THSHStateRep3: formData.THSHStateRep3,
            THSHObserver1: formData.THSHObserver1,
            THSHObserver2: formData.THSHObserver2,
            THSHTribunal1: formData.THSHTribunal1,
            THSHTribunal2: formData.THSHTribunal2,
            THSHTribunal3: formData.THSHTribunal3,
            THSHOfficerAssistTribunal1: formData.THSHOfficerAssistTribunal1,
            THSHOfficerAssistTribunal2: formData.THSHOfficerAssistTribunal2,
            THSHVenue: formData.THSHVenue,
            THSHLocation: formData.THSHLocation,
            THSHStatus: formData.THSHStatus
          })
          .eq('THSHID', formData.THSHID);

        if (updateError) throw updateError;
        setSuccess('Hearing details updated successfully');
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('tribunalhearingsethearing')
          .insert({
            THSHID: irn,
            THSHHearingRef: formData.THSHHearingRef,
            THSHFromDate: formData.THSHFromDate,
            THSHToDate: formData.THSHToDate,
            THSHTribunalChair: formData.THSHTribunalChair,
            THSHClaimantRep1: formData.THSHClaimantRep1,
            THSHClaimantRep2: formData.THSHClaimantRep2,
            THSHStateRep1: formData.THSHStateRep1,
            THSHStateRep2: formData.THSHStateRep2,
            THSHStateRep3: formData.THSHStateRep3,
            THSHObserver1: formData.THSHObserver1,
            THSHObserver2: formData.THSHObserver2,
            THSHTribunal1: formData.THSHTribunal1,
            THSHTribunal2: formData.THSHTribunal2,
            THSHTribunal3: formData.THSHTribunal3,
            THSHOfficerAssistTribunal1: formData.THSHOfficerAssistTribunal1,
            THSHOfficerAssistTribunal2: formData.THSHOfficerAssistTribunal2,
            THSHVenue: formData.THSHVenue,
            THSHLocation: formData.THSHLocation,
            THSHStatus: formData.THSHStatus
          });

        if (insertError) throw insertError;
        
        // Update the tribunalhearingschedule record to set THSSetForHearing to 'Yes'
        if (irn) {
          const { error: updateError } = await supabase
            .from('tribunalhearingschedule')
            .update({ THSSetForHearing: 'Yes' })
            .eq('IRN', irn);
            
          if (updateError) {
            console.error('Error updating hearing schedule:', updateError);
            // Continue anyway as the main record was created
          }
        }
        
        setSuccess('Hearing details saved successfully');
      }

      // Close the form after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error saving hearing details:', err);
      setError(err.message || 'Failed to save hearing details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Set Tribunal Hearing
            {claimDetails && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                {claimDetails.DisplayIRN} - {claimDetails.workerpersonaldetails?.WorkerFirstName} {claimDetails.workerpersonaldetails?.WorkerLastName}
              </span>
            )}
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

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold text-primary mb-4">Set Details for the Hearing</h3>
            <hr className="mb-6" />

            <div className="mb-6">
              <label htmlFor="THSHHearingRef" className="block text-sm font-medium text-gray-700 mb-1">
                Hearing Reference (If Any)
              </label>
              <input
                type="text"
                id="THSHHearingRef"
                name="THSHHearingRef"
                value={formData.THSHHearingRef}
                onChange={handleInputChange}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="THSHFromDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing From (Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="THSHFromDate"
                  name="THSHFromDate"
                  value={formData.THSHFromDate}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="THSHToDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing To (Date) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="THSHToDate"
                  name="THSHToDate"
                  value={formData.THSHToDate}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="THSHTribunalChair" className="block text-sm font-medium text-gray-700 mb-1">
                Tribunal Chair <span className="text-red-500">*</span>
              </label>
              <select
                id="THSHTribunalChair"
                name="THSHTribunalChair"
                value={formData.THSHTribunalChair}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="Chris Kolias">Chris Kolias</option>
                <option value="Martin Pala">Martin Pala</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="THSHClaimantRep1" className="block text-sm font-medium text-gray-700 mb-1">
                  Tribunal Claimant Representative <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="THSHClaimantRep1"
                  name="THSHClaimantRep1"
                  value={formData.THSHClaimantRep1}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="THSHClaimantRep2" className="block text-sm font-medium text-gray-700 mb-1">
                  Tribunal Claimant Representative
                </label>
                <input
                  type="text"
                  id="THSHClaimantRep2"
                  name="THSHClaimantRep2"
                  value={formData.THSHClaimantRep2}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="THSHStateRep1" className="block text-sm font-medium text-gray-700 mb-1">
                  State Representative <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="THSHStateRep1"
                  name="THSHStateRep1"
                  value={formData.THSHStateRep1}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="THSHStateRep2" className="block text-sm font-medium text-gray-700 mb-1">
                  State Representative
                </label>
                <input
                  type="text"
                  id="THSHStateRep2"
                  name="THSHStateRep2"
                  value={formData.THSHStateRep2}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="THSHStateRep3" className="block text-sm font-medium text-gray-700 mb-1">
                  State Representative
                </label>
                <input
                  type="text"
                  id="THSHStateRep3"
                  name="THSHStateRep3"
                  value={formData.THSHStateRep3}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="THSHObserver1" className="block text-sm font-medium text-gray-700 mb-1">
                  Observer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="THSHObserver1"
                  name="THSHObserver1"
                  value={formData.THSHObserver1}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="THSHObserver2" className="block text-sm font-medium text-gray-700 mb-1">
                  Observer
                </label>
                <input
                  type="text"
                  id="THSHObserver2"
                  name="THSHObserver2"
                  value={formData.THSHObserver2}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="THSHTribunal1" className="block text-sm font-medium text-gray-700 mb-1">
                  Tribunal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="THSHTribunal1"
                  name="THSHTribunal1"
                  value={formData.THSHTribunal1}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="THSHTribunal2" className="block text-sm font-medium text-gray-700 mb-1">
                  Tribunal
                </label>
                <input
                  type="text"
                  id="THSHTribunal2"
                  name="THSHTribunal2"
                  value={formData.THSHTribunal2}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="THSHTribunal3" className="block text-sm font-medium text-gray-700 mb-1">
                  Tribunal
                </label>
                <input
                  type="text"
                  id="THSHTribunal3"
                  name="THSHTribunal3"
                  value={formData.THSHTribunal3}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="THSHOfficerAssistTribunal1" className="block text-sm font-medium text-gray-700 mb-1">
                  Officer assisting the tribunal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="THSHOfficerAssistTribunal1"
                  name="THSHOfficerAssistTribunal1"
                  value={formData.THSHOfficerAssistTribunal1}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="THSHOfficerAssistTribunal2" className="block text-sm font-medium text-gray-700 mb-1">
                  Officer assisting the tribunal
                </label>
                <input
                  type="text"
                  id="THSHOfficerAssistTribunal2"
                  name="THSHOfficerAssistTribunal2"
                  value={formData.THSHOfficerAssistTribunal2}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="THSHVenue" className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing Venue
                </label>
                <input
                  type="text"
                  id="THSHVenue"
                  name="THSHVenue"
                  value={formData.THSHVenue}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="THSHLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Hearing held location
                </label>
                <input
                  type="text"
                  id="THSHLocation"
                  name="THSHLocation"
                  value={formData.THSHLocation}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="THSHStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Hearing Status
              </label>
              <select
                id="THSHStatus"
                name="THSHStatus"
                value={formData.THSHStatus}
                onChange={handleInputChange}
                className="input"
              >
                <option value="Open">Hearing Pending</option>
                <option value="Close">Hearing Completed</option>
              </select>
            </div>

            <hr className="mb-6" />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Set Hearing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetTribunalHearing;
