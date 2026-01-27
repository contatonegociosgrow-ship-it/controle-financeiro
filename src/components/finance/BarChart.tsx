'use client';

type BarChartData = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
};

export function BarChart({ 
  data, 
  height = 250, 
  showValues = true,
  formatValue = (v) => v.toFixed(0)
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem dados para exibir
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  const gap = Math.max(4, Math.min(8, 100 / data.length * 0.1));

  return (
    <div className="w-full">
      <div className="relative mb-2" style={{ height: `${height}px` }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="border-t border-gray-200"
              style={{ marginTop: percent === 0 ? 0 : -1 }}
            />
          ))}
        </div>
        
        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around px-2">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const color = item.color || '#3b82f6';
            
            return (
              <div
                key={index}
                className="flex flex-col items-center group relative"
                style={{ 
                  width: `calc(${barWidth}% - ${gap}px)`,
                  minWidth: '20px',
                }}
              >
                {/* Value label on top */}
                {showValues && item.value > 0 && (
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-800 whitespace-nowrap opacity-100 z-10">
                    {formatValue(item.value)}
                  </div>
                )}
                
                {/* Bar with gradient */}
                <div
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg relative group"
                  style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(to top, ${color}, ${color}dd)`,
                    minHeight: barHeight > 0 ? '4px' : '0',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Gradient overlay for depth */}
                  <div 
                    className="absolute inset-0 rounded-t-lg"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.2), rgba(0,0,0,0.05), transparent)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-around px-2 mt-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="text-center text-xs text-gray-600 font-medium truncate px-1"
            style={{ width: `calc(${barWidth}% - ${gap}px)` }}
            title={item.label}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

type HorizontalBarChartProps = {
  data: BarChartData[];
  maxBars?: number;
  formatValue?: (value: number) => string;
};

export function HorizontalBarChart({ 
  data, 
  maxBars = 10,
  formatValue = (v) => v.toFixed(0)
}: HorizontalBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Sem dados para exibir
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars);
  const maxValue = Math.max(...sortedData.map((d) => d.value), 1);

  return (
    <div className="space-y-4">
      {sortedData.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const color = item.color || '#3b82f6';
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 truncate flex-1 mr-3 text-sm">
                {item.label}
              </span>
              <span className="text-gray-900 font-bold whitespace-nowrap text-sm">
                {formatValue(item.value)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 relative group"
                style={{
                  width: `${percentage}%`,
                  background: `linear-gradient(to right, ${color}, ${color}dd)`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.1), transparent)',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
