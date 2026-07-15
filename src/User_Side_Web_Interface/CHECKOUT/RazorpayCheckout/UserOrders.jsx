import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const UserOrders = () => {
  const location = useLocation();
  const [showProcessing, setShowProcessing] = useState(false);

  useEffect(() => {
    if (location.state?.justPlaced) {
      setShowProcessing(true);

      // fake processing for 3 sec
      setTimeout(() => {
        setShowProcessing(false);
      }, 3000);
    }
  }, [location.state]);

  return (
    <div>
      {showProcessing && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="animate-spin mb-3" size={32} />
          <p className="font-semibold text-gray-700">
            Your order is in processing...
          </p>
        </div>
      )}

      {/* Your actual orders list below */}
    </div>
  );
};

export default UserOrders;