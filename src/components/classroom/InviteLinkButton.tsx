'use client';

import { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';

interface InviteLinkButtonProps {
  token: string;
}

export const InviteLinkButton = ({ token }: InviteLinkButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const inviteUrl = `${origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="btn-icon"
      style={{
        padding: '4px 8px',
        fontSize: '0.75rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: copied ? '#10b981' : 'var(--accent)',
        borderColor: copied ? '#10b981' : 'rgba(234, 179, 8, 0.2)',
        background: 'rgba(234, 179, 8, 0.05)',
        transition: 'all 0.2s',
        marginLeft: '8px'
      }}
      title="Copiar Link de Invitación"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      <span style={{ fontWeight: 700 }}>{copied ? '¡Copiado!' : 'Compartir Link'}</span>
    </button>
  );
};
