import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { formatINR, getDTIHealth } from '../lib/financial';
import { calculateLoan } from '../lib/api/loan';
import { ApiRequestError } from '../lib/api/client';
import type { LoanResult, LoanType } from '@fintech/shared';
import SectionCard from '../components/ui/SectionCard';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const loanSchema = z.object({
  loanType: z.enum(['home', 'car', 'personal', 'education'] as const),
  amount: z
    .number()
    .min(10000, 'Minimum loan amount is ₹10,000')
    .max(100_000_000, 'Maximum ₹10 Crore'),
  interestRate: z
    .number()
    .min(1, 'Minimum 1%')
    .max(36, 'Maximum 36%'),
  tenureMonths: z
    .number()
    .int()
    .min(6, 'Minimum 6 months')
    .max(360, 'Maximum 30 years'),
});

type LoanFormData = z.infer<typeof loanSchema>;

const LOAN_DEFAULTS: Record<LoanType, { rate: number; tenure: number; max: number }> = {
  home:      { rate: 8.5,  tenure: 240, max: 10_000_000 },
  car:       { rate: 9.2,  tenure: 60,  max: 2_000_000 },
  personal:  { rate: 12.5, tenure: 48,  max: 1_500_000 },
  education: { rate: 10.5, tenure: 84,  max: 2_500_000 },
};

const LOAN_ICONS: Record<LoanType, string> = {
  home: '🏠', car: '🚗', personal: '💳', education: '🎓',
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={12} />{msg}</p>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>{children}</label>;
}

