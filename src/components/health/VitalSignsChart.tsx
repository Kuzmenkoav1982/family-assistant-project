import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface VitalRecord {
  id: string;
  type: string;
  value: string;
  unit: string;
  date: string;
  time?: string;
  notes?: string;
}

interface VitalSignsChartProps {
  vitals: VitalRecord[];
  type: 'pressure' | 'pulse' | 'weight' | 'temperature';
  title: string;
  color: string;
}

export function VitalSignsChart({ vitals, type, title, color }: VitalSignsChartProps) {
  const filteredVitals = vitals
    .filter(v => v.type === type)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30);

  const chartData = filteredVitals.map(vital => {
    const date = new Date(vital.date);
    const dateStr = `${date.getDate()}.${date.getMonth() + 1}`;
    
    if (type === 'pressure') {
      const [systolic, diastolic] = vital.value.split('/').map(v => parseInt(v));
      return {
        date: dateStr,
        time: vital.time || date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        systolic,
        diastolic,
        fullDate: vital.date
      };
    }
    
    return {
      date: dateStr,
      time: vital.time || date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(vital.value),
      fullDate: vital.date
    };
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Нет данных для отображения
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.date}</p>
          <p className="text-xs text-muted-foreground mb-2">{payload[0].payload.time}</p>
          {type === 'pressure' ? (
            <>
              <p className="text-sm text-red-600">
                Систолическое: {payload[0].value} мм рт.ст.
              </p>
              <p className="text-sm text-blue-600">
                Диастолическое: {payload[1].value} мм рт.ст.
              </p>
            </>
          ) : (
            <p className="text-sm" style={{ color }}>
              {payload[0].value} {filteredVitals[0]?.unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Activity" size={18} style={{ color }} />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Последние {chartData.length} измерений
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          {type === 'pressure' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                stroke="#888"
                domain={[60, 160]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Систолическое"
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Диастолическое"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                stroke="#888"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ r: 4, fill: color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
