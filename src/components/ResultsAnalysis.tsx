import React, { useState, useMemo } from 'react';
import { BarChart, MapPin, TrendingUp, Download, ArrowUpDown, CheckCircle, Target, Building } from 'lucide-react';
import { StoreData, TargetConfig, SelectionStrategy, StrategyConfiguration } from '../types';
import { StrategyEngine } from '../utils/strategyEngine';
import { CSVParser } from '../utils/csvParser';
import { InfoTooltip } from './Tooltip';
import { Card } from './common/Card';
import { extractRetailerBrand } from '../utils/retailerUtils';

interface ResultsAnalysisProps {
  stores: StoreData[];
  selectedRetailer: string;
  targetConfig: TargetConfig;
  performanceTier: {
    type: 'percentage' | 'absolute';
    value: number;
    description: string;
  };
  strategy: SelectionStrategy;
  regionalConfig: {
    type: 'national' | 'over-index';
    overIndexRegions?: string[];
    overIndexPercentage?: number;
  };
  onBack: () => void;
  onStartOver: () => void;
}

type SortField = keyof StoreData;
type SortDirection = 'asc' | 'desc';

export const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({
  stores,
  selectedRetailer,
  targetConfig,
  performanceTier,
  strategy,
  regionalConfig,
  onBack,
  onStartOver,
}) => {
  const [sortField, setSortField] = useState<SortField>('prodSelect');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get filtered stores based on new workflow
  const filteredStores = useMemo(() => {
    // Filter by retailer
    let filtered = stores.filter(store => extractRetailerBrand(store.naam) === selectedRetailer);
    
    // Filter by performance tier
    if (performanceTier.type === 'percentage') {
      const sorted = [...filtered].sort((a, b) => b.prodSelect - a.prodSelect);
      const count = Math.floor((performanceTier.value / 100) * sorted.length);
      filtered = sorted.slice(0, count);
    } else {
      filtered = filtered.filter(store => store.prodSelect >= performanceTier.value);
    }
    
    return filtered;
  }, [stores, selectedRetailer, performanceTier]);

  // Generate selection results
  const selectionResult = useMemo(() => {
    // For now, return a simple selection based on target count
    // This would be enhanced with proper strategy engine implementation
    const selectedStores = filteredStores.slice(0, targetConfig.total);
    const totalRevenue = selectedStores.reduce((sum, store) => sum + store.prodSelect, 0);
    const averageRevenue = totalRevenue / selectedStores.length;
    const uniqueRegions = new Set(selectedStores.map(store => store.fieldSalesRegio)).size;
    const uniqueRetailers = new Set(selectedStores.map(store => store.naam)).size;
    
    const revenuePerRegion: Record<string, number> = {};
    selectedStores.forEach(store => {
      revenuePerRegion[store.fieldSalesRegio] = (revenuePerRegion[store.fieldSalesRegio] || 0) + store.prodSelect;
    });
    
    return {
      selectedStores,
      totalRevenue,
      averageRevenue,
      regionCoverage: uniqueRegions / new Set(filteredStores.map(store => store.fieldSalesRegio)).size,
      performanceDistribution: {
        high: selectedStores.filter(store => store.prodSelect > averageRevenue * 1.2).length,
        medium: selectedStores.filter(store => store.prodSelect >= averageRevenue * 0.8 && store.prodSelect <= averageRevenue * 1.2).length,
        low: selectedStores.filter(store => store.prodSelect < averageRevenue * 0.8).length,
      },
      statistics: {
        totalStores: selectedStores.length,
        uniqueRegions,
        uniqueRetailers,
        revenuePerRegion,
      },
    };
  }, [filteredStores, targetConfig]);

  // Sort selected stores
  const sortedStores = useMemo(() => {
    return [...selectionResult.selectedStores].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [selectionResult.selectedStores, sortField, sortDirection]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const selected = selectionResult.selectedStores;
    const total = stores.length;
    
    return {
      selectionRate: (selected.length / total) * 100,
      avgRevenue: selectionResult.averageRevenue,
      totalRevenue: selectionResult.totalRevenue,
      regionCoverage: selectionResult.regionCoverage * 100,
      topPerformerRate: (selectionResult.performanceDistribution.high / selected.length) * 100,
    };
  }, [selectionResult, stores.length]);

  // Regional analysis
  const regionalAnalysis = useMemo(() => {
    const regionStats = Object.entries(selectionResult.statistics.revenuePerRegion).map(([region, revenue]) => {
      const regionStores = selectionResult.selectedStores.filter(store => store.fieldSalesRegio === region);
      const totalRegionStores = stores.filter(store => store.fieldSalesRegio === region).length;
      
      return {
        region,
        revenue,
        storeCount: regionStores.length,
        avgRevenue: revenue / regionStores.length,
        coverage: (regionStores.length / totalRegionStores) * 100,
      };
    });
    
    return regionStats.sort((a, b) => b.revenue - a.revenue);
  }, [selectionResult, stores]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export results
  const handleExport = () => {
    CSVParser.exportToCSV(selectionResult.selectedStores, `store-selection-${strategy}`);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return (
      <ArrowUpDown 
        className={`w-4 h-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} 
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Selection Results
        </h2>
        <p className="text-lg text-gray-600">
          Review your optimized store selection and performance analytics
        </p>
      </div>

      {/* Strategy Summary */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Selection Summary
          </h3>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-content-100 text-content-800 rounded-full text-sm font-medium">
              {strategy.charAt(0).toUpperCase() + strategy.slice(1).replace(/-/g, ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-items-center">
          <div className="metric-card animate-fadeInUp">
                          <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-content-500 mr-2" />
                <InfoTooltip content="Total number of stores selected by the algorithm based on your target configuration" />
              </div>
            <div className="metric-value mb-2">
              {selectionResult.selectedStores.length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Stores Selected</div>
            <div className="text-xs text-gray-500 mt-1">
              {performanceMetrics.selectionRate.toFixed(1)}% of total
            </div>
          </div>

          <div className="metric-card animate-fadeInUp animation-delay-100">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              <InfoTooltip content="Combined revenue of all selected stores with average revenue per store" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              €{Math.round(performanceMetrics.totalRevenue / 1000000)}M
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              €{Math.round(performanceMetrics.avgRevenue / 1000)}k avg
            </div>
          </div>

          <div className="metric-card animate-fadeInUp animation-delay-200">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-blue-500 mr-2" />
              <InfoTooltip content="Number of unique regions covered by the selected stores for geographic distribution" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {selectionResult.statistics.uniqueRegions}
            </div>
            <div className="text-sm text-gray-600 font-medium">Regions Covered</div>
            <div className="text-xs text-gray-500 mt-1">
              {performanceMetrics.regionCoverage.toFixed(1)}% coverage
            </div>
          </div>

          <div className="metric-card animate-fadeInUp animation-delay-300">
            <div className="flex items-center justify-center mb-2">
              <Building className="w-6 h-6 text-purple-500 mr-2" />
              <InfoTooltip content="Number of unique retailers in the selection with percentage of high-performing stores" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {selectionResult.statistics.uniqueRetailers}
            </div>
            <div className="text-sm text-gray-600 font-medium">Retailers</div>
            <div className="text-xs text-gray-500 mt-1">
              {performanceMetrics.topPerformerRate.toFixed(1)}% top performers
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart className="mr-2 h-5 w-5" />
            Performance Distribution
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Performers</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(selectionResult.performanceDistribution.high / selectionResult.selectedStores.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{selectionResult.performanceDistribution.high}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Performers</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(selectionResult.performanceDistribution.medium / selectionResult.selectedStores.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{selectionResult.performanceDistribution.medium}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth Opportunities</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(selectionResult.performanceDistribution.low / selectionResult.selectedStores.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{selectionResult.performanceDistribution.low}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Analysis */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Regional Analysis
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {regionalAnalysis.map((region, index) => (
              <div key={region.region} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{region.region}</span>
                  <span className="text-xs text-gray-500">{region.storeCount} stores</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>€{Math.round(region.revenue / 1000000)}M</span>
                  <span>{region.coverage.toFixed(1)}% coverage</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Configuration
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Strategy:</span>
              <span className="text-sm font-medium">{strategy}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target:</span>
              <span className="text-sm font-medium">{targetConfig.total} stores</span>
            </div>
            
            {strategy === 'portfolio-balance' && (
              <>
                <div className="pt-2 border-t">
                  <div className="text-xs text-content-500 mb-2">Portfolio Balance Methodology</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Core Markets:</span>
                      <span>70%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Growth Markets:</span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Experimental:</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Filtered from:</span>
                <span className="text-sm font-medium">{filteredStores.length} stores</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Stores Table */}
      <div className="card mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Selected Stores</h3>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('naam')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>Store Name</span>
                    {getSortIcon('naam')}
                  </button>
                </th>
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('stad')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>City</span>
                    {getSortIcon('stad')}
                  </button>
                </th>
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('fieldSalesRegio')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>Region</span>
                    {getSortIcon('fieldSalesRegio')}
                  </button>
                </th>
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>Type</span>
                    {getSortIcon('type')}
                  </button>
                </th>
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('kanaal')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>Channel</span>
                    {getSortIcon('kanaal')}
                  </button>
                </th>
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('klantgroep')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>Group</span>
                    {getSortIcon('klantgroep')}
                  </button>
                </th>
                <th className="text-left p-3">
                  <button
                    onClick={() => handleSort('prodSelect')}
                    className="flex items-center space-x-1 hover:text-primary-600"
                  >
                    <span>Revenue</span>
                    {getSortIcon('prodSelect')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.map((store, index) => (
                <tr key={store.storeId} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{store.naam}</div>
                    <div className="text-sm text-gray-500">{store.straat} {store.nummer}</div>
                  </td>
                  <td className="p-3">
                    <div>{store.stad}</div>
                    <div className="text-sm text-gray-500">{store.postcode}</div>
                  </td>
                  <td className="p-3">{store.fieldSalesRegio}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      store.type === 'Filiaal' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {store.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{store.kanaal}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      store.klantgroep === 'A' ? 'bg-green-100 text-green-800' :
                      store.klantgroep === 'B' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {store.klantgroep}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">€{store.prodSelect.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Back: Filters & Strategy
        </button>
        
        <button
          onClick={onStartOver}
          className="btn-primary"
        >
          Start New Selection
        </button>
      </div>
    </div>
  );
}; 