// Core store data interface based on the specified structure
export interface StoreData {
  naam: string;           // Store name
  crmId: string;         // CRM identifier
  storeId: string;       // Store identifier
  stad: string;          // City
  straat: string;        // Street
  nummer: string;        // Street number
  postcode: string;      // Postal code
  kanaal: string;        // Channel type
  type: string;          // Store type
  fieldSalesRegio: string; // Sales region
  klantgroep: string;    // Customer group
  prodSelect: number;    // Revenue/performance metric
  strategie: string;     // Store strategy
  storeSize: number;     // Store size in square meters
}

// Strategy types for store selection
export type SelectionStrategy = 
  | 'revenue-focus'
  | 'geographic-coverage'
  | 'growth-opportunities'
  | 'portfolio-balance'
  | 'market-penetration'
  | 'demographic-targeting';

// Portfolio Balance Configuration for 70/20/10 methodology
export interface PortfolioConfig {
  coreMarkets: number;      // 70% - Established strong performers
  growthMarkets: number;    // 20% - Growth opportunities
  experimental: number;     // 10% - New/experimental markets
  prioritizePerformance: boolean;
  ensureGeographicSpread: boolean;
}

// Filter configurations
export interface FilterConfig {
  retailers: string[];
  storeTypes: string[];
  strategies: string[];
  channels: string[];
  customerGroups: string[];
  revenueRange: {
    min: number;
    max: number;
  };
  includedRegions: string[];
  excludedRegions: string[];
}

// Target configuration for store selection
export interface TargetConfig {
  total: number;
}

// Strategy configuration
export interface StrategyConfig {
  strategy: SelectionStrategy;
  name: string;
  description: string;
  algorithm: string;
  useCase: string;
  config?: PortfolioConfig;
}

// Results and analysis
export interface SelectionResult {
  selectedStores: StoreData[];
  totalRevenue: number;
  averageRevenue: number;
  regionCoverage: number;
  performanceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  statistics: {
    totalStores: number;
    uniqueRegions: number;
    uniqueRetailers: number;
    revenuePerRegion: Record<string, number>;
  };
}

// Application state
export interface AppState {
  currentStep: number;
  stores: StoreData[];
  filteredStores: StoreData[];
  targetConfig: TargetConfig;
  filters: FilterConfig;
  strategy: SelectionStrategy;
  results: SelectionResult | null;
  isLoading: boolean;
  error: string | null;
}

// CSV import related types
export interface CSVImportResult {
  success: boolean;
  data?: StoreData[];
  errors?: string[];
  warnings?: string[];
  partialSuccess?: boolean;
}

// Filter validation
export interface FilterValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Strategy definitions
export const STRATEGY_DEFINITIONS: Record<SelectionStrategy, StrategyConfig> = {
  'revenue-focus': {
    strategy: 'revenue-focus',
    name: 'Revenue Maximization',
    description: 'Select highest-performing stores to maximize total revenue',
    algorithm: 'Sort by revenue descending',
    useCase: 'Best for: Ensuring high ROI, focusing on proven performers'
  },
  'geographic-coverage': {
    strategy: 'geographic-coverage',
    name: 'Geographic Distribution',
    description: 'Ensure balanced representation across all regions and markets',
    algorithm: 'Regional spread with performance balancing',
    useCase: 'Best for: Market expansion, ensuring national presence'
  },
  'growth-opportunities': {
    strategy: 'growth-opportunities',
    name: 'Growth Potential',
    description: 'Target underperforming stores with high growth potential',
    algorithm: 'Focus on mid-tier performers with growth indicators',
    useCase: 'Best for: Development programs, untapped market potential'
  },
  'portfolio-balance': {
    strategy: 'portfolio-balance',
    name: '70/20/10 Portfolio Strategy',
    description: 'Strategic allocation: 70% core markets, 20% growth, 10% experimental',
    algorithm: 'Tiered selection with strategic allocation framework',
    useCase: 'Best for: Balanced risk approach, comprehensive strategy'
  },
  'market-penetration': {
    strategy: 'market-penetration',
    name: 'Market Penetration',
    description: 'Focus on high-density markets and competitive positioning',
    algorithm: 'Density-based selection with competitive analysis',
    useCase: 'Best for: Competitive markets, urban expansion'
  },
  'demographic-targeting': {
    strategy: 'demographic-targeting',
    name: 'Demographic Focus',
    description: 'Select stores based on target customer demographics and profiles',
    algorithm: 'Customer group and demographic-based selection',
    useCase: 'Best for: Specific audience targeting, customer-centric approaches'
  }
};

