import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_PATH = path.join(__dirname, "..", "data", "fitnessKnowledge.json");

/**
 * Poor man's RAG: Keyword matching.
 * Returns relevant context chunks based on user query.
 */
export function getRelevantContext(userQuery) {
  try {
    const rawData = fs.readFileSync(KNOWLEDGE_PATH, "utf-8");
    const { knowledge } = JSON.parse(rawData);
    
    const queryLower = userQuery.toLowerCase();
    
    // Find chunks where any keyword matches the query
    const matches = knowledge.filter(item => 
      item.keywords.some(keyword => queryLower.includes(keyword))
    );
    
    if (matches.length === 0) return "No specific fitness knowledge found for this query.";
    
    // Format into a string
    return matches.map(m => `--- ${m.topic.toUpperCase()} ---\n${m.content}`).join("\n\n");
  } catch (err) {
    console.error("RAG Engine Error:", err);
    return "Error retrieving fitness knowledge.";
  }
}
