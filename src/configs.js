const SMART_CONTRACTS = {
  CashierContractAddress: "0x36c1321E25a4C7cEaD8E64C89fb0A7A2324cea89",
  VoucherKernelContractAddress: "0x697d96F5C2f3DFCC8A0361070f19BE6eFDDEC0f7",
  BosonRouterContractAddressPolygon: "0xBa573Ff56Ba32c4ee1D4d8EF16337504Db5938d6", //ganache 1
  BosonRouterContractAddressArbitrum: "0xBa573Ff56Ba32c4ee1D4d8EF16337504Db5938d6", //ganache 2
  BosonRouterContractAddressGanache: "0x8C49ef50160104b02C95f7e4d4e8d60C97Fcd459",
  BosonTokenContractAddress: "0x46326b2d7ea8e32aFC9a4e6bD583AF993827Dd6C",
  FundLimitsContractAddress: "0x85c6A75ddf3635060b69c558ca0bf09488Bd1B45",

};

const SMART_CONTRACTS_EVENTS = {
  LOG_VOUCHER_DELIVERED: "LogVoucherDelivered",
  LOG_CANCEL_FAULT_VOUCHER_SET: "LogVoucherSetFaultCancel",
  LOG_ORDER_CREATED: "LogOrderCreated",
  LOG_VOUCHER_CANCEL_FAULT: "LogVoucherFaultCancel",
  LOG_VOUCHER_COMPLAIN: "LogVoucherComplain",
  LOG_VOUCHER_REDEEMED: "LogVoucherRedeemed",
  LOG_VOUCHER_REFUNDED: "LogVoucherRefunded",
};

const VOUCHER_STATUSES = {
  COMMITTED: "COMMITTED",
  REDEEMED: "REDEEMED",
  REFUNDED: "REFUNDED",
  COMPLAINED: "COMPLAINED",
  CANCELLED: "CANCELLED",
  FINALIZED: "FINALIZED",
};

//ToDo: Make it more generic for the next phase, not coupled to BSN.
const PAYMENT_METHODS = {
  ETHETH: 1,
  ETHBSN: 2,
  BSNETH: 3,
  BSNBSN: 4,
};

const PAYMENT_METHODS_LABELS = {
  ETHETH: "ETHETH",
  ETHBSN: "ETHBSN",
  BSNETH: "BSNETH",
  BSNBSN: "BSNBSN",
};

module.exports = { SMART_CONTRACTS, SMART_CONTRACTS_EVENTS, SMART_CONTRACTS_EVENTS, PAYMENT_METHODS_LABELS };
