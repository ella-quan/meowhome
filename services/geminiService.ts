
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedInput, Priority, FamilyMember } from "../types";

// In a real app, this should be handled securely. For this demo, we assume env access.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const parseNaturalLanguage = async (input: string, members: FamilyMember[] = []): Promise<ParsedInput | null> => {
  if (!apiKey) {
    console.warn("No API key found for Gemini");
    return null;
  }

  try {
    const membersContext = members.map(m => `${m.name} (ID: ${m.id})`).join(", ");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: input,
      config: {
        systemInstruction: `You are a helpful family assistant. 
        Your job is to parse natural language inputs from family members into structured JSON data.
        The input may be in English or Chinese (or other languages). ALWAYS return the result in standard English JSON values (e.g., type="todo"), but keep titles/descriptions in the original language if appropriate, or translate if the user asks.
        
        Determine if the user is describing a "todo" (task) or an "event" (calendar).
        
        Current Family Members: ${membersContext}.

        For Events:
        - Extract title, startTime (ISO string), endTime (ISO string), isAllDay (boolean), location.
        - Assume the current date is ${new Date().toISOString()} if not specified.
        - Infer duration if not specified (default 1 hour).
        - Type can be 'appointment', 'activity', 'celebration', or 'general'.

        For Todos:
        - Extract title, priority ('low', 'medium', 'high').
        - If the input mentions a family member (e.g., "for Dad", "assign to Kiddo"), extract their ID into 'assignedTo'.
        
        Return ONLY the JSON matching the schema.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['todo', 'event'] },
            data: { 
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                // Event specific
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                isAllDay: { type: Type.BOOLEAN },
                location: { type: Type.STRING },
                eventType: { type: Type.STRING, enum: ['appointment', 'activity', 'celebration', 'general'] },
                // Todo specific
                priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                assignedTo: { type: Type.STRING, description: "ID of the family member if mentioned" }
              }
            },
            confidence: { type: Type.NUMBER }
          },
          required: ['type', 'data']
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as ParsedInput;

  } catch (error) {
    console.error("Gemini parse error:", error);
    return null;
  }
};
