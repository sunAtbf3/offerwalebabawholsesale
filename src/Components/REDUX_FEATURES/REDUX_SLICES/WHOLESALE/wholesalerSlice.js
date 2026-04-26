import { createSlice } from "@reduxjs/toolkit";

// ─────────────────────────────────────────────────────────────────────────────
// Initial form data — matches every field the backend expects
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_FORM_DATA = {
  // Step 1
  fullName:        "",
  email:           "",
  mobileNumber:    "",
  whatsappNumber:  "",
  // Step 2
  permanentAddress: "",
  businessAddress:  "",
  deliveryAddress:  "",
  haveShop:         false,
  // Step 3
  sellingPlaceFrom:          "",
  sellingZoneCity:           "",
  productCategory:           "",
  monthlyEstimatedPurchase:  "",
  // Files — stored as refs, excluded from serialization check in store.js
  idProofFile:               null,
  businessAddressProofFile:  null,
};

const initialState = {
  // Modal
  isModalOpen: false,
  activeTab:   "register", // "login" | "register"
  // Stepper
  currentStep: 1,
  formData:    { ...INITIAL_FORM_DATA },
  // Post-submit
  submittedRequestId:  null,
  registrationSuccess: false,
};

const wholesalerSlice = createSlice({
  name: "wholesaler",
  initialState,
  reducers: {
    // ── Modal controls ──────────────────────────────────────────────────────
    openModal(state, action) {
      state.isModalOpen = true;
      // Allow caller to specify which tab to open: openModal("login") | openModal("register")
      if (action.payload === "login" || action.payload === "register") {
        state.activeTab = action.payload;
      }
    },
    closeModal(state) {
      state.isModalOpen            = false;
      state.currentStep            = 1;
      state.formData               = { ...INITIAL_FORM_DATA };
      state.submittedRequestId     = null;
      state.registrationSuccess    = false;
    },
    setActiveTab(state, action) {
      state.activeTab   = action.payload;
      state.currentStep = 1;
      state.formData    = { ...INITIAL_FORM_DATA };
    },

    // ── Stepper ─────────────────────────────────────────────────────────────
    nextStep(state) {
      if (state.currentStep < 3) state.currentStep += 1;
    },
    prevStep(state) {
      if (state.currentStep > 1) state.currentStep -= 1;
    },
    goToStep(state, action) {
      const step = action.payload;
      if (step >= 1 && step <= 3) state.currentStep = step;
    },

    // ── Form data ───────────────────────────────────────────────────────────
    updateFormData(state, action) {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData(state) {
      state.formData    = { ...INITIAL_FORM_DATA };
      state.currentStep = 1;
    },

    // ── Post-submit ─────────────────────────────────────────────────────────
    setRegistrationSuccess(state, action) {
      state.registrationSuccess = true;
      state.submittedRequestId  = action.payload ?? null;
    },
  },
});

export const {
  openModal,
  closeModal,
  setActiveTab,
  nextStep,
  prevStep,
  goToStep,
  updateFormData,
  resetFormData,
  setRegistrationSuccess,
} = wholesalerSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectIsModalOpen          = (state) => state.wholesaler.isModalOpen;
export const selectActiveTab            = (state) => state.wholesaler.activeTab;
export const selectCurrentStep          = (state) => state.wholesaler.currentStep;
export const selectFormData             = (state) => state.wholesaler.formData;
export const selectRegistrationSuccess  = (state) => state.wholesaler.registrationSuccess;
export const selectSubmittedRequestId   = (state) => state.wholesaler.submittedRequestId;

export default wholesalerSlice.reducer;