const {
  getAuthedContext,
  reserveAiCredit,
  completeAiCredit,
  refundAiCredit,
  callHuggingFaceJson,
  sendError
} = require('../../lib/aiAuth');

async function extractTextFromResume({ resumeText, resumeUrl }) {
  if (resumeText && String(resumeText).trim()) return String(resumeText).slice(0, 25000);
  if (!resumeUrl) throw new Error('Provide resumeUrl or resumeText.');

  const response = await fetch(resumeUrl);
  if (!response.ok) throw new Error('Could not download resume.');
  const contentType = response.headers.get('content-type') || '';
  const buffer = Buffer.from(await response.arrayBuffer());
  const lowerUrl = resumeUrl.toLowerCase().split('?')[0];

  if (contentType.includes('pdf') || lowerUrl.endsWith('.pdf')) {
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(buffer);
    return String(parsed.text || '').slice(0, 25000);
  }

  if (contentType.includes('word') || lowerUrl.endsWith('.docx')) {
    const mammoth = require('mammoth');
    const parsed = await mammoth.extractRawText({ buffer });
    return String(parsed.value || '').slice(0, 25000);
  }

  throw new Error('Resume format is not supported for AI parsing. Upload a PDF or DOCX.');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let ctx;
  let ledgerId;
  try {
    ctx = await getAuthedContext(req, 'careers');
    ledgerId = await reserveAiCredit(ctx.company.id, ctx.user.id, 'resume_parse', 1);

    const resumeText = await extractTextFromResume(req.body || {});
    const model = process.env.HF_RESUME_MODEL || process.env.HF_CHAT_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';
    const parsed = await callHuggingFaceJson({
      model,
      messages: [
        {
          role: 'system',
          content: 'Extract candidate profile fields from resumes. Return strict JSON only with keys: name,email,phone,city,state,addressLine1,addressLine2,pincode,gender,qualification,experience,currentCompany,currentDesignation,skills,summary.'
        },
        { role: 'user', content: resumeText }
      ]
    });

    await completeAiCredit(ledgerId, 'succeeded', { action: 'resume_parse' });
    res.status(200).json({ success: true, creditsUsed: 1, parsed });
  } catch (error) {
    if (ctx && ledgerId) {
      await refundAiCredit(ctx.company.id, ledgerId, 1, error.message).catch(() => {});
    }
    sendError(res, error);
  }
};
