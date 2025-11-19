import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HeroSectionProps {
  stats: {
    pending: number;
    submitted: number;
    processed: number;
    rejected: number;
    totalAmount: number;
  };
}

const HeroSection = ({ stats }: HeroSectionProps) => {
  return (
      <div className="bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Refund Requests</h1>
            <p className="text-green-100 text-lg mb-2">Track your refund requests for cancelled bookings</p>
            <p className="text-green-200 text-sm">When you cancel a booking, your refund will be processed and sent to your bank account</p>
          </div>
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span className="text-sm text-green-100 font-medium">Pending</span>
                </div>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-300" />
                  <span className="text-sm text-green-100 font-medium">Submitted</span>
                </div>
                <p className="text-3xl font-bold">{stats.submitted}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-green-100 font-medium">Processed</span>
                </div>
                <p className="text-3xl font-bold">{stats.processed}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-300" />
                  <span className="text-sm text-green-100 font-medium">Rejected</span>
                </div>
                <p className="text-3xl font-bold">{stats.rejected}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-green-100 font-medium">Total</span>
              </div>
              <p className="text-4xl font-bold whitespace-nowrap">{stats.totalAmount.toLocaleString()} đ</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HeroSection;