'use client';

import { Presentation, Users, Check, Share2, Clipboard, MapPin, Calendar, User } from 'lucide-react';
import styles from '@/app/invite/[token]/invite.module.css';
import { useState, useEffect } from 'react';

interface InviteCardProps {
  classroomName: string;
  delegadoName: string;
  university?: string;
  period?: string;
  studentCount: number;
  token: string;
  isPreview?: boolean;
  children?: React.ReactNode;
}

export const InviteCard = ({ 
  classroomName, 
  delegadoName, 
  university,
  period,
  studentCount, 
  token, 
  isPreview = false,
  children
}: InviteCardProps) => {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopyLink = () => {
    const url = `${origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.card} style={isPreview ? { padding: '1.5rem' } : {}}>
      <div className={styles.logoWrapper} style={isPreview ? { width: '80px', height: '80px', marginBottom: '1rem' } : {}}>
        <Presentation size={isPreview ? 40 : 48} className={styles.icon} />
      </div>
      
      <p className={styles.inviteLabel}>Te han invitado a unirte</p>
      
      <h1 className={styles.title} style={isPreview ? { fontSize: '1.5rem', marginBottom: '1.5rem' } : {}}>
        {classroomName}
      </h1>
      
      <div className={styles.stats} style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
        {university && (
          <div className={styles.statItem}>
            <MapPin size={16} />
            <span>{university}</span>
          </div>
        )}
        {period && (
          <div className={styles.statItem}>
            <Calendar size={16} />
            <span>{period}</span>
          </div>
        )}
        <div className={styles.statItem}>
          <User size={16} />
          <span>Delegado: {delegadoName}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {children}
      </div>
    </div>
  );
};
