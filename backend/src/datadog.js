import axios from 'axios';
import { config } from './config.js';

const DATADOG_API_KEY = config.datadog.apiKey;
const DATADOG_SITE = config.datadog.site;
const SERVICE_NAME = 'llm-guardian';

/**
 * Send log to Datadog
 */
export async function sendLog(message, attributes = {}, tags = []) {
  if (!DATADOG_API_KEY) {
    return; // Silently skip if not configured
  }

  try {
    const logEntry = {
      ddsource: 'nodejs',
      ddtags: `service:${SERVICE_NAME},env:${process.env.NODE_ENV || 'production'},${tags.join(',')}`,
      hostname: process.env.HOSTNAME || 'cloud-run',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      service: SERVICE_NAME,
      ...attributes
    };

    await axios.post(
      `https://http-intake.logs.${DATADOG_SITE}/api/v2/logs`,
      [logEntry],
      {
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': DATADOG_API_KEY
        },
        timeout: 5000
      }
    );
  } catch (error) {
    // Silently fail - don't spam console with Datadog errors
  }
}

/**
 * Send metric to Datadog
 */
export async function sendMetric(metricName, value, tags = []) {
  if (!DATADOG_API_KEY) {
    return; // Silently skip if not configured
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    
    const metric = {
      series: [
        {
          metric: metricName,
          type: 'gauge',
          points: [[now, value]],
          tags: [`service:${SERVICE_NAME}`, `env:${process.env.NODE_ENV || 'production'}`, ...tags]
        }
      ]
    };

    await axios.post(
      `https://api.${DATADOG_SITE}/api/v2/series`,
      metric,
      {
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': DATADOG_API_KEY
        },
        timeout: 5000
      }
    );
  } catch (error) {
    // Silently fail - don't spam console with Datadog errors
  }
}

/**
 * Send security signal to Datadog
 */
export async function sendSecuritySignal(signal) {
  if (!DATADOG_API_KEY) {
    return; // Silently skip if not configured
  }

  try {
    // Log as a security event
    await sendLog('security.signal', {
      title: signal.title,
      message: signal.message,
      severity: signal.severity || 'medium',
      ...signal.metadata
    }, ['security:true', ...(signal.tags || [])]);

    // Also send as metric for alerting
    await sendMetric('llm.security.signal', 1, [
      `severity:${signal.severity}`,
      ...(signal.tags || [])
    ]);
  } catch (error) {
    // Silently fail
  }
}

/**
 * Send APM trace (simplified version)
 */
export async function sendTrace(spanData) {
  if (!DATADOG_API_KEY) {
    return;
  }

  try {
    // In production, use dd-trace library for proper APM
    // This is a simplified version for demonstration
    await sendLog('apm.trace', spanData, ['trace:true']);
  } catch (error) {
    // Silently fail
  }
}

export default { sendLog, sendMetric, sendSecuritySignal, sendTrace };
