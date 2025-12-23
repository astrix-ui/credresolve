/**
 * Input Validators
 * Reusable validation functions
 */

class Validators {
  
  static isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  
  static isValidPhone(phone) {
    // Basic phone validation - adjust based on requirements
    const phonePattern = /^[\d\s\-\+\(\)]+$/;
    return phonePattern.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
  
  static isPositiveNumber(value) {
    return typeof value === 'number' && value > 0;
  }
  
  static isValidMongoId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
  
  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }
  
  static validateSplitDetails(divisionMethod, splitDetails, totalAmount) {
    const errors = [];
    
    if (!Array.isArray(splitDetails) || splitDetails.length === 0) {
      errors.push('Split details must be a non-empty array');
      return { valid: false, errors };
    }
    
    switch (divisionMethod) {
      case 'equal':
        // Just need participant IDs
        for (const detail of splitDetails) {
          if (!detail) {
            errors.push('Each split detail must contain a participant ID');
          }
        }
        break;
        
      case 'exact':
        // Need participant ID and amount
        let totalExact = 0;
        for (const detail of splitDetails) {
          if (!detail.participantId) {
            errors.push('Each split detail must contain participantId');
          }
          if (!this.isPositiveNumber(detail.amount)) {
            errors.push('Each split detail must contain a positive amount');
          }
          totalExact += detail.amount || 0;
        }
        
        // Check if amounts match total (with small tolerance for rounding)
        if (Math.abs(totalExact - totalAmount) > 0.02) {
          errors.push(`Split amounts (${totalExact}) don't match total (${totalAmount})`);
        }
        break;
        
      case 'percentage':
        // Need participant ID and percentage
        let totalPercentage = 0;
        for (const detail of splitDetails) {
          if (!detail.participantId) {
            errors.push('Each split detail must contain participantId');
          }
          if (typeof detail.percentage !== 'number' || detail.percentage < 0 || detail.percentage > 100) {
            errors.push('Each percentage must be between 0 and 100');
          }
          totalPercentage += detail.percentage || 0;
        }
        
        // Check if percentages add up to 100
        if (Math.abs(totalPercentage - 100) > 0.01) {
          errors.push(`Percentages (${totalPercentage}) must sum to 100`);
        }
        break;
        
      default:
        errors.push('Invalid division method');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;
