'use client';
import { useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctLabel, setCorrectLabel] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction('');
      setConfidence(0);
      setError('');
      setIsCorrect(null);
      setCorrectLabel('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction('');
      setConfidence(0);
      setError('');
      setIsCorrect(null);
      setCorrectLabel('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select or drop an image');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post('http://0.0.0.0:8080/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data.label);
      setConfidence(response.data.confidence);
    } catch (error) {
      setError('Failed to process image. Please try again.');
      setPrediction('');
      setConfidence(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFeedback = async () => {
    if (!image || !prediction) return;

    const formData = new FormData();
    formData.append('file', image);
    formData.append('prediction', prediction);
    formData.append('is_correct', isCorrect.toString());
    if (!isCorrect && correctLabel) {
      formData.append('correct_label', correctLabel);
    }

    try {
      await axios.post('http://127.0.0.1:4000/feedback', formData);
      alert('Feedback submitted successfully');
      setIsCorrect(null);
      setCorrectLabel('');
    } catch (error) {
      alert('Failed to submit feedback');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-600 to-green-200 flex items-center justify-center p-4 font-poppins">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 space-y-6">
        <h1 className="text-4xl font-bold text-center text-green-600">
          Plant Disease Classifier
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-xl p-6 cursor-pointer hover:border-green-500 transition"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()} // 🔥 Clickable drop zone
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drag & Drop or Click to Upload
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef} // 🔥 Hooking the ref
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-gray-500 text-sm">Supports JPEG, PNG</p>
          </div>

          {preview && (
            <div className="flex justify-center">
              <Image
                src={preview}
                alt="Preview"
                width={224}
                height={224}
                className="rounded-lg shadow-md"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={uploading || !image}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition duration-300"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Classify Image'
            )}
          </button>
        </form>

        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-green-50 p-6 rounded-xl space-y-4"
          >
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <p className="text-lg font-medium text-green-800">
                Prediction: {prediction}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <p className="text-md text-gray-700">
                Confidence: {(confidence * 100).toFixed(2)}%
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
