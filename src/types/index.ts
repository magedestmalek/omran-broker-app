export type Language = 'ar' | 'en';

export interface User {
  id: string;
  username: string;
  brokerId: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  email: string;
  branchAr: string;
  branchEn: string;
  licenseNumber: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
  avatarUrl?: string;
}

export type CommissionStatus = 'due' | 'paid' | 'under_review';

export interface Commission {
  id: string;
  brokerId: string;
  dealRef: string;
  projectNameAr: string;
  projectNameEn: string;
  unitNumber: string;
  clientName: string;
  dealAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  payoutDate: string; // Target payout date for due or actual payout date for paid
  paidDate?: string;
  invoiceRef?: string;
  paymentVoucher?: string;
  notesAr?: string;
  notesEn?: string;
}

export type RequestType = 'complaint' | 'appointment';
export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RequestStatus = 'submitted' | 'in_review' | 'scheduled' | 'resolved' | 'rejected';

export interface ComplaintRequest {
  id: string;
  brokerId: string;
  type: RequestType;
  title: string;
  categoryAr: string;
  categoryEn: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  meetingFormat?: 'hq' | 'virtual';
  departmentAr?: string;
  departmentEn?: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  adminFeedbackAr?: string;
  adminFeedbackEn?: string;
}

export type NotificationType = 'payout' | 'announcement' | 'system' | 'deal';

export interface AppNotification {
  id: string;
  brokerId: string; // Target broker ID or 'ALL'
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  actionRef?: string;
}

export interface AppsScriptConfig {
  webAppUrl: string;
  isConnected: boolean;
  lastSyncTime?: string;
  isSimulated: boolean;
}
