import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const CenteredPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemLabel = 'items'
}) => {
  if (totalItems === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '28px',
        marginBottom: '60px',
        padding: '18px 24px',
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--neu-border-subtle)',
        boxShadow: 'var(--neu-extruded-sm)',
        gap: '12px'
      }}
    >
      {/* Centered Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--card-bg)',
            border: '1px solid var(--neu-border-subtle)',
            color: currentPage === 1 ? 'var(--text-subtle)' : 'var(--text-main)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentPage === 1 ? 0.35 : 1,
            boxShadow: 'var(--neu-extruded-xs)',
            transition: 'all 0.15s ease'
          }}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--card-bg)',
            border: '1px solid var(--neu-border-subtle)',
            color: currentPage === 1 ? 'var(--text-subtle)' : 'var(--text-main)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentPage === 1 ? 0.35 : 1,
            boxShadow: 'var(--neu-extruded-xs)',
            transition: 'all 0.15s ease'
          }}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page number indicators */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pNum = i + 1;
          if (totalPages > 5) {
            if (currentPage <= 3) {
              pNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pNum = totalPages - 4 + i;
            } else {
              pNum = currentPage - 2 + i;
            }
          }
          const isActive = currentPage === pNum;
          return (
            <button
              key={pNum}
              onClick={() => onPageChange(pNum)}
              style={{
                minWidth: '36px',
                height: '36px',
                padding: '0 12px',
                borderRadius: '10px',
                background: isActive ? 'var(--primary-blue)' : 'var(--card-bg)',
                border: '1px solid ' + (isActive ? 'var(--primary-blue)' : 'var(--neu-border-subtle)'),
                color: isActive ? '#fff' : 'var(--text-main)',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: isActive ? '0 4px 14px rgba(56, 189, 248, 0.4)' : 'var(--neu-extruded-xs)',
                transition: 'all 0.15s ease'
              }}
            >
              {pNum}
            </button>
          );
        })}

        <button
          disabled={currentPage === totalPages || totalItems === 0}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--card-bg)',
            border: '1px solid var(--neu-border-subtle)',
            color: currentPage === totalPages || totalItems === 0 ? 'var(--text-subtle)' : 'var(--text-main)',
            cursor: currentPage === totalPages || totalItems === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentPage === totalPages || totalItems === 0 ? 0.35 : 1,
            boxShadow: 'var(--neu-extruded-xs)',
            transition: 'all 0.15s ease'
          }}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>

        <button
          disabled={currentPage === totalPages || totalItems === 0}
          onClick={() => onPageChange(totalPages)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--card-bg)',
            border: '1px solid var(--neu-border-subtle)',
            color: currentPage === totalPages || totalItems === 0 ? 'var(--text-subtle)' : 'var(--text-main)',
            cursor: currentPage === totalPages || totalItems === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentPage === totalPages || totalItems === 0 ? 0.35 : 1,
            boxShadow: 'var(--neu-extruded-xs)',
            transition: 'all 0.15s ease'
          }}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      {/* Centered Showing Info Text */}
      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Showing{' '}
        <strong style={{ color: 'var(--text-main)' }}>
          {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        </strong>{' '}
        to{' '}
        <strong style={{ color: 'var(--text-main)' }}>
          {Math.min(currentPage * pageSize, totalItems)}
        </strong>{' '}
        of <strong style={{ color: 'var(--text-main)' }}>{totalItems}</strong> {itemLabel}
      </div>
    </div>
  );
};

export default CenteredPagination;
