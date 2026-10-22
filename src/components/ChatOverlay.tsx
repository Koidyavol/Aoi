import React, { useState } from 'react';
import { CHAT_PRESETS, EMOTE_LIST } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { Send, MessageSquare, Smile, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isPlayer: boolean;
  time: string;
}

interface ChatOverlayProps {
  chatLog: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emote: string) => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  chatLog,
  onSendMessage,
  onSendEmote,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    soundEngine.playChatPop();
    onSendMessage(inputText.trim());
    setInputText('');
    setShowPresets(false);
    setShowEmotes(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleSend();
    }
  };

  const handleQuickPreset = (preset: string) => {
    soundEngine.playChatPop();
    onSendMessage(preset);
    setShowPresets(false);
  };

  const handleEmoteClick = (emote: string) => {
    soundEngine.playChatPop();
    onSendEmote(emote);
    setShowEmotes(false);
  };

  return (
    <div className="absolute bottom-3 left-3 z-30 pointer-events-auto max-w-sm w-full select-none">
      {/* Expandable Chat Log */}
      <div className="bg-slate-950/85 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col mb-1.5 transition-all">
        {/* Chat header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-pixel text-[9px]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>OBROLAN KOTA AOI</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-0.5"
            title={isExpanded ? 'Kecilkan' : 'Perbesar'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Message feed */}
        <div
          className={`px-3 py-2 space-y-1.5 overflow-y-auto font-mono text-[11px] transition-all ${
            isExpanded ? 'h-48' : 'h-24'
          }`}
        >
          {chatLog.map((msg) => (
            <div key={msg.id} className="leading-tight break-words">
              <span className="text-slate-400 text-[9px] mr-1">[{msg.time}]</span>
              <span
                className={`font-bold mr-1 ${
                  msg.isPlayer ? 'text-amber-400' : 'text-sky-300'
                }`}
              >
                {msg.sender}:
              </span>
              <span className="text-slate-100">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Pickers Popover */}
      {showPresets && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 mb-1.5 shadow-xl flex flex-col gap-1 max-h-36 overflow-y-auto">
          <span className="text-[10px] font-pixel text-amber-400 mb-0.5">PESAN CEPAT AOI:</span>
          {CHAT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPreset(p)}
              className="text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Emotes Popover */}
      {showEmotes && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 mb-1.5 shadow-xl flex items-center justify-between gap-1">
          {EMOTE_LIST.map((emo, idx) => (
            <button
              key={idx}
              onClick={() => handleEmoteClick(emo)}
              className="text-lg p-1 hover:scale-125 transition-transform"
            >
              {emo}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-lg">
        {/* Preset Button */}
        <button
          onClick={() => {
            setShowPresets(!showPresets);
            setShowEmotes(false);
          }}
          className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            showPresets ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Pesan Cepat"
        >
          Cepat
        </button>

        {/* Emote Button */}
        <button
          onClick={() => {
            setShowEmotes(!showEmotes);
            setShowPresets(false);
          }}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            showEmotes ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Kirim Emote"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          maxLength={60}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan chat..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="p-1.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-lg transition-transform cursor-pointer"
          title="Kirim"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
