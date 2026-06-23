'use client';

import { useState } from 'react';

const SUBJECTS = [
  'English',
  'Math',
  'Science',
  'History',
  'Computer Science',
  'PE',
];

type Report = {
  summary: string;
  weaknesses: string[];
  recommendations: string[];
};

export default function Home() {
  const [formData, setFormData] = useState({
    studentName: '',
    grades: SUBJECTS.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {} as Record<string, string>),
    attendance: '',
  });
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGradeChange = (subject: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      grades: { ...prev.grades, [subject]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error(error);
      alert('Something went wrong generating the report. Check the console.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setFormData({
      studentName: '',
      grades: SUBJECTS.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {} as Record<string, string>),
      attendance: '',
    });
  };

  if (report) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Insight Report
            </h1>
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:underline"
            >
              New Report
            </button>
          </div>

          <h2 className="text-lg font-medium text-gray-900 mb-1">
            {formData.studentName || 'Student'}
          </h2>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Summary
            </h3>
            <p className="text-gray-800">{report.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Flagged Weaknesses
            </h3>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {report.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Recommendations
            </h3>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {report.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          ScholarSync
        </h1>
        <p className="text-gray-500 mb-6">
          Enter student data to generate an academic insight report.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, studentName: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Ananya Sharma"
              required
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Subject Grades (out of 100)
            </p>
            <div className="grid grid-cols-2 gap-4">
              {SUBJECTS.map((subject) => (
                <div key={subject}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {subject}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.grades[subject]}
                    onChange={(e) => handleGradeChange(subject, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0-100"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={formData.attendance}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, attendance: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Insight Report'}
          </button>
        </form>
      </div>
    </main>
  );
}