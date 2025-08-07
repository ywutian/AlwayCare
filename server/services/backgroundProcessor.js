const { runQuery, getQuery, allQuery } = require('../database/database');
const { processImageAnalysis } = require('./imageAnalysis');

/**
 * Process all pending images in the background
 * This function is called periodically by the scheduler
 */
async function processPendingImages() {
  try {
    // Get all pending images
    const pendingImages = await allQuery(
      `SELECT id, filename, file_path, user_id 
       FROM image_records 
       WHERE analysis_status = 'pending' 
       ORDER BY upload_timestamp ASC 
       LIMIT 5`
    );

    if (!pendingImages || pendingImages.length === 0) {
      return; // No pending images to process
    }

    console.log(`🔄 Processing ${pendingImages.length} pending images...`);

    // Process each pending image
    for (const image of pendingImages) {
      try {
        // Update status to processing
        await runQuery(
          'UPDATE image_records SET analysis_status = ? WHERE id = ?',
          ['processing', image.id]
        );

        console.log(`📸 Analyzing image: ${image.filename}`);

        // Process the image analysis
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
            image.id
          ]
        );

        console.log(`✅ Analysis completed for image: ${image.filename}`);
        console.log(`   Risk Level: ${analysisResult.riskLevel}`);
        console.log(`   Objects Detected: ${analysisResult.detectedObjects.length}`);

      } catch (error) {
        console.error(`❌ Failed to process image ${image.filename}:`, error.message);
        
        // Update status to failed
        await runQuery(
          'UPDATE image_records SET analysis_status = ? WHERE id = ?',
          ['failed', image.id]
        );
      }
    }

  } catch (error) {
    console.error('Background processing error:', error);
  }
}

/**
 * Get processing statistics
 */
async function getProcessingStats() {
  try {
    const stats = await allQuery(
      `SELECT 
        analysis_status,
        COUNT(*) as count
       FROM image_records 
       GROUP BY analysis_status`
    );

    return stats || [];
  } catch (error) {
    console.error('Error getting processing stats:', error);
    return [];
  }
}

/**
 * Retry failed analyses
 */
async function retryFailedAnalyses() {
  try {
    const failedImages = await getQuery(
      `SELECT id, filename, file_path 
       FROM image_records 
       WHERE analysis_status = 'failed' 
       ORDER BY upload_timestamp ASC 
       LIMIT 10`
    );

    if (!failedImages || failedImages.length === 0) {
      return { message: 'No failed analyses to retry' };
    }

    console.log(`🔄 Retrying ${failedImages.length} failed analyses...`);

    let successCount = 0;
    let failureCount = 0;

    for (const image of failedImages) {
      try {
        // Update status to processing
        await runQuery(
          'UPDATE image_records SET analysis_status = ? WHERE id = ?',
          ['processing', image.id]
        );

        // Process the image analysis
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
            image.id
          ]
        );

        successCount++;
        console.log(`✅ Retry successful for image: ${image.filename}`);

      } catch (error) {
        failureCount++;
        console.error(`❌ Retry failed for image ${image.filename}:`, error.message);
        
        // Update status to failed
        await runQuery(
          'UPDATE image_records SET analysis_status = ? WHERE id = ?',
          ['failed', image.id]
        );
      }
    }

    return {
      message: `Retry completed: ${successCount} successful, ${failureCount} failed`,
      successCount,
      failureCount
    };

  } catch (error) {
    console.error('Retry failed analyses error:', error);
    throw error;
  }
}

/**
 * Clean up old processed images (optional)
 * This can be used to manage storage space
 */
async function cleanupOldImages(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldImages = await allQuery(
      `SELECT id, file_path 
       FROM image_records 
       WHERE upload_timestamp < ? AND analysis_status = 'completed'`,
      [cutoffDate.toISOString()]
    );

    if (!oldImages || oldImages.length === 0) {
      return { message: 'No old images to clean up' };
    }

    console.log(`🧹 Cleaning up ${oldImages.length} old images...`);

    let deletedCount = 0;
    const fs = require('fs');

    for (const image of oldImages) {
      try {
        // Delete file from filesystem
        if (fs.existsSync(image.file_path)) {
          fs.unlinkSync(image.file_path);
        }

        // Delete from database
        await runQuery(
          'DELETE FROM image_records WHERE id = ?',
          [image.id]
        );

        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to clean up image ${image.id}:`, error.message);
      }
    }

    return {
      message: `Cleanup completed: ${deletedCount} images deleted`,
      deletedCount
    };

  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
}

module.exports = {
  processPendingImages,
  getProcessingStats,
  retryFailedAnalyses,
  cleanupOldImages
};
