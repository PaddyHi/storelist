import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface StepConfig {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface ProgressIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="progress-container mb-6">
        <div 
          className="progress-bar"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-start justify-between px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              className={`flex flex-col items-center cursor-pointer group ${
                onStepClick ? 'hover:scale-105' : ''
              } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-content-900 focus:ring-offset-2 rounded-lg p-2 min-w-0`}
              onClick={() => onStepClick && onStepClick(step.id)}
              disabled={!onStepClick}
              aria-label={`Step ${step.id}: ${step.title}. ${step.isCompleted ? 'Completed' : step.isActive ? 'Current step' : 'Not started'}`}
              tabIndex={onStepClick ? 0 : -1}
            >
              {/* Step Circle */}
              <div
                className={`
                  ${step.isCompleted ? 'step-indicator-completed' : ''}
                  ${step.isActive ? 'step-indicator' : ''}
                  ${!step.isActive && !step.isCompleted ? 'step-indicator-inactive' : ''}
                  animate-fadeInUp w-10 h-10 text-sm flex items-center justify-center
                `}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-hidden="true"
              >
                {step.isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center animate-fadeInUp animation-delay-200">
                <div 
                  className={`font-semibold text-sm leading-tight ${
                    step.isActive ? 'text-content-900' : 
                    step.isCompleted ? 'text-content-700' : 
                    'text-content-500'
                  }`}
                >
                  {step.title}
                </div>
                <div 
                  className={`text-xs mt-1 leading-tight ${
                    step.isActive ? 'text-content-600' : 
                    step.isCompleted ? 'text-content-500' : 
                    'text-content-400'
                  }`}
                >
                  {step.description}
                </div>
              </div>
            </button>

            {/* Connection Line between steps */}
            {index < steps.length - 1 && (
              <div className="flex-1 flex justify-center items-center pt-5">
                <div 
                  className={`h-px flex-1 mx-2 ${
                    step.isCompleted ? 'bg-content-900' : 'bg-content-200'
                  } transition-all duration-300`} 
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 