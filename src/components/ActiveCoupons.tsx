import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket, Gift, Clock, ChevronRight, Zap, User, Users, AlertCircle, RefreshCw, ChevronLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import couponService from "../api/couponService";
import { Coupon } from "../types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface ActiveCouponsProps {
  onApply?: (couponCode: string, description: string, discountAmount?: number) => void;
}

const ActiveCoupons = ({ onApply = () => { } }: ActiveCouponsProps) => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // For sliding functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setScrollPosition(container.scrollLeft);
      setShowLeftArrow(container.scrollLeft > 10);
      setShowRightArrow(container.scrollLeft < maxScrollLeft - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Check initial state
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [coupons]);

  const fetchCoupons = async () => {
    if (!user?._id) {
      // If no user ID is available, use default coupons
      setCoupons(couponService.getDefaultCoupons());
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Reset error when starting a new fetch
      console.log('Fetching coupons for user ID:', user._id);
      const activeCoupons = await couponService.getActiveUserCoupons(user._id);

      if (activeCoupons && activeCoupons.length > 0) {
        console.log('Coupons loaded successfully:', activeCoupons);
        setCoupons(activeCoupons);
      } else {
        console.log('No coupons returned, using defaults');
        // If no coupons returned, use default coupons instead of showing "no coupons available"
        setCoupons(couponService.getDefaultCoupons());
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to load coupons");
      // Fallback to default coupons on error
      setCoupons(couponService.getDefaultCoupons());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [user?._id]);

  const handleApplyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon.code);

    // For predefined coupons
    if (["GreenStart10", "EcoRide20", "ElectricSaver30", "SharedBonus50", "ReferralRide100"].includes(coupon.code)) {
      let discountAmount = 0;

      // Set the appropriate discount amount
      switch (coupon.code) {
        case "GreenStart10":
          discountAmount = 10;
          break;
        case "ElectricSaver30":
          discountAmount = 30;
          break;
        case "EcoRide20":
          discountAmount = 20;
          break;
        case "SharedBonus50":
          discountAmount = 50;
          break;
        case "ReferralRide100":
          discountAmount = 0; // Points coupon, no direct discount
          break;
      }

      onApply(coupon.code, coupon.description, discountAmount);
    } else {
      // For database coupons
      onApply(
        coupon.code,
        coupon.description,
        coupon.discountType === "Fixed" ? coupon.discountValue : undefined
      );
    }
  };

  const getIconForCouponType = (coupon: Coupon) => {
    // For predefined coupons
    if (coupon.code === "GreenStart10") {
      return <Zap className="h-4 w-4 text-primary" />;
    } else if (coupon.code === "EcoRide20") {
      return <Users className="h-4 w-4 text-blue-500" />;
    } else if (coupon.code === "ElectricSaver30") {
      return <Zap className="h-4 w-4 text-green-500" />;
    } else if (coupon.code === "SharedBonus50") {
      return <Users className="h-4 w-4 text-amber-500" />;
    } else if (coupon.code === "ReferralRide100") {
      return <User className="h-4 w-4 text-purple-500" />;
    }

    // For database coupons
    switch (coupon.discountType) {
      case "Percentage":
        return <Ticket className="h-4 w-4 text-primary" />;
      case "Fixed":
        return <Ticket className="h-4 w-4 text-emerald-500" />;
      default:
        return <Gift className="h-4 w-4 text-amber-500" />;
    }
  };

  const formatExpiryDate = (date: Date | string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getBorderColorClass = (coupon: Coupon) => {
    // For predefined coupons
    if (coupon.code === "GreenStart10") {
      return "border-l-primary";
    } else if (coupon.code === "EcoRide20") {
      return "border-l-blue-500";
    } else if (coupon.code === "ElectricSaver30") {
      return "border-l-green-500";
    } else if (coupon.code === "SharedBonus50") {
      return "border-l-amber-500";
    } else if (coupon.code === "ReferralRide100") {
      return "border-l-purple-500";
    }

    // For database coupons
    return coupon.discountType === "Percentage"
      ? "border-l-primary"
      : coupon.discountType === "Fixed"
        ? "border-l-emerald-500"
        : "border-l-amber-500";
  };

  const getBackgroundColorClass = (coupon: Coupon) => {
    // For predefined coupons
    if (coupon.code === "GreenStart10") {
      return "bg-primary/10";
    } else if (coupon.code === "EcoRide20") {
      return "bg-blue-500/10";
    } else if (coupon.code === "ElectricSaver30") {
      return "bg-green-500/10";
    } else if (coupon.code === "SharedBonus50") {
      return "bg-amber-500/10";
    } else if (coupon.code === "ReferralRide100") {
      return "bg-purple-500/10";
    }

    // For database coupons
    return coupon.discountType === "Percentage"
      ? "bg-primary/10"
      : coupon.discountType === "Fixed"
        ? "bg-emerald-500/10"
        : "bg-amber-500/10";
  };

  const getCouponTitle = (coupon: Coupon) => {
    // For predefined coupons, use hardcoded titles
    switch (coupon.code) {
      case "GreenStart10":
        return "₹10 Off First Eco Ride";
      case "EcoRide20":
        return "₹20 Shared Ride Cashback";
      case "ElectricSaver30":
        return "₹30 Off Electric Rides";
      case "SharedBonus50":
        return "₹50 Shared Ride Bonus";
      case "ReferralRide100":
        return "100 Eco Points - Referral";
      default:
        // For database coupons, use discount info
        if (coupon.discountType === "Percentage") {
          return `${coupon.discountValue}% Off`;
        } else if (coupon.discountType === "Fixed") {
          return `₹${coupon.discountValue} Off`;
        } else {
          return coupon.description?.split(' ').slice(0, 3).join(' ') || "Special Offer";
        }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const navigateToAllCoupons = () => {
    navigate('/coupons');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full bg-background p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-secondary/50 animate-pulse rounded"></div>
          <div className="h-6 w-20 bg-secondary/50 animate-pulse rounded"></div>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[240px] h-[140px] bg-secondary/30 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // If we have an error but also have fallback coupons
  if (error && coupons.length > 0) {
    return (
      <div className="w-full bg-background p-4 rounded-xl">
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Using sample coupons due to connection issue</span>
            <Button variant="outline" size="sm" onClick={fetchCoupons} className="ml-2">
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>

        {/* Display the coupon list UI */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Active Coupons</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground flex items-center"
            onClick={navigateToAllCoupons}
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          {/* Left navigation arrow */}
          {showLeftArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
              onClick={handleScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-4 pr-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleScroll}
          >
            {coupons.map((coupon, index) => (
              <motion.div
                key={coupon._id || coupon.code}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="min-w-[240px] sm:min-w-[280px]"
              >
                <Card
                  className={`border-l-4 ${getBorderColorClass(coupon)} h-full`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-2 ${getBackgroundColorClass(coupon)}`}>
                          {getIconForCouponType(coupon)}
                        </div>
                        <span className="font-medium">{getCouponTitle(coupon)}</span>
                      </div>
                      {/* Show special badge for GreenStart10 which is for new users */}
                      {coupon.code === "GreenStart10" && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900"
                        >
                          NEW USER
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {coupon.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expires {formatExpiryDate(coupon.validUntil)}</span>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant={
                            appliedCoupon === coupon.code ? "default" : "outline"
                          }
                          className={`text-xs h-7 ${appliedCoupon === coupon.code
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                            }`}
                          onClick={() => handleApplyCoupon(coupon)}
                          disabled={appliedCoupon === coupon.code}
                        >
                          {appliedCoupon === coupon.code ? "Applied" : "Apply"}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right navigation arrow */}
          {showRightArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
              onClick={handleScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Fatal error with no coupons
  if (error && coupons.length === 0) {
    return (
      <div className="w-full bg-background p-4 rounded-xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchCoupons}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Normal display when everything works
  return (
    <div className="w-full bg-background p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Active Coupons</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground flex items-center"
          onClick={navigateToAllCoupons}
        >
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {coupons.length === 0 ? (
        <p className="text-center text-muted-foreground py-6">
          No active coupons available at the moment
        </p>
      ) : (
        <div className="relative">
          {/* Left navigation arrow */}
          {showLeftArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
              onClick={handleScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-4 pr-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleScroll}
          >
            {coupons.map((coupon, index) => (
              <motion.div
                key={coupon._id || coupon.code}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="min-w-[240px] sm:min-w-[280px]"
              >
                <Card
                  className={`border-l-4 ${getBorderColorClass(coupon)} h-full`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-2 ${getBackgroundColorClass(coupon)}`}>
                          {getIconForCouponType(coupon)}
                        </div>
                        <span className="font-medium">{getCouponTitle(coupon)}</span>
                      </div>
                      {/* Show special badge for GreenStart10 which is for new users */}
                      {coupon.code === "GreenStart10" && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900"
                        >
                          NEW USER
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {coupon.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expires {formatExpiryDate(coupon.validUntil)}</span>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant={
                            appliedCoupon === coupon.code ? "default" : "outline"
                          }
                          className={`text-xs h-7 ${appliedCoupon === coupon.code
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                            }`}
                          onClick={() => handleApplyCoupon(coupon)}
                          disabled={appliedCoupon === coupon.code}
                        >
                          {appliedCoupon === coupon.code ? "Applied" : "Apply"}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right navigation arrow */}
          {showRightArrow && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
              onClick={handleScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveCoupons;
