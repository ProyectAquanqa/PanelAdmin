import React, { useState } from 'react';
import PaymentTable from '../../components/payments/PaymentTable';
import PaymentDetailsModal from '../../components/payments/PaymentDetailsModal';

const PaymentListPage = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Pagos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Listado de todos los pagos registrados en el sistema.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <PaymentTable onViewDetails={handleViewDetails} />
      </div>
      
      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        paymentId={selectedPaymentId}
      />
    </div>
  );
};

export default PaymentListPage; 