module.exports = async (req, res) => {
    res.status(200).json({
        message: 'Test endpoint working!',
        timestamp: new Date().toISOString()
    });
};