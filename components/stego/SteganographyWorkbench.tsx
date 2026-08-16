'use client';

import React, { useState, useRef, useEffect } from 'react';
import { encodeLSB, decodeLSB, encodeZeroWidth, decodeZeroWidth } from '@/lib/stego/lsbEngine';
import { runChiSquareSteganalysis, ChiSquareResult } from '@/lib/stego/chiSquare';
import { generateSampleCover } from '@/lib/stego/bitPlane';
import BitPlaneInspector from './BitPlaneInspector';
import { Sparkles, Image as ImageIcon, FileText, ShieldAlert, CheckCircle2, Layers } from 'lucide-react';

export default function SteganographyWorkbench() {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [bitDepth, setBitDepth] = useState<number>(1);
  const [secretMessage, setSecretMessage] = useState<string>('Covert Payload 123');
  const [coverText, setCoverText] = useState<string>('The quick brown fox jumps over the lazy dog.');
  const [outputResult, setOutputResult] = useState<string>('');
  const [chiResult, setChiResult] = useState<ChiSquareResult | null>(null);
  const [selectedSample, setSelectedSample] = useState<'gradient' | 'geometric' | 'colorbars'>('gradient');
  const [coverImageData, setCoverImageData] = useState<ImageData | null>(null);
  const [stegoImageData, setStegoImageData] = useState<ImageData | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial sample on mount
  useEffect(() => {
    loadSampleCover(selectedSample);
  }, []);

  const loadSampleCover = (sampleType: 'gradient' | 'geometric' | 'colorbars') => {
    try {
      const sampleData = generateSampleCover(sampleType, 400, 300);
      setCoverImageData(sampleData);
      setStegoImageData(null);
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = sampleData.width;
        canvas.height = sampleData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(sampleData, 0, 0);
          setChiResult(runChiSquareSteganalysis(sampleData));
        }
      }
    } catch (error) {
      console.error('Error loading sample cover:', error);
      // Gracefully handle canvas context errors (e.g., in test environment)
      if (coverImageData) {
        setChiResult(runChiSquareSteganalysis(coverImageData));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setCoverImageData(imgData);
          setStegoImageData(null);
          setChiResult(runChiSquareSteganalysis(imgData));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleEmbedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const stegoData = encodeLSB(imgData, secretMessage, bitDepth);
    ctx.putImageData(stegoData, 0, 0);

    setStegoImageData(stegoData);
    setChiResult(runChiSquareSteganalysis(stegoData));
    setOutputResult('Payload successfully embedded via spatial LSB!');
  };

  const handleDecodeImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = decodeLSB(imgData, bitDepth);
    setOutputResult(`Extracted Secret Message: "${decoded}"`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-zinc-950/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm font-sans text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold font-sans flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" /> Digital Steganography & Steganalysis Workbench
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Hide secret payloads in media coverfiles and run statistical Chi-squared detection.</p>
        </div>
        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
          <button onClick={() => setActiveTab('image')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'image' ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold' : 'text-zinc-500'}`}>
            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" /> Spatial Image LSB
          </button>
          <button onClick={() => setActiveTab('text')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'text' ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold' : 'text-zinc-500'}`}>
            <FileText className="w-3.5 h-3.5 inline mr-1.5" /> Zero-Width Text
          </button>
        </div>
      </div>

      {activeTab === 'image' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Sample Selection */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 block">
                Pre-Loaded Cover Media
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedSample('gradient');
                    loadSampleCover('gradient');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedSample === 'gradient' 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Grayscale Gradient
                </button>
                <button
                  onClick={() => {
                    setSelectedSample('geometric');
                    loadSampleCover('geometric');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedSample === 'geometric' 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Geometric Shapes
                </button>
                <button
                  onClick={() => {
                    setSelectedSample('colorbars');
                    loadSampleCover('colorbars');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedSample === 'colorbars' 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Color Bars
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[300px]">
              <canvas ref={canvasRef} className="max-w-full rounded-xl shadow-sm border border-zinc-300 dark:border-zinc-700 mb-4" />
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 rounded-xl text-xs font-bold transition">
                Upload Cover Image (PNG/JPEG)
              </button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Secret Message Payload</label>
              <input
                type="text"
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none"
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Bit Depth:</span>
                  {[1, 2, 3].map(depth => (
                    <button
                      key={depth}
                      onClick={() => setBitDepth(depth)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${bitDepth === depth ? 'bg-teal-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                    >
                      {depth}-Bit
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleEmbedImage} className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition">Embed via LSB</button>
                  <button onClick={handleDecodeImage} className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 font-bold text-xs transition">Decode LSB</button>
                </div>
              </div>
              {outputResult && <div className="p-3 bg-teal-600/10 border border-teal-600/30 rounded-xl text-xs text-teal-700 dark:text-teal-300 font-medium">{outputResult}</div>}
            </div>
          </div>

          {/* Steganalysis & Bit-Plane Inspector */}
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-teal-600" /> Chi-Squared Steganalysis
              </h3>
              {chiResult ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Chi-Square Stat ($\chi^2$):</span>
                    <span className="font-mono font-bold">{chiResult.chiSquareStat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Estimated p-value:</span>
                    <span className="font-mono font-bold">{chiResult.pValue.toFixed(4)}</span>
                  </div>
                  <div className={`p-3 rounded-xl border font-bold flex items-center gap-2 ${chiResult.isPayloadDetected ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-green-500/10 border-green-500/30 text-green-600'}`}>
                    {chiResult.isPayloadDetected ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {chiResult.isPayloadDetected ? 'Payload Anomaly Detected (p-value high)' : 'Clean Cover Media (Natural Distribution)'}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">Upload an image to run statistical steganalysis.</p>
              )}
            </div>

            <BitPlaneInspector 
              coverImageData={coverImageData} 
              stegoImageData={stegoImageData} 
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Cover Carrier Text</label>
            <textarea
              value={coverText}
              onChange={(e) => setCoverText(e.target.value)}
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none"
              rows={3}
            />
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Secret Message</label>
            <input
              type="text"
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setOutputResult(encodeZeroWidth(coverText, secretMessage))}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition"
              >
                Encode Zero-Width Unicode
              </button>
              <button
                onClick={() => setOutputResult(`Decoded Message: "${decodeZeroWidth(outputResult)}"`) }
                className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 font-bold text-xs transition"
              >
                Decode Zero-Width Unicode
              </button>
            </div>
            {outputResult && (
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono break-all">
                {outputResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
