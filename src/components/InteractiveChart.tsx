import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface HistogramData {
  range: string;
  count: number;
  percentage: number;
  minValue: number;
  maxValue: number;
}

interface InteractiveChartProps {
  data: HistogramData[];
  title: string;
  className?: string;
}

const InteractiveChartComponent: React.FC<InteractiveChartProps> = ({
  data,
  title,
  className = '',
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count)), [data]);
  const totalCount = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);

  const getBarColor = (index: number, isHovered: boolean) => {
    if (isHovered) {
      return 'bg-gradient-to-t from-content-600 to-content-500';
    }
    return 'bg-gradient-to-t from-content-400 to-content-300';
  };

  const getBarHeight = (count: number) => {
    return (count / maxCount) * 100;
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div 
          className="flex items-end justify-between h-64 bg-gradient-to-t from-gray-50 to-white rounded-lg p-4"
          role="img"
          aria-label={`Bar chart showing ${title} distribution across ${data.length} ranges`}
          aria-describedby="chart-description chart-summary"
        >
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group cursor-pointer"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
              role="button"
              tabIndex={0}
              aria-label={`${item.range}: ${item.count} stores (${item.percentage.toFixed(1)}%)`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setHoveredBar(hoveredBar === index ? null : index);
                }
              }}
              onFocus={() => setHoveredBar(index)}
              onBlur={() => setHoveredBar(null)}
            >
              {/* Bar */}
              <div className="relative w-full max-w-12 mx-1">
                <div
                  className={`
                    ${getBarColor(index, hoveredBar === index)}
                    rounded-t-lg transition-all duration-300 ease-out
                    shadow-lg hover:shadow-xl
                    transform hover:scale-105
                  `}
                  style={{
                    height: `${getBarHeight(item.count)}%`,
                    minHeight: '8px',
                  }}
                  aria-hidden="true"
                />
                
                {/* Tooltip */}
                {hoveredBar === index && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 animate-fadeInUp">
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                      <div className="font-medium">{item.range}</div>
                      <div className="text-xs opacity-90">
                        {item.count} stores ({item.percentage.toFixed(1)}%)
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="text-xs text-gray-600 mt-2 text-center">
                <div className="font-medium">{item.range}</div>
                <div className="text-gray-500">{item.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-500 -ml-8" aria-label="Y-axis scale">
          <span aria-label={`Maximum: ${maxCount}`}>{maxCount}</span>
          <span aria-label={`Three quarters: ${Math.round(maxCount * 0.75)}`}>{Math.round(maxCount * 0.75)}</span>
          <span aria-label={`Half: ${Math.round(maxCount * 0.5)}`}>{Math.round(maxCount * 0.5)}</span>
          <span aria-label={`Quarter: ${Math.round(maxCount * 0.25)}`}>{Math.round(maxCount * 0.25)}</span>
          <span aria-label="Minimum: 0">0</span>
        </div>
      </div>

      {/* Chart Description for Screen Readers */}
      <div id="chart-description" className="sr-only">
        This chart shows the distribution of stores across different {title.toLowerCase()} ranges. 
        Use Tab to navigate between bars and Enter or Space to view detailed information.
      </div>

      {/* Chart Summary for Screen Readers */}
      <div id="chart-summary" className="sr-only">
        Summary: {totalCount} total stores across {data.length} ranges. 
        Highest concentration: {data.find(d => d.count === Math.max(...data.map(d => d.count)))?.range || 'N/A'} with {Math.max(...data.map(d => d.count))} stores.
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4" role="group" aria-label="Chart statistics">
        <div className="text-center" role="img" aria-label={`Total stores: ${totalCount}`}>
          <div className="text-lg font-bold text-content-600">
            {totalCount}
          </div>
          <div className="text-sm text-gray-600">Total Stores</div>
        </div>
        <div className="text-center" role="img" aria-label={`Peak count: ${Math.max(...data.map(d => d.count))}`}>
          <div className="text-lg font-bold text-green-600">
            {Math.max(...data.map(d => d.count))}
          </div>
          <div className="text-sm text-gray-600">Peak Count</div>
        </div>
        <div className="text-center" role="img" aria-label={`Number of ranges: ${data.length}`}>
          <div className="text-lg font-bold text-blue-600">
            {data.length}
          </div>
          <div className="text-sm text-gray-600">Ranges</div>
        </div>
        <div className="text-center" role="img" aria-label={`Mode range: ${data.find(d => d.count === Math.max(...data.map(d => d.count)))?.range || 'N/A'}`}>
          <div className="text-lg font-bold text-purple-600">
            {data.find(d => d.count === Math.max(...data.map(d => d.count)))?.range || 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Mode Range</div>
        </div>
      </div>
    </div>
  );
};

interface SimpleBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title: string;
  className?: string;
}

// Memoized export for performance optimization
export const InteractiveChart = React.memo(InteractiveChartComponent);

const SimpleBarChartComponent: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  className = '',
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={`card ${className}`}>
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-content-600" />
        {title}
      </h3>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="group cursor-pointer"
            onMouseEnter={() => setHoveredBar(index)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {item.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  item.color || 'bg-gradient-to-r from-content-400 to-content-600'
                } ${
                  hoveredBar === index ? 'shadow-glow' : ''
                }`}
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const SimpleBarChart = React.memo(SimpleBarChartComponent); 