// Revenue performance categories
export enum PerformanceCategory {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Available Dutch retailers for sample data
export const DUTCH_RETAILERS = [
  'Albert Heijn',
  'Jumbo',
  'Lidl',
  'Aldi',
  'Plus',
  'Vomar',
  'Coop',
  'Spar'
] as const;

// Available store types
export const STORE_TYPES = [
  'Filiaal',
  'Franchiser'
] as const;

// Available strategies
export const STRATEGIES = [
  'Executie',
  'Brandbuilding',
  'Executie+'
] as const;

// Available channels
export const CHANNELS = [
  'Stedelijk Premium',
  'Landelijk Mainstream',
  'Stedelijk Basis',
  'Landelijk Basis'
] as const;

// Customer groups
export const CUSTOMER_GROUPS = [
  'A',
  'B',
  'C',
  'D'
] as const;

// Utility type for form validation
export type ValidationResult<T> = {
  isValid: boolean;
  data?: T;
  errors: string[];
};

// Step configuration for the progressive workflow
export interface StepConfig {
  id: number;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
  isActive: boolean;
}

// Export functionality
export interface ExportConfig {
  format: 'csv';
  includeHeaders: boolean;
  filename: string;
  dateStamp: boolean;
} 

// Enhanced Strategy Schema System
export interface ColumnRequirement {
  key: string;                    // Internal key for the requirement
  name: string;                   // Display name
  description: string;            // What this column is used for
  type: 'numeric' | 'categorical' | 'boolean' | 'date';
  required: boolean;              // Is this column mandatory?
  mappedColumn?: string;          // Which actual data column is mapped to this
  defaultColumn?: string;         // Suggested default mapping
  validation?: {
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
}

export interface StrategyParameter {
  key: string;
  name: string;
  description: string;
  type: 'number' | 'percentage' | 'boolean' | 'select' | 'multiselect' | 'regionWeights';
  required: boolean;
  defaultValue: any;
  options?: string[] | { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

export interface RegionWeight {
  region: string;
  weight: number;
  targetPercentage?: number;
}

export interface StrategySchema {
  id: SelectionStrategy;
  name: string;
  description: string;
  useCase: string;
  category: 'performance' | 'geographic' | 'demographic' | 'balanced' | 'custom';
  
  // Target Configuration boxes this strategy needs
  requiredTargetBoxes: ('target-count' | 'dataset-overview' | 'selection-preview' | 'whats-next')[];
  
  // Column requirements
  requiredColumns: ColumnRequirement[];
  optionalColumns: ColumnRequirement[];
  
  // Configuration parameters
  parameters: StrategyParameter[];
  
  // Advanced configuration
  supportsCustomColumns: boolean;
  supportsRegionalWeighting: boolean;
  supportsMultiObjective: boolean;
  
  // Calculation method
  calculationMethod: string;
  algorithmComplexity: 'simple' | 'moderate' | 'complex';
}

export interface StrategyConfiguration {
  strategy: SelectionStrategy;
  columnMappings: Record<string, string>;  // requirement key -> actual column name
  parameters: Record<string, any>;         // parameter key -> value
  customColumns?: CustomColumn[];
  regionWeights?: RegionWeight[];
}

export interface CustomColumn {
  id: string;
  name: string;
  description: string;
  formula: string;
  type: 'numeric' | 'categorical' | 'boolean';
  dependencies: string[];  // Which columns this depends on
}

export interface ColumnAnalysis {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'date' | 'unknown';
  uniqueValues: number;
  nullCount: number;
  sampleValues: any[];
  statistics?: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    standardDeviation?: number;
  };
  suggestedRequirements: string[];  // Which strategy requirements this could fulfill
}

export interface DataColumnMapping {
  availableColumns: ColumnAnalysis[];
  suggestedMappings: Record<SelectionStrategy, Record<string, string>>;
  conflicts: string[];  // Columns that couldn't be automatically mapped
} 