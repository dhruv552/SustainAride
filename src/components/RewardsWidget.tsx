import React from "react";
import { motion } from "framer-motion";
import { Trophy, Gift, ChevronRight, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RewardsWidgetProps {
  ecoPoints?: number;
  nextMilestone?: number;
  currentProgress?: number;
  availableRewards?: Array<{
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
  }>;
}

const RewardsWidget = ({
  ecoPoints = 750,
  nextMilestone = 1000,
  currentProgress = 75, // percentage towards next milestone
  availableRewards = [
    {
      id: "1",
      name: "10% Off Next Ride",
      description: "Get 10% off on your next eco-friendly ride",
      pointsRequired: 500,
    },
    {
      id: "2",
      name: "Free EV Ride",
      description: "Enjoy a free electric vehicle ride up to 10km",
      pointsRequired: 1200,
    },
    {
      id: "3",
      name: "Plant a Tree",
      description: "We plant a tree in your name",
      pointsRequired: 800,
    },
  ],
}: RewardsWidgetProps) => {
  // Find the next available reward based on points
  const nextReward = availableRewards
    .filter((reward) => reward.pointsRequired > ecoPoints)
    .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];

  return (
    <Card className="w-full shadow-md overflow-hidden border-primary/20 border-2">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy size={18} />
            Eco Rewards
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-white/20 text-primary-foreground hover:bg-white/30"
          >
            Level 3
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Points Display */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <p className="text-sm text-muted-foreground">Your Eco-Points</p>
              <h3 className="text-2xl font-bold text-primary flex items-center gap-1">
                <Leaf size={20} className="text-primary" />
                {ecoPoints}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Milestone</p>
              <p className="font-semibold">{nextMilestone} points</p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to next milestone</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </motion.div>

          {/* Next Reward */}
          {nextReward && (
            <motion.div
              className="mt-4 bg-secondary/30 p-3 rounded-lg flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium">{nextReward.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {nextReward.pointsRequired - ecoPoints} points away
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </motion.div>
          )}

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                className="w-full mt-2 border-primary text-primary hover:bg-primary/10"
              >
                View All Rewards
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsWidget;
