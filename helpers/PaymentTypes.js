// Payment Type Definitions for Holy Cross Convent School App
// Based on Pinnacle_School's Feetypes.ts

// Group Detail Object for individual fee components
export const createGroupDetailObjectRequest = ({
  headName = '',
  installmentName = '',
  refundFlag = 'N',
  feesMinusDeductionAmount = '0',
  dueDate = '',
  paidAmount = '0',
  balFeesAmout = '0',
  feesHeadValueId = '',
  ctr = '0',
  dueHead = 'N',
  feesAmount = '0'
} = {}) => ({
  headName,
  installmentName,
  refundFlag,
  feesMinusDeductionAmount,
  dueDate,
  paidAmount,
  balFeesAmout,
  feesHeadValueId,
  ctr,
  dueHead,
  feesAmount
});

// Fees Details Object for fee group information
export const createFeesDetailsObjectRequest = ({
  groupName = '',
  groupConfigId = '',
  amountPaid = '0',
  currDueBal = '0',
  fineAmount = '0',
  totalBal = '0',
  totalDiscount = '0',
  transPresent = 'N',
  bankId = '',
  getway = '',
  bankName = '',
  bankAccNo = '',
  bankAccName = '',
  groupDetails = []
} = {}) => ({
  groupName,
  groupConfigId,
  amountPaid,
  currDueBal,
  fineAmount,
  totalBal,
  totalDiscount,
  transPresent,
  bankId,
  getway,
  bankName,
  bankAccNo,
  bankAccName,
  groupDetails
});

// Fees Transaction Object for payment processing
export const createFeesTransactionObjectRequest = ({
  feesDbName = '',
  academicYear = '',
  pId = '',
  feesDate = '',
  className = '',
  divisionName = '',
  admissionType = '',
  configProp = '',
  localhostProp = '',
  feesDetails = []
} = {}) => ({
  feesDbName,
  academicYear,
  pId,
  feesDate,
  className,
  divisionName,
  admissionType,
  configProp,
  localhostProp,
  feesDetails
});

// Main Transaction Request for payment initiation
export const createIntitateFeesTransactionMainRequest = ({
  feesOnlineTransactionDTO = []
} = {}) => ({
  feesOnlineTransactionDTO
});

// Academic Data List Type
export const createAcademicDataListType = ({
  session = '',
  className = '',
  section = '',
  divisionId = '',
  admissionType = ''
} = {}) => ({
  session,
  className,
  section,
  divisionId,
  admissionType
});

// Student Configuration Type
export const createStudentConfigType = ({
  ONLINE_FEE = 'N',
  ONLINE_FEE_MESSAGE = '',
  PENDING_FEE = 'N',
  FEE_BIFURCATION = 'N'
} = {}) => ({
  ONLINE_FEE,
  ONLINE_FEE_MESSAGE,
  PENDING_FEE,
  FEE_BIFURCATION
});

// Payment Receipt Type
export const createPaymentReceiptType = ({
  receiptNo = '',
  amountPaid = '0',
  feesDate = '',
  paymentId = '',
  status = '',
  createdTimestamp = ''
} = {}) => ({
  receiptNo,
  amountPaid,
  feesDate,
  paymentId,
  status,
  createdTimestamp
});

// Recent Payment Type
export const createRecentPaymentType = ({
  PAYMENT_ID = '',
  AMOUNT = '0',
  STATE_NAME = '',
  CREATED_TIMESTAMP = ''
} = {}) => ({
  PAYMENT_ID,
  AMOUNT,
  STATE_NAME,
  CREATED_TIMESTAMP
});

// Fee Group Type
export const createFeeGroupType = ({
  groupName = '',
  groupConfigId = '',
  totalBalaceAmount = '0',
  totalDiscount = '0',
  paytmChecksum = [],
  groupDetails = []
} = {}) => ({
  groupName,
  groupConfigId,
  totalBalaceAmount,
  totalDiscount,
  paytmChecksum,
  groupDetails
});

// Payment Gateway Configuration
export const createPaymentGatewayConfig = ({
  callback_url = '',
  channel_id = 'WAP',
  cust_id = '',
  email = '',
  industry_type_id = 'PrivateEducation',
  merchantKey = '',
  mid = '',
  mobile_no = '',
  order_id = '',
  txn_amount = '',
  website = 'APPPROD'
} = {}) => ({
  callback_url,
  channel_id,
  cust_id,
  email,
  industry_type_id,
  merchantKey,
  mid,
  mobile_no,
  order_id,
  txn_amount,
  website
});

// Validation helpers
export const validatePaymentAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validateFeesData = (feesData) => {
  return feesData && 
         feesData.groupName && 
         feesData.groupConfigId && 
         validatePaymentAmount(feesData.totalBalaceAmount);
};

export const validateStudentInfo = (studentInfo) => {
  return studentInfo &&
         studentInfo.feesDbName &&
         studentInfo.pId &&
         studentInfo.className;
};

// Payment status constants
export const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED'
};

// Fee head types
export const FEE_HEAD_TYPES = {
  TUITION: 'TUITION',
  TRANSPORT: 'TRANSPORT',
  LIBRARY: 'LIBRARY',
  LABORATORY: 'LABORATORY',
  MISCELLANEOUS: 'MISCELLANEOUS'
};

export default {
  createGroupDetailObjectRequest,
  createFeesDetailsObjectRequest,
  createFeesTransactionObjectRequest,
  createIntitateFeesTransactionMainRequest,
  createAcademicDataListType,
  createStudentConfigType,
  createPaymentReceiptType,
  createRecentPaymentType,
  createFeeGroupType,
  createPaymentGatewayConfig,
  validatePaymentAmount,
  validateFeesData,
  validateStudentInfo,
  PAYMENT_STATUS,
  FEE_HEAD_TYPES
};
