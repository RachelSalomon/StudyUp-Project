/**
 * Role-based Authorization & Permission Guards
 * Provides middleware for strict role and permission-based access control
 */

// Guard to check if user has a specific role
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please provide a valid token.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(
          " or ",
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Guard to check if user has a specific permission
const permissionGuard = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }

    if (
      !req.user.hasPermission ||
      !req.user.hasPermission(requiredPermission)
    ) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permission required: ${requiredPermission}`,
      });
    }

    next();
  };
};

// Guard to check if user owns the resource
const ownerGuard = (resourceOwnerField = "user") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    // Admin can access any resource
    if (req.user.role === "admin") {
      return next();
    }

    const resourceOwnerId = req.resource?.[resourceOwnerField];

    if (!resourceOwnerId) {
      return res.status(400).json({
        success: false,
        message: "Resource not found or invalid.",
      });
    }

    if (resourceOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not own this resource.",
      });
    }

    next();
  };
};

// Guard to check if user is manager of a course
const courseManagerGuard = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
  }

  if (!req.course) {
    return res.status(400).json({
      success: false,
      message: "Course not found.",
    });
  }

  // Admin can manage any course
  if (req.user.role === "admin") {
    return next();
  }

  // Check if user is manager or creator
  if (!req.course.isManager(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You are not a manager of this course.",
    });
  }

  next();
};

// Guard for course member access
const courseMemberGuard = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated.",
    });
  }

  if (!req.course) {
    return res.status(400).json({
      success: false,
      message: "Course not found.",
    });
  }

  // Admin can access any course
  if (req.user.role === "admin") {
    return next();
  }

  // Manager can access their course
  if (req.course.isManager(req.user._id)) {
    return next();
  }

  // Member can access their course
  if (req.course.isMember(req.user._id)) {
    return next();
  }

  res.status(403).json({
    success: false,
    message: "Access denied. You are not a member of this course.",
  });
};

module.exports = {
  roleGuard,
  permissionGuard,
  ownerGuard,
  courseManagerGuard,
  courseMemberGuard,
};
