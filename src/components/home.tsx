import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Award, ChevronRight, Home, Info, Repeat } from "lucide-react";
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
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [userType, setUserType] = React.useState<"rider" | "driver">("rider");
  const [bookingMode, setBookingMode] = React.useState<"now" | "schedule">("now");
  const [showBookingFlow, setShowBookingFlow] = React.useState(false);

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
      // If not logged in, redirect to login instead of starting booking flow
      window.location.href = "/login";
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
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                SustainAride
              </h1>
              <p className="text-sm text-muted-foreground">
                Eco-friendly rides for a better tomorrow
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setUserType(userType === "rider" ? "driver" : "rider")}
              >
                <Repeat className="h-4 w-4" />
                <span>Switch to {userType === "rider" ? "Driver" : "Rider"}</span>
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
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                SustainAride
              </h1>
              <p className="text-sm text-muted-foreground">
                Eco-friendly rides for a better tomorrow
              </p>
              {isAuthenticated && (
                <p className="text-md text-primary font-medium mt-2">{getWelcomeMessage()}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setUserType(userType === "rider" ? "driver" : "rider")}
              >
                <Repeat className="h-4 w-4" />
                <span className="hidden sm:inline">Switch to {userType === "rider" ? "Driver" : "Rider"}</span>
                <span className="sm:hidden">{userType === "rider" ? "Driver" : "Rider"}</span>
              </Button>
              <AuthHeader />
            </div>
          </header>

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-primary/10 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <Info className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Join SustainAride Today</h2>
                  <p className="text-muted-foreground">Create an account to book rides and earn sustainability rewards</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Main Content - 2/3 width on desktop */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              {userType === "rider" ? (
                <>
                  {/* Booking Options */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <Button
                      variant="default"
                      size="lg"
                      className={`py-6 flex items-center justify-center gap-2 text-primary-foreground ${bookingMode === "now" ? "bg-primary" : "bg-secondary hover:bg-secondary/80"
                        }`}
                      onClick={() => {
                        setBookingMode("now");
                        handleStartBooking();
                      }}
                    >
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium text-base">Ride Now</span>
                    </Button>
                    <Button
                      variant="default"
                      size="lg"
                      className={`py-6 flex items-center justify-center gap-2 text-primary-foreground ${bookingMode === "schedule" ? "bg-primary" : "bg-secondary hover:bg-secondary/80"
                        }`}
                      onClick={() => {
                        setBookingMode("schedule");
                        handleStartBooking();
                      }}
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium text-base">Schedule Ride</span>
                    </Button>
                  </div>

                  {/* Ride Options */}
                  <Card className="mb-6 bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          Available Ride Options
                        </h2>
                        <span className="text-sm text-primary">
                          Eco-friendly choices
                        </span>
                      </div>
                      <RideOptions onSelectRide={handleStartBooking} />
                    </CardContent>
                  </Card>

                  {/* Top Contributors */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                          <Award className="mr-2 h-5 w-5 text-[#FFC107]" />
                          Top Environmental Contributors
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                        >
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-3">
                              {i}
                            </div>
                            <div>
                              <p className="font-medium">User {i}</p>
                              <p className="text-sm text-muted-foreground">
                                {120 - i * 20} kg CO₂ saved
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
                  <Card className="mb-6 bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Current Bookings
                      </h2>
                      <div className="space-y-4">
                        {[1, 2].map((booking) => (
                          <div
                            key={booking}
                            className="p-4 border rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">
                                Pickup: Downtown Central
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Dropoff: Westside Mall
                              </p>
                              <p className="text-xs text-primary mt-1">
                                Shared Ride • 2 passengers
                              </p>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90">
                              Accept
                            </Button>
                          </div>
                        ))}
                        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                          No more bookings available at the moment
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6 bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          Promote Shared Rides
                        </h2>
                        <div className="flex items-center">
                          <span className="text-sm text-primary mr-2">
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
                      <p className="text-muted-foreground text-sm mb-4">
                        Enabling shared rides helps reduce carbon emissions and
                        earns you double eco-points!
                      </p>
                      <div className="bg-secondary/30 p-4 rounded-lg">
                        <p className="font-medium">Your Impact Today</p>
                        <div className="flex justify-between mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                            <p className="font-bold text-primary">4.2 kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Shared Rides
                            </p>
                            <p className="font-bold text-primary">3</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Extra Points
                            </p>
                            <p className="font-bold text-primary">+120</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                          <Award className="mr-2 h-5 w-5 text-[#FFC107]" />
                          Top Green Drivers
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                        >
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-3">
                                {i}
                              </div>
                              <div>
                                <p className="font-medium">Driver {i}</p>
                                <p className="text-sm text-muted-foreground">
                                  {15 - i * 2} shared rides today
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                {320 - i * 40} pts
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {8 - i} kg CO₂ saved
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
              className="md:col-span-1 space-y-6"
            >
              {isAuthenticated ? (
                <>
                  {/* Rewards Widget - only for authenticated users */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Your Eco Rewards
                      </h2>
                      <RewardsWidget />
                      {user && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-sm font-medium text-muted-foreground">Your Points Balance</p>
                          <p className="text-2xl font-bold text-primary">{user.sustainPoints || 0} points</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Coupons - only for authenticated users */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Active Coupons</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                        >
                          View All <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <ActiveCoupons />
                    </CardContent>
                  </Card>

                  {/* User-specific Impact - only for authenticated users */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total CO₂ Saved</span>
                          <span className="font-bold text-primary">24.8 kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Trees Equivalent</span>
                          <span className="font-bold text-primary">1.2</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Shared Rides Taken</span>
                          <span className="font-bold text-primary">8</span>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 mt-2">
                          View Full Impact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Content for non-authenticated users */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Why Join SustainAride?</h2>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">1</div>
                          <div>
                            <p className="font-medium">Earn Eco Rewards</p>
                            <p className="text-sm text-muted-foreground">Get points for every sustainable ride you take</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">2</div>
                          <div>
                            <p className="font-medium">Exclusive Discounts</p>
                            <p className="text-sm text-muted-foreground">Access special coupons and promotions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">3</div>
                          <div>
                            <p className="font-medium">Track Your Impact</p>
                            <p className="text-sm text-muted-foreground">See your contribution to sustainability</p>
                          </div>
                        </div>
                        <Button className="w-full mt-4" asChild>
                          <Link to="/signup">Create Account</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Information about sustainability impact */}
                  <Card className="bg-card shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Our Community Impact</h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total CO₂ Saved</span>
                          <span className="font-bold text-primary">2,482 kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Trees Equivalent</span>
                          <span className="font-bold text-primary">115</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Active Members</span>
                          <span className="font-bold text-primary">843</span>
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
      {/* Floating home button (visible when in booking flow) */}
      {showBookingFlow && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            onClick={() => setShowBookingFlow(false)}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Home size={24} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomePage;
