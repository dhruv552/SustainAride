import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  Zap,
  Users,
  ChevronRight,
  X,
  Search,
  Calendar,
  Tag,
  IndianRupee,
  Route
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import ActiveCoupons from "./ActiveCoupons";
import { useAuth } from "../contexts/AuthContext";
import couponService from "../api/couponService";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Import our new map components
import MapView from "./map/MapView";
import LocationSearch from "./map/LocationSearch";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RideOption {
  id: string;
  type: "CNG" | "Electric" | "Shared";
  price: number;
  eta: number;
  carbonSaved: number;
  distance: number;
  driver: {
    name: string;
    rating: number;
    avatar: string;
  };
  vehicle: {
    model: string;
    color: string;
    plateNumber: string;
  };
  capacity?: number;
  currentRiders?: number;
}

interface RideBookingFlowProps {
  onClose: () => void;
  bookingMode: "now" | "schedule";
}

const RideBookingFlow = ({ onClose, bookingMode = "now" }: RideBookingFlowProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Updated to store full location objects instead of just strings
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

  // Add state for route distance and duration
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);

  const [selectedRideType, setSelectedRideType] = useState<
    "CNG" | "Electric" | "Shared"
  >("Electric");
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState<boolean>(false);

  // Add state for vehicle location (for simulating driver movement)
  const [vehicleLocation, setVehicleLocation] = useState<Location | null>(null);

  // New state for coupons
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Handle route calculation callback
  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteDistance(distance);
    setRouteDuration(duration);

    // Update the available rides with the actual distance
    const updatedRides = availableRides.map(ride => ({
      ...ride,
      distance: distance,
      price: calculateFare(ride.type, distance),
      eta: ride.type === "Shared" ? duration + 5 : duration
    }));

    setAvailableRides(updatedRides);
  };

  // Calculate fare based on distance and ride type
  const calculateFare = (rideType: "CNG" | "Electric" | "Shared", distance: number): number => {
    const baseFare = 50;
    let perKmRate = 0;

    switch (rideType) {
      case "CNG":
        perKmRate = 12;
        break;
      case "Electric":
        perKmRate = 15;
        break;
      case "Shared":
        perKmRate = 8;
        break;
      default:
        perKmRate = 10;
    }

    return Math.round(baseFare + (perKmRate * distance));
  };

  // Mock data for available rides - now a state variable
  const [availableRides, setAvailableRides] = useState<RideOption[]>([
    {
      id: "1",
      type: "CNG",
      price: 120,
      eta: 5,
      carbonSaved: 0.8,
      distance: 7.2,
      driver: {
        name: "Alex Johnson",
        rating: 4.8,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      },
      vehicle: {
        model: "Toyota Etios",
        color: "White",
        plateNumber: "KA 01 AB 1234",
      },
    },
    {
      id: "2",
      type: "Electric",
      price: 150,
      eta: 8,
      carbonSaved: 2.1,
      distance: 7.2,
      driver: {
        name: "Sarah Miller",
        rating: 4.9,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
      vehicle: {
        model: "Tesla Model 3",
        color: "Blue",
        plateNumber: "KA 02 EV 5678",
      },
    },
    {
      id: "3",
      type: "Shared",
      price: 80,
      eta: 10,
      carbonSaved: 1.5,
      distance: 7.2,
      driver: {
        name: "Michael Chen",
        rating: 4.7,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      },
      vehicle: {
        model: "Honda City",
        color: "Silver",
        plateNumber: "KA 03 CD 9012",
      },
      capacity: 4,
      currentRiders: 2,
    },
  ]);

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRideSelect = (ride: RideOption) => {
    setSelectedRide(ride);
    setSelectedRideType(ride.type);
    handleNextStep();
  };

  // Simulate vehicle movement when ride is confirmed
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isBookingConfirmed && pickupLocation) {
      // Set initial vehicle position (for demo purposes)
      const initialVehiclePos: Location = {
        lat: pickupLocation.lat - 0.005,
        lng: pickupLocation.lng - 0.005,
        address: "Driver's current location"
      };
      setVehicleLocation(initialVehiclePos);

      // Simulate vehicle movement
      interval = setInterval(() => {
        setVehicleLocation(prevLocation => {
          if (!prevLocation || !pickupLocation) return prevLocation;

          // Move vehicle closer to pickup point
          const newLat = prevLocation.lat + (pickupLocation.lat - prevLocation.lat) * 0.1;
          const newLng = prevLocation.lng + (pickupLocation.lng - prevLocation.lng) * 0.1;

          return {
            lat: newLat,
            lng: newLng,
            address: "Driver is on the way"
          };
        });
      }, 2000); // Update every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBookingConfirmed, pickupLocation]);

  const handleConfirmBooking = async () => {
    try {
      // In a real implementation, we would call the API to book the ride
      // and apply the coupon if one is selected

      // Example code:
      // const rideData = {
      //   pickupLocation,
      //   destination,
      //   rideType: selectedRide?.type,
      //   fare: calculateFinalFare(),
      //   couponCode: appliedCoupon || undefined
      // };
      // const bookedRide = await rideService.bookRide(rideData);

      // Mock successful booking for now
      setIsBookingConfirmed(true);
      handleNextStep();
    } catch (error) {
      console.error("Error confirming booking:", error);
      // Handle error state
    }
  };

  const resetBooking = () => {
    setCurrentStep(0);
    setPickupLocation(null);
    setDestination(null);
    setSelectedRide(null);
    setIsBookingConfirmed(false);
    setVehicleLocation(null);
  };

  const renderStepIndicator = () => {
    const steps = ["Location", "Ride Options", "Confirmation", "Tracking"];

    return (
      <div className="flex items-center justify-between py-6 px-6 border-b">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                } ${index < currentStep ? "ring-2 ring-primary/20" : ""}`}
            >
              {index < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`absolute h-0.5 top-4 w-[calc(100%-2rem)] left-[calc(50%+1rem)] ${index < currentStep ? "bg-primary" : "bg-muted"
                  } hidden md:block`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderLocationStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 bg-background rounded-lg"
      >
        <div className="space-y-5 mb-6">
          {/* LocationSearch component for pickup */}
          <LocationSearch
            placeholder="Enter pickup location"
            icon={<MapPin />}
            onLocationSelect={(location) => setPickupLocation(location)}
          />

          {/* LocationSearch component for destination */}
          <LocationSearch
            placeholder="Enter destination"
            icon={<Navigation />}
            onLocationSelect={(location) => setDestination(location)}
          />
        </div>

        {/* Display map with selected locations */}
        {(pickupLocation || destination) && (
          <div className="mt-4 rounded-md overflow-hidden border">
            <MapView
              sourceLocation={pickupLocation}
              destinationLocation={destination}
              height="250px"
              onRouteCalculated={handleRouteCalculated}
            />
          </div>
        )}

        {/* Display route information when both locations are selected */}
        {pickupLocation && destination && routeDistance > 0 && (
          <div className="flex items-center justify-between bg-primary/10 p-3 rounded-md">
            <div className="flex items-center">
              <Route className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium">{routeDistance} km</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium">~{routeDuration} mins</span>
            </div>
          </div>
        )}

        <Tabs defaultValue={bookingMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-3">
            <TabsTrigger value="now" className="text-base">Ride Now</TabsTrigger>
            <TabsTrigger value="schedule" className="text-base">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="now" className="mt-4">
            <div className="flex items-center space-x-3 text-sm bg-secondary/20 p-3 rounded-md">
              <Clock className="h-5 w-5 text-primary" />
              <span>Pickup as soon as possible</span>
            </div>
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <Input type="date" className="flex-1 h-11" />
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <Input type="time" className="flex-1 h-11" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleNextStep}
            disabled={!pickupLocation || !destination || routeDistance === 0}
            className="h-11 px-6 text-base"
          >
            Find Rides
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderRideOptionsStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 bg-background rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Available Rides</h3>
          <Button variant="outline" size="sm" onClick={handlePreviousStep}>
            <X className="mr-2 h-4 w-4" />
            Change Location
          </Button>
        </div>

        {/* Route distance info */}
        <div className="flex items-center justify-between bg-primary/10 p-3 rounded-md">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-primary mr-1.5" />
            <span className="text-sm">{pickupLocation?.address.split(",")[0]}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          <div className="flex items-center">
            <Navigation className="h-4 w-4 text-primary mr-1.5" />
            <span className="text-sm">{destination?.address.split(",")[0]}</span>
          </div>
          <span className="text-sm font-medium ml-2">{routeDistance} km</span>
        </div>

        <div className="flex overflow-x-auto space-x-3 pb-3">
          <Button
            variant={selectedRideType === "CNG" ? "default" : "outline"}
            className="flex-shrink-0 h-10 px-4"
            onClick={() => setSelectedRideType("CNG")}
          >
            <Car className="mr-2 h-4 w-4" />
            CNG
          </Button>
          <Button
            variant={selectedRideType === "Electric" ? "default" : "outline"}
            className="flex-shrink-0 h-10 px-4"
            onClick={() => setSelectedRideType("Electric")}
          >
            <Zap className="mr-2 h-4 w-4" />
            Electric
          </Button>
          <Button
            variant={selectedRideType === "Shared" ? "default" : "outline"}
            className="flex-shrink-0 h-10 px-4"
            onClick={() => setSelectedRideType("Shared")}
          >
            <Users className="mr-2 h-4 w-4" />
            Shared
          </Button>
        </div>

        <div className="space-y-4 mt-2">
          {availableRides
            .filter((ride) => ride.type === selectedRideType)
            .map((ride) => (
              <motion.div
                key={ride.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  className="cursor-pointer border-2 hover:border-primary shadow-sm"
                  onClick={() => handleRideSelect(ride)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-secondary/30 p-2 rounded-full">
                            {ride.type === "CNG" && (
                              <Car className="h-5 w-5 text-amber-500" />
                            )}
                            {ride.type === "Electric" && (
                              <Zap className="h-5 w-5 text-green-500" />
                            )}
                            {ride.type === "Shared" && (
                              <Users className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-base">
                              {ride.vehicle.model}
                            </span>
                            <Badge variant="outline" className="ml-2">{ride.vehicle.color}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-2 border-2 border-background">
                              <AvatarImage
                                src={ride.driver.avatar}
                                alt={ride.driver.name}
                              />
                              <AvatarFallback>
                                {ride.driver.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{ride.driver.name}</p>
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="#FFD700"
                                  stroke="#FFD700"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span className="text-xs ml-1 font-medium">
                                  {ride.driver.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {ride.eta} mins away
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">₹{ride.price}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900">
                          {ride.carbonSaved} kg CO₂ saved
                        </Badge>
                        {ride.type === "Shared" && (
                          <Badge variant="outline">
                            {ride.currentRiders}/{ride.capacity} riders
                          </Badge>
                        )}
                        <Badge variant="outline" className="flex items-center">
                          <Route className="h-3 w-3 mr-1" />
                          {ride.distance} km
                        </Badge>
                      </div>
                      <Button size="sm" className="text-primary-foreground">
                        Select
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </motion.div>
    );
  };

  // Add this function to handle coupon application
  const handleApplyCoupon = async (couponCode: string, description: string, discountAmount?: number) => {
    if (!selectedRide || !user) {
      setCouponError("Please login to apply coupons");
      return;
    }

    try {
      setCouponError(null);

      // For ride-time coupons like GreenStart10 and ElectricSaver30
      if (["GreenStart10", "ElectricSaver30"].includes(couponCode)) {
        // Validate the coupon with the backend
        const validationResult = await couponService.validateCoupon(
          couponCode,
          {
            userId: user?._id,
            rideType: selectedRide.type,
            rideValue: selectedRide.price
          }
        );

        if (!validationResult.valid) {
          setCouponError(validationResult.message);
          return;
        }

        // Apply discount to ride
        const discount = validationResult.discountAmount || discountAmount || 0;
        setAppliedCoupon(couponCode);
        setCouponDiscount(discount);
        setCouponMessage(validationResult.message || `Applied ${description}`);
      }
      // For other coupons with fixed/percentage discounts
      else {
        const discount = discountAmount || 0;
        setAppliedCoupon(couponCode);
        setCouponDiscount(discount);
        setCouponMessage(`Applied ${description}`);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Failed to apply coupon. Please try again.");
    }
  };

  // Function to remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
    setCouponError(null);
  };

  // Calculate the final fare after applying coupon discount
  const calculateFinalFare = () => {
    if (!selectedRide) return 0;
    return Math.max(0, selectedRide.price - couponDiscount);
  };

  const renderConfirmationStep = () => {
    if (!selectedRide || !pickupLocation || !destination) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 bg-background rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Confirm Your Ride</h3>
          <Button variant="outline" size="sm" onClick={handlePreviousStep}>
            <X className="mr-2 h-4 w-4" />
            Change Ride
          </Button>
        </div>

        {/* Map with route */}
        <div className="rounded-md overflow-hidden border">
          <MapView
            sourceLocation={pickupLocation}
            destinationLocation={destination}
            height="200px"
          />
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium text-base">
                  {pickupLocation.address.split(',')[0]}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium text-base">{destination.address.split(',')[0]}</p>
              </div>
            </div>

            {/* Trip info with actual distance */}
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
              <div className="flex items-center">
                <Route className="h-4 w-4 text-primary mr-1.5" />
                <span className="text-sm font-medium">{routeDistance} km</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-primary mr-1.5" />
                <span className="text-sm font-medium">~{routeDuration} mins</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex items-center">
                <div className="bg-secondary/30 p-2 rounded-full mr-3">
                  {selectedRide.type === "CNG" && (
                    <Car className="h-5 w-5 text-amber-500" />
                  )}
                  {selectedRide.type === "Electric" && (
                    <Zap className="h-5 w-5 text-green-500" />
                  )}
                  {selectedRide.type === "Shared" && (
                    <Users className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedRide.type} Ride</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRide.vehicle.model} • {selectedRide.vehicle.color}{" "}
                    • {selectedRide.vehicle.plateNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex items-center">
                <Avatar className="h-11 w-11 mr-3 border-2 border-background">
                  <AvatarImage
                    src={selectedRide.driver.avatar}
                    alt={selectedRide.driver.name}
                  />
                  <AvatarFallback>
                    {selectedRide.driver.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedRide.driver.name}</p>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#FFD700"
                      stroke="#FFD700"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span className="text-xs ml-1 font-medium">
                      {selectedRide.driver.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Fare</p>
                  <p className="text-sm text-muted-foreground">
                    Base fare + distance ({selectedRide.distance} km)
                  </p>
                </div>
                <p className={`text-lg font-bold ${appliedCoupon ? "line-through text-muted-foreground" : ""}`}>
                  ₹{selectedRide.price}
                </p>
              </div>

              {/* Show coupon discount if applied */}
              {appliedCoupon && (
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-primary mr-1.5" />
                    <p className="text-sm font-medium text-primary flex items-center">
                      {appliedCoupon}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={removeCoupon}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </p>
                  </div>
                  <p className="text-sm font-medium text-primary">-₹{couponDiscount}</p>
                </div>
              )}

              {/* Show coupon error if any */}
              {couponError && (
                <Alert variant="destructive" className="mt-3 py-2">
                  <AlertDescription>{couponError}</AlertDescription>
                </Alert>
              )}

              {/* Show final fare */}
              {appliedCoupon && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <p className="font-medium">Final Fare</p>
                  <p className="text-lg font-bold text-primary">₹{calculateFinalFare()}</p>
                </div>
              )}

              {/* Apply coupon button */}
              {!appliedCoupon && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      <Tag className="h-4 w-4 mr-2" />
                      Apply Coupon
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <div className="py-6">
                      <h3 className="text-lg font-medium mb-4">Available Coupons</h3>
                      <ActiveCoupons onApply={handleApplyCoupon} />
                    </div>
                    <SheetClose asChild>
                      <Button variant="outline" className="mt-4 w-full">Cancel</Button>
                    </SheetClose>
                  </SheetContent>
                </Sheet>
              )}
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    Environmental Impact
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CO₂ emissions saved compared to regular cab
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 font-medium">
                  {selectedRide.carbonSaved} kg CO₂
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button onClick={handleConfirmBooking} className="h-11 px-6 text-base" size="lg">
            Confirm Booking
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderTrackingStep = () => {
    if (!selectedRide || !pickupLocation || !destination) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 bg-background rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Ride is Confirmed!</h3>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 font-medium">
            On the way
          </Badge>
        </div>

        {/* Live tracking map */}
        <div className="relative h-64 bg-secondary/20 rounded-lg overflow-hidden shadow-sm">
          <MapView
            sourceLocation={pickupLocation}
            destinationLocation={destination}
            vehicleLocation={vehicleLocation}
            height="100%"
          />
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3 border-2 border-background">
                  <AvatarImage
                    src={selectedRide.driver.avatar}
                    alt={selectedRide.driver.name}
                  />
                  <AvatarFallback>
                    {selectedRide.driver.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-base">{selectedRide.driver.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRide.vehicle.plateNumber}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-9">
                Contact
              </Button>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Driver is on the way</p>
                <p className="text-sm font-medium">{selectedRide.eta} mins</p>
              </div>
              <Progress value={30} className="h-2.5" />
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                  {selectedRide.vehicle.model} • {selectedRide.vehicle.color}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 font-medium">
                {selectedRide.type} Ride
              </Badge>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trip fare</p>
                  <p className="font-medium text-base">₹{calculateFinalFare()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Environmental impact</p>
                  <p className="text-green-600 font-medium">{selectedRide.carbonSaved} kg CO₂ saved</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={resetBooking} className="h-11 px-6 text-base">
            Close Tracking
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderLocationStep();
      case 1:
        return renderRideOptionsStep();
      case 2:
        return renderConfirmationStep();
      case 3:
        return renderTrackingStep();
      default:
        return renderLocationStep();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-background rounded-xl shadow-lg border overflow-hidden">
      <div className="py-5 px-6 border-b bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Book Your Eco-Friendly Ride
            </h2>
            <p className="text-sm text-primary-foreground/90 mt-1">
              Choose sustainable options and earn rewards
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {renderStepIndicator()}

      <div className="p-5 min-h-[400px] relative">{renderCurrentStep()}</div>
    </div>
  );
};

export default RideBookingFlow;
