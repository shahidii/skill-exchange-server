// utility/asyncHandler.js
// DRY async handler for Express route controllers

module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
