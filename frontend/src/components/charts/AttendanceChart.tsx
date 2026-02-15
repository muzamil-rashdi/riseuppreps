import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceChartProps {
  present: number;
  absent: number;
  late: number;
  title?: string;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Present: '#16a34a',
  Absent: '#ef4444',
  Late: '#f59e0b',
};

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const color = STATUS_COLORS[item.name ?? ''] ?? '#888';

  return (
    <div className="rounded-lg border bg-background px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-foreground">{item.name}</span>
      </div>
      <p className="mt-1 text-lg font-bold" style={{ color }}>
        {item.value} <span className="text-xs font-normal text-muted-foreground">classes</span>
      </p>
    </div>
  );
}

export function AttendanceChart({
  present,
  absent,
  late,
  title = 'Attendance Summary',
  className,
}: AttendanceChartProps) {
  const total = present + absent + late;
  const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const data = [
    { name: 'Present', value: present },
    { name: 'Absent', value: absent },
    { name: 'Late', value: late },
  ].filter((d) => d.value > 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No attendance data available yet.
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">
                  {attendancePercentage}%
                </span>
                <span className="text-xs text-muted-foreground">Attendance</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6">
              {[
                { label: 'Present', value: present, color: STATUS_COLORS.Present },
                { label: 'Absent', value: absent, color: STATUS_COLORS.Absent },
                { label: 'Late', value: late, color: STATUS_COLORS.Late },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.label}{' '}
                    <span className="font-medium text-foreground">({item.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
