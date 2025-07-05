import React from 'react';
import Modal from '../common/Modal.jsx';
import MedicalRecordForm from './MedicalRecordForm';
import { useCreateMedicalRecord } from '../../hooks/medical/useCreateMedicalRecord';
import { useUpdateMedicalRecord } from '../../hooks/medical/useUpdateMedicalRecord';

const MedicalRecordFormModal = ({ isOpen, onClose, appointmentId, record = null }) => {
  const isEditing = !!record;
  const { mutate: createRecord, isLoading: isCreating } = useCreateMedicalRecord();
  const { mutate: updateRecord, isLoading: isUpdating } = useUpdateMedicalRecord();

  const handleSave = (data) => {
    const payload = { ...data };
    if (appointmentId && !payload.appointment) {
      payload.appointment = appointmentId;
    }

    const onSaveSuccess = () => {
      onClose();
    };

    if (isEditing) {
      updateRecord({ id: record.id, recordData: payload }, {
        onSuccess: onSaveSuccess,
      });
    } else {
      createRecord(payload, {
        onSuccess: onSaveSuccess,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <MedicalRecordForm
        record={record}
        appointmentId={appointmentId}
        onSave={handleSave}
        onCancel={onClose}
        isLoading={isCreating || isUpdating}
      />
    </Modal>
  );
};

export default MedicalRecordFormModal; 