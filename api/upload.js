import formidable from 'formidable';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { recognizeHandwriting } from '../lib/handwritingRecognition.js';
import { getAnswerKey } from '../lib/answerKey.js';
import { gradeTest, generateFeedback } from '../lib/grading.js';

export default async function uploadRoute(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    uploadDir: './uploads',
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    multiples: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Upload failed' });
    }

    try {
      const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
      const testId = Array.isArray(fields.testId) ? fields.testId[0] : fields.testId || 'math-quiz-1';

      // Get answer key
      const answerKey = getAnswerKey(testId);
      if (!answerKey) {
        return res.status(400).json({ error: 'Invalid test ID' });
      }

      // Process image
      const imagePath = imageFile.filepath || imageFile.path || imageFile.file;
      const processedPath = path.join('./uploads', `processed-${Date.now()}.jpg`);

      await sharp(imagePath)
        .resize(1200, null, { withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(processedPath);

      // Recognize handwriting
      console.log('Recognizing handwriting...');
      const recognizedText = await recognizeHandwriting(processedPath);

      // Parse answers (assuming one answer per line)
      const recognizedAnswers = recognizedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log('Recognized answers:', recognizedAnswers);

      // Grade the test
      const gradingResult = gradeTest(recognizedAnswers, answerKey);
      const feedback = generateFeedback(gradingResult);

      // Prepare response
      const result = {
        id: Date.now(),
        testId: testId,
        testName: answerKey.name,
        recognized_text: recognizedText,
        recognized_answers: recognizedAnswers,
        grading_result: gradingResult,
        confidence_score: gradingResult.percentage,
        disease_type: gradingResult.letterGrade,
        description: `Test: ${answerKey.name} | Score: ${gradingResult.totalScore}/${gradingResult.maxScore} (${gradingResult.percentage}%)`,
        prescription: feedback.slice(0, 2).join(' '),
        mitigation_strategies: feedback.slice(2).join(' '),
        annotated_image_url: `/uploads/${path.basename(processedPath)}`,
        created_at: new Date().toISOString()
      };

      // Cleanup original file
      await fs.unlink(imagePath).catch(() => {});

      res.status(200).json(result);
    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}