import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

interface FaceCaptureProps {
  onCapture: (faceDescriptors: Float32Array[]) => void;
  buttonText?: string;
  maxImages?: number;
}

interface CapturedFace {
  id: string;
  descriptor: Float32Array;
  imageUrl: string;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ 
  onCapture, 
  buttonText = "Capture Face", 
  maxImages = 5 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedFaces, setCapturedFaces] = useState<CapturedFace[]>([]);
  const [isHolding, setIsHolding] = useState(false);
  const captureIntervalRef = useRef<number | null>(null);

  // Load models once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadModels = async () => {
      try {
        console.log('Loading models...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        
        if (isMounted) {
          console.log('Models loaded');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    loadModels();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Start camera when isCapturing becomes true
  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      videoRef.current.srcObject = stream;
      console.log('Camera started');
    } catch (error) {
      console.error('Camera error:', error);
      setIsCapturing(false);
    }
  }, []);

  // Stop camera function
  const stopCamera = useCallback(() => {
    if (!videoRef.current) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log('Camera stopped');
    }
  }, []);

  // Handle camera based on isCapturing state
  useEffect(() => {
    if (isCapturing) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isCapturing, startCamera, stopCamera]);

  // Function to capture a single face
  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !captureCanvasRef.current) return null;
    
    try {
      // Detect face
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        console.log('No face detected');
        return null;
      }
      
      // Create a snapshot of the video
      const context = captureCanvasRef.current.getContext('2d');
      if (!context) return null;
      
      captureCanvasRef.current.width = videoRef.current.videoWidth;
      captureCanvasRef.current.height = videoRef.current.videoHeight;
      
      context.drawImage(
        videoRef.current, 
        0, 0, 
        videoRef.current.videoWidth, 
        videoRef.current.videoHeight
      );
      
      // Draw face detection on display canvas
      const displaySize = { 
        width: videoRef.current.videoWidth, 
        height: videoRef.current.videoHeight 
      };
      
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      const displayContext = canvasRef.current.getContext('2d');
      if (displayContext) {
        displayContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, [resizedDetections]);
      }
      
      // Convert canvas to image URL
      const imageUrl = captureCanvasRef.current.toDataURL('image/jpeg');
      
      return {
        id: Date.now().toString(),
        descriptor: detections.descriptor,
        imageUrl
      };
    } catch (error) {
      console.error('Error capturing face:', error);
      return null;
    }
  };

  // Handle Start button click
  const handleStart = () => {
    console.log('Start button clicked');
    setCapturedFaces([]);
    setIsCapturing(true);
  };

  // Handle Cancel button click
  const handleCancel = () => {
    console.log('Cancel button clicked');
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    setIsHolding(false);
    setIsCapturing(false);
    setCapturedFaces([]);
  };

  // Handle Save button click
  const handleSave = () => {
    console.log('Save button clicked');
    
    if (capturedFaces.length === 0) {
      alert('Please capture at least one photo before saving.');
      return;
    }
    
    const descriptors = capturedFaces.map(face => face.descriptor);
    onCapture(descriptors);
    setIsCapturing(false);
  };

  // Handle mouse down on capture button
  const handleCaptureMouseDown = () => {
    console.log('Capture button pressed');
    setIsHolding(true);
    setIsProcessing(true);
    
    // Take first photo immediately
    captureFace().then(face => {
      if (face) {
        setCapturedFaces(prev => [...prev, face]);
      }
    });
    
    // Set up interval for continuous capture
    captureIntervalRef.current = window.setInterval(async () => {
      if (capturedFaces.length >= maxImages) {
        clearInterval(captureIntervalRef.current!);
        captureIntervalRef.current = null;
        setIsHolding(false);
        setIsProcessing(false);
        return;
      }
      
      const face = await captureFace();
      if (face) {
        setCapturedFaces(prev => [...prev, face]);
      }
    }, 1000); // Capture every second
  };

  // Handle mouse up on capture button
  const handleCaptureMouseUp = () => {
    console.log('Capture button released');
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    setIsHolding(false);
    setIsProcessing(false);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  // Handle removal of a captured face
  const handleRemoveFace = (id: string) => {
    setCapturedFaces(prev => prev.filter(face => face.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!isInitialized ? (
        <div className="text-center p-4">Loading face detection models...</div>
      ) : !isCapturing ? (
        <button
          className="btn btn-primary w-full"
          onClick={handleStart}
          type="button"
        >
          {buttonText}
        </button>
      ) : (
        <div>
          <div className="relative mb-4">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            <canvas 
              ref={captureCanvasRef}
              className="hidden" // Hidden canvas for capturing images
            />
          </div>
          
          {/* Thumbnails of captured faces */}
          {capturedFaces.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Captured Photos ({capturedFaces.length}/{maxImages})</h3>
              <div className="flex flex-wrap gap-2">
                {capturedFaces.map(face => (
                  <div key={face.id} className="relative">
                    <img 
                      src={face.imageUrl} 
                      alt="Captured face" 
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => handleRemoveFace(face.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between gap-2">
            <button
              className="btn btn-primary flex-1"
              onMouseDown={handleCaptureMouseDown}
              onMouseUp={handleCaptureMouseUp}
              onMouseLeave={handleCaptureMouseUp} // In case cursor leaves the button while holding
              disabled={isProcessing && !isHolding || capturedFaces.length >= maxImages}
              type="button"
            >
              {isHolding ? 'Capturing...' : 'Hold to Capture'}
            </button>
            
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={capturedFaces.length === 0 || isProcessing}
              type="button"
            >
              Save
            </button>
            
            <button
              className="btn btn-outline"
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </button>
          </div>
          
          <div className="text-center text-xs mt-2">
            {isHolding ? (
              <span className="text-green-500">Capturing images... Release when done</span>
            ) : capturedFaces.length >= maxImages ? (
              <span className="text-amber-500">Maximum number of images captured</span>
            ) : (
              <span>Hold the capture button to take multiple photos</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceCapture;