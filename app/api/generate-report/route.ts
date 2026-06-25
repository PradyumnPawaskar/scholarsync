import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Official MYP conversion table: total out of 32 -> final grade 1-7
function convertToFinalGrade(total: number): number {
  if (total >= 28) return 7;
  if (total >= 24) return 6;
  if (total >= 19) return 5;
  if (total >= 15) return 4;
  if (total >= 11) return 3;
  if (total >= 6) return 2;
  return 1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, subjects, attendance, homeroomComment } = body;

    const subjectsText = subjects
      .map((s: any) => {
        const total = Object.values(s.criteria).reduce((sum: number, v: any) => sum + Number(v), 0);
        const finalGrade = convertToFinalGrade(total);
        const criteriaText = Object.entries(s.criteria)
          .map(([key, val]) => `${key}: ${val}/8`)
          .join(', ');
        return `${s.name} — ${criteriaText} (Total: ${total}/32, Final Grade: ${finalGrade}/7), ATL: ${s.atl.skill} - ${s.atl.rating}`;
      })
      .join('\n');

    const prompt = `You are an expert IB MYP academic advisor, the kind a top international school would hire to brief homeroom teachers before parent meetings. You understand criterion-based assessment: each subject scored across 4 criteria (A-D), each out of 8, totaling 32, converted to a final grade 1-7. You understand ATL ratings: EE (Exceeding), ME (Meeting), AE (Approaching), BE (Below).

Grade 1-7 quality descriptors:
1: very limited quality, significant misunderstandings
2: limited quality, significant gaps
3: acceptable, basic understanding with occasional significant gaps
4: good quality, basic understanding, some flexibility in familiar situations
5: generally high quality, secure understanding, sometimes sophisticated
6: high quality, occasionally innovative, extensive understanding, often independent
7: high quality, frequently innovative, comprehensive understanding, consistently sophisticated and independent

Student: ${studentName}
Attendance: ${attendance}
Homeroom advisor comment: ${homeroomComment || 'None provided'}

Subject performance:
${subjectsText}

Your job is not to summarize each subject one by one. Your job is to find the 2-3 real patterns that connect across subjects, and explain why they matter for this specific student's trajectory. Specifically:

1. Group criteria-level weaknesses by underlying skill, not by subject. If two unrelated subjects both show weak scores in the same type of criterion (e.g. process/development criteria, or productive/creative criteria), name that as one cross-subject pattern, not two separate subject notes.
2. Use the ATL ratings as real evidence, not decoration. If a subject is missing ATL data, say so plainly rather than ignoring it.
3. Treat the homeroom comment as the most important qualitative signal in the data. If it mentions specific behavioral patterns (e.g. submission timing, social distraction, focus), connect those explicitly to which criteria types are most affected, and name a concrete consequence for this student given their grade level (e.g. how this matters more as IB assessment becomes externally moderated).
4. If any subject shows null or zero scores across all criteria, name this as an administrative/submission question requiring confirmation, not as an ability problem.
5. Build one coherent narrative: this student is strong at X type of work and weaker at Y type of work, here's the evidence, here's why it matters now.

Avoid generic study advice. Every recommendation must reference a specific criterion, subject, or behavior pattern from the data above, and should be something a homeroom teacher could realistically act on or discuss with the student directly.

Respond ONLY in valid JSON with this exact structure, no markdown, no preamble:
{
  "summary": "4-5 sentences building one coherent narrative across subjects, referencing specific grades, criteria, and the homeroom context",
  "weaknesses": ["a cross-subject pattern grounded in specific criteria scores, named clearly", "another distinct pattern, not a per-subject restatement"],
  "recommendations": ["specific, actionable, tied to a named criterion or behavior", "specific actionable recommendation 2", "specific actionable recommendation 3"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
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