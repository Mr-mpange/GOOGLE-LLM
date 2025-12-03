/**
 * Security utilities for detecting malicious prompts and unsafe content
 */

// Patterns that indicate potential prompt injection
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions?/i,
  /disregard\s+(previous|above|all)\s+(instructions?|prompts?)/i,
  /forget\s+(everything|all|previous)/i,
  /you\s+are\s+now\s+a/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
  /\[SYSTEM\]/i,
  /\<\|im_start\|\>/i,
  /\<\|im_end\|\>/i,
  /sudo\s+mode/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /act\s+as\s+if/i,
  /pretend\s+(you|to)\s+(are|be)/i,
  /roleplay\s+as/i,
  /simulate\s+being/i
];

// Suspicious keywords that might indicate abuse
const SUSPICIOUS_KEYWORDS = [
  'password',
  'api key',
  'secret',
  'token',
  'credentials',
  'bypass',
  'exploit',
  'vulnerability',
  'injection',
  'override'
];

/**
 * Detect potential prompt injection attempts
 */
export function detectPromptInjection(prompt) {
  const detectedPatterns = [];
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      detectedPatterns.push(pattern.source);
    }
  }

  // Check for suspicious keyword density
  const lowerPrompt = prompt.toLowerCase();
  const suspiciousCount = SUSPICIOUS_KEYWORDS.filter(keyword => 
    lowerPrompt.includes(keyword)
  ).length;

  const isInjection = detectedPatterns.length > 0 || suspiciousCount >= 3;

  return {
    isInjection,
    patterns: detectedPatterns,
    suspiciousKeywordCount: suspiciousCount,
    riskScore: calculateRiskScore(detectedPatterns.length, suspiciousCount)
  };
}

/**
 * Calculate safety score from Vertex AI response
 */
export function calculateSafetyScore(aiResponse) {
  if (!aiResponse.safetyRatings || aiResponse.safetyRatings.length === 0) {
    return 1.0; // Default to safe if no ratings
  }

  // Map safety ratings to scores
  const ratingScores = {
    'NEGLIGIBLE': 1.0,
    'LOW': 0.8,
    'MEDIUM': 0.5,
    'HIGH': 0.2
  };

  let totalScore = 0;
  let count = 0;

  for (const rating of aiResponse.safetyRatings) {
    const probability = rating.probability || 'NEGLIGIBLE';
    totalScore += ratingScores[probability] || 1.0;
    count++;
  }

  return count > 0 ? totalScore / count : 1.0;
}

/**
 * Calculate risk score for prompt
 */
function calculateRiskScore(patternCount, suspiciousCount) {
  const patternScore = Math.min(patternCount * 0.3, 0.7);
  const keywordScore = Math.min(suspiciousCount * 0.1, 0.3);
  return Math.min(patternScore + keywordScore, 1.0);
}

/**
 * Detect anomalous user behavior
 */
export function detectAnomalousActivity(userHistory) {
  // Check for rapid-fire requests
  if (userHistory.length > 50 && userHistory.timeWindow < 60000) {
    return {
      isAnomalous: true,
      reason: 'excessive_request_rate',
      severity: 'high'
    };
  }

  // Check for repeated similar prompts (potential scraping)
  const uniquePrompts = new Set(userHistory.prompts);
  if (userHistory.prompts.length > 20 && uniquePrompts.size < 5) {
    return {
      isAnomalous: true,
      reason: 'repetitive_prompts',
      severity: 'medium'
    };
  }

  return {
    isAnomalous: false
  };
}

/**
 * Check content policy violations
 */
export function checkPolicyViolation(text) {
  const violations = [];

  // Check for PII exposure
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;

  if (emailPattern.test(text)) violations.push('email_exposure');
  if (phonePattern.test(text)) violations.push('phone_exposure');
  if (ssnPattern.test(text)) violations.push('ssn_exposure');

  return {
    hasViolation: violations.length > 0,
    violations
  };
}

export default {
  detectPromptInjection,
  calculateSafetyScore,
  detectAnomalousActivity,
  checkPolicyViolation
};
