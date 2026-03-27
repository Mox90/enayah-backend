import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const callAI = async (prompt: string) => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // fast + cheap + good
    messages: [
      {
        role: 'system',
        content: 'You are an expert HR assistant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3, // stable output
  })

  return res.choices[0]?.message?.content || ''
}
