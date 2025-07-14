import React, { useState } from 'react';
import { TrendingUp, Users, MapPin, Target, Zap, BarChart3 } from 'lucide-react';
import { SelectionStrategy } from '../types';
import { Card } from './common/Card';

interface StrategySelectionProps {
  selectedStrategy: SelectionStrategy;
  onStrategyChange: (strategy: SelectionStrategy) => void;
  onNext: () => void;
  onBack: () => void;
}

interface CampaignObjective {
  id: SelectionStrategy;
  title: string;
  description: string;
  businessGoal: string;
  bestFor: string;
  storeCharacteristics: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const CAMPAIGN_OBJECTIVES: CampaignObjective[] = [
  {
    id: 'revenue-focus',
    title: 'Drive Volume & Revenue',
    description: 'Focus on highest-performing stores to maximize total revenue impact',
    businessGoal: 'Increase total sales and revenue',
    bestFor: 'Product launches, seasonal campaigns, profit maximization',
    storeCharacteristics: 'High-volume, proven performers with strong sales track records',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'text-green-600',
    gradient: 'from-green-50 to-green-100'
  },
  {
    id: 'growth-opportunities',
    title: 'Find New Customers',
    description: 'Target underperforming stores with high potential to convert new customers',
    businessGoal: 'Expand customer base and market reach',
    bestFor: 'Brand awareness, customer acquisition, market expansion',
    storeCharacteristics: 'Large stores with lower current sales but high traffic potential',
    icon: <Users className="h-6 w-6" />,
    color: 'text-blue-600',
    gradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'geographic-coverage',
    title: 'National Coverage',
    description: 'Ensure presence across all key regions for maximum geographic reach',
    businessGoal: 'Build national brand presence',
    bestFor: 'National campaigns, brand building, market penetration',
    storeCharacteristics: 'Representative stores across all provinces with balanced distribution',
    icon: <MapPin className="h-6 w-6" />,
    color: 'text-purple-600',
    gradient: 'from-purple-50 to-purple-100'
  },
  {
    id: 'market-penetration',
    title: 'Market Penetration',
    description: 'Target stores in high-density markets for concentrated impact',
    businessGoal: 'Dominate specific market segments',
    bestFor: 'Competitive response, market dominance, focused campaigns',
    storeCharacteristics: 'Stores in high-density markets with strong competitive positioning',
    icon: <Target className="h-6 w-6" />,
    color: 'text-orange-600',
    gradient: 'from-orange-50 to-orange-100'
  },
  {
    id: 'portfolio-balance',
    title: 'Balanced Portfolio',
    description: 'Mix of proven performers, growth opportunities, and experimental markets',
    businessGoal: 'Optimize risk vs. reward across store portfolio',
    bestFor: 'Long-term strategy, diversified campaigns, risk management',
    storeCharacteristics: '70% core performers, 20% growth stores, 10% experimental',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'text-indigo-600',
    gradient: 'from-indigo-50 to-indigo-100'
  },
  {
    id: 'demographic-targeting',
    title: 'Demographic Focus',
    description: 'Target stores based on specific customer demographics and profiles',
    businessGoal: 'Reach specific customer segments',
    bestFor: 'Targeted campaigns, niche products, demographic-specific messaging',
    storeCharacteristics: 'Stores with customer base matching target demographics',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-pink-600',
    gradient: 'from-pink-50 to-pink-100'
  }
];

export const StrategySelection: React.FC<StrategySelectionProps> = ({
  selectedStrategy,
  onStrategyChange,
  onNext,
  onBack
}) => {
  const [hoveredObjective, setHoveredObjective] = useState<SelectionStrategy | null>(null);

  const handleObjectiveSelect = (objective: CampaignObjective) => {
    onStrategyChange(objective.id);
  };

  const selectedObjective = CAMPAIGN_OBJECTIVES.find(obj => obj.id === selectedStrategy);

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 bg-white border-b border-content-200 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-content-900 mb-2">
            Match Your Campaign Objective
          </h2>
          <p className="text-content-600">
            Choose the strategy that best aligns with your campaign goals
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Campaign Objectives */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-content-900">
                Campaign Objectives
              </h3>
              
              <div className="space-y-4">
                {CAMPAIGN_OBJECTIVES.map((objective) => {
                  const isSelected = selectedStrategy === objective.id;
                  const isHovered = hoveredObjective === objective.id;
                  
                  return (
                    <button
                      key={objective.id}
                      onClick={() => handleObjectiveSelect(objective)}
                      onMouseEnter={() => setHoveredObjective(objective.id)}
                      onMouseLeave={() => setHoveredObjective(null)}
                      className={`w-full p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-content-900 bg-content-50 shadow-lg'
                          : 'border-content-200 hover:border-content-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${objective.gradient}`}>
                          <div className={objective.color}>
                            {objective.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-content-900 mb-2">
                            {objective.title}
                          </h4>
                          <p className="text-content-600 text-sm leading-relaxed mb-3">
                            {objective.description}
                          </p>
                          
                          <div className="bg-content-100 rounded-lg p-3">
                            <div className="text-xs font-medium text-content-500 mb-1">
                              BUSINESS GOAL
                            </div>
                            <div className="text-sm text-content-700">
                              {objective.businessGoal}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Objective Details */}
            <div className="space-y-6">
              {(selectedObjective || hoveredObjective) && (
                <Card>
                  <div className="space-y-6">
                    {/* Objective Header */}
                    <div className="flex items-center space-x-4 pb-4 border-b border-content-200">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${
                        (hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.gradient) ||
                        selectedObjective?.gradient
                      }`}>
                        <div className={
                          (hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.color) ||
                          selectedObjective?.color
                        }>
                          {(hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.icon) ||
                           selectedObjective?.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-content-900">
                          {(hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.title) ||
                           selectedObjective?.title}
                        </h3>
                        <p className="text-content-600 text-sm">
                          {(hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.description) ||
                           selectedObjective?.description}
                        </p>
                      </div>
                    </div>

                    {/* Objective Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-content-900 mb-2">Best For:</h4>
                        <p className="text-content-600 text-sm">
                          {(hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.bestFor) ||
                           selectedObjective?.bestFor}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-content-900 mb-2">Store Characteristics:</h4>
                        <p className="text-content-600 text-sm">
                          {(hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.storeCharacteristics) ||
                           selectedObjective?.storeCharacteristics}
                        </p>
                      </div>
                    </div>

                    {/* Business Impact */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Expected Business Impact</h4>
                      <p className="text-blue-800 text-sm">
                        {(hoveredObjective && CAMPAIGN_OBJECTIVES.find(obj => obj.id === hoveredObjective)?.businessGoal) ||
                         selectedObjective?.businessGoal}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Campaign Context */}
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-content-900">
                  Campaign Context
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-content-50 rounded-lg p-4">
                    <h4 className="font-medium text-content-800 mb-2">Common Scenarios</h4>
                    <ul className="text-sm text-content-600 space-y-1">
                      <li>• <strong>Volume Challenge:</strong> Use "Drive Volume & Revenue"</li>
                      <li>• <strong>Customer Acquisition:</strong> Use "Find New Customers"</li>
                      <li>• <strong>National Launch:</strong> Use "National Coverage"</li>
                      <li>• <strong>Competitive Response:</strong> Use "Market Penetration"</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-800 mb-2">💡 Pro Tip</h4>
                    <p className="text-amber-700 text-sm">
                      Consider your campaign duration and budget. Short-term campaigns often benefit from 
                      focused strategies, while long-term initiatives can use balanced approaches.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-content-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white border border-content-300 text-content-700 rounded-lg hover:bg-content-50 transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={onNext}
            disabled={!selectedStrategy}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedStrategy
                ? 'bg-content-900 text-white hover:bg-content-800'
                : 'bg-content-300 text-content-500 cursor-not-allowed'
            }`}
          >
            Next: Regional Distribution
          </button>
        </div>
      </div>
    </div>
  );
}; 