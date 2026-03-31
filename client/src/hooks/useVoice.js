import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useVoice — Custom React hook for Speech-to-Text via Web Speech API.
 * Supports voice commands for product addition and system queries.
 */

const GRAMMAR_PATTERNS = {
  addProduct: /(?:add|create|new)?\s*(\d+)\s*(?:kg|kilo|kg)?\s+(.+?)\s+(?:at|for|price|rupees?|rs\.?)?\s*(?:₹|rs\.?|rupees?)?\s*(\d+)/i,
  queryPrice: /(?:price|cost|rate)\s+(?:of|for)?\s*(.+)/i,
  setCategory: /(?:category|type)\s+(?:is)?\s*(.+)/i,
};

/**
 * Parse voice command into structured product data
 */
export const parseVoiceCommand = (transcript) => {
  const text = transcript.toLowerCase().trim();

  // Pattern: "add 50 kg tomatoes at 40 rupees" or "50 tomatoes 40"
  const productMatch = text.match(
    /(?:add|create|new)?\s*(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilos|kilogram)?\s+([a-z\s]+?)\s+(?:at|for|price|rupees?|rs\.?)?\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:\.\d+)?)/i
  );

  if (productMatch) {
    return {
      type: 'add_product',
      quantity: parseFloat(productMatch[1]),
      name: productMatch[2].trim(),
      price: parseFloat(productMatch[3]),
    };
  }

  // Pattern: "category vegetables" or "set category to fruits"
  const categoryMatch = text.match(/(?:category|type)\s+(?:is|to|as)?\s*([a-z\s]+)/i);
  if (categoryMatch) {
    return {
      type: 'set_category',
      category: categoryMatch[1].trim(),
    };
  }

  return { type: 'unknown', raw: transcript };
};

/**
 * useVoice hook
 */
const useVoice = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English for agricultural terms

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        setTranscript(text);

        if (result.isFinal) {
          const parsed = parseVoiceCommand(text);
          onResult?.(parsed, text);
        }
      };

      recognition.onerror = (event) => {
        setError(event.error === 'not-allowed'
          ? 'Microphone permission denied. Please allow mic access.'
          : `Voice error: ${event.error}`
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    try {
      recognitionRef.current?.start();
    } catch (e) {
      setError('Already listening or recognition unavailable.');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, transcript, error, isSupported, startListening, stopListening };
};

export default useVoice;
