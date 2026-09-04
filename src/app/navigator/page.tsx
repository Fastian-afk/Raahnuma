'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import ResultsPanel from '@/components/results/ResultsPanel';
import { useLanguage } from '@/lib/i18n/context';
import { AssessmentResult } from '@/lib/rules-engine/types';
import JSZip from 'jszip';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Loader2,
  Bot,
  User,
  Volume2,
  X,
} from 'lucide-react';

function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    case 'txt':
      return 'text/plain';
    default:
      return '';
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const xmlText = await zip.file('word/document.xml')?.async('string');
    if (!xmlText) return '';
    const matches = xmlText.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (!matches) return '';
    return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
  } catch (err) {
    console.error('Docx extraction error:', err);
    return '';
  }
}

interface ExtractionResult {
  type: 'text' | 'media';
  text?: string;
  base64?: string;
  mimeType?: string;
  fileName: string;
}

async function extractFileContent(file: File): Promise<ExtractionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    return { type: 'text', text, fileName: file.name };
  }

  if (ext === 'docx') {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    const text = await extractTextFromDocx(arrayBuffer);
    return { type: 'text', text, fileName: file.name };
  }

  if (ext === 'zip') {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    const zip = await JSZip.loadAsync(arrayBuffer);

    let foundFile = null;
    let foundFileName = '';

    for (const relativePath of Object.keys(zip.files)) {
      const zipEntry = zip.files[relativePath];
      if (zipEntry.dir) continue;
      const innerExt = relativePath.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt', 'docx'].includes(innerExt || '')) {
        foundFile = zipEntry;
        foundFileName = relativePath;
        break;
      }
    }

    if (!foundFile) {
      throw new Error('No supported files found inside the ZIP archive. Include a JPG, PNG, WebP, PDF, TXT, or DOCX file.');
    }

    const innerExt = foundFileName.split('.').pop()?.toLowerCase();

    if (innerExt === 'txt') {
      const text = await foundFile.async('string');
      return { type: 'text', text, fileName: foundFileName };
    }

    if (innerExt === 'docx') {
      const innerBuf = await foundFile.async('arraybuffer');
      const text = await extractTextFromDocx(innerBuf);
      return { type: 'text', text, fileName: foundFileName };
    }

    const base64 = await foundFile.async('base64');
    const mimeType = getMimeTypeFromFilename(foundFileName);
    return { type: 'media', base64, mimeType, fileName: foundFileName };
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const mimeType = file.type || getMimeTypeFromFilename(file.name);
  return { type: 'media', base64, mimeType, fileName: file.name };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: AssessmentResult;
}

