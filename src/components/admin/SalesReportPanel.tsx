'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchSalesCsv, fetchSalesSummary, reconcileSalesSummary } from '@/lib/adminReportService';
import { SalesSummaryResponse } from '@/types/salesReport';
import {
  DATE_PRESETS,
  getPreviousPeriodRange,
  percentChange,
  getFilteredTotals,
} from '@/lib/salesReportUtils';

const formatMoney = (value: number) =>
  `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompact = (value: number) => {
  if (value >= 1000) return `RM ${(value / 1000).toFixed(1)}k`;
  return `RM ${value.toFixed(0)}`;
};

type ChartMetric = 'revenue' | 'grossProfit' | 'orderCount';

const METRIC_LABELS: Record<ChartMetric, string> = {
  revenue: 'Revenue',
  grossProfit: 'Profit',
  orderCount: 'Orders',
};

interface ChartDataPoint {
  index: number;
  dateLabel: string;
  prevDateLabel: string;
  current: number;
  previous: number;
}

function buildChartData(
  summary: SalesSummaryResponse,
  previousSummary: SalesSummaryResponse | null,
  metric: ChartMetric
): ChartDataPoint[] {
  return summary.daily.map((row, i) => {
    const prevRow = previousSummary?.daily[i];
    return {
      index: i,
      dateLabel: row.date.slice(5), // MM-DD
      prevDateLabel: prevRow?.date.slice(5) ?? '',
      current: row[metric],
      previous: prevRow?.[metric] ?? 0,
    };
  });
}

function ChangeBadge({ current, previous, invertPolarity }: { current: number; previous: number; invertPolarity?: boolean }) {
  const pct = percentChange(current, previous);
  if (pct === null) return null;
  const isUp = pct > 0;
  const isGood = invertPolarity ? !isUp : isUp;
  return (
    <span className={`ml-2 inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as ChartDataPoint | undefined;
  if (!data) return null;
  const pct = percentChange(data.current, data.previous);
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-slate-700 mb-1">{data.dateLabel}</p>
      <p className="text-sky-600">Current: {typeof data.current === 'number' && data.current % 1 !== 0 ? formatMoney(data.current) : data.current}</p>
      {data.prevDateLabel && (
        <p className="text-slate-400">Previous ({data.prevDateLabel}): {typeof data.previous === 'number' && data.previous % 1 !== 0 ? formatMoney(data.previous) : data.previous}</p>
      )}
      {pct !== null && (
        <p className={pct >= 0 ? 'text-green-600' : 'text-red-600'}>{pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%</p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function SalesReportPanel() {
  const [from, setFrom] = useState(() => {
    const preset = DATE_PRESETS.find((p) => p.key === '30d')!;
    return preset.getRange().from;
  });
  const [to, setTo] = useState(() => {
    const preset = DATE_PRESETS.find((p) => p.key === '30d')!;
    return preset.getRange().to;
  });
  const [summary, setSummary] = useState<SalesSummaryResponse | null>(null);
  const [previousSummary, setPreviousSummary] = useState<SalesSummaryResponse | null>(null);
  const [activePreset, setActivePreset] = useState<string>('30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | null>(null);
  const [promotionTypeFilter, setPromotionTypeFilter] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('revenue');

  const loadSummary = useCallback(async (fromVal: string, toVal: string, useRaw = false) => {
    setLoading(true);
    setError(null);
    try {
      const prev = getPreviousPeriodRange(fromVal, toVal);
      const [currentData, prevData] = await Promise.all([
        fetchSalesSummary({ from: fromVal, to: toVal, raw: useRaw }),
        fetchSalesSummary({ from: prev.from, to: prev.to }).catch(() => null),
      ]);
      setSummary(currentData);
      setPreviousSummary(prevData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary(from, to);
  }, [from, to, loadSummary]);

  const handlePreset = (key: string) => {
    const preset = DATE_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const range = preset.getRange();
    setActivePreset(key);
    setFrom(range.from);
    setTo(range.to);
  };

  const handleApplyRange = () => {
    setActivePreset('');
    loadSummary(from, to);
  };

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
      await loadSummary(from, to);
    } catch (reconcileError) {
      setError(reconcileError instanceof Error ? reconcileError.message : 'Failed to reconcile report.');
    } finally {
      setReconciling(false);
    }
  };

  const hasFilter = paymentMethodFilter !== null || promotionTypeFilter !== null;

  const displayTotals = useMemo(() => {
    if (!summary) return null;
    return getFilteredTotals(summary, paymentMethodFilter, promotionTypeFilter);
  }, [summary, paymentMethodFilter, promotionTypeFilter]);

  const prevDisplayTotals = useMemo(() => {
    if (!previousSummary) return null;
    return getFilteredTotals(previousSummary, paymentMethodFilter, promotionTypeFilter);
  }, [previousSummary, paymentMethodFilter, promotionTypeFilter]);

  const chartData = useMemo(() => {
    if (!summary) return [];
    return buildChartData(summary, previousSummary, chartMetric);
  }, [summary, previousSummary, chartMetric]);

  const paymentMethods = useMemo(() => (summary ? Object.keys(summary.byPaymentMethod) : []), [summary]);
  const promotionTypes = useMemo(() => (summary ? Object.keys(summary.byPromotionType) : []), [summary]);

  const btnBase = 'px-3 py-1.5 text-sm rounded-md border transition-colors disabled:opacity-50';
  const btnDefault = `${btnBase} border-slate-300 bg-white hover:bg-slate-50 text-slate-700`;
  const btnPrimary = `${btnBase} border-sky-500 bg-sky-500 hover:bg-sky-600 text-white`;

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Sales Report</h2>
          <p className="text-sm text-slate-500">Revenue, profit and loss (recognized on delivered orders).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnDefault} onClick={() => loadSummary(from, to)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className={btnDefault} onClick={() => loadSummary(from, to, true)} disabled={loading}>
            Recompute
          </button>
          <button className={btnDefault} onClick={handleReconcile} disabled={reconciling}>
            {reconciling ? 'Reconciling...' : 'Reconcile'}
          </button>
          <button className={btnPrimary} onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Date Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Presets */}
        <div className="flex gap-1.5 flex-wrap">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                activePreset === preset.key
                  ? 'border-sky-500 bg-sky-50 text-sky-700 font-medium'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => handlePreset(preset.key)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date inputs */}
        <div className="flex items-end gap-2">
          <div>
            <label htmlFor="sales-from" className="block text-xs text-slate-500 mb-0.5">From</label>
            <input
              id="sales-from"
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setActivePreset(''); }}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sales-to" className="block text-xs text-slate-500 mb-0.5">To</label>
            <input
              id="sales-to"
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setActivePreset(''); }}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <button className={btnDefault} onClick={handleApplyRange} disabled={loading}>
            Apply
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-0.5">Payment Method</label>
            <select
              value={paymentMethodFilter ?? ''}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value || null);
                if (e.target.value) setPromotionTypeFilter(null);
              }}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm bg-white"
            >
              <option value="">All</option>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-0.5">Promotion Type</label>
            <select
              value={promotionTypeFilter ?? ''}
              onChange={(e) => {
                setPromotionTypeFilter(e.target.value || null);
                if (e.target.value) setPaymentMethodFilter(null);
              }}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm bg-white"
            >
              <option value="">All</option>
              {promotionTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {summary && displayTotals && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {/* Revenue */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-500">Revenue</div>
              <div className="font-bold text-slate-800">{formatMoney(displayTotals.revenue)}</div>
              {prevDisplayTotals && (
                <ChangeBadge current={displayTotals.revenue} previous={prevDisplayTotals.revenue} />
              )}
            </div>
            {/* COGS */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-500">COGS</div>
              <div className="font-bold text-slate-800">{formatMoney(displayTotals.cogs)}</div>
              {prevDisplayTotals && (
                <ChangeBadge current={displayTotals.cogs} previous={prevDisplayTotals.cogs} invertPolarity />
              )}
            </div>
            {/* Gross Profit */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-500">Gross Profit</div>
              <div className={`font-bold ${displayTotals.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatMoney(displayTotals.grossProfit)}
              </div>
              {prevDisplayTotals && (
                <ChangeBadge current={displayTotals.grossProfit} previous={prevDisplayTotals.grossProfit} />
              )}
            </div>
            {/* Loss */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-500">Loss Amount</div>
              <div className="font-bold text-red-700">{formatMoney(displayTotals.grossLoss)}</div>
              {prevDisplayTotals && (
                <ChangeBadge current={displayTotals.grossLoss} previous={prevDisplayTotals.grossLoss} invertPolarity />
              )}
            </div>
            {/* Delivery Subsidy */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-500">Delivery Subsidy</div>
              <div className="font-bold text-slate-800">{formatMoney(displayTotals.deliverySubsidy)}</div>
              {prevDisplayTotals && (
                <ChangeBadge current={displayTotals.deliverySubsidy} previous={prevDisplayTotals.deliverySubsidy} invertPolarity />
              )}
            </div>
            {/* Returns */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-500">Returns</div>
              <div className="font-bold text-red-700">
                {displayTotals.returnedCount} / {formatMoney(displayTotals.returnedAmount)}
              </div>
              {prevDisplayTotals && (
                <ChangeBadge current={displayTotals.returnedAmount} previous={prevDisplayTotals.returnedAmount} invertPolarity />
              )}
            </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Daily Trend</h3>
              <div className="flex gap-1">
                {(Object.keys(METRIC_LABELS) as ChartMetric[]).map((m) => (
                  <button
                    key={m}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      chartMetric === m
                        ? 'border-sky-500 bg-sky-50 text-sky-700 font-medium'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                    onClick={() => setChartMetric(m)}
                  >
                    {METRIC_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
            {hasFilter && (
              <p className="text-xs text-amber-600 mb-2">Chart shows all payment methods/promotions (daily breakdown not available per filter).</p>
            )}
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => (chartMetric === 'orderCount' ? v : formatCompact(v))}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  formatter={(value: string) => <span className="text-xs text-slate-500">{value}</span>}
                />
                {previousSummary && (
                  <Area
                    type="monotone"
                    dataKey="previous"
                    name="Previous Period"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    fill="transparent"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="current"
                  name="Current Period"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0ea5e9' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Payment Method */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Payment Method</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-2 font-medium">Method</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byPaymentMethod).map(([key, value]) => (
                    <tr
                      key={key}
                      className={`border-b border-slate-50 ${paymentMethodFilter === key ? 'bg-sky-50' : ''}`}
                    >
                      <td className="py-1.5 text-slate-700">{key}</td>
                      <td className="py-1.5 text-right text-slate-600">{formatMoney(value.revenue)}</td>
                      <td className="py-1.5 text-right text-slate-500">{value.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* By Promotion Type */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Promotion Type</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                    <th className="pb-2 font-medium text-right">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byPromotionType).map(([key, value]) => (
                    <tr
                      key={key}
                      className={`border-b border-slate-50 ${promotionTypeFilter === key ? 'bg-sky-50' : ''}`}
                    >
                      <td className="py-1.5 text-slate-700">{key}</td>
                      <td className="py-1.5 text-right text-slate-600">{formatMoney(value.revenue)}</td>
                      <td className="py-1.5 text-right text-slate-500">{value.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
