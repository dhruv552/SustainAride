import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Award, ChevronRight, Home, Info, Repeat, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RideOptions from "./RideOptions";
import RewardsWidget from "./RewardsWidget";
import RideBookingFlow from "./RideBookingFlow";
import ActiveCoupons from "./ActiveCoupons";
import { ThemeToggle } from "./ui/theme-toggle";
import AuthHeader from "./AuthHeader";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = React.useState<"rider" | "driver">("rider");
  const [bookingMode, setBookingMode] = React.useState<"now" | "schedule">("now");
  const [showBookingFlow, setShowBookingFlow] = React.useState(false);
  const [backendStatus, setBackendStatus] = React.useState<"checking" | "connected" | "disconnected">("checking");
  const [backendMessage, setBackendMessage] = React.useState<string>("");

  // Test backend connection
  const testBackendConnection = async () => {
    setBackendStatus("checking");
    setBackendMessage("Testing connection...");

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL ||
        (window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : 'https://sustain-aride-avfp.vercel.app');

      const response = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackendStatus("connected");
        setBackendMessage(`✅ Backend Connected! Database: ${data.database || 'unknown'}`);
        console.log('Backend health check:', data);
      } else {
        setBackendStatus("disconnected");
        setBackendMessage(`❌ Backend Error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      setBackendStatus("disconnected");
      setBackendMessage(`❌ Connection Failed: ${error.message || 'Network error'}`);
      console.error('Backend connection error:', error);
    }
  };

  // Test connection on component mount
  React.useEffect(() => {
    testBackendConnection();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const handleStartBooking = () => {
    if (!isAuthenticated) {
      // Show alert and redirect to login using React Router
      const proceed = window.confirm("Please login or create an account to book a ride. Click OK to go to login page.");
      if (proceed) {
        navigate("/login");
      }
      return;
    }
    setShowBookingFlow(true);
  };

  const handleCloseBooking = () => {
    setShowBookingFlow(false);
  };

  // Welcome message for authenticated users
  const getWelcomeMessage = () => {
    if (!user) return "";

    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return `${greeting}, ${user.name}`;
  };

  return (
    <AnimatePresence mode="wait">
      {showBookingFlow ? (
        <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                SustainAride
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Eco-friendly rides for a better tomorrow
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs sm:text-sm"
                onClick={() => setUserType(userType === "rider" ? "driver" : "rider")}
              >
                <Repeat className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Switch to {userType === "rider" ? "Driver" : "Rider"}</span>
                <span className="xs:hidden">{userType === "rider" ? "🚗" : "🚕"}</span>
              </Button>
              <AuthHeader />
            </div>
          </header>
          <RideBookingFlow
            onClose={handleCloseBooking}
            bookingMode={bookingMode}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                SustainAride
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Eco-friendly rides for a better tomorrow
              </p>
              {isAuthenticated && (
                <p className="text-sm sm:text-md text-primary font-medium mt-1 sm:mt-2">{getWelcomeMessage()}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto justify-end">
              {/* Backend Connection Status Button */}
              <Button
                variant={backendStatus === "connected" ? "default" : backendStatus === "disconnected" ? "destructive" : "secondary"}
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs"
                onClick={testBackendConnection}
                disabled={backendStatus === "checking"}
              >
                {backendStatus === "checking" ? (
                  <>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="hidden lg:inline">Checking...</span>
                  </>
                ) : backendStatus === "connected" ? (
                  <>
                    <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Backend OK</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Backend Down</span>
                  </>
                )}
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setUserType(userType === "rider" ? "driver" : "rider")}
              >
                <Repeat className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">Switch to {userType === "rider" ? "Driver" : "Rider"}</span>
                <span className="md:hidden">{userType === "rider" ? "🚗" : "🚕"}</span>
              </Button>
              <AuthHeader />
            </div>
          </header>

          {/* Backend Status Message Banner */}
          {backendMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border ${backendStatus === "connected"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
            >
              <p className="text-xs sm:text-sm font-medium">{backendMessage}</p>
            </motion.div>
          )}

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-6 bg-primary/10 rounded-xl border border-primary/20"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Info className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Join SustainAride Today</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Create an account to book rides and earn sustainability rewards</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Main Content - 2/3 width on desktop */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 sm:space-y-6">
              {userType === "rider" ? (
                <>
                  {/* Booking Options */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="default"
                      size="lg"
                      className={`py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-primary-foreground ${bookingMode === "now" ? "bg-primary" : "bg-secondary hover:bg-secondary/80"
                        }`}
                      onClick={() => {
                        setBookingMode("now");
                        handleStartBooking();
                      }}
                    >
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm sm:text-base">Ride Now</span>
                    </Button>
                    <Button
                      variant="default"
                      size="lg"
                      className={`py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-primary-foreground ${bookingMode === "schedule" ? "bg-primary" : "bg-secondary hover:bg-secondary/80"
                        }`}
                      onClick={() => {
                        setBookingMode("schedule");
                        handleStartBooking();
                      }}
                    >
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm sm:text-base">Schedule</span>
                    </Button>
                  </div>

                  {/* Ride Options */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Available Ride Options
                        </h2>
                        <span className="text-xs sm:text-sm text-primary">
                          Eco-friendly choices
                        </span>
                      </div>
                      <RideOptions onSelectRide={handleStartBooking} />
                    </CardContent>
                  </Card>

                  {/* Top Contributors */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
                          <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#FFC107]" />
                          Top Contributors
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary text-xs sm:text-sm"
                        >
                          View All <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2 sm:mr-3 flex-shrink-0">
                              {i}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm sm:text-base truncate">User {i}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {120 - i * 20} kg CO₂
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Driver view - existing code with responsive improvements */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                        Current Bookings
                      </h2>
                      <div className="space-y-3 sm:space-y-4">
                        {[1, 2].map((booking) => (
                          <div
                            key={booking}
                            className="p-3 sm:p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          >
                            <div className="w-full sm:w-auto">
                              <p className="font-medium text-sm sm:text-base">
                                Pickup: Downtown Central
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Dropoff: Westside Mall
                              </p>
                              <p className="text-xs text-primary mt-1">
                                Shared Ride • 2 passengers
                              </p>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm">
                              Accept
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rest of driver content with responsive improvements */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Promote Shared Rides
                        </h2>
                        <div className="flex items-center">
                          <span className="text-xs sm:text-sm text-primary mr-2">
                            2x Points
                          </span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              value=""
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                        Enabling shared rides helps reduce carbon emissions and
                        earns you double eco-points!
                      </p>
                      <div className="bg-secondary/30 p-3 sm:p-4 rounded-lg">
                        <p className="font-medium text-sm sm:text-base">Your Impact Today</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                            <p className="font-bold text-primary text-sm sm:text-base">4.2 kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Shared Rides
                            </p>
                            <p className="font-bold text-primary text-sm sm:text-base">3</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Extra Points
                            </p>
                            <p className="font-bold text-primary text-sm sm:text-base">+120</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Green Drivers - responsive */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
                          <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#FFC107]" />
                          Top Green Drivers
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary text-xs sm:text-sm"
                        >
                          View All <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 sm:p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2 sm:mr-3 flex-shrink-0">
                                {i}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">Driver {i}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {15 - i * 2} shared rides
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className="font-bold text-primary text-sm sm:text-base">
                                {320 - i * 40}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {8 - i} kg CO₂
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>

            {/* Sidebar - 1/3 width on desktop */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-1 space-y-4 sm:space-y-6"
            >
              {isAuthenticated ? (
                <>
                  {/* Rewards Widget */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                        Your Eco Rewards
                      </h2>
                      <RewardsWidget />
                      {user && (
                        <div className="mt-3 sm:mt-4 pt-3 border-t border-border">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Your Points Balance</p>
                          <p className="text-xl sm:text-2xl font-bold text-primary">{user.sustainPoints || 0} points</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Coupons */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold">Active Coupons</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary text-xs sm:text-sm"
                        >
                          View All <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <ActiveCoupons />
                    </CardContent>
                  </Card>

                  {/* User Impact */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Impact</h2>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Total CO₂ Saved</span>
                          <span className="font-bold text-primary text-sm sm:text-base">24.8 kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Trees Equivalent</span>
                          <span className="font-bold text-primary text-sm sm:text-base">1.2</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Shared Rides Taken</span>
                          <span className="font-bold text-primary text-sm sm:text-base">8</span>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 mt-2 text-sm">
                          View Full Impact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Why Join */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Why Join SustainAride?</h2>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 text-sm sm:text-base">1</div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Earn Eco Rewards</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Get points for every sustainable ride</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 text-sm sm:text-base">2</div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Exclusive Discounts</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Access special coupons and promotions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 text-sm sm:text-base">3</div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">Track Your Impact</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">See your contribution to sustainability</p>
                          </div>
                        </div>
                        <Button className="w-full mt-3 sm:mt-4 text-sm" asChild>
                          <Link to="/signup">Create Account</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Community Impact */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Our Community Impact</h2>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Total CO₂ Saved</span>
                          <span className="font-bold text-primary text-sm sm:text-base">2,482 kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Trees Equivalent</span>
                          <span className="font-bold text-primary text-sm sm:text-base">115</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Active Members</span>
                          <span className="font-bold text-primary text-sm sm:text-base">843</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                          <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                        </div>
                        <p className="text-xs text-center text-muted-foreground">65% to our next community goal</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
      {/* Floating home button */}
      {showBookingFlow && (
        <motion.div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            onClick={() => setShowBookingFlow(false)}
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePage;
