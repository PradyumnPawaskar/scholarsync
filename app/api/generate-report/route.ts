import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, grades, attendance } = body;

    const gradesText = Object.entries(grades)
      .map(([subject, score]) => `${subject}: ${score}/100`)
      .join('\n');

    const prompt = `You are an academic insight assistant for teachers. Analyze the following student data and generate a structured insight report.

Student: ${studentName}
Subject Grades:
${gradesText}
Attendance: ${attendance}%

Respond ONLY in valid JSON with this exact structure, no markdown, no preamble:
{
  "summary": "2-3 sentence overview of academic performance and attendance",
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const rawText = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const report = JSON.parse(cleaned);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}