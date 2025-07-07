import React from "react";
import { motion } from "framer-motion";
import { Car, Zap, Users, Clock, IndianRupee, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RideOption {
  id: string;
  type: "CNG" | "Electric" | "Shared";
  title: string;
  description: string;
  price: number;
  eta: number; // in minutes
  carbonSaved: number; // in kg
  available: number; // number of available rides
}

interface RideOptionsProps {
  options?: RideOption[];
  onSelectRide?: (ride: RideOption) => void;
}

const RideOptions = ({
  options = [
    {
      id: "1",
      type: "CNG",
      title: "CNG Ride",
      description: "Eco-friendly compressed natural gas vehicle",
      price: 12.5,
      eta: 5,
      carbonSaved: 0.8,
      available: 5,
    },
    {
      id: "2",
      type: "Electric",
      title: "Electric Ride",
      description: "Zero-emission electric vehicle",
      price: 15.75,
      eta: 8,
      carbonSaved: 1.5,
      available: 3,
    },
    {
      id: "3",
      type: "Shared",
      title: "Shared Ride",
      description: "Share your ride with others going the same way",
      price: 8.25,
      eta: 10,
      carbonSaved: 2.2,
      available: 7,
    },
  ],
  onSelectRide = () => { },
}: RideOptionsProps) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case "CNG":
        return <Car className="h-6 w-6 text-blue-500" />;
      case "Electric":
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case "Shared":
        return <Users className="h-6 w-6 text-green-500" />;
      default:
        return <Car className="h-6 w-6" />;
    }
  };

  const getCardColorByType = (type: string) => {
    switch (type) {
      case "CNG":
        return "border-blue-200 hover:border-blue-300 dark:border-blue-900 dark:hover:border-blue-700";
      case "Electric":
        return "border-yellow-200 hover:border-yellow-300 dark:border-yellow-900 dark:hover:border-yellow-700";
      case "Shared":
        return "border-green-200 hover:border-green-300 dark:border-green-900 dark:hover:border-green-700";
      default:
        return "";
    }
  };

  return (
    <div className="w-full p-2 sm:p-4 rounded-xl">
      <h2 className="text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
        Choose Your Ride
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {options.map((option) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mx-auto"
          >
            <Card
              className={`h-full border-2 ${getCardColorByType(option.type)} cursor-pointer`}
              onClick={() => onSelectRide(option)}
            >
              <CardContent className="p-4 sm:p-5 md:p-6 min-h-[240px] sm:min-h-[260px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center min-w-0">
                      <div className="p-2 rounded-full bg-secondary/30 mr-2 sm:mr-3 flex-shrink-0">
                        {getIconByType(option.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg">{option.title}</h3>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-secondary/10 px-2 py-1 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">
                      {option.available} available
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground pr-2">
                    {option.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center py-2 px-1 bg-secondary/20 rounded-lg h-[60px]">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <div className="text-center mt-1">
                        <span className="text-xs font-medium block">
                          ₹{option.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 px-1 bg-secondary/20 rounded-lg h-[60px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="text-center mt-1">
                        <span className="text-xs font-medium block">
                          {option.eta}
                        </span>
                        <span className="text-xs block">min</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 px-1 bg-green-100/50 dark:bg-green-900/30 rounded-lg h-[60px]">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <div className="text-center mt-1">
                        <span className="text-xs font-medium block">
                          {option.carbonSaved}
                        </span>
                        <span className="text-xs block">kg CO₂</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4"
                >
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs sm:text-sm h-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRide(option);
                    }}
                  >
                    Select {option.type} Ride
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RideOptions;
