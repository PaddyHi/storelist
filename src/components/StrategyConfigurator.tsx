import React, { useState, useEffect, useMemo } from 'react';
import { Target, AlertCircle, CheckCircle, Settings, MapPin, BarChart3, Users, TrendingUp } from 'lucide-react';
import { 
  StoreData, 
  SelectionStrategy, 
  StrategyConfiguration, 
  ColumnAnalysis, 
  StrategySchema,
  RegionWeight 
} from '../types';
import { ColumnAnalyzer } from '../utils/columnAnalyzer';
import { STRATEGY_SCHEMAS, DUTCH_PROVINCES } from '../data/strategySchemas';
import { Card } from './common/Card';

interface StrategyConfiguratorProps {
  stores: StoreData[];
  currentStrategy: SelectionStrategy;
  onStrategyConfigChange: (config: StrategyConfiguration) => void;
  onStrategyChange: (strategy: SelectionStrategy) => void;
}

export const StrategyConfigurator: React.FC<StrategyConfiguratorProps> = ({
  stores,
  currentStrategy,
  onStrategyConfigChange,
  onStrategyChange
}) => {
  const [columnAnalysis, setColumnAnalysis] = useState<ColumnAnalysis[]>([]);
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfiguration>({
    strategy: currentStrategy,
    columnMappings: {},
    parameters: {},
    regionWeights: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Analyze columns when stores change
  useEffect(() => {
    if (stores && stores.length > 0) {
      const analysis = ColumnAnalyzer.analyzeDataset(stores);
      setColumnAnalysis(analysis);
      
      // Generate suggested mappings
      const suggestedMappings = ColumnAnalyzer.generateSuggestedMappings(analysis);
      
      // Update strategy config with suggestions
      const schema = STRATEGY_SCHEMAS[currentStrategy];
      const mappings: Record<string, string> = {};
      const parameters: Record<string, any> = {};
      
      // Set up default column mappings
      schema.requiredColumns.forEach(req => {
        if (req.defaultColumn) {
          mappings[req.key] = req.defaultColumn;
        } else if (suggestedMappings[currentStrategy]?.[req.key]) {
          mappings[req.key] = suggestedMappings[currentStrategy][req.key];
        }
      });
      
      schema.optionalColumns.forEach(req => {
        if (req.defaultColumn) {
          mappings[req.key] = req.defaultColumn;
        } else if (suggestedMappings[currentStrategy]?.[req.key]) {
          mappings[req.key] = suggestedMappings[currentStrategy][req.key];
        }
      });
      
      // Set up default parameters
      schema.parameters.forEach(param => {
        parameters[param.key] = param.defaultValue;
      });

      setStrategyConfig({
        strategy: currentStrategy,
        columnMappings: mappings,
        parameters,
        regionWeights: []
      });
    }
  }, [stores, currentStrategy]);

  // Get available strategies based on data
  const availableStrategies = useMemo(() => {
    return Object.values(STRATEGY_SCHEMAS).map(schema => {
      const requiredColumns = schema.requiredColumns.filter(req => req.required);
      const availableRequirements = requiredColumns.filter(req => {
        return columnAnalysis.some(col => 
          col.suggestedRequirements.includes(req.key) || 
          col.name === req.defaultColumn
        );
      });
      
      const isAvailable = availableRequirements.length === requiredColumns.length;
      
      return {
        ...schema,
        isAvailable,
        missingRequirements: requiredColumns.filter(req => 
          !availableRequirements.some(avail => avail.key === req.key)
        ).map(req => req.name)
      };
    });
  }, [columnAnalysis]);

  // Get regions for regional weighting - use Dutch provinces as standard
  const availableRegions = useMemo(() => {
    const regionColumn = columnAnalysis.find(col => 
      col.suggestedRequirements.includes('region') || 
      col.name === 'fieldSalesRegio'
    );
    
    if (!regionColumn) return DUTCH_PROVINCES;
    
    // Filter to only include valid Dutch provinces from the data
    const dataRegions = regionColumn.sampleValues as string[];
    return dataRegions.filter(region => DUTCH_PROVINCES.includes(region as any));
  }, [columnAnalysis]);

  // Handle strategy selection
  const handleStrategySelect = (strategy: SelectionStrategy) => {
    onStrategyChange(strategy);
  };

  // Handle column mapping
  const handleColumnMapping = (requirementKey: string, columnName: string) => {
    const newMappings = { ...strategyConfig.columnMappings };
    newMappings[requirementKey] = columnName;
    
    const newConfig = { ...strategyConfig, columnMappings: newMappings };
    setStrategyConfig(newConfig);
    onStrategyConfigChange(newConfig);
  };

  // Handle parameter change
  const handleParameterChange = (paramKey: string, value: any) => {
    const newParameters = { ...strategyConfig.parameters };
    newParameters[paramKey] = value;
    
    const newConfig = { ...strategyConfig, parameters: newParameters };
    setStrategyConfig(newConfig);
    onStrategyConfigChange(newConfig);
  };

  // Handle regional weight change
  const handleRegionWeightChange = (region: string, weight: number) => {
    const newWeights = [...(strategyConfig.regionWeights || [])];
    const existingIndex = newWeights.findIndex(w => w.region === region);
    
    if (existingIndex >= 0) {
      newWeights[existingIndex] = { region, weight, targetPercentage: weight };
    } else {
      newWeights.push({ region, weight, targetPercentage: weight });
    }
    
    const newConfig = { ...strategyConfig, regionWeights: newWeights };
    setStrategyConfig(newConfig);
    onStrategyConfigChange(newConfig);
  };

  const currentSchema = STRATEGY_SCHEMAS[currentStrategy];

  return (
    <div className="space-y-8">
      {/* Strategy Selection - Clean and Simple */}
      <Card>
        <h3 className="text-xl font-semibold mb-6 text-content-900">
          Choose Your Selection Strategy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableStrategies.filter(s => s.isAvailable).map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => handleStrategySelect(strategy.id)}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                currentStrategy === strategy.id
                  ? 'border-content-900 bg-content-50 shadow-lg'
                  : 'border-content-200 hover:border-content-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-content-900 mb-2">
                    {strategy.name}
                  </h4>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    strategy.category === 'performance' ? 'bg-blue-100 text-blue-800' :
                    strategy.category === 'geographic' ? 'bg-green-100 text-green-800' :
                    strategy.category === 'demographic' ? 'bg-purple-100 text-purple-800' :
                    strategy.category === 'balanced' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {strategy.category}
                  </div>
                </div>
                {currentStrategy === strategy.id && (
                  <div className="flex items-center justify-center w-8 h-8 bg-content-900 rounded-full">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              
              <p className="text-content-600 mb-4 leading-relaxed">
                {strategy.description}
              </p>
              
              <div className="bg-content-100 rounded-lg p-3">
                <div className="text-xs font-medium text-content-500 mb-1">BEST FOR:</div>
                <div className="text-sm text-content-700">{strategy.useCase}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Unavailable Strategies - Collapsed */}
        {availableStrategies.some(s => !s.isAvailable) && (
          <details className="mt-6">
            <summary className="text-sm text-content-500 cursor-pointer hover:text-content-700">
              {availableStrategies.filter(s => !s.isAvailable).length} strategies unavailable (missing data)
            </summary>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableStrategies.filter(s => !s.isAvailable).map((strategy) => (
                <div key={strategy.id} className="p-4 border border-content-200 rounded-lg opacity-60">
                  <div className="font-medium text-content-900 mb-1">{strategy.name}</div>
                  <div className="text-sm text-content-600 mb-2">{strategy.description}</div>
                  <div className="text-xs text-amber-600">
                    Missing: {strategy.missingRequirements.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </Card>

      {/* Strategy-Specific Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Strategy Details */}
        <div className="lg:col-span-1">
          <Card variant="gradient">
            <h4 className="font-semibold text-content-900 mb-4">
              {currentSchema.name}
            </h4>
            
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium text-content-800 mb-1">How it works:</div>
                <div className="text-content-600">{currentSchema.calculationMethod}</div>
              </div>
              
              <div>
                <div className="font-medium text-content-800 mb-1">Complexity:</div>
                <div className={`inline-flex px-2 py-1 rounded text-xs ${
                  currentSchema.algorithmComplexity === 'simple' ? 'bg-green-100 text-green-800' :
                  currentSchema.algorithmComplexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentSchema.algorithmComplexity}
                </div>
              </div>

              {currentSchema.supportsRegionalWeighting && (
                <div>
                  <div className="font-medium text-content-800 mb-1">Features:</div>
                  <div className="text-content-600">✓ Regional allocation control</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Configuration Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Parameters */}
          {currentSchema.parameters.length > 0 && (
            <Card>
              <h4 className="text-lg font-semibold mb-4 text-content-900">
                Strategy Settings
              </h4>
              
              <div className="space-y-6">
                {currentSchema.parameters.map((param) => (
                  <div key={param.key} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-content-800 block mb-1">
                        {param.name}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <div className="text-sm text-content-600">{param.description}</div>
                    </div>
                    
                    <div className="max-w-xs">
                      {param.type === 'select' && (
                        <select
                          value={strategyConfig.parameters[param.key] || param.defaultValue}
                          onChange={(e) => handleParameterChange(param.key, e.target.value)}
                          className="w-full px-4 py-3 border border-content-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-content-900 focus:border-transparent"
                        >
                          {param.options?.map(option => (
                            <option key={typeof option === 'string' ? option : option.value} 
                                    value={typeof option === 'string' ? option : option.value}>
                              {typeof option === 'string' ? option : option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {(param.type === 'number' || param.type === 'percentage') && (
                        <input
                          type="number"
                          value={strategyConfig.parameters[param.key] || param.defaultValue}
                          onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
                          min={param.validation?.min}
                          max={param.validation?.max}
                          step={param.validation?.step}
                          className="w-full px-4 py-3 border border-content-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-content-900 focus:border-transparent"
                        />
                      )}
                      
                      {param.type === 'boolean' && (
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={strategyConfig.parameters[param.key] || param.defaultValue}
                            onChange={(e) => handleParameterChange(param.key, e.target.checked)}
                            className="w-5 h-5 rounded border-content-300 focus:ring-content-900"
                          />
                          <span className="text-sm text-content-700">Enable</span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Regional Allocation - Only if Strategy Supports It */}
          {currentSchema.supportsRegionalWeighting && availableRegions.length > 0 && (
            <Card>
              <h4 className="text-lg font-semibold mb-4 text-content-900">
                Province Allocation
              </h4>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800 mb-2">
                  <strong>Optional:</strong> Specify what percentage of stores to select from each province.
                </div>
                <div className="text-xs text-blue-600">
                  Leave at 0% for automatic distribution based on store availability.
                </div>
              </div>
              
              <div className="space-y-4">
                {availableRegions.map((region) => (
                  <div key={region} className="flex items-center justify-between p-4 bg-content-50 rounded-lg">
                    <div className="font-medium text-content-800">{region}</div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={strategyConfig.regionWeights?.find(w => w.region === region)?.weight || 0}
                        onChange={(e) => handleRegionWeightChange(region, Number(e.target.value))}
                        className="w-32"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={strategyConfig.regionWeights?.find(w => w.region === region)?.weight || 0}
                          onChange={(e) => handleRegionWeightChange(region, Number(e.target.value))}
                          className="w-20 px-3 py-2 border border-content-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-content-900"
                        />
                        <span className="text-sm text-content-600">%</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-content-200">
                  <div className="text-sm text-content-600">
                    <strong>Total allocation: </strong>
                    <span className="font-medium">
                      {strategyConfig.regionWeights?.reduce((sum, w) => sum + w.weight, 0) || 0}%
                    </span>
                    {(strategyConfig.regionWeights?.reduce((sum, w) => sum + w.weight, 0) || 0) > 100 && (
                      <span className="text-red-600 ml-2">⚠ Exceeds 100%</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 