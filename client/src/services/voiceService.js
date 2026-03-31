/**
 * VOICE SERVICE
 * Wraps the Web Speech API for FarmDirect voice commands.
 * Provides static parsing utilities and session management.
 *
 * Usage:
 *   import { parseVoiceCommand, VoiceSession } from '../services/voiceService';
 *   const session = new VoiceSession({ onResult, onError });
 *   session.start() / session.stop()
 */

// ── Command intent patterns ─────────────────────────────────────────────────

const INTENTS = [
  {
    name: 'add_product',
    patterns: [
      /(?:add|create|new|list)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilos)?\s+([a-z\s]+?)\s+(?:at|for|rs\.?|rupees?|₹)?\s*₹?\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:kg|kilo)?\s+([a-z\s]+?)\s+(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?/i,
    ],
    extract: (match) => ({
      type: 'add_product',
      quantity: parseFloat(match[1]),
      name: match[2].trim().replace(/\b\w/g, l => l.toUpperCase()),
      price: parseFloat(match[3]),
    }),
  },
  {
    name: 'show_orders',
    patterns: [/show\s+(?:my\s+)?orders?/i, /open\s+orders?/i, /my\s+orders?/i],
    extract: () => ({ type: 'navigate', target: 'orders' }),
  },
  {
    name: 'show_analytics',
    patterns: [/show\s+(?:my\s+)?(?:analytics|earnings|stats|dashboard)/i, /open\s+analytics/i],
    extract: () => ({ type: 'navigate', target: 'analytics' }),
  },
  {
    name: 'show_products',
    patterns: [/show\s+(?:my\s+)?(?:products?|inventory|catalog|stock)/i],
    extract: () => ({ type: 'navigate', target: 'products' }),
  },
  {
    name: 'fast_sell',
    patterns: [/(?:create|add|new)\s+(?:flash|fast)\s+(?:deal|sell)/i, /flash\s+deal/i],
    extract: () => ({ type: 'navigate', target: 'fastsell' }),
  },
  {
    name: 'set_price',
    patterns: [/(?:set|change|update)\s+price\s+(?:to\s+)?(?:₹|rs\.?)?\s*(\d+)/i],
    extract: (match) => ({ type: 'set_price', price: parseFloat(match[1]) }),
  },
];

/**
 * Parse a raw voice transcript into a structured intent object.
 */
export const parseVoiceCommand = (transcript) => {
  if (!transcript) return { type: 'unknown', raw: '' };

  const text = transcript.trim();

  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      const match = text.match(pattern);
      if (match) {
        return { ...intent.extract(match), raw: text, confidence: 'high' };
      }
    }
  }

  return { type: 'unknown', raw: text, confidence: 'low' };
};

/**
 * Check if Web Speech API is supported.
 */
export const isSpeechSupported = () =>
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * VoiceSession — stateful class wrapper for Web Speech API.
 *
 * const session = new VoiceSession({
 *   lang: 'en-IN',
 *   onResult: (parsed, raw) => {},
 *   onInterimResult: (text) => {},
 *   onError: (msg) => {},
 *   onStart: () => {},
 *   onEnd: () => {},
 * });
 * session.start();
 * session.stop();
 */
export class VoiceSession {
  constructor({ lang = 'en-IN', onResult, onInterimResult, onError, onStart, onEnd } = {}) {
    this.lang = lang;
    this.onResult = onResult;
    this.onInterimResult = onInterimResult;
    this.onError = onError;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this._recognition = null;
    this.isListening = false;
  }

  start() {
    if (!isSpeechSupported()) {
      this.onError?.('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    if (this.isListening) {
      this.stop();
      return false;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = this.lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.isListening = true;
      this.onStart?.();
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        const parsed = parseVoiceCommand(transcript);
        this.onResult?.(parsed, transcript);
      } else {
        this.onInterimResult?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone access denied. Please allow mic permission.',
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone detected.',
        'network': 'Network error during voice recognition.',
      };
      this.onError?.(messages[event.error] || `Voice error: ${event.error}`);
      this.isListening = false;
    };

    recognition.onend = () => {
      this.isListening = false;
      this.onEnd?.();
    };

    this._recognition = recognition;
    recognition.start();
    return true;
  }

  stop() {
    this._recognition?.stop();
    this.isListening = false;
  }

  abort() {
    this._recognition?.abort();
    this.isListening = false;
  }
}

export default VoiceSession;
