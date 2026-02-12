import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QrScanner from 'qr-scanner';
import { equipment } from '../api';

const QRScanner = ({ onClose, onEquipmentFound }) => {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      if (scannerRef.current) {
        scannerRef.current.destroy();
      }

      // Wait for video element to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }



      scannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          try {
            const serialNumber = result.data;
            
            // Show success feedback
            setScanning(false);
            setSuccess(true);
            
            // Close scanner and update search
            setTimeout(() => {
              onClose();
              onEquipmentFound(serialNumber);
            }, 1000);
          } catch (err) {
            setError('Scan failed');
            console.error('QR scan error:', err);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
    } catch (err) {
      let errorMessage = 'Camera access denied or not available';
      
      if (err.message && err.message.includes('https')) {
        errorMessage = 'The camera stream is only accessible if the page is transferred via https.';
      } else if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and reload the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Camera not found. Please ensure you have a camera connected.';
      } else if (err.message && err.message.includes('secure')) {
        errorMessage = 'Camera access requires HTTPS. Please access the site via https://localhost or https://your-ip-address';
      }
      
      setError(errorMessage);
      setScanning(false);
      console.error('Scanner start error:', err);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
    }
    setScanning(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '20px',
          padding: '0',
          width: '90%',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
        <div style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          padding: '24px 32px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            QR Code Scanner
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: '0 32px 32px 32px' }}>

        {!scanning ? (
          <div>
            <div style={{
              width: '200px',
              height: '200px',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* QR Code Pattern Background */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '140px',
                height: '140px',
                background: 'white',
                border: '3px solid #1e293b',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridTemplateRows: 'repeat(7, 1fr)',
                gap: '1px',
                padding: '4px'
              }}>
                {/* Top-left corner marker */}
                <div style={{ background: '#1e293b', gridColumn: '1/3', gridRow: '1/3', borderRadius: '2px' }}></div>
                <div style={{ background: 'white', gridColumn: '3/4', gridRow: '1/2' }}></div>
                <div style={{ background: 'white', gridColumn: '1/2', gridRow: '3/4' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '2/4', gridRow: '2/4', borderRadius: '2px' }}></div>
                
                {/* Top-right corner marker */}
                <div style={{ background: '#1e293b', gridColumn: '6/8', gridRow: '1/3', borderRadius: '2px' }}></div>
                <div style={{ background: 'white', gridColumn: '5/6', gridRow: '1/2' }}></div>
                <div style={{ background: 'white', gridColumn: '7/8', gridRow: '2/3' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '5/7', gridRow: '2/4', borderRadius: '2px' }}></div>
                
                {/* Bottom-left corner marker */}
                <div style={{ background: '#1e293b', gridColumn: '1/3', gridRow: '6/8', borderRadius: '2px' }}></div>
                <div style={{ background: 'white', gridColumn: '2/4', gridRow: '5/7', borderRadius: '2px' }}></div>
                <div style={{ background: 'white', gridColumn: '3/4', gridRow: '7/8' }}></div>
                <div style={{ background: 'white', gridColumn: '1/2', gridRow: '5/6' }}></div>
                
                {/* Data cells (sample pattern) */}
                <div style={{ background: '#1e293b' }}></div>
                <div style={{ background: 'white' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '4/6' }}></div>
                <div style={{ background: 'white', gridColumn: '7/8', gridRow: '4/5' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '5/6', gridRow: '5/6' }}></div>
                <div style={{ background: 'white', gridColumn: '6/7', gridRow: '5/6' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '4/5', gridRow: '6/7' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '6/7', gridRow: '6/7' }}></div>
                <div style={{ background: 'white', gridColumn: '4/5', gridRow: '7/8' }}></div>
                <div style={{ background: 'white', gridColumn: '6/8', gridRow: '7/8' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '4/5' }}></div>
                <div style={{ background: 'white', gridColumn: '5/6' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '5/7', gridRow: '4/5' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '4/5', gridRow: '5/6' }}></div>
                <div style={{ background: 'white', gridColumn: '6/7', gridRow: '6/7' }}></div>
                <div style={{ background: '#1e293b', gridColumn: '4/6', gridRow: '7/8' }}></div>
                <div style={{ background: 'white', gridColumn: '6/7' }}></div>
                <div style={{ background: '#1e293b' }}></div>
              </div>
            </div>
            
            <p style={{
              color: '#64748b',
              marginBottom: '24px',
              fontSize: '16px'
            }}>
              Point your camera at a QR code to scan equipment
            </p>
            
            <button
              onClick={startScanning}
              style={{
                padding: '16px 32px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '0 auto'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,9A1,1 0 0,1 18,10V14A1,1 0 0,1 17,15H16V16A1,1 0 0,1 15,17H9A1,1 0 0,1 8,16V15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H8V8A1,1 0 0,1 9,7H15A1,1 0 0,1 16,8V9H17M15,15V9H9V15H15Z"/>
              </svg>
              Start Camera
            </button>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
            </div>
            <p style={{ color: '#10b981', fontSize: '18px', fontWeight: '600' }}>
              QR Code Scanned Successfully!
            </p>
          </div>
        ) : (
          <div>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '300px',
                borderRadius: '12px',
                backgroundColor: '#000',
                marginBottom: '24px'
              }}
            />
            
            <p style={{
              color: '#64748b',
              marginBottom: '24px',
              fontSize: '16px'
            }}>
              Position the QR code within the camera view
            </p>
            
            <button
              onClick={stopScanning}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Stop Scanning
            </button>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
};

export default QRScanner;