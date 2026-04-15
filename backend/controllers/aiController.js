const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Report = require('../models/Report');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Helper to convert remote URL to generic parts expected by inlineData
const urlToGenerativePart = async (url, mimeType) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType,
    },
  };
};

// @desc    Analyze medical report natively with Gemini API and optionally save to DB
// @route   POST /api/ai/analyze
exports.analyzeReport = async (req, res) => {
  try {
    const { fileUrl, reportId, fileType } = req.body;
    
    if (!fileUrl) return res.status(400).json({ success: false, message: "No file URL provided" });
    
    // 1. Differentiate Multi-Page PDFs vs Static Visual Scans (Images)
    let targetUrl = fileUrl;
    let imagePart = null;
    let tempFilePath = null;
    
    console.log(`🧠 [AI MODULE] Starting analysis for fileType: ${fileType} | URL: ${targetUrl.substring(0, 50)}...`);

    // Explicitly use the UI-provided fileType property instead of strict URL extension parsing
    // This perfectly catches raw Cloudinary URLs that might not retain standard extensions
    if(fileType === 'pdf') {
       console.log(`📄 [AI MODULE] PDF Detected. Attempting deep native vision extraction via GoogleAIFileManager...`);
       const response = await fetch(targetUrl);
       if (!response.ok) {
          console.error(`❌ [AI MODULE] Failed to fetch PDF. HTTP: ${response.status}`);
          throw new Error(`Failed to fetch original PDF. HTTP Status: ${response.status}`);
       }
       const arrayBuffer = await response.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       if (buffer.length === 0) {
          throw new Error("PDF buffer is completely empty. Cloudinary returned nothing.");
       }
       
       // Write to temporary local disk to satisfy Google API requirements securely
       tempFilePath = path.join(os.tmpdir(), `gemini_upload_${Date.now()}.pdf`);
       fs.writeFileSync(tempFilePath, buffer);
       
       // Stream strictly using Google Server APIs for multi-page vision tolerance
       const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "dummy_key");
       const uploadResult = await fileManager.uploadFile(tempFilePath, {
          mimeType: "application/pdf",
          displayName: "MedIntel_Report",
       });
       
       // Connect standard part using the file server URI explicitly
       imagePart = {
          fileData: {
             mimeType: uploadResult.file.mimeType,
             fileUri: uploadResult.file.uri
          }
       };

    } else {
       // Visual Encoding Module: Transforms explicit image bytes to generative structure
       let targetMime = 'image/jpeg';
       if (targetUrl.toLowerCase().endsWith('.png')) {
          targetMime = "image/png";
       }
       imagePart = await urlToGenerativePart(targetUrl, targetMime);
    }

    // Prompt instructions for returning strictly JSON structure 
    const prompt = `You are a professional Medical AI Analyst. I am giving you a medical document or image. 
Analyze the image or document and return a detailed, structured JSON response. 

**CRITICAL LANGUAGE RULE**: Write your analysis in simple, everyday language (layman's terms) so a normal non-medical person can easily understand it. Explain complicated medical terms if they appear. Provide a VERY detailed and thorough response.

DO NOT INCLUDE ANY MARKDOWN formatting like \`\`\`json or \`\`\`. 
Only return valid raw JSON matching exactly this structure:
{
  "aiTitle": "Short descriptive title of findings (e.g. No Significant Abnormalities)",
  "confidenceScore": "e.g. 98.4%",
  "findings": ["Array of string descriptions of findings"],
  "nextSteps": [
    { "title": "Check-up", "desc": "description", "icon": "📅" }
  ],
  "snippet": "A single short sentence summarizing the report."
}

CRITICAL RULE: If the document is NOT a medical report (for example, if it's a resume, a receipt, a blank page, or a random photo), you MUST STILL RETURN THE JSON FORMAT ABOVE. In that case, output:
{
  "aiTitle": "Invalid Document / Not a Medical Report",
  "confidenceScore": "0%",
  "findings": ["The uploaded document does not appear to be a clinical or medical record.", "It appears to be a resume or non-medical file."],
  "nextSteps": [{ "title": "Upload Valid Record", "desc": "Please upload a valid medical report snippet.", "icon": "⚠️" }],
  "snippet": "Invalid document detected. Routine analysis aborted."
}`;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using 2.5-flash as requested latest/fastest
    
    // Assemble the Payload Payload Dynamically
    const inferencePayload = [prompt];
    if (imagePart) {
        inferencePayload.push(imagePart);
    }
    
    console.log(`🤖 [AI MODULE] Triggering Gemini 2.5 Flash Inference...`);
    const result = await model.generateContent(inferencePayload);
    const responseText = result.response.text();
    console.log(`✅ [AI MODULE] Gemini Inference Complete! Raw payload size: ${responseText.length} chars.`);
    
    // ALWAYS Clean up secure temporary node storage after extraction succeeds
    if (tempFilePath && fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch(e){}
    }
    
    // Parse JSON removing markdown wrappers if they exist
    let cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const analysisData = JSON.parse(cleanJsonStr);

    // Auto update db report
    if (reportId) {
      const report = await Report.findById(reportId);
      if (report && report.userId.toString() === req.user._id.toString()) {
        report.aiAnalysis = analysisData;
        report.snippet = analysisData.snippet || report.snippet; // update the table text
        await report.save();
      }
    }

    res.status(200).json({ success: true, analysis: analysisData });
    
  } catch (err) {
    if (typeof tempFilePath !== 'undefined' && tempFilePath && fs.existsSync(tempFilePath)) {
       try { fs.unlinkSync(tempFilePath); } catch(e){}
    }
    console.error("AI Analysis Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Interactive RAG Chatbot Endpoint using User History & Vitals
// @route   POST /api/ai/chat
exports.chatWithAI = async (req, res) => {
  try {
    const { message, history, vitals } = req.body;
    
    if (!message) return res.status(400).json({ success: false, message: "No message provided" });
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast optimized model for chat stream
    
    // Construct Clinical History string mapping from Database RAG
    // We only pass TEXT metadata (findings, analysis) instead of heavy base64 images to save API limits and speed!
    let historyContext = "User has NO past medical reports.";
    if (history && history.length > 0) {
       historyContext = history.map(r => {
         const analysisRaw = r.aiAnalysis;
         let findingsData = "Unprocessed Document";
         if (analysisRaw) {
            findingsData = `Title: ${analysisRaw.aiTitle || 'N/A'}. Details: ${analysisRaw.findings ? analysisRaw.findings.join('; ') : analysisRaw.snippet}`;
         }
         return `[File: ${r.title}] Date: ${r.date}. ${findingsData}`;
       }).join('\n\n');
    }
    
    const promptParams = `
You are MedIntel Clinical AI, a highly intelligent and empathetic Medical Health Assistant chatbot.
You are currently talking directly to the patient.

---
PATIENT CONTEXT DATA OVERVIEW:
Vitals:
- Blood Pressure (Sys/Dia): ${vitals?.bp || 'Unknown'}
- Height: ${vitals?.height || 'Unknown'} cm
- Weight: ${vitals?.weight || 'Unknown'} kg
- Age: ${vitals?.age || 'Unknown'} Years

Medical Record History:
${historyContext}
---

PATIENT'S MESSAGE:
"${message}"

INSTRUCTIONS:
1. Provide a direct, highly detailed, yet easy to understand response exactly answering the user's question.
2. **USE SIMPLE LANGUAGE**: Emulate a friendly doctor speaking to a normal patient. Avoid complex medical jargon, and if you must use it, explain it clearly in layman's terms so a non-medical person fully understands.
3. If the user asks about their reports or their vitals like blood pressure, reference the contextual data above accurately in a natural tone.
4. Keep your answer structurally formatted. Do NOT wrap your answer in JSON or markdown codeblocks. Use standard markdown bold/italics or bullet points for readability.
5. Always include a tiny soft reminder if giving clinical advice to consult their physical doctor.
`;

    const result = await model.generateContent(promptParams);
    const responseText = result.response.text();
    
    res.status(200).json({ success: true, response: responseText });

  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
