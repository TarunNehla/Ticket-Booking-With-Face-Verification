import React, { useRef, useEffect, useState, useCallback } from 'react';

interface FaceCaptureProps {
  onCapture: (images: string[]) => void;
  buttonText?: string;
  maxImages?: number;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ 
  onCapture, 
  buttonText = "Capture Face", 
  maxImages = 5 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<{id: string, imageUrl: string}[]>([]);
  const [isHolding, setIsHolding] = useState(false);
  const captureIntervalRef = useRef<number | null>(null);

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

  const captureImage = async () => {
    if (!videoRef.current || !captureCanvasRef.current) return null;
    
    try {
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
      
      const imageUrl = captureCanvasRef.current.toDataURL('image/jpeg');
      
      return {
        id: Date.now().toString(),
        imageUrl
      };
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  };

  const handleStart = () => {
    console.log('Start button clicked');
    setCapturedImages([]);
    setIsCapturing(true);
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    setIsHolding(false);
    setIsCapturing(false);
    setCapturedImages([]);
  };

  const handleSave = () => {
    console.log('Save button clicked');
    
    if (capturedImages.length === 0) {
      alert('Please capture at least one photo before saving.');
      return;
    }
    
    const imageUrls = capturedImages.map(image => image.imageUrl);
    onCapture(imageUrls);
    setIsCapturing(false);
  };

  const handleCaptureMouseDown = () => {
    console.log('Capture button pressed');
    setIsHolding(true);
    setIsProcessing(true);
    
    captureImage().then(image => {
      if (image) {
        setCapturedImages(prev => [...prev, image]);
      }
    });
    
    captureIntervalRef.current = window.setInterval(async () => {
      if (capturedImages.length >= maxImages) {
        clearInterval(captureIntervalRef.current!);
        captureIntervalRef.current = null;
        setIsHolding(false);
        setIsProcessing(false);
        return;
      }
      
      const image = await captureImage();
      if (image) {
        setCapturedImages(prev => [...prev, image]);
      }
    }, 1000); 
  };

  const handleCaptureMouseUp = () => {
    console.log('Capture button released');
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    setIsHolding(false);
    setIsProcessing(false);
  };

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  const handleRemoveImage = (id: string) => {
    setCapturedImages(prev => prev.filter(image => image.id !== id));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!isCapturing ? (
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
              ref={captureCanvasRef}
              className="hidden" 
            />
          </div>
          
          {capturedImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Captured Photos ({capturedImages.length}/{maxImages})</h3>
              <div className="flex flex-wrap gap-2">
                {capturedImages.map(image => (
                  <div key={image.id} className="relative">
                    <img 
                      src={image.imageUrl} 
                      alt="Captured face" 
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => handleRemoveImage(image.id)}
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
              onMouseLeave={handleCaptureMouseUp}
              disabled={isProcessing && !isHolding || capturedImages.length >= maxImages}
              type="button"
            >
              {isHolding ? 'Capturing...' : 'Hold to Capture'}
            </button>
            
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={capturedImages.length === 0 || isProcessing}
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
            ) : capturedImages.length >= maxImages ? (
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