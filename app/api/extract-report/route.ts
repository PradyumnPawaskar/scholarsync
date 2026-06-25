import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const extractionPrompt = `You are reading an IB MYP report card PDF. Extract the following information and respond ONLY in valid JSON, no markdown, no preamble:

{
  "studentName": "full student name",
  "attendance": "attendance as shown, e.g. 86/98",
  "homeroomComment": "the full homeroom advisor's narrative reflection comment, verbatim",
  "subjects": [
    {
      "name": "subject name as shown, e.g. English, Spanish, Integrated Science",
      "criteria": { "A": number, "B": number, "C": number, "D": number },
      "atl": { "skill": "the ATL skill category name shown for this subject, e.g. Social, Thinking, Research, Communication", "rating": "EE or ME or AE or BE, exactly as marked with a checkmark or tick for this subject" }
    }
  ]
}

IMPORTANT: Each subject's report typically includes an ATL (Approaches to Learning) section near the bottom, showing skill categories (e.g. Social, Thinking, Communication, Research, Self-management) each with columns for EE, ME, AE, BE. Find which rating has a checkmark or tick mark for each skill category listed under that specific subject, and report the skill name plus which rating was checked. Some subjects may show multiple ATL skill categories checked, in that case include the most prominent or first one. If a subject genuinely has no ATL section at all, use "Not specified" for skill and rating, but check carefully first, most subjects in MYP report cards do include this section.

Each criterion score is out of 8. Extract every subject you find in the document. Be precise with numbers, do not guess or round.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: extractionPrompt,
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const rawText = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(cleaned);

    return NextResponse.json(extracted);
  } catch (error) {
    console.error('Error extracting report card:', error);
    return NextResponse.json(
      { error: 'Failed to extract report card data' },
      { status: 500 }
    );
  }
}