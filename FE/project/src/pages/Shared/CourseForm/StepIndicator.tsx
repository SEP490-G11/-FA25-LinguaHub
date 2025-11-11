import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { title: string; description?: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center w-full max-w-md">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              {/* Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > index + 1
                      ? 'bg-green-500 text-white'
                      : currentStep === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-2 text-sm font-medium text-center text-gray-700">
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {step.description}
                  </span>
                )}
              </div>

              {/* Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 transition-colors ${
                    currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
