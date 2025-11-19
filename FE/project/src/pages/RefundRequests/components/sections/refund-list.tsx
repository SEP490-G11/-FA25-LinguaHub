import React, { useState } from 'react';
import { Calendar, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import api from '@/config/axiosConfig.ts';

interface RefundRequest {
  refundRequestId: number;
  bookingPlanId: number;
  slotId: number;
  userId: number;
  packageId: number | null;
  refundAmount: number;
  bankAccountNumber: string | null;
  bankOwnerName: string | null;
  bankName: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'SUBMITTED';
  createdAt: string;
  processedAt: string | null;
}

interface RefundListProps {
  requests: RefundRequest[];
  currentUserId: number;
  isStudentView?: boolean;
}

const RefundList = ({ requests, currentUserId, isStudentView = false }: RefundListProps) => {
  const [editableRequest, setEditableRequest] = useState<RefundRequest | null>(null);
  const { toast } = useToast();

  const getStatusBadge = (status: RefundRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1.5">
              <AlertCircle className="w-3 h-3" />
              Pending
            </Badge>
        );
      case 'APPROVED':
        return (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1.5">
              <CheckCircle className="w-3 h-3" />
              Approved
            </Badge>
        );
      case 'PROCESSED':
        return (
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1.5">
              <CheckCircle className="w-3 h-3" />
              Processed
            </Badge>
        );
      case 'REJECTED':
        return (
            <Badge className="bg-red-100 text-red-700 border-red-200 gap-1.5">
              <XCircle className="w-3 h-3" />
              Rejected
            </Badge>
        );
      case 'SUBMITTED':
        return (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1.5">
              <AlertCircle className="w-3 h-3" />
              Submitted
            </Badge>
        );
    }
  };

  const handleSubmitForm = async (event: React.FormEvent, requestId: number) => {
    event.preventDefault();

    if (editableRequest) {
      try {
        const response = await api.put(`/learner/refund/${requestId}`, {
          bankName: editableRequest.bankName,
          bankOwnerName: editableRequest.bankOwnerName,
          bankAccountNumber: editableRequest.bankAccountNumber,
        });

        if (response.data.code === 0) {
          toast({
            title: 'Success!',
            description: 'Refund request updated successfully!',
            variant: 'success',
          });
          setEditableRequest(null);
        }
      } catch (error) {
        console.error('Error updating refund request:', error);
        toast({
          title: 'Error',
          description: 'Failed to update refund request.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
      <div className="space-y-4">
        {requests.map((request) => (
            <div key={request.refundRequestId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-md ring-2 ring-slate-100">
                    <AvatarImage src={request.bankOwnerName || 'default-avatar.jpg'} alt={request.bankOwnerName || 'No name provided'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {request.bankOwnerName?.split(' ').map((n) => n[0]).join('') || 'NA'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {request.bankOwnerName || 'Bank Refund'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-3.5 h-3.5" />
                          <span>{isStudentView ? 'Student' : 'Admin'}</span>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div className="text-sm">
                          <span className="text-slate-500">Created: </span>
                          <span className="font-medium text-slate-700">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-600 font-medium">Refund amount:</span>
                        <span className="font-bold text-blue-900 text-xl">{request.refundAmount.toLocaleString()} đ</span>
                      </div>
                      <p className="text-xs text-blue-800">
                        {request.status === 'PENDING'
                            ? 'Your refund is being reviewed by admin'
                            : request.status === 'APPROVED'
                                ? 'Approved! Will be sent to your bank account soon'
                                : request.status === 'PROCESSED'
                                    ? 'This amount was sent to your bank account'
                                    : 'Refund request was rejected'}
                      </p>
                    </div>
                  </div>
                </div>

                {request.status === 'PENDING' && !request.bankAccountNumber && !request.bankOwnerName && !request.bankName && request.userId === currentUserId && (
                    <div className="flex flex-col gap-2 lg:min-w-[180px]">
                      <Button
                          onClick={() => setEditableRequest(request)}
                          className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Provide Bank Details
                      </Button>
                    </div>
                )}

                {editableRequest && editableRequest.refundRequestId === request.refundRequestId && (
                    <form onSubmit={(e) => handleSubmitForm(e, request.refundRequestId)} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-slate-700">Bank Name</label>
                        <input
                            type="text"
                            id="bankName"
                            value={editableRequest.bankName || ''}
                            onChange={(e) => setEditableRequest({ ...editableRequest, bankName: e.target.value })}
                            className="mt-1 p-2 w-full border border-slate-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="bankOwnerName" className="block text-sm font-medium text-slate-700">Bank Owner Name</label>
                        <input
                            type="text"
                            id="bankOwnerName"
                            value={editableRequest.bankOwnerName || ''}
                            onChange={(e) => setEditableRequest({ ...editableRequest, bankOwnerName: e.target.value })}
                            className="mt-1 p-2 w-full border border-slate-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-slate-700">Bank Account Number</label>
                        <input
                            type="text"
                            id="bankAccountNumber"
                            value={editableRequest.bankAccountNumber || ''}
                            onChange={(e) => setEditableRequest({ ...editableRequest, bankAccountNumber: e.target.value })}
                            className="mt-1 p-2 w-full border border-slate-300 rounded-md"
                        />
                      </div>
                      <Button type="submit" className="mt-4 bg-green-600 text-white">
                        Submit Details
                      </Button>
                    </form>
                )}
              </div>
            </div>
        ))}
      </div>
  );
};

export default RefundList;
