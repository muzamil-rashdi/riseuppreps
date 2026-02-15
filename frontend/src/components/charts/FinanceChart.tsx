import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  type TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';

interface FinanceDataPoint {
  category: string;
  total: number;
}

interface FinanceChartProps {
  data: FinanceDataPoint[];
  title?: string;
  className?: string;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const total = item.payload?.total as number | undefined;

  return (
    <div className="rounded-lg border bg-background px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: item.payload?.fill ?? '#888' }}
        />
        <span className="text-sm font-medium text-foreground">{item.name}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-foreground">
        {formatCurrency(total ?? 0)}
      </p>
    </div>
  );
}

function renderLegend(props: { payload?: Array<{ value: string; color: string }> }) {
  const { payload } = props;
  if (!payload) return null;

  return (
    <div className="flex flex-col gap-2 pl-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function FinanceChart({ data, title = 'Expense Breakdown', className }: FinanceChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.total > 0);

  const formattedData = data
    .filter((d) => d.total > 0)
    .map((d) => ({
      ...d,
      name: d.category.charAt(0) + d.category.slice(1).toLowerCase(),
    }));

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No financial data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="40%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                nameKey="name"
                strokeWidth={2}
                stroke="hsl(var(--background))"
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {formattedData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                content={renderLegend as any}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
