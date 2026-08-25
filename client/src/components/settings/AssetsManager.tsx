import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { Asset, AssetCategory, AssetInput } from '@fintech/shared';
import { useFinancialData } from '../../data/DataContext';
import { createAsset, updateAsset, deleteAsset } from '../../lib/api/profile';
import { ApiRequestError } from '../../lib/api/client';
import { formatINR } from '../../lib/financial';
import SectionCard from '../ui/SectionCard';

const CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = [
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'stock', label: 'Stock' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
  { value: 'gold', label: 'Gold' },
  { value: 'ppf', label: 'PPF' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'savings', label: 'Savings' },
  { value: 'crypto', label: 'Crypto' },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label])) as Record<AssetCategory, string>;

const EMPTY_FORM: AssetInput = {
  name: '',
  category: 'savings',
  currentValue: 0,
  purchaseValue: 0,
  lastUpdated: new Date().toISOString().slice(0, 10),
};

function AssetForm({
  initial,
  onCancel,
  onSave,
  saving,
}: {
  initial: AssetInput;
  onCancel: () => void;
  onSave: (input: AssetInput) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AssetInput>(initial);

  return (
    <tr style={{ background: 'var(--bg-elevated)' }}>
      <td style={{ padding: '0.6rem 1rem' }}>
        <input
          className="input-base"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. HDFC Flexi Cap Fund"
        />
      </td>
      <td style={{ padding: '0.6rem 1rem' }}>
        <select
          className="input-base"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '0.6rem 1rem' }}>
        <input
          type="number"
          className="input-base"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem', width: 120 }}
          value={form.currentValue}
          onChange={(e) => setForm({ ...form, currentValue: Number(e.target.value) })}
        />
      </td>
      <td style={{ padding: '0.6rem 1rem' }}>
        <input
          type="number"
          className="input-base"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem', width: 120 }}
          value={form.purchaseValue}
          onChange={(e) => setForm({ ...form, purchaseValue: Number(e.target.value) })}
        />
      </td>
      <td style={{ padding: '0.6rem 1rem', whiteSpace: 'nowrap' }}>
        <button
          type="button"
          className="btn-gold"
          style={{ padding: '0.4rem', marginRight: '0.4rem' }}
          disabled={saving || !form.name.trim()}
          onClick={() => onSave(form)}
          aria-label="Save"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        </button>
        <button type="button" className="btn-ghost" style={{ padding: '0.4rem' }} onClick={onCancel} disabled={saving} aria-label="Cancel">
          <X size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function AssetsManager() {
  const { profile, refreshProfile } = useFinancialData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleCreate = async (input: AssetInput) => {
    setSavingId('new');
    try {
      await createAsset(input);
      await refreshProfile();
      setIsAdding(false);
      toast.success('Asset added.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not add asset.');
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdate = async (id: string, input: AssetInput) => {
    setSavingId(id);
    try {
      await updateAsset(id, input);
      await refreshProfile();
      setEditingId(null);
      toast.success('Asset updated.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not update asset.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAsset(id);
      await refreshProfile();
      toast.success('Asset removed.');
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'Could not remove asset.');
    } finally {
      setDeletingId(null);
      setConfirmingDeleteId(null);
    }
  };

  return (
    <SectionCard
      title="Assets"
      subtitle={`${profile.assets.length} holdings`}
      noPadding
      actions={
        !isAdding && (
          <button type="button" className="btn-ghost" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Add Asset
          </button>
        )
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Name', 'Category', 'Current Value', 'Purchase Value', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profile.assets.map((asset: Asset) =>
              editingId === asset.id ? (
                <AssetForm
                  key={asset.id}
                  initial={{ name: asset.name, category: asset.category, currentValue: asset.currentValue, purchaseValue: asset.purchaseValue, lastUpdated: asset.lastUpdated }}
                  saving={savingId === asset.id}
                  onCancel={() => setEditingId(null)}
                  onSave={(input) => handleUpdate(asset.id, input)}
                />
              ) : (
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{asset.name}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge badge-amethyst" style={{ fontSize: '0.66rem' }}>{CATEGORY_LABELS[asset.category]}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-ui)', whiteSpace: 'nowrap' }}>{formatINR(asset.currentValue, true)}</td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatINR(asset.purchaseValue, true)}</td>
                  <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                    {confirmingDeleteId === asset.id ? (
                      <>
                        <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginRight: '0.5rem' }}>Delete?</span>
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ padding: '0.35rem', color: 'var(--danger)' }}
                          onClick={() => handleDelete(asset.id)}
                          disabled={deletingId === asset.id}
                          aria-label="Confirm delete"
                        >
                          {deletingId === asset.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button type="button" className="btn-ghost" style={{ padding: '0.35rem' }} onClick={() => setConfirmingDeleteId(null)} aria-label="Cancel delete">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn-ghost" style={{ padding: '0.35rem', marginRight: '0.35rem' }} onClick={() => setEditingId(asset.id)} aria-label={`Edit ${asset.name}`}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="btn-ghost" style={{ padding: '0.35rem' }} onClick={() => setConfirmingDeleteId(asset.id)} aria-label={`Delete ${asset.name}`}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            )}
            {isAdding && (
              <AssetForm
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
