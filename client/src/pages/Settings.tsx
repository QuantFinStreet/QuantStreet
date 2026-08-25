import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileJson, FileSpreadsheet, FileText, Download, Loader2, Wallet } from 'lucide-react';
import { exportProfile } from '../lib/api/settings';
import { ApiRequestError } from '../lib/api/client';
import { useFinancialData } from '../data/DataContext';
import { calculateNetWorth, formatINR } from '../lib/financial';
import type { ExportFormat } from '@fintech/shared';
import SectionCard from '../components/ui/SectionCard';
import AssetsManager from '../components/settings/AssetsManager';
import LiabilitiesManager from '../components/settings/LiabilitiesManager';

const EXPORT_OPTIONS: { format: ExportFormat; label: string; description: string; icon: React.ReactNode; extension: string; mime: string }[] = [
  { format: 'json', label: 'JSON', description: 'Full profile as structured data', icon: <FileJson size={20} />, extension: 'json', mime: 'application/json' },
  { format: 'csv', label: 'CSV', description: 'Spreadsheet-friendly, sectioned by entity', icon: <FileSpreadsheet size={20} />, extension: 'csv', mime: 'text/csv' },
  { format: 'pdf', label: 'PDF', description: 'Printable summary report', icon: <FileText size={20} />, extension: 'pdf', mime: 'application/pdf' },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const { profile } = useFinancialData();
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const { total: netWorth } = calculateNetWorth(profile);

  const handleExport = async (option: (typeof EXPORT_OPTIONS)[number]) => {
    setPendingFormat(option.format);
    try {
      const result = await exportProfile(option.format);
      const blob = result instanceof Blob ? result : new Blob([JSON.stringify(result, null, 2)], { type: option.mime });
      downloadBlob(blob, `financial-profile.${option.extension}`);
      toast.success(`${option.label} export ready.`);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : `Could not export as ${option.label}.`;
      toast.error(message);
    } finally {
      setPendingFormat(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }} className="animate-fade-in">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your holdings and export your financial data
        </p>
      </div>

      <div
        className="card animate-fade-in"
        style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-gold-muted), var(--accent-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Wallet size={18} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>
            Current Net Worth
          </p>
          <p className="numeric" style={{ fontSize: '1.4rem', fontWeight: 600, color: netWorth >= 0 ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>
            {formatINR(netWorth, true)}
          </p>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto', maxWidth: 280, textAlign: 'right' }}>
          Calculated from your assets and liabilities below — edit either to update it.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <AssetsManager />
        <LiabilitiesManager />
      </div>

      <SectionCard title="Export profile" subtitle={`${profile.name}'s full financial profile, generated fresh from the server`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {EXPORT_OPTIONS.map((option) => {
            const isPending = pendingFormat === option.format;
            return (
              <button
                key={option.format}
                type="button"
                onClick={() => handleExport(option)}
                disabled={pendingFormat !== null}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  cursor: pendingFormat !== null ? 'default' : 'pointer',
                  opacity: pendingFormat !== null && !isPending ? 0.5 : 1,
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-ui)' }}>
                  {isPending ? <Loader2 size={20} className="animate-spin" /> : option.icon}
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{option.label}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{option.description}</p>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-ui)', fontWeight: 600, marginTop: '0.25rem' }}>
                  <Download size={13} /> {isPending ? 'Exporting…' : 'Export'}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
