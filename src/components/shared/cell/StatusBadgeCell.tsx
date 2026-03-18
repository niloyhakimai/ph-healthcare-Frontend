import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types/doctor.types"

interface IStatusBadgeCellProps {
    status : UserStatus;
}


const StatusBadgeCell = ({status} : IStatusBadgeCellProps) => {
  const getStatusVariant = () => {
    switch(status) {
      case UserStatus.ACTIVE:
        return "default"; // Will use green background
      case UserStatus.BLOCKED:
        return "destructive"; // Red background
      case UserStatus.DELETED:
        return "secondary"; // Gray background
      default:
        return "secondary";
    }
  };

  const getStatusColor = () => {
    switch(status) {
      case UserStatus.ACTIVE:
        return "bg-green-100 text-green-800 border border-green-300";
      case UserStatus.BLOCKED:
        return "bg-red-100 text-red-800 border border-red-300";
      case UserStatus.DELETED:
        return "bg-gray-100 text-gray-800 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status.toLowerCase()}
    </span>
  )
}

export default StatusBadgeCell