// ============================================================
// FIGO — Chat Functions
// AI Travel Assistant chat interface
// ============================================================
import axios from 'axios'
import type { ChatMessage } from '@/types'

export async function chatWithFigo(
  messages: ChatMessage[],
  destination?: string
): Promise<string> {
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

  const destText = destination ? ` for the destination "${destination}"` : ''
  const systemPrompt = `You are FIGO, a helpful AI Travel Assistant${destText}. Provide concise, practical, friendly travel advice with emojis and bullet points. Answer questions about packing, safety, food, transport, weather, budget, and local attractions.`

  // 1. Try Gemini API
  if (GEMINI_KEY && GEMINI_KEY.length > 10) {
    try {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || 'Hello'
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${lastUserMsg}` }],
            },
          ],
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      )
      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (reply) return reply
    } catch { /* fallthrough */ }
  }

  // 2. Try OpenAI API
  if (OPENAI_KEY && OPENAI_KEY.startsWith('sk-')) {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        },
        { headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' }, timeout: 15000 }
      )
      return res.data.choices[0].message.content
    } catch { /* fallthrough */ }
  }

  // 3. Fallback smart responder
  const lastMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || ''
  return generateFallbackResponse(lastMsg, destination)
}

function generateFallbackResponse(question: string, destination?: string): string {
  const q = question.toLowerCase()
  const dest = destination ?? 'your destination'

  if (q.includes('pack') || q.includes('bring') || q.includes('luggage')) {
    return `For ${dest}, I'd recommend packing:\n• Comfortable walking shoes\n• Weather-appropriate clothing\n• Universal power adapter\n• Sunscreen & sunglasses\n• A lightweight daypack\n• Offline maps downloaded\n• Copies of important documents\n\nPro tip: Roll your clothes to save space! 🧳`
  }
  if (q.includes('safe') || q.includes('security') || q.includes('danger')) {
    return `${dest} is generally safe for tourists. Key tips:\n• Keep emergency contacts saved offline\n• Use official taxis or ride-sharing apps\n• Stay in well-lit areas at night\n• Share your itinerary with family\n\nCheck the Safety tab for emergency numbers! 🛡️`
  }
  if (q.includes('food') || q.includes('eat') || q.includes('restaurant')) {
    return `The food scene in ${dest} is incredible!\n• Ask locals for their favorite spots\n• Try fresh local street delicacies\n• Check for dietary requirements beforehand\n• Visit morning food markets for fresh treats\n\nEnjoy your culinary journey! 🍽️`
  }
  if (q.includes('budget') || q.includes('money') || q.includes('cost')) {
    return `Money & budget tips for ${dest}:\n• Carry some local cash for small vendors\n• Use card payments where accepted\n• Keep a small separate emergency fund\n• Use ATMs inside banks for safety\n\nPlan wisely! 💰`
  }

  return `Here are insider tips for ${dest}:\n• Visit top attractions early in the morning\n• Download offline maps before heading out\n• Learn basic greetings in the local language\n• Ask locals for hidden gem recommendations\n\nIs there anything specific I can help with? 🌍`
}
