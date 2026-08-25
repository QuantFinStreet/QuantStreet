import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { Liability, LiabilityInput, LoanType } from '@fintech/shared';
import { useFinancialData } from '../../data/DataContext';
import { createLiability, updateLiability, deleteLiability } from '../../lib/api/profile';
import { ApiRequestError } from '../../lib/api/client';
import { formatINR } from '../../lib/financial';
import SectionCard from '../ui/SectionCard';

const TYPE_OPTIONS: { value: LoanType; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'car', label: 'Car' },
  { value: 'personal', label: 'Personal' },
  { value: 'education', label: 'Education' },
];

const TYPE_LABELS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label])) as Record<LoanType, string>;

const EMPTY_FORM: LiabilityInput = {
  name: '',
  type: 'personal',
  outstandingAmount: 0,
  originalAmount: 0,
  interestRate: 10,
  monthlyEMI: 0,
  remainingMonths: 12,
  startDate: new Date().toISOString().slice(0, 10),
};

function labeled(label: string, children: React.ReactNode) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </div>
  );
}

function LiabilityForm({
  initial,
  onCancel,
  onSave,
  saving,
}: {
  initial: LiabilityInput;
  onCancel: () => void;
  onSave: (input: LiabilityInput) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<LiabilityInput>(initial);
  const inputStyle: React.CSSProperties = { fontSize: '0.82rem', padding: '0.4rem 0.6rem' };

  return (
    <tr style={{ background: 'var(--bg-elevated)' }}>
      <td colSpan={5} style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {labeled('Name', (
            <input className="input-base" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Home Loan — HDFC" />
          ))}
          {labeled('Type', (
            <select className="input-base" style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LoanType })}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {labeled('Outstanding (₹)', (
            <input type="number" className="input-base" style={inputStyle} value={form.outstandingAmount} onChange={(e) => setForm({ ...form, outstandingAmount: Number(e.target.value) })} />
          ))}
          {labeled('Original Amount (₹)', (
            <input type="number" className="input-base" style={inputStyle} value={form.originalAmount} onChange={(e) => setForm({ ...form, originalAmount: Number(e.target.value) })} />
          ))}
          {labeled('Interest Rate (%)', (
            <input type="number" step="0.1" className="input-base" style={inputStyle} value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: Number(e.target.value) })} />
          ))}
          {labeled('Monthly EMI (₹)', (
            <input type="number" className="input-base" style={inputStyle} value={form.monthlyEMI} onChange={(e) => setForm({ ...form, monthlyEMI: Number(e.target.value) })} />
          ))}
          {labeled('Remaining Months', (
            <input type="number" className="input-base" style={inputStyle} value={form.remainingMonths} onChange={(e) => setForm({ ...form, remainingMonths: Number(e.target.value) })} />
          ))}
          {labeled('Start Date', (
            <input type="date" className="input-base" style={inputStyle} value={form.startDate.slice(0, 10)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-gold" style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} disabled={saving || !form.name.trim()} onClick={() => onSave(form)}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
          </button>
          <button type="button" className="btn-ghost" style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={onCancel} disabled={saving}>
            <X size={14} /> Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function LiabilitiesManager() {
  const { profile, refreshProfile } = useFinancialData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleCreate = async (input: LiabilityInput) => {
    setSavingId('new');
    try {
      await createLiability(input);
      await refreshProfile();
      setIsAdding(false);
      toast.success('Liability added.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not add liability.');
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdate = async (id: string, input: LiabilityInput) => {
    setSavingId(id);
    try {
      await updateLiability(id, input);
      await refreshProfile();
      setEditingId(null);
      toast.success('Liability updated.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not update liability.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteLiability(id);
      await refreshProfile();
      toast.success('Liability removed.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not remove liability.');
    } finally {
      setDeletingId(null);
      setConfirmingDeleteId(null);
    }
  };

  return (
    <SectionCard
      title="Liabilities"
      subtitle={`${profile.liabilities.length} active`}
      noPadding
      actions={
        !isAdding && (
          <button type="button" className="btn-ghost" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Add Liability
          </button>
        )
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Name', 'Type', 'Outstanding', 'Monthly EMI', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profile.liabilities.map((liability: Liability) =>
              editingId === liability.id ? (
                <LiabilityForm
                  key={liability.id}
                  initial={{
                    name: liability.name,
                    type: liability.type,
                    outstandingAmount: liability.outstandingAmount,
                    originalAmount: liability.originalAmount,
                    interestRate: liability.interestRate,
                    monthlyEMI: liability.monthlyEMI,
                    remainingMonths: liability.remainingMonths,
                    startDate: liability.startDate,
                  }}
                  saving={savingId === liability.id}
                  onCancel={() => setEditingId(null)}
                  onSave={(input) => handleUpdate(liability.id, input)}
                />
              ) : (
                <tr key={liability.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{liability.name}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge badge-amethyst" style={{ fontSize: '0.66rem' }}>{TYPE_LABELS[liability.type]}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--danger)', whiteSpace: 'nowrap' }}>{formatINR(liability.outstandingAmount, true)}</td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatINR(liability.monthlyEMI, true)}/mo</td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    {confirmingDeleteId === liability.id ? (
                      <>
                        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginRight: '0.5rem' }}>Delete?</span>
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ padding: '0.35rem', color: 'var(--danger)' }}
                          onClick={() => handleDelete(liability.id)}
                          disabled={deletingId === liability.id}
                          aria-label="Confirm delete"
                        >
                          {deletingId === liability.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button type="button" className="btn-ghost" style={{ padding: '0.35rem' }} onClick={() => setConfirmingDeleteId(null)} aria-label="Cancel delete">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn-ghost" style={{ padding: '0.35rem', marginRight: '0.35rem' }} onClick={() => setEditingId(liability.id)} aria-label={`Edit ${liability.name}`}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="btn-ghost" style={{ padding: '0.35rem' }} onClick={() => setConfirmingDeleteId(liability.id)} aria-label={`Delete ${liability.name}`}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            )}
            {isAdding && (
              <LiabilityForm
                initial={EMPTY_FORM}
                saving={savingId === 'new'}
                onCancel={() => setIsAdding(false)}
                onSave={handleCreate}
              />
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