export default function LoanCalculator() {
  const [selectedType, setSelectedType] = useState<LoanType>('home');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loanType:     'home',
      amount:       5_000_000,
      interestRate: 8.5,
      tenureMonths: 240,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();
  const { amount, interestRate, tenureMonths } = watchedValues;

  // Debounced call to the server, which owns the eligibility/EMI math
  // against the authoritative profile — this component just renders it.
  useEffect(() => {
    if (!amount || !interestRate || !tenureMonths) {
      setResult(null);
      return;
    }
    if (amount < 10000 || interestRate < 1 || tenureMonths < 6) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsCalculating(true);
      setCalcError(null);
      calculateLoan({
        type: selectedType,
        amount,
        annualInterestRate: interestRate,
        tenureMonths,
      })
        .then((res) => {
          if (!cancelled) setResult(res);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setResult(null);
          setCalcError(err instanceof ApiRequestError ? err.message : 'Could not reach the server to calculate this loan.');
        })
        .finally(() => {
          if (!cancelled) setIsCalculating(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amount, interestRate, tenureMonths, selectedType]);

  const handleTypeSelect = (type: LoanType) => {
    setSelectedType(type);
    setValue('loanType', type);
    setValue('interestRate', LOAN_DEFAULTS[type].rate);
    setValue('tenureMonths', LOAN_DEFAULTS[type].tenure);
  };

  const riskColors = {
    low:       'var(--success)',
    medium:    'var(--accent-gold)',
    high:      'var(--warning)',
    very_high: 'var(--danger)',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }} className="animate-fade-in">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
          Loan Calculator
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Simulate any loan scenario and check your eligibility instantly
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Loan Type Selector */}
          <SectionCard title="Loan Type" className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {(['home', 'car', 'personal', 'education'] as LoanType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  id={`loan-type-${type}`}
                  onClick={() => handleTypeSelect(type)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: 12,
                    border: `1px solid ${selectedType === type ? 'var(--accent-gold-muted)' : 'var(--border-subtle)'}`,
                    background: selectedType === type ? 'var(--accent-gold-glow)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transform: selectedType === type ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: selectedType === type ? 'var(--shadow-gold)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{LOAN_ICONS[type]}</span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: selectedType === type ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    textTransform: 'capitalize',
                  }}>
                    {type === 'home' ? 'Home Loan' : type === 'car' ? 'Car Loan' : type === 'personal' ? 'Personal' : 'Education'}
                  </span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Loan Amount */}
          <SectionCard title="Loan Details" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Amount */}
              <div>
                <Label>Loan Amount (₹)</Label>
                <input
                  id="loan-amount"
                  type="number"
                  className={`input-base${errors.amount ? ' input-error' : ''}`}
                  placeholder="e.g. 5000000"
                  {...register('amount', { valueAsNumber: true })}
                />
                {watchedValues.amount > 0 && !errors.amount && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-ui)', marginTop: '0.3rem' }}>
                    {formatINR(watchedValues.amount, true)} ({formatINR(watchedValues.amount)})
                  </p>
                )}
                <FieldError msg={errors.amount?.message} />
              </div>

              {/* Interest Rate */}
              <div>
                <Label>Annual Interest Rate (%)</Label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    className={`input-base${errors.interestRate ? ' input-error' : ''}`}
                    style={{ flex: 1 }}
                    {...register('interestRate', { valueAsNumber: true })}
                  />
                  <span className="numeric" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-gold)', whiteSpace: 'nowrap' }}>
                    {watchedValues.interestRate ?? 0}%
                  </span>
                </div>
                <input
                  type="range"
                  className="range-gold"
                  style={{ marginTop: '0.5rem' }}
                  min={1}
                  max={36}
                  step={0.1}
                  value={watchedValues.interestRate ?? 8.5}
                  onChange={(e) => setValue('interestRate', parseFloat(e.target.value), { shouldValidate: true })}
                />
                <FieldError msg={errors.interestRate?.message} />
              </div>

              {/* Tenure */}
              <div>
                <Label>Loan Tenure (months)</Label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    id="tenure-months"
                    type="number"
                    className={`input-base${errors.tenureMonths ? ' input-error' : ''}`}
                    style={{ flex: 1 }}
                    {...register('tenureMonths', { valueAsNumber: true })}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {Math.floor((watchedValues.tenureMonths ?? 0) / 12)}y {(watchedValues.tenureMonths ?? 0) % 12}m
                  </span>
                </div>
                <input
                  type="range"
                  className="range-gold"
                  style={{ marginTop: '0.5rem' }}
                  min={6}
                  max={360}
                  step={6}
                  value={watchedValues.tenureMonths ?? 240}
                  onChange={(e) => setValue('tenureMonths', parseInt(e.target.value), { shouldValidate: true })}
                />
                <FieldError msg={errors.tenureMonths?.message} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {calcError ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={22} style={{ color: 'var(--danger)', marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Couldn't calculate this loan
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{calcError}</p>
            </div>
          ) : result ? (
            <>
              {isCalculating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={13} className="animate-spin" /> Recalculating…
                </div>
              )}
              {/* Eligibility Status */}
              <div
                className={`card animate-slide-up ${result.eligible ? 'glow-gold' : ''}`}
                style={{
                  padding: '1.5rem',
                  border: `1px solid ${result.eligible ? 'rgba(212,168,83,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: result.eligible ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {result.eligible
                      ? <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                      : <XCircle size={24} style={{ color: 'var(--danger)' }} />
                    }
                  </div>
                  <div>
                    <p style={{
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: result.eligible ? 'var(--success)' : 'var(--danger)',
                      marginBottom: '0.4rem',
                      letterSpacing: '-0.01em',
                    }}>
                      {result.eligible ? 'Loan Eligible ✓' : 'Not Eligible'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {result.reasoning}
                    </p>
                  </div>
                </div>
              </div>

              {/* EMI Breakdown */}
              <SectionCard title="EMI Breakdown" className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
                    Monthly EMI
                  </p>
                  <p className="numeric" style={{
                    fontSize: '2.1rem',
                    fontWeight: 600,
                    color: 'var(--accent-ui)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {formatINR(result.monthlyEMI, true)}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    {formatINR(result.monthlyEMI)}/month
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Principal Amount', value: formatINR(watchedValues.amount ?? 0) },
                    { label: 'Total Interest', value: formatINR(result.totalInterest), color: 'var(--danger)' },
                    { label: 'Total Payment', value: formatINR(result.totalPayment), color: 'var(--accent-gold)' },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{row.label}</span>
                      <span className="numeric" style={{ fontSize: '0.85rem', fontWeight: 600, color: row.color === 'var(--accent-gold)' ? 'var(--accent-ui)' : (row.color ?? 'var(--text-primary)') }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* DTI Impact */}
              <SectionCard title="Debt-to-Income Impact" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {[
                  { label: 'Current DTI', value: result.currentDebtToIncome, health: getDTIHealth(result.currentDebtToIncome) },
                  { label: 'New DTI (with loan)', value: result.newDebtToIncome, health: getDTIHealth(result.newDebtToIncome) },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                      <span className="numeric" style={{ fontSize: '0.82rem', fontWeight: 600, color: item.health.color }}>
                        {(item.value * 100).toFixed(1)}% · {item.health.label}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-medium)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(item.value * 200, 100)}%`,
                        background: item.health.color,
                        borderRadius: 999,
                        transition: 'width 0.6s ease',
                        boxShadow: `0 0 6px ${item.health.color}50`,
                      }} />
                    </div>
                  </div>
                ))}

                {result.maxEligibleAmount > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <Info size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Based on your income, you can comfortably borrow up to{' '}
                        <strong style={{ color: 'var(--accent-gold)' }}>{formatINR(result.maxEligibleAmount, true)}</strong>{' '}
                        while keeping DTI below 50%.
                      </p>
                    </div>
                  </div>
                )}
              </SectionCard>
            </>
          ) : isCalculating ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Loader2 size={22} className="animate-spin" style={{ color: 'var(--accent-ui)', marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Calculating…</p>
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', animationDelay: '0.1s' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧮</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Fill in the loan details to see EMI and eligibility results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
