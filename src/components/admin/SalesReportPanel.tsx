'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchSalesCsv, fetchSalesSummary, reconcileSalesSummary } from '@/lib/adminReportService';
import { SalesSummaryResponse } from '@/types/salesReport';

const formatMoney = (value: number) => `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function minusDaysKey(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function SalesReportPanel() {
  const [from, setFrom] = useState(() => minusDaysKey(29));
  const [to, setTo] = useState(() => todayKey());
  const [summary, setSummary] = useState<SalesSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const maxDailyRevenue = useMemo(
    () => Math.max(...(summary?.daily.map((row) => row.revenue) || [0]), 0),
    [summary]
  );

  const loadSummary = async (useRaw = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSalesSummary({ from, to, raw: useRaw });
      setSummary(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const blob = await fetchSalesCsv({ from, to });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${from}-to-${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  const handleReconcile = async () => {
    setReconciling(true);
    setError(null);
    try {
      await reconcileSalesSummary({ from, to });
      await loadSummary();
    } catch (reconcileError) {
      setError(reconcileError instanceof Error ? reconcileError.message : 'Failed to reconcile report.');
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '0.25rem' }}>Sales Report</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Revenue, profit and loss (recognized on delivered orders).</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => loadSummary()} disabled={loading} style={{ padding: '0.5rem 0.85rem' }}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={() => loadSummary(true)} disabled={loading} style={{ padding: '0.5rem 0.85rem' }}>
            Recompute
          </button>
          <button onClick={handleReconcile} disabled={reconciling} style={{ padding: '0.5rem 0.85rem' }}>
            {reconciling ? 'Reconciling...' : 'Reconcile'}
          </button>
          <button onClick={handleExport} disabled={exporting} style={{ padding: '0.5rem 0.85rem' }}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end' }}>
        <div>
          <label htmlFor="sales-from" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>From</label>
          <input id="sales-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sales-to" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>To</label>
          <input id="sales-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={() => loadSummary()} disabled={loading} style={{ padding: '0.5rem 0.85rem' }}>
          Apply Range
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Revenue</div>
              <div style={{ fontWeight: 700 }}>{formatMoney(summary.totals.revenue)}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>COGS</div>
              <div style={{ fontWeight: 700 }}>{formatMoney(summary.totals.cogs)}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Gross Profit</div>
              <div style={{ fontWeight: 700, color: summary.totals.grossProfit >= 0 ? '#166534' : '#991b1b' }}>
                {formatMoney(summary.totals.grossProfit)}
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Loss Amount</div>
              <div style={{ fontWeight: 700, color: '#991b1b' }}>{formatMoney(summary.totals.grossLoss)}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivery Subsidy</div>
              <div style={{ fontWeight: 700 }}>{formatMoney(summary.totals.deliverySubsidy)}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Returns</div>
              <div style={{ fontWeight: 700, color: '#991b1b' }}>
                {summary.totals.returnedCount} / {formatMoney(summary.totals.returnedAmount)}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Daily Trend</h3>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {summary.daily.map((row) => (
                <div key={row.date} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 110px', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}>{row.date}</span>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: maxDailyRevenue > 0 ? `${Math.max((row.revenue / maxDailyRevenue) * 100, 2)}%` : '0%',
                        height: '100%',
                        background: '#0ea5e9'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', textAlign: 'right' }}>{formatMoney(row.revenue)}</span>
                  <span style={{ fontSize: '0.78rem', textAlign: 'right', color: '#64748b' }}>{row.orderCount} orders</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>By Payment Method</h3>
              {Object.entries(summary.byPaymentMethod).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span>{key}</span>
                  <span>{formatMoney(value.revenue)} ({value.orderCount})</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>By Promotion Type</h3>
              {Object.entries(summary.byPromotionType).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span>{key}</span>
                  <span>{formatMoney(value.revenue)} ({value.orderCount})</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