export default function NavigatorPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [latestResults, setLatestResults] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t('chat.welcome'),
        timestamp: new Date(),
      },
    ]);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = useCallback(
    async (text: string) => {
      if (isSpeaking) {
        audioRef.current?.pause();
        setIsSpeaking(false);
        return;
      }

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.slice(0, 500), language }),
        });

        if (!res.ok) {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
            utterance.lang = language === 'en' ? 'en-US' : 'ur-PK';
            window.speechSynthesis.speak(utterance);
          }
          return;
        }

        const data = await res.json();
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } catch {
        /* TTS unavailable — silent fallback */
      }
    },
    [language, isSpeaking]
  );

  const sendMessage = async (content?: string) => {
    const messageText = (content ?? input).trim();
    if (!messageText || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages.filter((m) => m.id !== 'welcome'), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.error || 'I apologize, there was an error. Please try again.',
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        results: data.eligibilityResults || undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.eligibilityResults) {
        setLatestResults(data.eligibilityResults);
        setShowResults(true);
      }

      if (data.needsHumanReview) {
        setError(
          language === 'en'
            ? 'Some details are unclear — consider visiting a BISP office for in-person verification.'
            : 'کچھ تفصیلات واضح نہیں — براہ کرم BISP آفس میں ذاتی تصدیق کریں۔'
        );
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, there was a network error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError(
        language === 'en'
          ? 'Voice input requires Chrome or Edge browser.'
          : 'وائس ان پٹ کے لیے Chrome یا Edge استعمال کریں۔'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;

    const langMap: Record<string, string> = {
      en: 'en-US',
      ur: 'ur-PK',
      sd: 'sd-PK',
      ps: 'ps-AF',
      pn: 'pa-PK',
      bl: 'ur-PK',
    };
    recognition.lang = langMap[language] || 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError('Voice recognition failed. Please try again or type your message.');
    };
    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(language === 'en' ? 'File too large. Maximum size is 10MB.' : 'فائل بہت بڑی ہے۔ زیادہ سے زیادہ سائز 10MB ہے۔');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt', 'docx', 'zip'];
    if (!allowedExtensions.includes(ext || '')) {
      setError(
        language === 'en'
          ? 'Unsupported file type. Use JPG, PNG, WebP, PDF, TXT, DOCX, or ZIP.'
          : 'غیر تعاون یافتہ فائل کی قسم۔ براہ کرم JPG، PNG، WebP، PDF، TXT، DOCX، یا ZIP استعمال کریں۔'
      );
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `${t('upload.title') || 'Uploaded Document'}: ${file.name}`,
        timestamp: new Date(),
      },
    ]);
    setIsLoading(true);

    try {
      const extraction = await extractFileContent(file);

      if (extraction.type === 'text') {
        const cleanText = extraction.text?.trim();
        if (!cleanText) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content:
                language === 'en'
                  ? 'The document appears to be empty. Please enter your details manually.'
                  : 'دستاویز خالی معلوم ہوتی ہے۔ براہ کرم اپنی تفصیلات خود درج کریں۔',
              timestamp: new Date(),
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content:
              language === 'en'
                ? `I extracted the following text from "${extraction.fileName}":\n\n"${cleanText.slice(0, 300)}${cleanText.length > 300 ? '...' : ''}"\n\nAnalyzing this text for eligibility...`
                : `میں نے اس دستاویز "${extraction.fileName}" سے درج ذیل متن نکالا ہے:\n\n"${cleanText.slice(0, 300)}${cleanText.length > 300 ? '...' : ''}"\n\nاہلیت کے لیے اس متن کا جائزہ لیا جا رہا ہے...`,
            timestamp: new Date(),
          },
        ]);

        await sendMessage(
          language === 'en'
            ? `Analyzing document content: ${cleanText.slice(0, 4000)}`
            : `دستاویز کے مواد کا تجزیہ: ${cleanText.slice(0, 4000)}`
        );
      } else {
        // Media type (image or PDF)
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: extraction.base64,
            mimeType: extraction.mimeType,
            documentType: 'cnic',
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content:
                data.message ||
                data.error ||
                (language === 'en'
                  ? 'Document analysis is not available. Please describe your CNIC details manually.'
                  : 'دستاویز کا تجزیہ دستیاب نہیں ہے۔ براہ کرم اپنے شناختی کارڈ کی تفصیلات خود بیان کریں۔'),
              timestamp: new Date(),
            },
          ]);
          return;
        }

        const extData = data.extracted;
        const summary = [
          extData.cnicNumber && `${language === 'en' ? 'CNIC' : 'شناختی کارڈ'}: ${extData.cnicNumber}`,
          extData.fullName && `${language === 'en' ? 'Name' : 'نام'}: ${extData.fullName}`,
          extData.province && `${language === 'en' ? 'Province' : 'صوبہ'}: ${extData.province}`,
          extData.address && `${language === 'en' ? 'Address' : 'پتہ'}: ${extData.address}`,
        ]
          .filter(Boolean)
          .join('\n');

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content:
              summary.length > 0
                ? language === 'en'
                  ? `I extracted the following from "${extraction.fileName}":\n${summary}\n\nLet me check your eligibility based on this information.`
                  : `میں نے اس دستاویز "${extraction.fileName}" سے درج ذیل معلومات حاصل کی ہیں:\n${summary}\n\nآئیے اس معلومات کی بنیاد پر آپ کی اہلیت چیک کرتے ہیں۔`
                : language === 'en'
                ? 'I could not extract clear information from the document. Please describe your details manually.'
                : 'میں دستاویز سے واضح معلومات حاصل نہیں کر سکا۔ براہ کرم اپنی تفصیلات خود بیان کریں۔',
            timestamp: new Date(),
          },
        ]);

        if (extData.province || extData.cnicNumber) {
          const autoMessage = [
            extData.province && `My CNIC province is ${extData.province}.`,
            extData.cnicNumber && `My CNIC number is ${extData.cnicNumber}.`,
            'Please check my eligibility for government programs.',
          ]
            .filter(Boolean)
            .join(' ');
          await sendMessage(autoMessage);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : (language === 'en'
              ? 'Failed to process document. Please try again or enter details manually.'
              : 'دستاویز پر کارروائی کرنے میں ناکامی۔ دوبارہ کوشش کریں یا تفصیلات خود درج کریں۔')
      );
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AppShell>
      <div className="flex h-full relative">
        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all ${
            showResults && latestResults ? 'lg:w-1/2' : 'w-full'
          }`}
        >
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <h2 className="font-bold text-cream">{t('app.name')} AI Navigator</h2>
                <p className="text-xs text-sage-500">
                  NLP → Rules Engine → Recommendation → Explanation
                </p>
              </div>
            </div>
            {latestResults && (
              <button
                onClick={() => setShowResults(!showResults)}
                className="text-xs px-3 py-1.5 rounded-lg glass text-gold-400 hover:bg-emerald-800/40 transition-colors"
              >
                {showResults ? 'Hide' : 'Show'} Results (
                {latestResults.likelyEligibleCount + latestResults.mayBeEligibleCount})
              </button>
            )}
          </div>

          {error && (
            <div className="mx-4 mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 no-print">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 underline"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-emerald-950" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-emerald-700/40 text-cream rounded-br-md'
                      : 'glass text-sage-300 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-sage-600">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className={`text-sage-500 hover:text-gold-400 ${isSpeaking ? 'text-gold-400' : ''}`}
                        title="Read aloud"
                        aria-label="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-700/40 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-sage-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-950" />
                </div>
                <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
                  <span className="text-sm text-sage-400">{t('chat.analyzing')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 md:px-6 pb-4 pt-2 border-t border-border-subtle bg-surface-primary shrink-0 no-print">
            <div className="flex items-end gap-2 glass rounded-2xl p-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,application/zip,application/x-zip-compressed,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl hover:bg-emerald-800/40 text-sage-500 hover:text-sage-300 transition-colors shrink-0"
                title={t('chat.upload')}
                aria-label={t('chat.upload')}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={t('chat.placeholder')}
                rows={1}
                className="flex-1 bg-transparent text-cream placeholder-sage-600 text-sm resize-none outline-none py-2.5 max-h-32"
                style={{ minHeight: '40px' }}
                aria-label="Message input"
              />
              <button
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'hover:bg-emerald-800/40 text-sage-500 hover:text-sage-300'
                }`}
                title={t('chat.voice')}
                aria-label={t('chat.voice')}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 disabled:opacity-40 hover:from-gold-500 hover:to-gold-400 transition-all shrink-0"
                aria-label={t('chat.send')}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 mt-2 px-2">
                <div className="flex items-center gap-1 h-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="voice-bar" />
                  ))}
                </div>
                <span className="text-xs text-rose-400">{t('voice.listening')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Results Panel */}
        {showResults && latestResults && (
          <div className="hidden lg:flex w-96 xl:w-[28rem] flex-col border-l border-border-subtle bg-surface-secondary/30 shrink-0">
            <ResultsPanel results={latestResults} />
          </div>
        )}

        {/* Mobile Results Drawer */}
        {showResults && latestResults && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-surface-primary">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle no-print">
              <h3 className="font-bold text-cream">{t('results.title')}</h3>
              <button
                onClick={() => setShowResults(false)}
                className="p-2 rounded-lg hover:bg-emerald-800/40 text-sage-400"
                aria-label="Close results"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ResultsPanel results={latestResults} className="flex-1 overflow-hidden" />
          </div>
        )}
      </div>
    </AppShell>
  );
}
