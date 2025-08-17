// Switched to Gemini because we can use the best model for a better price
import { GoogleGenAI } from "@google/genai";
import logger from "../utils/logger.js";

const apiKey = process.env["GEMINI_API_KEY"];
if (!apiKey) {
  logger.fatal("No Gemini API key found in the env!");
}

// Initialize the client
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

// Define the grounding tool
const groundingTool = {
  googleSearch: {},
};

// Configure generation settings, including the tool
const config = {
  tools: [groundingTool],
};

const query = async (message) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: message,
      config,
    });

    // Debug logging to understand the response structure
    logger.info("Gemini API result structure:", {
      resultKeys: Object.keys(result || {}),
    });

    return result;
  } catch (error) {
    logger.error("Error in Gemini API query:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Helper function to extract text from Gemini response
const extractTextFromResponse = (result, functionName) => {
  try {
    let responseText = result.text;

    if (!responseText || responseText.trim() === "") {
      logger.error(`Empty response from Gemini API in ${functionName}`);
      throw new Error("Empty response from Gemini API");
    }

    return responseText;
  } catch (error) {
    logger.error(
      `Unable to extract text from Gemini response in ${functionName}`,
      {
        errorMsg: error.message,
        fullResult: JSON.stringify(result, null, 2),
      },
    );
  }
};

export const generateItinerary = async (trip) => {
  const responseSchema = `
  [
    day: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    items: [{
      time: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      description: String,
      location: String,
      duration: Number, // in minutes
      cost: Number,
      bookingRequired: {
        type: Boolean,
        default: false
      },
      bookingInfo: {
        website: String,
        phone: String,
        notes: String
      },
    }]
  ]
  `;
  const prompt = `
    Generate a concise day-by-day itinerary for the following trip details:
    - Destination: ${trip.destination}
    - Start: ${trip.startDate}
    - End: ${trip.endDate}
    - Days: ${trip.duration}
    - Budget: $${trip.budget}

    The user has specified these preferences which you must take into account when planning:
    - Travel style: ${trip.preferences.travelStyle}
    - Interests: ${trip.preferences.interests.toString()}
    - Budget range: ${trip.preferences.budgetRange}
    - Preferred accommodation: ${trip.preferences.accommodationStyle}
    - Generated travel tips: ${JSON.stringify(trip.travelTips)}
    - Generated recommendations: ${JSON.stringify(trip.recommendations)}

    Your response must be completely in JSON and adhere to the following MongoDB Mongoose schema:
    ${responseSchema}

    Generate an entry for each day in the trip, consider both arrival time and depature time.

    Important: Include nothing in the output except valid JSON, ensure it STRICTLY adheres to the given schema.
  `;

  const result = await query(prompt);
  return extractTextFromResponse(result, "generateItinerary");
};

export const generateRecs = async (trip) => {
  const responseSchema = `
  {
    attractions: [{
      name: String,
      description: String,
      location: String,
      rating: Number,
      cost: Number,
      category: String,
    }],
    restaurants: [{
      name: String,
      cuisine: String,
      description: String,
      location: String,
      rating: Number,
      priceRange: String,
      dietaryOptions: [String],
    }],
    experiences: [{
      name: String,
      description: String,
      category: String,
      duration: Number,
      cost: Number,
      location: String,
    }]
  }
  `;
  const prompt = `
    Generate a personalized list of attraction, restaurant, and experience recommendations for the following trip details:
    - Destination: ${trip.destination}
    - Start: ${trip.startDate}
    - End: ${trip.endDate}
    - Days: ${trip.duration}
    - Budget: $${trip.budget}

    The user has specified these preferences which you must take into account when planning:
    - Travel style: ${trip.preferences.travelStyle}
    - Interests: ${trip.preferences.interests.toString()}
    - Budget range: ${trip.preferences.budgetRange}
    - Preferred accommodation: ${trip.preferences.accommodationStyle}
    
    Your response must be completely in JSON and adhere to the following MongoDB Mongoose schema:
    ${responseSchema}
    
    Generate 3-5 items for each recommendation category.

    Important: Include nothing in the output except valid JSON, ensure it STRICTLY adheres to the given schema.
  `;

  const result = await query(prompt);
  return extractTextFromResponse(result, "generateRecs");
};

export const generateTips = async (trip) => {
  const responseSchema = `
  [{
    category: {
      type: String,
      enum: ['cultural', 'transportation', 'safety', 'language', 'weather', 'money', 'food', 'customs'],
      required: true
    },
    title: String,
    content: String,
    importance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }]
  `;
  const prompt = `
    Generate an informative list of travel tips for the following trip details:
    - Destination: ${trip.destination}
    - Start: ${trip.startDate}
    - End: ${trip.endDate}
    - Days: ${trip.duration}
    - Budget: $${trip.budget}

    The user has specified these preferences which you must take into account when planning:
    - Travel style: ${trip.preferences.travelStyle}
    - Interests: ${trip.preferences.interests.toString()}
    - Budget range: ${trip.preferences.budgetRange}
    - Preferred accommodation: ${trip.preferences.accommodationStyle}
    
    Your response must be completely in JSON and adhere to the following MongoDB Mongoose schema:
    ${responseSchema}

    Each tip must be assigned one of these categories, NO others are allowed:
    'cultural', 'transportation', 'safety', 'language', 'weather', 'money', 'food', 'customs'

    Generate 5-7 travel tips you think will be most useful.

    Important: Include nothing in the output except valid JSON, ensure it STRICTLY adheres to the given schema.
  `;

  const result = await query(prompt);
  return extractTextFromResponse(result, "generateTips");
};
