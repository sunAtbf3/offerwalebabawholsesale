import React from "react";
import { useSelector } from "react-redux";
import {
  selectFormData,
  selectRegistrationSuccess,
} from "../../REDUX_FEATURES/REDUX_SLICES/WHOLESALE/wholesalerSlice";
import Step1_PersonalInfo from "../FORM_STEPS/Step1_PersonalInfo";
import { CheckCircle2 } from "lucide-react";

const RegisterPage = () => {
  const formData = useSelector(selectFormData);
  const registrationSuccess = useSelector(selectRegistrationSuccess);

  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={44} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0F172A]">Interest Submitted!</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            Our team will review your request. After approval we&apos;ll notify you on
            WhatsApp — then complete business details and activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-1">
      <Step1_PersonalInfo formData={formData} />
    </div>
  );
};

export default RegisterPage;
