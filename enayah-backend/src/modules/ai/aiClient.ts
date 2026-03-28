import OpenAI from 'openai'

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY missing at runtime')
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

//export const openai = new OpenAI({
//  apiKey: process.env.OPENAI_API_KEY,
//})

export const callAI = async (prompt: string) => {
  const openai = getOpenAIClient()
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

  const content = res.choices[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('OpenAI returned empty response content')
  }
  return content
}
