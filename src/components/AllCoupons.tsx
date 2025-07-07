import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Gift, Clock, Zap, User, Users, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import couponService from "../api/couponService";
import { Coupon } from "../types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const AllCoupons = () => {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchCoupons = async () => {
        if (!user?._id) {
            setCoupons(couponService.getDefaultCoupons());
            setLoading(false);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('Fetching all coupons for user ID:', user._id);
            const activeCoupons = await couponService.getActiveUserCoupons(user._id);

            if (activeCoupons && activeCoupons.length > 0) {
                console.log('Coupons loaded successfully:', activeCoupons);
                setCoupons(activeCoupons);
            } else {
                console.log('No coupons returned, using defaults');
                setCoupons(couponService.getDefaultCoupons());
            }
        } catch (err) {
            console.error("Error fetching coupons:", err);
            setError("Failed to load coupons");
            setCoupons(couponService.getDefaultCoupons());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [user?._id]);

    const getIconForCouponType = (coupon: Coupon) => {
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

        return coupon.discountType === "Percentage"
            ? "border-l-primary"
            : coupon.discountType === "Fixed"
                ? "border-l-emerald-500"
                : "border-l-amber-500";
    };

    const getBackgroundColorClass = (coupon: Coupon) => {
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

        return coupon.discountType === "Percentage"
            ? "bg-primary/10"
            : coupon.discountType === "Fixed"
                ? "bg-emerald-500/10"
                : "bg-amber-500/10";
    };

    const getCouponTitle = (coupon: Coupon) => {
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

    if (loading) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">All Coupons</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[160px] bg-secondary/30 animate-pulse rounded-md"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && coupons.length === 0) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">All Coupons</h1>
                </div>

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

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">All Coupons</h1>
            </div>

            {error && coupons.length > 0 && (
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
            )}

            {coupons.length === 0 ? (
                <div className="text-center p-8 bg-secondary/20 rounded-lg">
                    <p className="text-muted-foreground text-lg">No active coupons available at the moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon, index) => (
                        <motion.div
                            key={coupon._id || coupon.code}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`border-l-4 ${getBorderColorClass(coupon)}`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                            <div className={`p-1.5 rounded-full mr-2 ${getBackgroundColorClass(coupon)}`}>
                                                {getIconForCouponType(coupon)}
                                            </div>
                                            <span className="font-medium">{getCouponTitle(coupon)}</span>
                                        </div>
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
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllCoupons;