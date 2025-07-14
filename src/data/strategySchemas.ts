import { StrategySchema, SelectionStrategy } from '../types';

// Dutch provinces for region-based strategies
export const DUTCH_PROVINCES = [
  'Groningen',
  'Friesland',
  'Drenthe',
  'Overijssel',
  'Flevoland',
  'Gelderland',
  'Utrecht',
  'Noord-Holland',
  'Zuid-Holland',
  'Zeeland',
  'Noord-Brabant',
  'Limburg'
] as const;

export const STRATEGY_SCHEMAS: Record<SelectionStrategy, StrategySchema> = {
  'revenue-focus': {
    id: 'revenue-focus',
    name: 'Revenue Focus',
    description: 'Prioritize stores with highest revenue/performance metrics',
    useCase: 'Maximize total revenue and ROI',
    category: 'performance',
    
    // Target Configuration boxes this strategy needs
    requiredTargetBoxes: ['target-count', 'dataset-overview', 'selection-preview'],
    
    requiredColumns: [
      {
        key: 'performance',
        name: 'Performance Metric',
        description: 'Revenue, sales, or performance indicator for ranking stores',
        type: 'numeric',
        required: true,
        defaultColumn: 'prodSelect'
      }
    ],
    
    optionalColumns: [
      {
        key: 'region',
        name: 'Region/Location',
        description: 'Dutch province for balanced distribution',
        type: 'categorical',
        required: false,
        defaultColumn: 'fieldSalesRegio'
      },
      {
        key: 'storeType',
        name: 'Store Type',
        description: 'Store format or type for diversification',
        type: 'categorical',
        required: false,
        defaultColumn: 'type'
      }
    ],
    
    parameters: [
      {
        key: 'minimumPerformance',
        name: 'Minimum Performance Threshold',
        description: 'Only consider stores above this performance level',
        type: 'percentage',
        required: false,
        defaultValue: 0,
        validation: { min: 0, max: 100, step: 5 }
      },
      {
        key: 'diversificationLevel',
        name: 'Geographic Diversification',
        description: 'How much to spread selection across regions',
        type: 'select',
        required: true,
        defaultValue: 'moderate',
        options: [
          { label: 'Focus on Best Regions', value: 'low' },
          { label: 'Moderate Spread', value: 'moderate' },
          { label: 'Maximum Diversification', value: 'high' }
        ]
      }
    ],
    
    supportsCustomColumns: true,
    supportsRegionalWeighting: true,
    supportsMultiObjective: false,
    calculationMethod: 'Sort by performance metric with optional regional balancing',
    algorithmComplexity: 'simple'
  },

  'geographic-coverage': {
    id: 'geographic-coverage',
    name: 'Geographic Coverage',
    description: 'Maximize geographic reach and market penetration',
    useCase: 'Ensure presence across all key regions',
    category: 'geographic',
    
    // Target Configuration boxes this strategy needs
    requiredTargetBoxes: ['target-count', 'dataset-overview', 'selection-preview', 'whats-next'],
    
    requiredColumns: [
      {
        key: 'region',
        name: 'Region/Location',
        description: 'Dutch province for coverage calculation',
        type: 'categorical',
        required: true,
        defaultColumn: 'fieldSalesRegio'
      }
    ],
    
    optionalColumns: [
      {
        key: 'performance',
        name: 'Performance Metric',
        description: 'Performance metric for tie-breaking within regions',
        type: 'numeric',
        required: false,
        defaultColumn: 'prodSelect'
      },
      {
        key: 'population',
        name: 'Population/Market Size',
        description: 'Market size or population data for weighting',
        type: 'numeric',
        required: false
      }
    ],
    
    parameters: [
      {
        key: 'coverageStrategy',
        name: 'Coverage Strategy',
        description: 'How to distribute stores across regions',
        type: 'select',
        required: true,
        defaultValue: 'proportional',
        options: [
          { label: 'Equal per Region', value: 'equal' },
          { label: 'Proportional to Store Count', value: 'proportional' },
          { label: 'Custom Regional Weights', value: 'custom' }
        ]
      },
      {
        key: 'minimumPerRegion',
        name: 'Minimum Stores per Region',
        description: 'Ensure at least this many stores per region',
        type: 'number',
        required: false,
        defaultValue: 1,
        validation: { min: 0, max: 10, step: 1 }
      },
      {
        key: 'regionWeights',
        name: 'Regional Allocation',
        description: 'Custom percentage allocation per region',
        type: 'regionWeights',
        required: false,
        defaultValue: []
      }
    ],
    
    supportsCustomColumns: true,
    supportsRegionalWeighting: true,
    supportsMultiObjective: true,
    calculationMethod: 'Distribute stores to maximize geographic coverage',
    algorithmComplexity: 'moderate'
  },

  'growth-opportunities': {
    id: 'growth-opportunities',
    name: 'Growth Opportunities',
    description: 'Target stores with high growth potential - large stores with lower current performance',
    useCase: 'Identify underperforming stores with upside potential',
    category: 'performance',
    
    // Target Configuration boxes this strategy needs
    requiredTargetBoxes: ['target-count', 'dataset-overview', 'selection-preview', 'whats-next'],
    
    requiredColumns: [
      {
        key: 'performance',
        name: 'Current Performance',
        description: 'Current revenue/sales performance metric',
        type: 'numeric',
        required: true,
        defaultColumn: 'prodSelect'
      },
      {
        key: 'potential',
        name: 'Growth Potential Indicator',
        description: 'Store size, traffic, or market potential indicator',
        type: 'numeric',
        required: true,
        validation: { min: 0 }
      }
    ],
    
    optionalColumns: [
      {
        key: 'region',
        name: 'Region/Location',
        description: 'Dutch province for balanced selection',
        type: 'categorical',
        required: false,
        defaultColumn: 'fieldSalesRegio'
      },
      {
        key: 'age',
        name: 'Store Age',
        description: 'How long the store has been operating',
        type: 'numeric',
        required: false
      }
    ],
    
    parameters: [
      {
        key: 'performanceWeight',
        name: 'Performance Weight',
        description: 'How much to weight current performance (vs potential)',
        type: 'percentage',
        required: true,
        defaultValue: 30,
        validation: { min: 0, max: 100, step: 5 }
      },
      {
        key: 'potentialWeight',
        name: 'Potential Weight',
        description: 'How much to weight growth potential',
        type: 'percentage',
        required: true,
        defaultValue: 70,
        validation: { min: 0, max: 100, step: 5 }
      },
      {
        key: 'excludeTopPerformers',
        name: 'Exclude Top Performers',
        description: 'Exclude stores already in top performance percentile',
        type: 'boolean',
        required: false,
        defaultValue: true
      }
    ],
    
    supportsCustomColumns: true,
    supportsRegionalWeighting: true,
    supportsMultiObjective: true,
    calculationMethod: 'Calculate growth score: (potential_score - performance_score) * weights',
    algorithmComplexity: 'moderate'
  },

  'portfolio-balance': {
    id: 'portfolio-balance',
    name: 'Portfolio Balance',
    description: 'Create a balanced portfolio mixing high, medium, and low performers',
    useCase: 'Risk-balanced selection with 70/20/10 methodology',
    category: 'balanced',
    
    // Target Configuration boxes this strategy needs
    requiredTargetBoxes: ['target-count', 'dataset-overview', 'selection-preview', 'whats-next'],
    
    requiredColumns: [
      {
        key: 'performance',
        name: 'Performance Metric',
        description: 'Performance metric for categorizing stores',
        type: 'numeric',
        required: true,
        defaultColumn: 'prodSelect'
      }
    ],
    
    optionalColumns: [
      {
        key: 'region',
        name: 'Region/Location',
        description: 'Dutch province for balanced distribution',
        type: 'categorical',
        required: false,
        defaultColumn: 'fieldSalesRegio'
      },
      {
        key: 'storeType',
        name: 'Store Type',
        description: 'Store format for additional diversification',
        type: 'categorical',
        required: false,
        defaultColumn: 'type'
      }
    ],
    
    parameters: [
      {
        key: 'corePercentage',
        name: 'Core Performers (%)',
        description: 'Percentage of selection from top performing stores',
        type: 'percentage',
        required: true,
        defaultValue: 70,
        validation: { min: 0, max: 100, step: 5 }
      },
      {
        key: 'growthPercentage',
        name: 'Growth Opportunities (%)',
        description: 'Percentage from medium performers with potential',
        type: 'percentage',
        required: true,
        defaultValue: 20,
        validation: { min: 0, max: 100, step: 5 }
      },
      {
        key: 'experimentalPercentage',
        name: 'Experimental (%)',
        description: 'Percentage from lower performers or new opportunities',
        type: 'percentage',
        required: true,
        defaultValue: 10,
        validation: { min: 0, max: 100, step: 5 }
      }
    ],
    
    supportsCustomColumns: true,
    supportsRegionalWeighting: true,
    supportsMultiObjective: true,
    calculationMethod: 'Segment stores by performance quartiles and select according to portfolio weights',
    algorithmComplexity: 'complex'
  },

  'market-penetration': {
    id: 'market-penetration',
    name: 'Market Penetration',
    description: 'Focus on regions with highest market opportunity and competition',
    useCase: 'Competitive market entry and expansion',
    category: 'geographic',
    
    // Target Configuration boxes this strategy needs
    requiredTargetBoxes: ['target-count', 'dataset-overview', 'selection-preview'],
    
    requiredColumns: [
      {
        key: 'region',
        name: 'Region/Market',
        description: 'Dutch province or market area',
        type: 'categorical',
        required: true,
        defaultColumn: 'fieldSalesRegio'
      },
      {
        key: 'marketSize',
        name: 'Market Size Indicator',
        description: 'Population, market value, or opportunity size',
        type: 'numeric',
        required: true
      }
    ],
    
    optionalColumns: [
      {
        key: 'performance',
        name: 'Performance Metric',
        description: 'Current store performance in the market',
        type: 'numeric',
        required: false,
        defaultColumn: 'prodSelect'
      },
      {
        key: 'competition',
        name: 'Competition Level',
        description: 'Competitive intensity or market saturation',
        type: 'numeric',
        required: false
      }
    ],
    
    parameters: [
      {
        key: 'penetrationStrategy',
        name: 'Penetration Strategy',
        description: 'How aggressive to be in market penetration',
        type: 'select',
        required: true,
        defaultValue: 'balanced',
        options: [
          { label: 'Conservative - Low Competition', value: 'conservative' },
          { label: 'Balanced - Mixed Markets', value: 'balanced' },
          { label: 'Aggressive - High Opportunity', value: 'aggressive' }
        ]
      },
      {
        key: 'marketSizeWeight',
        name: 'Market Size Weight',
        description: 'How much to prioritize larger markets',
        type: 'percentage',
        required: true,
        defaultValue: 60,
        validation: { min: 0, max: 100, step: 5 }
      }
    ],
    
    supportsCustomColumns: true,
    supportsRegionalWeighting: true,
    supportsMultiObjective: true,
    calculationMethod: 'Score markets by size and opportunity, then select best stores within target markets',
    algorithmComplexity: 'complex'
  },

  'demographic-targeting': {
    id: 'demographic-targeting',
    name: 'Demographic Targeting',
    description: 'Target specific customer demographics and segments',
    useCase: 'Reach specific customer groups or demographics',
    category: 'demographic',
    
    // Target Configuration boxes this strategy needs
    requiredTargetBoxes: ['target-count', 'dataset-overview', 'selection-preview', 'whats-next'],
    
    requiredColumns: [
      {
        key: 'customerSegment',
        name: 'Customer Segment',
        description: 'Primary customer demographic or segment',
        type: 'categorical',
        required: true,
        defaultColumn: 'klantgroep'
      }
    ],
    
    optionalColumns: [
      {
        key: 'region',
        name: 'Region/Location',
        description: 'Dutch province for additional targeting',
        type: 'categorical',
        required: false,
        defaultColumn: 'fieldSalesRegio'
      },
      {
        key: 'performance',
        name: 'Performance Metric',
        description: 'Store performance within the demographic',
        type: 'numeric',
        required: false,
        defaultColumn: 'prodSelect'
      },
      {
        key: 'demographics',
        name: 'Additional Demographics',
        description: 'Income, age, or other demographic factors',
        type: 'categorical',
        required: false
      }
    ],
    
    parameters: [
      {
        key: 'targetSegments',
        name: 'Target Customer Segments',
        description: 'Which customer segments to focus on',
        type: 'multiselect',
        required: true,
        defaultValue: [],
        options: [] // Will be populated dynamically based on data
      },
      {
        key: 'segmentWeights',
        name: 'Segment Priority Weights',
        description: 'How much to prioritize each segment',
        type: 'select',
        required: false,
        defaultValue: 'equal',
        options: [
          { label: 'Equal Weight', value: 'equal' },
          { label: 'Performance Weighted', value: 'performance' },
          { label: 'Custom Weights', value: 'custom' }
        ]
      }
    ],
    
    supportsCustomColumns: true,
    supportsRegionalWeighting: false,
    supportsMultiObjective: true,
    calculationMethod: 'Filter and rank stores by customer segment presence and performance',
    algorithmComplexity: 'moderate'
  }
}; 