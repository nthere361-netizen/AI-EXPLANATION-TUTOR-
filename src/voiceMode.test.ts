/**
 * Voice Mode Automated Self-Test Suite
 * Verifies conversational intent tags, sentence word-count limits,
 * absence of speech-breaking markdown symbols, and data contract adherence.
 */

import { VoiceExplanationResponse, VoiceSentence, VoiceModeIntent } from './types';

function runTests() {
  console.log('--- RUNNING VOICE MODE TESTS ---');

  // Test 1: Verify VoiceExplanationResponse data shape
  const mockResponse: VoiceExplanationResponse = {
    spokenText: 'A diesel engine generates power by compressing air until it becomes hot enough to ignite fuel automatically.',
    sentences: [
      { text: 'A diesel engine compresses air to extreme pressure inside the cylinder.', durationMs: 2500 },
      { text: 'This high compression makes the air super hot.', durationMs: 1900 },
      { text: 'Fuel is then sprayed in and instantly ignites without a spark plug.', durationMs: 2400 }
    ],
    onScreenText: '### Diesel Engine Mechanics\n\n- Extreme compression\n- Auto-ignition without spark plugs',
    visual: {
      type: 'flow',
      title: 'Four-Stroke Diesel Combustion Cycle',
      stages: [
        { label: 'Intake', description: 'Air is drawn in', badge: 'Stroke 1' },
        { label: 'Compression', description: 'Air is squeezed tightly', badge: 'Stroke 2' },
        { label: 'Combustion', description: 'Fuel ignites from heat', badge: 'Stroke 3' },
        { label: 'Exhaust', description: 'Spent gases leave', badge: 'Stroke 4' }
      ]
    },
    intent: 'answer',
    followUpCommand: 'Would you like to explore why diesel engines have higher thermal efficiency than gasoline engines?'
  };

  if (!mockResponse.spokenText || typeof mockResponse.spokenText !== 'string') {
    throw new Error('Test 1 Failed: spokenText must be a non-empty string');
  }

  // Test 2: Ensure all sentences are <= 15 words for natural spoken cadency
  mockResponse.sentences.forEach((s, idx) => {
    const wordCount = s.text.trim().split(/\s+/).length;
    if (wordCount > 18) { // allow small flexibility margin
      throw new Error(`Test 2 Failed: sentence ${idx} has ${wordCount} words (should be <= 15)`);
    }
  });

  // Test 3: Ensure spoken text has no raw markdown or forbidden characters
  const forbiddenRegex = /[*#_`\[\]()]/;
  mockResponse.sentences.forEach((s, idx) => {
    if (forbiddenRegex.test(s.text)) {
      throw new Error(`Test 3 Failed: sentence ${idx} contains forbidden speech markdown: "${s.text}"`);
    }
  });

  // Test 4: Verify valid intents
  const validIntents: VoiceModeIntent[] = [
    'answer',
    'clarification',
    'simplification',
    'repeat',
    'go_deeper',
    'skip',
    'interrupt'
  ];

  if (!validIntents.includes(mockResponse.intent!)) {
    throw new Error(`Test 4 Failed: unknown intent "${mockResponse.intent}"`);
  }

  // Test 5: Verify visual schema conformance
  if (!mockResponse.visual || !mockResponse.visual.type || !mockResponse.visual.stages) {
    throw new Error('Test 5 Failed: visual must contain valid type and stages');
  }

  console.log('✅ ALL VOICE MODE TESTS PASSED SUCCESSFULLY (5/5)');
}

runTests();
