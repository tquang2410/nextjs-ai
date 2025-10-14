// File: src/app/page.tsx

'use client';

import { useState } from 'react';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.text);
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-4xl font-bold mb-8">Hỏi Gemini AI</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Nhập câu hỏi của bạn ở đây..."
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            rows={4}
        />
          <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-blue-600 text-white p-2 rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Gửi'}
          </button>
        </form>

        {result && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md w-full max-w-lg">
              <h2 className="text-xl font-semibold text-black">Kết quả:</h2>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{result}</p>
            </div>
        )}
      </main>
  );
}