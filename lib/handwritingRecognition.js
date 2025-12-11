import { pipeline } from "@xenova/transformers";

let recognizer = null;

export async function initializeModel() {
  if (!recognizer) {
    console.log("🧠 Loading TrOCR model...");
    recognizer = await pipeline(
      "image-to-text",
      "Xenova/trocr-base-handwritten"   // ✅ FIXED: use Xenova-hosted model
    );
    console.log("✅ Model loaded successfully!");
  }
  return recognizer;
}

export async function recognizeHandwriting(imagePath) {
  try {
    console.log("Recognizing handwriting...");
    const model = await initializeModel();
    const result = await model(imagePath);
    return result[0].generated_text;
  } catch (err) {
    console.error("❌ Recognition error:", err);
    throw err;
  }
}
