import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Address Info" },
  { number: 3, label: "Business Info" },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full mb-8 px-4">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive    = currentStep === step.number;
        const isLast      = idx === STEPS.length - 1;

        return (
          <React.Fragment key={step.number}>
            {/* Step bubble + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300
                  ${isCompleted
                    ? "bg-amber-500 border-amber-500 text-white"
                    : isActive
                    ? "bg-[#0F172A] border-[#0F172A] text-white"
                    : "bg-white border-slate-300 text-slate-400"
                  }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                  ${isActive ? "text-[#0F172A]" : isCompleted ? "text-amber-600" : "text-slate-400"}`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-3 mb-5">
                <div className="h-0.5 w-full bg-slate-200 relative overflow-hidden rounded-full">
                  <div
                    className="absolute left-0 top-0 h-full bg-amber-500 transition-all duration-500 rounded-full"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;