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

export default function Home() {
  const [formData, setFormData] = useState({
    studentName: '',
    grades: SUBJECTS.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {} as Record<string, string>),
    attendance: '',
  });

  const handleGradeChange = (subject: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      grades: { ...prev.grades, [subject]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

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
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Insight Report
          </button>
        </form>
      </div>
    </main>
  );
}