'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X, Check } from 'lucide-react';
import { InviteCard } from './InviteCard';

interface InvitePreviewModalProps {
  classroom: any;
  delegadoName: string;
}

export function InvitePreviewModal({ classroom, delegadoName }: InvitePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(!isOpen);
    
    // Bloquear scroll
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.92)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(10px)',
      padding: '20px'
    }}
    onClick={toggleModal}
    >
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          position: 'relative',
          animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
           <span style={{ 
             color: 'var(--accent)', 
             fontSize: '0.75rem', 
             fontWeight: 800, 
             textTransform: 'uppercase', 
             letterSpacing: '0.15em' 
           }}>
             Vista Previa
           </span>
           <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0' }}>Invitación al Docente</h2>
        </div>

        <InviteCard 
          classroomName={classroom.name}
          delegadoName={delegadoName}
          university={classroom.university}
          period={`${classroom.period_year} • ${classroom.period_month}`}
          studentCount={classroom.students?.length || 0}
          token={classroom.access_token}
          isPreview={true}
        >
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const origin = window.location.origin;
              const url = `${origin}/invite/${classroom.access_token}`;
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }} 
            style={{ 
              width: '100%',
              padding: '1.25rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: copied ? '#10b981' : 'var(--accent)',
              color: 'black',
              fontWeight: 950,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(234, 179, 8, 0.3)',
              transition: 'all 0.2s',
              textTransform: 'uppercase'
            }}
          >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            {copied ? '¡ENLACE COPIADO!' : 'COPIAR LINK'}
          </button>
        </InviteCard>

        <button 
          onClick={toggleModal}
          style={{ 
            marginTop: '2rem',
            background: 'rgba(255,255,255,0.08)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            color: 'white', 
            cursor: 'pointer',
            padding: '0.8rem 1.8rem',
            borderRadius: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <X size={16} />
          Cerrar Vista Previa
        </button>
        
        <style jsx global>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.92) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={toggleModal}
        className="btn-icon"
        style={{
          padding: '6px 12px',
          fontSize: '0.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--accent)',
          borderColor: 'rgba(234, 179, 8, 0.3)',
          background: 'rgba(234, 179, 8, 0.05)',
          transition: 'all 0.2s',
          borderRadius: 'var(--radius-md)'
        }}
        title="Compartir Invitación"
      >
        <Share2 size={14} />
        <span style={{ fontWeight: 700 }}>Compartir</span>
      </button>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
