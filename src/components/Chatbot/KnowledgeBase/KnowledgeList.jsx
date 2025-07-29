import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de conocimientos
 * Maneja los diferentes estados y la vista de datos
 */
const KnowledgeList = ({
  knowledgeBase,
  loading,
  error,
  totalItems,
  onEdit,
  onDelete,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !knowledgeBase?.length) {
    return <LoadingStates.KnowledgeListLoading />;
  }

  // Si hay error
  if (error) {
    return <LoadingStates.ErrorState onRetry={onRetry} />;
  }

  // Si no hay datos
  if (!knowledgeBase?.length) {
    return <LoadingStates.EmptyState onCreateFirst={onCreateFirst} />;
  }

  // Función para manejar ordenamiento
  const handleSort = (field, direction) => {
    // Por ahora el ordenamiento se hace en el componente DataViewSwitcher
    // En el futuro podríamos llamar al backend para ordenamiento del servidor
    console.log(`Ordenando por ${field} en dirección ${direction}`);
  };

  return (
    <div className="space-y-6">
      <DataViewSwitcher
        data={knowledgeBase}
        onEdit={onEdit}
        onDelete={onDelete}
        onSort={handleSort}
      />
    </div>
  );
};

KnowledgeList.propTypes = {
  knowledgeBase: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
      keywords: PropTypes.string,
      is_active: PropTypes.bool,
      view_count: PropTypes.number,
      question_embedding: PropTypes.string,
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
      category: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        description: PropTypes.string
      })
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default KnowledgeList; 