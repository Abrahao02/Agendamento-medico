// ============================================
// 📁 src/utils/publicSchedule/priceDisplay.js
// Utility functions for price display in public schedule
// ============================================

/**
 * Format location display text based on showPrice flag
 * @param {object} location - Location object with name and price
 * @param {boolean} showPrice - Whether to show price
 * @returns {string} Formatted location display string
 * 
 * @example
 * formatLocationDisplay({ name: "Flamengo", price: 250 }, true)
 * // "Flamengo - R$ 250.00"
 * 
 * formatLocationDisplay({ name: "Flamengo", price: 250 }, false)
 * // "Flamengo"
 */
export function formatLocationDisplay(location, showPrice = true) {
  if (!location || !location.name) {
    return "";
  }

  if (showPrice && location.price !== undefined && location.price > 0) {
    return `${location.name} - R$ ${location.price.toFixed(2)}`;
  }

  return location.name;
}

/**
 * Get price display text or alternative message
 * @param {object} location - Location object with price
 * @param {boolean} showPrice - Whether to show price
 * @returns {string} Price string or "Valor sob consulta"
 * 
 * @example
 * getPriceDisplayText({ price: 250 }, true)
 * // "R$ 250.00"
 * 
 * getPriceDisplayText({ price: 250 }, false)
 * // "Valor sob consulta"
 */
export function getPriceDisplayText(location, showPrice = true) {
  if (!location) {
    return "Valor sob consulta";
  }

  if (showPrice && location.price !== undefined && location.price > 0) {
    return `R$ ${location.price.toFixed(2)}`;
  }

  return "Valor sob consulta";
}

/**
 * Generate WhatsApp message for price inquiry
 * @param {string} locationName - Name of the location (optional)
 * @returns {string} Pre-filled WhatsApp message
 * 
 * @example
 * generatePriceInquiryMessage("Flamengo")
 * // "Olá! Gostaria de saber o valor da consulta no local Flamengo."
 * 
 * generatePriceInquiryMessage()
 * // "Olá! Gostaria de saber o valor da consulta."
 */
export function generatePriceInquiryMessage(locationName = null) {
  if (locationName) {
    return `Olá! Gostaria de saber o valor da consulta no local ${locationName}.`;
  }
  return "Olá! Gostaria de saber o valor da consulta.";
}
