// Display labels for WISHED_VISA enum values
export const WISHED_VISA_LABELS = {
  renew_the_existing_one: 'Renew the Existing One',
  non_immigrant_o_visa_3_month: 'Non-Immigrant O Visa (3 Month)',
  married_to_thai_visa: 'Married to Thai Visa',
  thai_child_visa: 'Thai Child Visa',
  student_visa_language_school: 'Student Visa (Language School)',
  student_visa_school_or_university: 'Student Visa (School or University)',
  retirement_visa: 'Retirement Visa',
  guardian_visa: 'Guardian Visa',
  dependent_visa: 'Dependent Visa',
  non_immigrant_b_visa_3_month: 'Non-Immigrant B Visa (3 Month)',
  business_visa_employment_1_year: 'Business Visa Employment (1 Year)',
  retirement_visa_1_year: 'Retirement Visa (1 Year)',
  non_immigrant_oa_visa: 'Non-Immigrant OA Visa',
  elite_visa: 'Elite Visa',
  dtv: 'DTV',
  ltr_wealthy_pensioner: 'LTR: Wealthy Pensioner',
  ltr_wealthy_citizen: 'LTR: Wealthy Citizen',
  ltr_highly_skilled_professional: 'LTR: Highly Skilled/Professional',
  ltr_work_from_thailand_professional: 'LTR: Work from Thailand Professional',
};

// Display labels for EXISTING_VISA enum values
export const EXISTING_VISA_LABELS = {
  entry_stamp_30_day: 'Entry Stamp (30 Day)',
  entry_stamp_60_day: 'Entry Stamp (60 Day)',
  tourist_visa_60_day: 'Tourist Visa (60 Day)',
  non_immigrant_o_visa_3_month: 'Non-Immigrant O Visa (3 Month)',
  married_to_thai_visa: 'Married to Thai Visa',
  thai_child_visa: 'Thai Child Visa',
  student_visa_language_school: 'Student Visa (Language School)',
  student_visa_school_or_university: 'Student Visa (School or University)',
  retirement_visa: 'Retirement Visa',
  guardian_visa: 'Guardian Visa',
  dependent_visa: 'Dependent Visa',
  non_immigrant_b_visa_3_month: 'Non-Immigrant B Visa (3 Month)',
  business_visa_employment_1_year: 'Business Visa Employment (1 Year)',
  retirement_visa_1_year: 'Retirement Visa (1 Year)',
  non_immigrant_oa_visa: 'Non-Immigrant OA Visa',
  elite_visa: 'Elite Visa',
  dtv: 'DTV',
  ltr_wealthy_pensioner: 'LTR: Wealthy Pensioner',
  ltr_wealthy_citizen: 'LTR: Wealthy Citizen',
  ltr_highly_skilled_professional: 'LTR: Highly Skilled/Professional',
  ltr_work_from_thailand_professional: 'LTR: Work from Thailand Professional',
};

// Helper function to get display label
export const getWishedVisaLabel = value => {
  return WISHED_VISA_LABELS[value] || value;
};

export const getExistingVisaLabel = value => {
  return EXISTING_VISA_LABELS[value] || value;
};

// Custom sort order for WISHED_VISA (sorted by display labels)
export const WISHED_VISA_SORT_ORDER = Object.keys(WISHED_VISA_LABELS).sort(
  (a, b) => {
    return WISHED_VISA_LABELS[a].localeCompare(WISHED_VISA_LABELS[b]);
  }
);

// Custom sort order for EXISTING_VISA (sorted by display labels)
export const EXISTING_VISA_SORT_ORDER = Object.keys(EXISTING_VISA_LABELS).sort(
  (a, b) => {
    return EXISTING_VISA_LABELS[a].localeCompare(EXISTING_VISA_LABELS[b]);
  }
);

export default {
  WISHED_VISA_LABELS,
  EXISTING_VISA_LABELS,
  getWishedVisaLabel,
  getExistingVisaLabel,
  WISHED_VISA_SORT_ORDER,
  EXISTING_VISA_SORT_ORDER,
};
