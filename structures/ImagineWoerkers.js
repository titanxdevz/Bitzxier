const { parentPort, workerData } = require("worker_threads");
const rexzimagine = require("image-genv3");
const path = require("path");
const fs = require("fs").promises;

(async () => {
  try {
    const { prompt, imagePath, userId } = workerData;
    
    // Create images directory if it doesn't exist
    const imagesDir = path.join(__dirname, "..", "images");
    await fs.mkdir(imagesDir, { recursive: true });
    
    // Report progress start
    parentPort.postMessage({ progress: 0, status: "Starting image generation..." });
    
    // Simulate progress updates since we don't know if image-genv3 has native progress reporting
    const progressUpdates = [
      { percent: 30, message: "Creating image structure..." },
      { percent: 60, message: "Adding details..." },
      { percent: 90, message: "Finalizing image..." }
    ];
    
    // Set up progress reporting
    const progressInterval = setInterval(() => {
      const nextUpdate = progressUpdates.shift();
      if (nextUpdate) {
        parentPort.postMessage({ 
          progress: nextUpdate.percent, 
          status: nextUpdate.message 
        });
      } else {
        clearInterval(progressInterval);
      }
    }, 3000); // Update every 3 seconds
    
    // Generate the image
    await rexzimagine.response(prompt);
    
    // Clear interval in case it's still running
    clearInterval(progressInterval);
    
    // Check common locations where the image might be generated
    const possiblePaths = [
      path.join(imagesDir, "image.png"),
      path.join(__dirname, "..", "image.png"),
      path.join(__dirname, "..", "..", "image.png"),
      "image.png"
    ];
    
    let sourceImagePath = null;
    
    // Find where the image was actually generated
    for (const checkPath of possiblePaths) {
      try {
        await fs.access(checkPath);
        sourceImagePath = checkPath;
        break;
      } catch (err) {
        // Path doesn't exist, try next one
      }
    }
    
    if (!sourceImagePath) {
      throw new Error("Generated image not found in any expected location");
    }
    
    // Report 100% progress
    parentPort.postMessage({ 
      progress: 100, 
      status: "Image generation complete!" 
    });
    
    // Move to final destination
    await fs.rename(sourceImagePath, imagePath);
    
    parentPort.postMessage({ success: true, imagePath });
  } catch (err) {
    console.error("Worker error:", err);
    parentPort.postMessage({ error: err.message });
  }
})();