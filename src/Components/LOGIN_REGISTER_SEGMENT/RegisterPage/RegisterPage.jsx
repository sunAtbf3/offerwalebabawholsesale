import React from "react";
import { useSelector } from "react-redux";
import {
  selectCurrentStep,
  selectFormData,
  selectRegistrationSuccess,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
import StepIndicator     from "../FORM_STEPS/StepIndicator";
import Step1_PersonalInfo from "../FORM_STEPS/Step1_PersonalInfo";
import Step2_AddressInfo  from "../FORM_STEPS/Step2_AddressInfo";
import Step3_BusinessInfo from "../FORM_STEPS/Step3_BusinessInfo";
import { CheckCircle2 }  from "lucide-react";

const RegisterPage = () => {
  const currentStep           = useSelector(selectCurrentStep);
  const formData              = useSelector(selectFormData);
  const registrationSuccess   = useSelector(selectRegistrationSuccess);

  // ── Success state — shown briefly before modal auto-closes ───────────────
  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={44} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0F172A]">Application Submitted!</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            Our team will review your request and reach out on your WhatsApp number.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <StepIndicator currentStep={currentStep} />

      <div className="px-1">
        {currentStep === 1 && <Step1_PersonalInfo formData={formData} />}
        {currentStep === 2 && <Step2_AddressInfo  formData={formData} />}
        {currentStep === 3 && <Step3_BusinessInfo formData={formData} />}
      </div>
    </div>
  );
};

export default RegisterPage;