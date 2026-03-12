import React, { useState, useRef } from 'react';
import { extractTextFromImage } from './services/geminiService';
import { Part } from '@google/genai';
import { Camera, Loader2, FileText } from 'lucide-react';

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("画像ファイルを選択してください。");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setExtractedText('');
    setError(null);
    setIsProcessing(true);

    try {
      const filePart = await fileToGenerativePart(file);
      const text = await extractTextFromImage(filePart);
      setExtractedText(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            AI文字起こし
          </h1>
          <p className="text-sm text-gray-500">
            スマホで写真を撮るか、画像をアップロードしてください。
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={triggerFileInput}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Camera className="w-5 h-5" />
              写真を撮る / 選ぶ
            </button>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  文字起こし結果
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                </h2>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[150px] border border-gray-200 whitespace-pre-wrap text-sm text-gray-800">
                  {isProcessing ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      AIが画像を読み取っています...
                    </div>
                  ) : extractedText ? (
                    extractedText
                  ) : (
                    <div className="text-gray-400 italic">
                      結果がここに表示されます
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
