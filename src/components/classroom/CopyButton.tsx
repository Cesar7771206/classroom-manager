'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        color: copied ? '#10b981' : 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        marginLeft: '10px',
        borderRadius: '4px'
      }}
      title="Copiar Token"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};
