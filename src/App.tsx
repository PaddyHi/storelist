import React, { useState, useEffect, useCallback } from 'react';
import { StoreData, FilterConfig, TargetConfig, SelectionStrategy, StepConfig, StrategyConfiguration } from './types';
import { defaultFilters } from './data/sampleStores';
import { DataImport } from './components/DataImport';
import { RetailerTargetSetup } from './components/RetailerTargetSetup';
import { PerformanceTierSelection } from './components/PerformanceTierSelection';
import { StrategySelection } from './components/StrategySelection';
import { RegionalDistribution } from './components/RegionalDistribution';
import { ResultsAnalysis } from './components/ResultsAnalysis';
import { ProgressIndicator } from './components/ProgressIndicator';
import { LoadingSpinner } from './components/LoadingSpinner';

const STEPS: StepConfig[] = [
  {
    id: 1,
    title: 'Import',
    description: 'Upload data or use sample',
    component: 'DataImport',
    isCompleted: false,
    isActive: true,
  },
  {
    id: 2,
    title: 'Setup',
    description: 'Select retailer & target',
    component: 'RetailerTargetSetup',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 3,
    title: 'Performance',
    description: 'Choose performance tier',
    component: 'PerformanceTierSelection',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 4,
    title: 'Strategy',
    description: 'Match campaign objective',
    component: 'StrategySelection',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 5,
    title: 'Regional',
    description: 'Configure distribution',
    component: 'RegionalDistribution',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 6,
    title: 'Results',
    description: 'Review & export',
    component: 'ResultsAnalysis',
    isCompleted: false,
    isActive: false,
  },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<StepConfig[]>(STEPS);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New workflow state
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [targetConfig, setTargetConfig] = useState<TargetConfig>({
    total: 10,
  });
  const [performanceTier, setPerformanceTier] = useState<{
    type: 'percentage' | 'absolute';
    value: number;
    description: string;
  }>({
    type: 'percentage',
    value: 20,
    description: 'Top 20% performers'
  });
  const [strategy, setStrategy] = useState<SelectionStrategy>('revenue-focus');
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfiguration>({
    strategy: 'revenue-focus',
    columnMappings: {},
    parameters: {},
    regionWeights: []
  });
  const [regionalConfig, setRegionalConfig] = useState<{
    type: 'national' | 'over-index';
    overIndexRegions?: string[];
    overIndexPercentage?: number;
  }>({
    type: 'national'
  });
  
  // Legacy filters (now used internally)
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);

  // Update filtered stores when filters change
  useEffect(() => {
    if (stores.length === 0) {
      setFilteredStores([]);
      return;
    }

    let filtered = stores;

    // Apply filters
    if (filters.retailers.length > 0) {
      filtered = filtered.filter((store: StoreData) => 
        filters.retailers.some((retailer: string) => store.naam.toLowerCase().includes(retailer.toLowerCase()))
      );
    }

    if (filters.storeTypes.length > 0) {
      filtered = filtered.filter((store: StoreData) => filters.storeTypes.includes(store.type));
    }

    if (filters.strategies.length > 0) {
      filtered = filtered.filter((store: StoreData) => filters.strategies.includes(store.strategie));
    }

    if (filters.channels.length > 0) {
      filtered = filtered.filter((store: StoreData) => filters.channels.includes(store.kanaal));
    }

    if (filters.customerGroups.length > 0) {
      filtered = filtered.filter((store: StoreData) => filters.customerGroups.includes(store.klantgroep));
    }

    filtered = filtered.filter((store: StoreData) => 
      store.prodSelect >= filters.revenueRange.min && 
      store.prodSelect <= filters.revenueRange.max
    );

    if (filters.includedRegions.length > 0) {
      filtered = filtered.filter((store: StoreData) => filters.includedRegions.includes(store.fieldSalesRegio));
    }

    if (filters.excludedRegions.length > 0) {
      filtered = filtered.filter((store: StoreData) => !filters.excludedRegions.includes(store.fieldSalesRegio));
    }

    setFilteredStores(filtered);
  }, [stores, filters]);

  // Update target config when stores change
  useEffect(() => {
    if (stores.length > 0) {
      setTargetConfig(prev => ({
        ...prev,
        total: Math.min(prev.total, stores.length),
      }));
    }
  }, [stores]);

  // Update steps state
  const updateSteps = (stepId: number, completed: boolean) => {
    setSteps(prev => 
      prev.map(step => ({
        ...step,
        isCompleted: step.id < stepId || (step.id === stepId && completed),
        isActive: step.id === stepId,
      }))
    );
  };

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setIsLoading(true);
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateSteps(currentStep + 1, false);
      setCurrentStep(currentStep + 1);
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      setIsLoading(true);
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 200));
      
      updateSteps(currentStep - 1, true);
      setCurrentStep(currentStep - 1);
      setIsLoading(false);
    }
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId <= currentStep || steps[stepId - 1].isCompleted) {
      setIsLoading(true);
      
      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 250));
      
      updateSteps(stepId, stepId < currentStep);
      setCurrentStep(stepId);
      setIsLoading(false);
    }
  };

  // Data handlers
  const handleDataImport = useCallback((importedStores: StoreData[]) => {
    setStores(importedStores);
    
    // Reset filters to accommodate new data
    if (importedStores.length > 0) {
      const revenues = importedStores.map((store: StoreData) => store.prodSelect);
      const minRevenue = Math.min(...revenues);
      const maxRevenue = Math.max(...revenues);
      
      setFilters({
        ...defaultFilters,
        revenueRange: {
          min: minRevenue,
          max: maxRevenue,
        },
      });
    }
    
    updateSteps(1, true);
  }, []);

  const handleTargetChange = useCallback((config: TargetConfig) => {
    setTargetConfig(config);
    updateSteps(2, true);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
  }, []);

  const handleStrategyChange = useCallback((newStrategy: SelectionStrategy) => {
    setStrategy(newStrategy);
    // Update strategy config when strategy changes
    setStrategyConfig(prev => ({
      ...prev,
      strategy: newStrategy
    }));
    updateSteps(4, true);
  }, []);

  const handleStrategyConfigChange = useCallback((config: StrategyConfiguration) => {
    setStrategyConfig(config);
    // Also update the strategy if it changed
    if (config.strategy !== strategy) {
      setStrategy(config.strategy);
    }
  }, [strategy]);

  const handleRetailerChange = useCallback((retailer: string) => {
    setSelectedRetailer(retailer);
    updateSteps(2, true);
  }, []);

  const handlePerformanceTierChange = useCallback((tier: typeof performanceTier) => {
    setPerformanceTier(tier);
    updateSteps(3, true);
  }, []);

  const handleRegionalConfigChange = useCallback((config: typeof regionalConfig) => {
    setRegionalConfig(config);
    updateSteps(5, true);
  }, []);

  const handleStartOver = () => {
    setCurrentStep(1);
    setSteps(STEPS);
    setStores([]);
    setSelectedRetailer('');
    setTargetConfig({
      total: 10,
    });
    setPerformanceTier({
      type: 'percentage',
      value: 20,
      description: 'Top 20% performers'
    });
    setStrategy('revenue-focus');
    setStrategyConfig({
      strategy: 'revenue-focus',
      columnMappings: {},
      parameters: {},
      regionWeights: []
    });
    setRegionalConfig({
      type: 'national'
    });
    setFilters(defaultFilters);
  };

  // Render current step component
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DataImport
            onDataImport={handleDataImport}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <RetailerTargetSetup
            stores={stores}
            selectedRetailer={selectedRetailer}
            targetConfig={targetConfig}
            onRetailerChange={handleRetailerChange}
            onTargetChange={handleTargetChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <PerformanceTierSelection
            stores={stores}
            selectedRetailer={selectedRetailer}
            performanceTier={performanceTier}
            onPerformanceTierChange={handlePerformanceTierChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StrategySelection
            selectedStrategy={strategy}
            onStrategyChange={handleStrategyChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <RegionalDistribution
            stores={stores}
            selectedRetailer={selectedRetailer}
            strategy={strategy}
            regionalConfig={regionalConfig}
            onRegionalConfigChange={handleRegionalConfigChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <ResultsAnalysis
            stores={stores}
            selectedRetailer={selectedRetailer}
            targetConfig={targetConfig}
            performanceTier={performanceTier}
            strategy={strategy}
            regionalConfig={regionalConfig}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-content-50 overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <LoadingSpinner size="lg" text="Processing..." />
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-content-200 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Store List Builder Logo" 
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            </div>

            {/* Right Section - Text and Mobile Step Indicator */}
            <div className="flex items-center space-x-8">
              {/* Navigation Text */}
              <div className="hidden md:block text-right">
                <h1 className="text-lg font-bold text-content-900">
                  Store List Builder
                </h1>
                <p className="text-content-500 text-xs">
                  In-store Location Optimization
                </p>
              </div>

              {/* Mobile step indicator */}
              <div className="md:hidden">
                <span className="text-sm font-medium text-content-600">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation - Step Progress */}
      <div className="bg-content-50 border-b border-content-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <ProgressIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={handleStepClick} 
          />
        </div>
      </div>

      {/* Main Content - Maximum space */}
      <main className={`flex-1 min-h-0 bg-content-50 ${currentStep === 4 ? 'overflow-auto' : 'overflow-hidden'}`}>
        <div className={currentStep === 4 ? 'min-h-full' : 'h-full'}>
          <div className={`animate-fadeInUp ${currentStep === 4 ? 'min-h-full' : 'h-full'}`}>
            {renderStepContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 