import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { Expense, Category, UserSettings } from '../types';

interface AIAdvisorViewProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      parts.push(
        <em key={match.index} className="italic text-gray-200">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      parts.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function FormattedMessage({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="font-bold text-white text-sm mt-2 mb-1">
              {renderInline(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h3 key={lineIdx} className="font-bold text-white text-base mt-2 mb-1">
              {renderInline(trimmed.replace(/^#+\s*/, ''))}
            </h3>
          );
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-emerald-400 text-sm leading-none mt-1">•</span>
              <span className="flex-1">{renderInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered list
        const matchNumber = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (matchNumber) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-emerald-400 font-mono text-xs font-semibold mt-0.5">{matchNumber[1]}.</span>
              <span className="flex-1">{renderInline(matchNumber[2])}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="m-0">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export function AIAdvisorView({ expenses, categories, settings }: AIAdvisorViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I am your AI Financial Advisor. I have access to your expenses and budget data. How can I help you analyze your spending or manage your finances today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true }]);

    // Build context with conversational intelligence
    const systemContext = `
You are a helpful, conversational, and expert AI Financial Advisor for TrackYourSpent.

Behavior guidelines:
1. GREETINGS & CASUAL CHAT: If the user says "hi", "hello", "hey", or asks a casual greeting, respond warmly, say hello back, and ask how you can assist with their expenses, budget, or savings today. Do not dump a large wall of financial data unprompted.
2. FINANCIAL ANALYSIS: When the user asks for financial analysis, advice, budgeting tips, category breakdowns, or spending reviews, analyze the provided JSON data and give clear, structured, and actionable recommendations.
3. FORMATTING: Use markdown bolding (e.g. **₹500** or **Dining Out**) for numbers, amounts, and category names. Use bullet points for structured tips. Keep the tone encouraging, clear, and professional.

Financial Data:
- Currency: ${settings.currencySymbol}
- Total Monthly Budget: ${settings.totalBudget}

Categories:
${JSON.stringify(categories.map(c => ({ name: c.name, budgetLimit: c.budgetLimit })), null, 2)}

Expenses History:
${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, date: e.date, category: categories.find(c => c.id === e.categoryId)?.name || 'General' })), null, 2)}
    `;

    try {
      const apiKey = import.meta.env.NVIDIA_API_KEY || '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';

      const requestPayload = {
        model: "nvidia/nemotron-3-ultra-550b-a55b",
        messages: [
          { role: "system", content: systemContext },
          ...messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage.content }
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
        stream: true
      };

      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      let response: Response;
      try {
        response = await fetch('/api/nvidia/v1/chat/completions', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestPayload)
        });
        if (!response.ok && response.status === 404) {
          response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(requestPayload)
          });
        }
      } catch {
        response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestPayload)
        });
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = '';
      let buffer = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (trimmed.startsWith('data: ')) {
                try {
                  const parsed = JSON.parse(trimmed.substring(6));
                  const delta = parsed.choices?.[0]?.delta;
                  const text = delta?.content || '';
                  if (text) {
                    fullResponse += text;
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: fullResponse }
                        : msg
                    ));
                  }
                } catch {
                  // ignore partial JSON parse error
                }
              }
            }
          }
        }
      }

      if (!fullResponse.trim()) {
        fullResponse = "Hello! I am ready to help you analyze your finances and spending. What would you like to review?";
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse, isStreaming: false }
            : msg
        ));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
      }
    } catch (error: unknown) {
      console.error("AI Advisor Error:", error);
      const errMsg = error instanceof Error ? error.message : "Unable to process request. Please check your connection.";
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: `Error: ${errMsg}`, isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Bot className="text-emerald-400" size={32} />
          AI Financial Advisor
        </h1>
        <p className="text-gray-400">Intelligent insights, spending analysis, and smart budgeting recommendations.</p>
      </div>

      <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col">
        {/* Chat Messages */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Chat messages history"
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30" aria-hidden="true">
                  <Sparkles size={20} />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-5 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-[#1a1a1c] border border-white/10 text-gray-200 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' && !msg.content && msg.isStreaming ? (
                  <div className="flex items-center gap-2 text-emerald-400/70" role="status">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : msg.role === 'assistant' ? (
                  <div className="text-sm">
                    <FormattedMessage content={msg.content} />
                    {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" aria-hidden="true" />}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {msg.content}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30" aria-hidden="true">
                  <User size={20} />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#141416] border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <label htmlFor="ai-advisor-prompt-input" className="sr-only">
              Ask AI Financial Advisor
            </label>
            <input
              id="ai-advisor-prompt-input"
              name="prompt"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice on your budget, spending trends, or savings..."
              disabled={isLoading}
              aria-label="Ask for advice on your budget, spending trends, or savings"
              className="w-full bg-[#1c1c1e] border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send query to AI Advisor"
              className="absolute right-2 p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              AI Financial Intelligence • Real-time Data Insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
