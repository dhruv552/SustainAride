/**
 * Coupon Engine for SustainAride
 * Handles coupon eligibility checks and reward processing
 */

/**
 * Check coupon eligibility for a user
 * @param {Object} user - The user object from the database
 * @param {String} couponCode - The coupon code to check
 * @returns {Boolean} - Whether the user is eligible for the coupon
 */
function checkCouponEligibility(user, couponCode) {
    const now = new Date();

    switch (couponCode) {
        case "GreenStart10":
            // Valid for new users only
            return user.rideHistory.length === 0;

        case "EcoRide20":
            // Valid when user completes 3 shared rides within same calendar week (Mon-Sun)
            const weekRides = user.rideHistory.filter(ride =>
                ride.type === "Shared" &&
                isSameWeek(ride.date, now)
            );
            return weekRides.length >= 3;

        case "ElectricSaver30":
            // Valid for electric rides above 10 km
            // This will be checked at the point of booking, not here
            // Just verify the user doesn't exceed the usage limit
            const electricCouponUses = user.couponsUsed.filter(code => code === "ElectricSaver30").length;
            return electricCouponUses < 2; // Limit: 2 uses per user per month

        case "SharedBonus50":
            // User must complete 5 shared rides within 30 days
            const monthRides = user.rideHistory.filter(ride =>
                ride.type === "Shared" &&
                daysBetween(ride.date, now) <= 30
            );
            return monthRides.length >= 5;

        case "ReferralRide100":
            // This requires a separate referral check
            // Here we just check if they have a referral code
            return !!user.referralCode;

        default:
            return false;
    }
}

/**
 * Apply rewards based on coupon eligibility
 * @param {Object} user - The user object from the database
 * @param {String} couponCode - The coupon code to apply rewards for
 * @returns {Object} result - The result of the reward application
 * @returns {Boolean} result.success - Whether the reward was applied successfully
 * @returns {String} result.message - A message describing the result
 * @returns {Number} result.amount - The amount of the reward (if applicable)
 */
async function applyRewards(user, couponCode) {
    if (checkCouponEligibility(user, couponCode)) {
        switch (couponCode) {
            case "EcoRide20":
                user.wallet += 20;
                user.couponsUsed.push(couponCode);
                await user.save();
                return {
                    success: true,
                    message: "₹20 cashback credited to your wallet!",
                    amount: 20
                };

            case "SharedBonus50":
                user.wallet += 50;
                user.couponsUsed.push(couponCode);
                await user.save();
                return {
                    success: true,
                    message: "₹50 bonus credited to your wallet for completing 5 shared rides!",
                    amount: 50
                };

            case "ReferralRide100":
                user.ecoPoints += 100;
                user.couponsUsed.push(couponCode);
                await user.save();
                return {
                    success: true,
                    message: "100 Eco Points added to your account for the referral!",
                    amount: 100
                };

            default:
                return {
                    success: false,
                    message: "Invalid coupon code or not eligible for rewards"
                };
        }
    } else {
        return {
            success: false,
            message: "You are not eligible for this reward"
        };
    }
}

/**
 * Check if two dates are in the same week (Monday to Sunday)
 * @param {Date} date1 - The first date
 * @param {Date} date2 - The second date
 * @returns {Boolean} - Whether the dates are in the same week
 */
function isSameWeek(date1, date2) {
    const start = new Date(date2);
    start.setDate(date2.getDate() - date2.getDay() + (date2.getDay() === 0 ? -6 : 1)); // Monday
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return date1 >= start && date1 < end;
}

/**
 * Calculate days between two dates
 * @param {Date} date1 - The first date
 * @param {Date} date2 - The second date
 * @returns {Number} - Number of days between the dates
 */
function daysBetween(date1, date2) {
    return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
}

/**
 * Get valid coupons for a user based on their ride history
 * @param {Object} user - The user object from the database
 * @returns {Array} - Array of valid coupon codes for the user
 */
function getValidCouponsForUser(user) {
    const validCoupons = [];
    const couponsToCheck = ["GreenStart10", "EcoRide20", "ElectricSaver30", "SharedBonus50", "ReferralRide100"];

    couponsToCheck.forEach(couponCode => {
        if (checkCouponEligibility(user, couponCode)) {
            validCoupons.push(couponCode);
        }
    });

    return validCoupons;
}

/**
 * Check if a ride qualifies for specific coupons at booking time
 * @param {Object} ride - The ride details
 * @param {String} couponCode - The coupon code to check
 * @returns {Object} - Eligibility result with price discount if applicable
 */
function checkRideEligibility(ride, couponCode) {
    switch (couponCode) {
        case "GreenStart10":
            // ₹10 off on first CNG or Electric ride, minimum ₹50
            if ((ride.type === "CNG" || ride.type === "Electric") && ride.fare >= 50) {
                return {
                    eligible: true,
                    discount: 10,
                    message: "₹10 discount applied to your first eco-friendly ride!"
                };
            }
            return {
                eligible: false,
                message: "This coupon requires a CNG or Electric ride with minimum fare of ₹50"
            };

        case "ElectricSaver30":
            // ₹30 discount for electric rides above 10 km
            if (ride.type === "Electric" && ride.distance > 10) {
                return {
                    eligible: true,
                    discount: 30,
                    message: "₹30 discount applied for your electric ride!"
                };
            }
            return {
                eligible: false,
                message: "This coupon requires an Electric ride with distance over 10km"
            };

        default:
            return {
                eligible: false,
                message: "This coupon cannot be applied at booking time"
            };
    }
}

module.exports = {
    checkCouponEligibility,
    applyRewards,
    isSameWeek,
    daysBetween,
    getValidCouponsForUser,
    checkRideEligibility
};