import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

interface FaceValidationProps {
  savedImageUrls: string[];
  onValidationComplete: (isValid: boolean) => void;
  threshold?: number;
  buttonText?: string;
}

const FaceValidation: React.FC<FaceValidationProps> = ({
  savedImageUrls,
  onValidationComplete,
  threshold = 0.6,
  buttonText = "Verify Identity"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    confidence: number;
    message: string;
  } | null>(null);
  const [savedDescriptors, setSavedDescriptors] = useState<Float32Array[]>([]);

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

  useEffect(() => {
    if (!isInitialized || savedImageUrls.length === 0) return;

    const extractDescriptors = async () => {
      try {
        const descriptors: Float32Array[] = [];
        
        for (const imageUrl of savedImageUrls) {
          const img = await createImageElement(imageUrl);
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          
          if (detection) {
            descriptors.push(detection.descriptor);
          }
        }
        
        if (descriptors.length > 0) {
          setSavedDescriptors(descriptors);
          console.log(`Extracted ${descriptors.length} face descriptors from saved images`);
        } else {
          console.error('No faces detected in saved images');
        }
      } catch (error) {
        console.error('Error extracting face descriptors:', error);
      }
    };

    extractDescriptors();
  }, [isInitialized, savedImageUrls]);

  const createImageElement = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

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

  const matchFace = (descriptor: Float32Array): { isMatch: boolean; distance: number } => {
    if (savedDescriptors.length === 0) {
      return { isMatch: false, distance: 1.0 };
    }
    
    const distances = savedDescriptors.map(savedDescriptor => {
      return faceapi.euclideanDistance(descriptor, savedDescriptor);
    });
    
    const minDistance = Math.min(...distances);
    console.log(`Closest match distance: ${minDistance}`);
    
    return { isMatch: minDistance < threshold, distance: minDistance };
  };

  const handleStart = () => {
    console.log('Start verification');
    setIsCapturing(true);
    setValidationResult(null);
  };

  const handleCancel = () => {
    console.log('Cancel verification');
    setIsCapturing(false);
    setValidationResult(null);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !captureCanvasRef.current || savedDescriptors.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detections) {
        setValidationResult({
          isValid: false,
          confidence: 0,
          message: "No face detected. Please position your face clearly in the camera."
        });
        setIsProcessing(false);
        return;
      }
      
      const context = captureCanvasRef.current.getContext('2d');
      if (!context) {
        setIsProcessing(false);
        return;
      }
      
      captureCanvasRef.current.width = videoRef.current.videoWidth;
      captureCanvasRef.current.height = videoRef.current.videoHeight;
      
      context.drawImage(
        videoRef.current, 
        0, 0, 
        videoRef.current.videoWidth, 
        videoRef.current.videoHeight
      );
      
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
      
      const { isMatch, distance } = matchFace(detections.descriptor);
      const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
      
      console.log(`Validation result: Match=${isMatch}, Confidence=${confidence.toFixed(2)}%`);
      
      const result = {
        isValid: isMatch,
        confidence: confidence,
        message: isMatch 
          ? `Identity verified with ${confidence.toFixed(2)}% confidence.` 
          : `Verification failed. Confidence: ${confidence.toFixed(2)}%.`
      };
      
      setValidationResult(result);
      onValidationComplete(isMatch);
      
      if (isMatch) {
        setTimeout(() => {
          setIsCapturing(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error during face validation:', error);
      setValidationResult({
        isValid: false,
        confidence: 0,
        message: "An error occurred during verification. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
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
          disabled={savedDescriptors.length === 0}
        >
          {savedDescriptors.length === 0 
            ? "No reference faces available" 
            : buttonText}
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
              onLoadedMetadata={() => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
              }}
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            <canvas 
              ref={captureCanvasRef}
              className="hidden" 
            />
          </div>
          
          {validationResult && (
            <div className={`mb-4 p-3 rounded-md ${
              validationResult.isValid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className="font-medium">{validationResult.isValid ? 'Success!' : 'Failed'}</div>
              <div className="text-sm">{validationResult.message}</div>
              {validationResult.confidence > 0 && (
                <div className="mt-1 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${validationResult.isValid ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{ width: `${validationResult.confidence}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between gap-2">
            <button
              className="btn btn-primary flex-1"
              onClick={handleCapture}
              disabled={isProcessing}
              type="button"
            >
              {isProcessing ? 'Processing...' : 'Capture & Verify'}
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
            Position your face clearly in the camera and press "Capture & Verify"
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceValidation;