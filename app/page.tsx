'use client';

import { useState } from 'react';

type Criteria = { A: string; B: string; C: string; D: string };
type Subject = {
  name: string;
  criteria: Criteria;
  atl: { skill: string; rating: string };
};

type ExtractedData = {
  studentName: string;
  attendance: string;
  homeroomComment: string;
  subjects: Subject[];
};

type Report = {
  summary: string;
  weaknesses: string[];
  recommendations: string[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Extraction failed');

      const data = await response.json();
      setExtracted(data);
    } catch (error) {
      console.error(error);
      alert('Could not extract data from this PDF. Check the console.');
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!extracted) return;
    setGenerating(true);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extracted),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error(error);
      alert('Could not generate insight report. Check the console.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtracted(null);
    setReport(null);
  };

  if (report) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Insight Report</h1>
            <button onClick={handleReset} className="text-sm text-blue-600 hover:underline">
              New Report
            </button>
          </div>

          <h2 className="text-lg font-medium text-gray-900 mb-1">
            {extracted?.studentName || 'Student'}
          </h2>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Summary</h3>
            <p className="text-gray-800">{report.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Flagged Weaknesses</h3>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Recommendations</h3>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      </main>
    );
  }

  if (extracted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Extracted Data</h1>
          <p className="text-gray-500 mb-6">Review what was pulled from the report card before generating insights.</p>

          <h2 className="text-lg font-medium text-gray-900 mb-1">{extracted.studentName}</h2>
          <p className="text-sm text-gray-600 mb-4">Attendance: {extracted.attendance}</p>

          <div className="space-y-3 mb-6">
            {extracted.subjects.map((s, i) => {
              const total = Object.values(s.criteria).reduce((sum, v) => sum + Number(v), 0);
              return (
                <div key={i} className="border border-gray-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-gray-600">
                    A:{s.criteria.A} B:{s.criteria.B} C:{s.criteria.C} D:{s.criteria.D} — Total: {total}/32
                  </p>
                  <p className="text-gray-500 text-xs">ATL: {s.atl.skill} - {s.atl.rating}</p>
                </div>
              );
            })}
          </div>

          {extracted.homeroomComment && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Homeroom Comment</h3>
              <p className="text-sm text-gray-700">{extracted.homeroomComment}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Insight Report'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">ScholarSync</h1>
        <p className="text-gray-500 mb-6">Upload an IB MYP report card PDF to generate an academic insight report.</p>

        <div className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
          />

          <button
            onClick={handleExtract}
            disabled={!file || extracting}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {extracting ? 'Reading PDF...' : 'Extract Data'}
          </button>
        </div>
      </div>
    </main>
  );
}
