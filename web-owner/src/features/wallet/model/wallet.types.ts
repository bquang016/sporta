export interface OwnerWalletResponse {
  balance: number;
  totalEarned: number;
  totalCommission: number;
  formattedBalance: string;
  formattedTotalEarned: string;
  formattedTotalCommission: string;
}

export interface WalletTransactionResponse {
  id: string;
  walletType: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface WithdrawalResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  formattedAmount: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: string;
  adminNote: string;
  processedAt: string;
  createdAt: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface BankAccountResponse {
  id: string;
  bankCode: string;
  bankName: string;
  bankLogo: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateBankAccountRequest {
  bankCode: string;
  bankName: string;
  bankLogo: string;
  accountNumber: string;
  accountName: string;
}

export interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}
