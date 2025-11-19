import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { WithdrawRequestStats } from '../types';
import { formatCurrency } from '../utils';

interface WithdrawRequestStatsProps {
  stats: WithdrawRequestStats;
  isLoading: boolean;
}

export default function WithdrawRequestStatsComponent({ 
  stats, 
  isLoading 
}: WithdrawRequestStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="bg-white/15 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 animate-pulse"
          >
            <div className="h-5 bg-white/20 rounded mb-2"></div>
            <div className="h-8 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: FileText,
      label: 'Total Requests',
      value: stats.totalRequests.toString(),
      iconColor: 'text-blue-300',
      bgColor: 'bg-white/15',
    },
    {
      icon: Clock,
      label: 'Pending',
      value: stats.pendingCount.toString(),
      iconColor: 'text-yellow-300',
      bgColor: 'bg-white/15',
    },
    {
      icon: CheckCircle,
      label: 'Approved',
      value: stats.approvedCount.toString(),
      iconColor: 'text-green-300',
      bgColor: 'bg-white/15',
    },
    {
      icon: XCircle,
      label: 'Rejected',
      value: stats.rejectedCount.toString(),
      iconColor: 'text-red-300',
      bgColor: 'bg-white/15',
    },
    {
      icon: DollarSign,
      label: 'Total Withdrawal',
      value: formatCurrency(stats.totalWithdrawAmount),
      iconColor: 'text-green-300',
      bgColor: 'bg-white/15',
    },
    {
      icon: DollarSign,
      label: 'Total Commission',
      value: formatCurrency(stats.totalCommission),
      iconColor: 'text-blue-300',
      bgColor: 'bg-white/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 transition-all hover:bg-white/20`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs font-medium truncate">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-white truncate">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
