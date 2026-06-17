import { useState, useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCcw, Camera } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import axios from 'axios';

// now its Edit
import { Float } from '@react-three/drei';

const FloatingTechNode = ({ position, color, speed, args }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 1.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={args} />
        <meshStandardMaterial 
          color={color} 
          wireframe={true} 
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
    </Float>
  );
};

const Background3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#ec4899" />
        
        {/* Abstract AI Nodes - Placed in the 4 corners */}
        {/* Top Left */}
        <FloatingTechNode position={[-7, 3.5, -2]} color="#ec4899" speed={0.15} args={[1.5, 1]} />
        {/* Top Right */}
        <FloatingTechNode position={[7, 3.5, -2]} color="#3b82f6" speed={0.2} args={[1.8, 1]} />
        {/* Bottom Left */}
        <FloatingTechNode position={[-7, -3.5, -2]} color="#8b5cf6" speed={0.25} args={[2, 1]} />
        {/* Bottom Right */}
        <FloatingTechNode position={[7, -3.5, -2]} color="#06b6d4" speed={0.18} args={[1.4, 1]} />
        
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
      </Canvas>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file) => {
    setError(null);
    setResults(null);
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const apiUrl = import.meta.env.PROD ? '/predict' : 'http://localhost:8000/predict';
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResults(response.data.predictions);
    } catch (err) {
      console.error("Analysis failed:", err);
      if (err.code === 'ERR_NETWORK') {
        setError("Could not connect to the backend server. Make sure the FastAPI server is running on port 8000.");
      } else {
        setError(err.response?.data?.detail || "An error occurred during analysis.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="relative min-h-screen bg-dark-bg text-slate-200 overflow-hidden font-sans">
      <Background3D />

      {/* Decorative gradient orb */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-fuchsia-400 to-indigo-400">
              Vision AI
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-light">
            State-of-the-art neural networks. Detect objects, animals, and scenes instantly.
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Uploader Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full"
          >
            <div className="glass-panel p-6 h-full flex flex-col relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                Source Image
              </h2>

              <AnimatePresence mode="wait">
                {!previewUrl ? (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer p-8 ${
                      isDragging ? 'border-purple-400 bg-purple-500/10' : 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 shadow-lg">
                      <Upload className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-300 mb-2">Drag & drop an image</p>
                    <p className="text-sm text-slate-500">or click to browse from device</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 relative rounded-xl overflow-hidden group bg-black/50 flex items-center justify-center"
                  >
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-[300px] object-contain rounded-lg shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={analyzeImage}
                disabled={!previewUrl || isAnalyzing}
                className={`mt-6 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
                  !previewUrl ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 
                  'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                    Analyzing Neural Pathways...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Run Classification
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full h-full"
          >
            <div className="glass-panel p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Analysis Results
                </h2>
                {results && (
                  <button 
                    onClick={resetApp}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                  >
                    <RefreshCcw className="w-4 h-4" /> Reset
                  </button>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!results ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-slate-500"
                    >
                      <div className="w-24 h-24 rounded-full border border-slate-700/50 mx-auto mb-6 flex items-center justify-center opacity-50">
                        <CheckCircle className="w-10 h-10 text-slate-600" />
                      </div>
                      <p>Upload an image and run classification</p>
                      <p className="text-sm mt-2 opacity-50">Powered by ResNet-50</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Primary Match</p>
                        <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                          {results[0].label}
                        </h3>
                        <p className="text-emerald-400 mt-2 font-mono text-xl">
                          {(results[0].confidence * 100).toFixed(1)}% Confidence
                        </p>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Other Possibilities</p>
                        {results.slice(1).map((result, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="bg-slate-800/40 rounded-lg p-4 flex items-center justify-between border border-slate-700/50"
                          >
                            <span className="font-medium">{result.label}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.confidence * 100}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                />
                              </div>
                              <span className="text-sm font-mono text-cyan-400 w-12 text-right">
                                {(result.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
