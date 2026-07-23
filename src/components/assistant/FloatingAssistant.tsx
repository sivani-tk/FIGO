import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useUIStore } from '@/store/useUIStore'
import { useTripStore } from '@/store/useTripStore'
import type { ChatMessage } from '@/types'

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Mock fallback responses ──────────────────────────────────
function generateResponse(question: string, destination?: string, budget?: number): string {
  const q = question.toLowerCase()
  const dest = destination ?? 'your destination'

  if (q.includes('pack') || q.includes('bring') || q.includes('luggage')) {
    return `For ${dest}, I'd recommend packing:\n• Comfortable walking shoes\n• Weather-appropriate clothing (check the weather widget!)\n• Universal power adapter\n• Sunscreen & sunglasses\n• A lightweight daypack\n• Offline maps downloaded\n• Copies of important documents\n\nPro tip: Roll your clothes to save space! 🧳`
  }
  if (q.includes('safe') || q.includes('security') || q.includes('danger')) {
    return `${dest} is generally safe for tourists. Here are key tips:\n• Keep valuables in hotel safe\n• Use official taxis or Uber\n• Stay in well-lit areas at night\n• Keep emergency contacts offline\n• Share your itinerary with someone back home\n• Get travel insurance before you go\n\nCheck the Safety tab for emergency numbers! 🛡️`
  }
  if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('cuisine')) {
    return `The food scene in ${dest} is amazing! Tips:\n• Try street food for authentic flavors\n• Ask locals for their favorite spots\n• Visit local markets in the morning for fresh produce\n• Book fine dining restaurants in advance\n• Learn a few food-related phrases in the local language\n• Check for any dietary restrictions/allergens beforehand\n\nBon appétit! 🍽️`
  }
  if (q.includes('budget') || q.includes('money') || q.includes('cost') || q.includes('expensive')) {
    const budgetText = budget ? `Your estimated budget of ₹${budget.toLocaleString()} should be comfortable.` : ''
    return `${budgetText} Money tips for ${dest}:\n• Carry some local currency for markets\n• Notify your bank before traveling\n• Use ATMs inside banks for safety\n• Avoid currency exchange at airports (bad rates)\n• Keep a small emergency fund separate\n• Use credit cards where accepted to avoid carrying cash\n\nBudget wisely and enjoy! 💰`
  }
  if (q.includes('transport') || q.includes('travel') || q.includes('get around') || q.includes('taxi') || q.includes('metro')) {
    return `Getting around ${dest}:\n• Metro/subway is often the fastest option\n• Uber/Grab usually cheaper than local taxis\n• Walking is free and lets you discover hidden gems\n• Consider a day pass for public transport\n• Rent a bike for a unique local experience\n• Book airport transfers in advance\n\nI've included transport details in each activity on your itinerary! 🚌`
  }
  if (q.includes('weather') || q.includes('climate') || q.includes('temperature') || q.includes('rain')) {
    return `Check the live weather widget at the top of your trip plan for real-time conditions in ${dest}! Generally:\n• Check forecasts daily during your trip\n• Pack layers for variable weather\n• A compact umbrella is always useful\n• UV protection is important in sunny destinations\n• The best time to visit varies by season\n\nStay prepared and enjoy! ☀️`
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('help')) {
    return `Hello! I'm your FIGO AI Travel Assistant 🌍\n\nI can help you with:\n• 🎒 Packing recommendations\n• 🛡️ Safety & security tips\n• 🍽️ Food & dining advice\n• 💰 Budget management\n• 🚌 Getting around\n• 🌤️ Weather insights\n• 📸 Photography spots\n\nWhat would you like to know about your trip to ${dest}?`
  }
  if (q.includes('photo') || q.includes('instagram') || q.includes('picture')) {
    return `Best photography spots in ${dest}:\n• Visit iconic landmarks at golden hour (1hr after sunrise, 1hr before sunset)\n• Scout locations the day before for perfect angles\n• Ask locals about hidden gems tourists miss\n• Use portrait mode for food photography\n• Back up photos daily to cloud storage\n• Respect "no photography" signs at religious sites\n\nCapture those memories! 📸`
  }
  if (q.includes('tip') || q.includes('etiquette') || q.includes('custom') || q.includes('culture')) {
    return `Cultural tips for ${dest}:\n• Research local customs before you go\n• Dress modestly at religious sites\n• Learn basic greetings in the local language\n• Ask permission before photographing locals\n• Tipping customs vary — research beforehand\n• Remove shoes when entering homes/temples\n• Respect local dining customs\n\nBeing culturally aware makes travel more meaningful! 🤝`
  }

  const tips = [
    `Great question about ${dest}! Here are some insider tips:\n• Book popular attractions in advance to skip queues\n• Visit famous spots early morning or late afternoon\n• Check Google Maps reviews for hidden gems\n• Download offline maps before you go\n• Connect with locals on travel forums for authentic advice\n\nIs there something more specific I can help with? 😊`,
    `For your trip to ${dest}:\n• The best experiences often aren't in tourist guides\n• Learn 5-10 words in the local language — locals appreciate it!\n• Take a free walking tour on your first day\n• Try the local breakfast instead of hotel food\n• Check if your destination has any upcoming festivals\n\nWhat else can I help you plan? ✨`,
    `Here's what I know about ${dest}:\n• Check visa requirements well in advance\n• Travel insurance is strongly recommended\n• Save important contacts as offline notes\n• Keep digital and physical copies of your passport\n• Register with your embassy if staying long-term\n\nAny specific concerns I can address? 🌍`,
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

// ─── OpenAI API call ──────────────────────────────────────────
async function callOpenAI(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('No API key')

  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 600,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 20000,
    }
  )
  return data.choices[0].message.content
}

