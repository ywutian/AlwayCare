const express = require('express');
const { runQuery, getQuery, allQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const { processImageAnalysis } = require('../services/imageAnalysis');

const router = express.Router();

// Get analysis status for an image
router.get('/status/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.userId;

    const image = await getQuery(
      `SELECT 
        id, analysis_status, detected_objects, risk_level, 
        risk_description, confidence_scores, upload_timestamp
       FROM image_records 
       WHERE id = ? AND user_id = ?`,
      [imageId, userId]
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({
      imageId: image.id,
      status: image.analysis_status,
      detectedObjects: image.detected_objects ? JSON.parse(image.detected_objects) : null,
      riskLevel: image.risk_level,
      riskDescription: image.risk_description,
      confidenceScores: image.confidence_scores ? JSON.parse(image.confidence_scores) : null,
      uploadTimestamp: image.upload_timestamp
    });
  } catch (error) {
    console.error('Get analysis status error:', error);
    res.status(500).json({ error: 'Failed to get analysis status' });
  }
});

// Manually trigger analysis for an image
router.post('/trigger/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.userId;

    // Get image details
    const image = await getQuery(
      'SELECT id, filename, file_path FROM image_records WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Update status to processing
    await runQuery(
      'UPDATE image_records SET analysis_status = ? WHERE id = ?',
      ['processing', imageId]
    );

    // Process the image analysis
    try {
      const analysisResult = await processImageAnalysis(image.file_path);
      
      // Update database with results
      await runQuery(
        `UPDATE image_records 
         SET analysis_status = ?, detected_objects = ?, risk_level = ?, 
             risk_description = ?, confidence_scores = ?
         WHERE id = ?`,
        [
          'completed',
          JSON.stringify(analysisResult.detectedObjects),
          analysisResult.riskLevel,
          analysisResult.riskDescription,
          JSON.stringify(analysisResult.confidenceScores),
          imageId
        ]
      );

      res.json({
        message: 'Analysis completed successfully',
        imageId: imageId,
        status: 'completed',
        result: analysisResult
      });
    } catch (analysisError) {
      // Update status to failed
      await runQuery(
        'UPDATE image_records SET analysis_status = ? WHERE id = ?',
        ['failed', imageId]
      );

      console.error('Analysis error:', analysisError);
      res.status(500).json({ 
        error: 'Analysis failed',
        details: analysisError.message 
      });
    }
  } catch (error) {
    console.error('Trigger analysis error:', error);
    res.status(500).json({ error: 'Failed to trigger analysis' });
  }
});

// Get analysis statistics for user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get counts by status
    const statusStats = await allQuery(
      `SELECT 
        analysis_status,
        COUNT(*) as count
       FROM image_records 
       WHERE user_id = ?
       GROUP BY analysis_status`,
      [userId]
    );

    // Get risk level distribution
    const riskStats = await allQuery(
      `SELECT 
        risk_level,
        COUNT(*) as count
       FROM image_records 
       WHERE user_id = ? AND analysis_status = 'completed'
       GROUP BY risk_level`,
      [userId]
    );

    // Get recent analyses
    const recentAnalyses = await allQuery(
      `SELECT 
        id, original_filename, analysis_status, risk_level, 
        risk_description, upload_timestamp
       FROM image_records 
       WHERE user_id = ?
       ORDER BY upload_timestamp DESC 
       LIMIT 5`,
      [userId]
    );

    res.json({
      statusDistribution: statusStats || [],
      riskDistribution: riskStats || [],
      recentAnalyses: recentAnalyses || []
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get analysis statistics' });
  }
});

// Get all completed analyses for user
router.get('/completed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const analyses = await allQuery(
      `SELECT 
        id, filename, original_filename, upload_timestamp,
        detected_objects, risk_level, risk_description, confidence_scores
       FROM image_records 
       WHERE user_id = ? AND analysis_status = 'completed'
       ORDER BY upload_timestamp DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await getQuery(
      'SELECT COUNT(*) as total FROM image_records WHERE user_id = ? AND analysis_status = ?',
      [userId, 'completed']
    );

    // Parse JSON fields
    const parsedAnalyses = (analyses || []).map(analysis => ({
      ...analysis,
      detectedObjects: analysis.detected_objects ? JSON.parse(analysis.detected_objects) : null,
      confidenceScores: analysis.confidence_scores ? JSON.parse(analysis.confidence_scores) : null
    }));

    res.json({
      analyses: parsedAnalyses,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get completed analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch completed analyses' });
  }
});

module.exports = router;
