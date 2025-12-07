import { VertexAI } from '@google-cloud/vertexai';
import { config } from './config.js';

const projectId = config.googleCloud.project;
const location = config.googleCloud.location;

console.log(`✓ Initializing Vertex AI with project: ${projectId}, location: ${location}`);

// Initialize Vertex AI
const vertexAI = new VertexAI({ project: projectId, location: location });

// Current model (can be changed dynamically)
let currentModel = 'gemini-2.0-flash-exp';

/**
 * Set the current model
 */
export function setModel(modelName) {
  currentModel = modelName;
  console.log(`✓ Model switched to: ${modelName}`);
}

/**
 * Get the current model
 */
export function getCurrentModel() {
  return currentModel;
}

/**
 * Generate content using Vertex AI Gemini
 */
export async function generateContent(prompt, customModel = null) {
  try {
    const modelToUse = customModel || currentModel;
    
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelToUse,
      generation_config: {
        max_output_tokens: 2048,
        temperature: 0.7,
        top_p: 0.8,
        top_k: 40
      },
      safety_settings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    });

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;

    return {
      text: response.candidates[0].content.parts[0].text,
      safetyRatings: response.candidates[0].safetyRatings || [],
      finishReason: response.candidates[0].finishReason
    };
  } catch (error) {
    console.error('Vertex AI error:', error);
    throw new Error(`Vertex AI generation failed: ${error.message}`);
  }
}

/**
 * Calculate cost based on token usage
 * Gemini Pro pricing (as of 2024):
 * - Input: $0.00025 per 1K tokens
 * - Output: $0.0005 per 1K tokens
 */
export function calculateCost(tokensIn, tokensOut) {
  const inputCost = (tokensIn / 1000) * 0.00025;
  const outputCost = (tokensOut / 1000) * 0.0005;
  return parseFloat((inputCost + outputCost).toFixed(6));
}

export default { generateContent, calculateCost, setModel, getCurrentModel };