const QUICK_SUGGESTIONS = [
  'What should I pack?',
  'Is it safe to visit?',
  'Best food spots?',
  'How to get around?',
  'Budget tips?',
  'Best photo spots?',
]

export function FloatingAssistant() {
  const { assistantOpen, toggleAssistant, setAssistantOpen } = useUIStore()
  const { currentTrip } = useTripStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuid(),
      role: 'assistant',
      content: `Hi! I'm your FIGO AI Assistant 🌍\n\nI can help with packing tips, safety advice, food recommendations, and more about your trip${currentTrip ? ` to ${currentTrip.destination}` : ''}!\n\nWhat would you like to know?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (assistantOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [assistantOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    let responseText: string

    try {
      // Build conversation history for OpenAI
      const systemPrompt = `You are FIGO, an expert AI travel assistant. ${
        currentTrip
          ? `The user is planning a trip to ${currentTrip.destination}. Budget: ₹${currentTrip.estimatedBudget.toLocaleString()}. Trip summary: ${currentTrip.summary.slice(0, 200)}`
          : 'Help the user plan their perfect trip.'
      } Give concise, practical, friendly advice. Use bullet points and emoji for readability. Keep responses under 150 words.`

      const conversationHistory = messages
        .filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .slice(-8) // Last 8 messages for context
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      responseText = await callOpenAI([
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: text.trim() },
      ])
    } catch {
      // Fall back to simulated delay + mock response
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))
      responseText = generateResponse(text, currentTrip?.destination, currentTrip?.estimatedBudget)
    }

    const assistantMsg: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, assistantMsg])
    setIsTyping(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleAssistant}
        id="floating-assistant-button"
        aria-label="Open AI Travel Assistant"
        className="fixed bottom-28 md:bottom-8 right-4 md:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #567C8D 0%, #2F4156 100%)',
          boxShadow: '0 8px 32px rgba(86,124,141,0.6), 0 0 0 4px rgba(86,124,141,0.15)',
        }}
      >
        <AnimatePresence mode="wait">
          {assistantOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkle"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!assistantOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            style={{ background: 'rgba(86,124,141,0.4)' }}
          />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-48 md:bottom-28 right-4 md:right-6 z-50 w-[calc(100vw-32px)] max-w-sm flex flex-col"
            style={{
              height: '420px',
              background: 'rgba(20, 30, 45, 0.97)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(200, 217, 230, 0.15)',
              borderRadius: '24px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 flex-shrink-0"
              style={{ background: 'rgba(86,124,141,0.12)' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)' }}
              >
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-highlight font-semibold text-sm leading-none">FIGO Assistant</p>
                <p className="text-accent/50 text-xs mt-0.5">AI travel companion</p>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="ml-auto p-1.5 rounded-xl text-accent/50 hover:text-accent hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'mt-0' : 'mt-1'}`}
                    style={{
                      background: msg.role === 'assistant'
                        ? 'linear-gradient(135deg, #567C8D, #2F4156)'
                        : 'rgba(200,217,230,0.15)',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot size={14} className="text-white" />
                    ) : (
                      <User size={14} className="text-accent" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'text-highlight rounded-tr-sm'
                        : 'text-accent/90 rounded-tl-sm'
                    }`}
                    style={{
                      background: msg.role === 'user'
                        ? 'rgba(86,124,141,0.35)'
                        : 'rgba(47,65,86,0.6)',
                      border: '1px solid rgba(200,217,230,0.1)',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-end"
                >
                  <div
                    className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)' }}
                  >
                    <Bot size={14} className="text-white" />
                  </div>
                  <div
                    className="px-3 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
                    style={{ background: 'rgba(47,65,86,0.6)', border: '1px solid rgba(200,217,230,0.1)' }}
                  >
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent/60"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions (only when no conversation yet) */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {QUICK_SUGGESTIONS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="px-2.5 py-1 rounded-xl text-xs text-accent/80 hover:text-highlight transition-all hover:bg-white/10"
                    style={{ border: '1px solid rgba(200,217,230,0.15)', background: 'rgba(47,65,86,0.4)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0"
              style={{ background: 'rgba(47,65,86,0.3)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your trip..."
                className="flex-1 bg-white/5 border border-white/10 text-highlight placeholder-accent/30 rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-secondary/60 focus:bg-white/10 transition-all"
                id="assistant-input"
                disabled={isTyping}
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #567C8D, #2F4156)' }}
                id="assistant-send-button"
              >
                {isTyping ? (
                  <Loader2 size={14} className="text-white animate-spin" />
                ) : (
                  <Send size={14} className="text-white" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
