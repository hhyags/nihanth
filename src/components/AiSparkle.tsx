import React, { useState } from "react";
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  HeartHandshake, 
  Compass, 
  Moon, 
  Smile, 
  Send, 
  Star,
  RefreshCw,
  Gift
} from "lucide-react";

interface AiSparkleProps {
  onTriggerLog: () => void;
}

export default function AiSparkle({ onTriggerLog }: AiSparkleProps) {
  // Story maker states
  const [childName, setChildName] = useState("");
  const [character, setCharacter] = useState("Friendly Velvet Dino");
  const [setting, setSetting] = useState("Galaxy Sandbox Castle");
  const [theme, setTheme] = useState("Sharing and cooperation values");
  
  const [storyContent, setStoryContent] = useState<string | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [isStoryMock, setIsStoryMock] = useState(false);

  // Recommender states
  const [childAge, setChildAge] = useState("3");
  const [parentFocus, setParentFocus] = useState("Independent playing and empathy");
  const [keywords, setKeywords] = useState("wood widgets, bedtime reading");
  
  const [recContent, setRecContent] = useState<string | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [isRecMock, setIsRecMock] = useState(false);

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStoryLoading(true);
    setStoryContent(null);

    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName,
          characterType: character,
          settingType: setting,
          adventureTheme: theme
        })
      });

      const data = await res.json();
      if (data.story) {
        setStoryContent(data.story);
        setIsStoryMock(!!data.mockMode);
        onTriggerLog();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStoryLoading(false);
    }
  };

  const handleGetRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecLoading(true);
    setRecContent(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childAge,
          currentFocus: parentFocus,
          parentKeywords: keywords
        })
      });

      const data = await res.json();
      if (data.response) {
        setRecContent(data.response);
        setIsRecMock(!!data.mockMode);
        onTriggerLog();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecLoading(false);
    }
  };

  // Simple, completely robust markdown line parser to prevent importing massive npm modules
  const renderSimpleFormatting = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        return <h3 key={idx} className="text-sm md:text-md font-bold font-display text-slate-800 mt-4 mb-2">{trimmed.replace("###", "")}</h3>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-md font-bold font-display text-slate-800 mt-5 mb-2">{trimmed.replace("##", "")}</h3>;
      }
      if (trimmed.startsWith(">")) {
        return (
          <blockquote key={idx} className="border-l-4 border-brand-pink/50 bg-brand-pink/5 pl-4 py-2 my-3 rounded-r-lg italic text-xs leading-relaxed text-slate-600">
            {trimmed.replace(">", "")}
          </blockquote>
        );
      }
      if (trimmed.startsWith("1.") || trimmed.match(/^\d+\./)) {
        return <p key={idx} className="text-xs text-slate-660 pl-4 py-0.5 leading-relaxed font-medium"><span className="text-brand-pink font-bold">•</span> {trimmed.replace(/^\d+\./, "")}</p>;
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }
      
      // Inline styling matching bold
      let formattedLine: React.ReactNode = trimmed;
      if (trimmed.includes("**")) {
        const parts = trimmed.split("**");
        formattedLine = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-slate-850 bg-brand-cream px-1 rounded-sm">{part}</strong> : part);
      }

      return <p key={idx} className="text-xs md:text-sm text-slate-600 leading-relaxed my-2">{formattedLine}</p>;
    });
  };

  return (
    <div id="ai-sparkle-root" className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* LEFT COLUMN: THE BEDTIME STORYMAKER */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1 bg-brand-pink/10 text-brand-pink text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
            <Moon className="w-3.5 h-3.5" /> Sleepy Bedtime Weaver
          </div>
          
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-slate-850">Weave a Magical Sleepy Tale</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Help your toddler transition to dreamland! Choose custom friendly settings and our Gemini engine will weave a soothing story focusing on kindness and spatial learning.
            </p>
          </div>

          <form onSubmit={handleGenerateStory} className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kid's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Liam"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Companion Friend</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink cursor-pointer text-slate-650"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                >
                  <option value="Chubby Velvet Dinosaur">🦖 Chubby Dinosaur</option>
                  <option value="Sleepy Organic Bear Cub">🐻 Sleepy bear cub</option>
                  <option value="Iridescent Rainbow Butterfly">🦋 Rainbow Butterfly</option>
                  <option value="Curious Little Astro Robot">🤖 Tiny Space Robot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Adventure setting</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink cursor-pointer text-slate-650"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                >
                  <option value="Sandbox Galaxy Castle">🏰 Sandbox Galaxy</option>
                  <option value="Cozy Whispering Birch Canopy">🌲 Whispering Canopy</option>
                  <option value="Magical Coral Playground reef">🐚 Coral Playground</option>
                  <option value="Sparkling Wooden Play Palace">🪵 Wooden Play Palace</option>
                </select>
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Growth theme</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink cursor-pointer text-slate-650"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="Active sharing and empathy">🤝 Sharing & Empathy</option>
                  <option value="Patience and fine motor discovery">🧩 Patience & Discovery</option>
                  <option value="Curiosity of stars and mathematics">🌟 Cosmic Curiosity</option>
                  <option value="Being helper to parents and animals">🐾 Helping Friends</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isStoryLoading}
              className="w-full py-2.5 bg-brand-pink hover:bg-brand-pink/90 disabled:bg-slate-200 text-white font-semibold rounded-xl text-xs shadow-sm shadow-brand-pink/15 transition-all flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isStoryLoading ? "Weaving stardust sentences..." : "Formulate Storybook"}</span>
            </button>
          </form>
        </div>

        {/* Display response in nice story frame */}
        <div className="flex-1 flex flex-col justify-end pt-4 min-h-[180px]">
          {isStoryLoading && (
            <div className="text-center py-10 space-y-2">
              <RefreshCw className="w-8 h-8 text-brand-pink animate-spin mx-auto opacity-70" />
              <p className="text-[11px] text-slate-400">Summoning creative child thoughts from Gemini...</p>
            </div>
          )}

          {storyContent && (
            <div className="bg-brand-cream/60 border border-brand-peach/15 rounded-2xl p-5 md:p-6 shadow-xs relative overflow-hidden text-left space-y-3">
              <div className="flex justify-between items-center text-[9px] font-bold text-brand-pink uppercase tracking-wider mb-2">
                <span>📖 Illustrated Bedtime Book</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-brand-pink" /> 
                  {isStoryMock ? "Mock AI Mode" : "Live Gemini"}
                </span>
              </div>
              
              <div className="max-h-72 overflow-y-auto pr-1">
                {renderSimpleFormatting(storyContent)}
              </div>
            </div>
          )}

          {!storyContent && !isStoryLoading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Configure parameters and press "Formulate Storybook" to display illustrations!
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: RECOMENTER ASSISTANT */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1 bg-brand-blue/15 text-slate-750 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" /> TreasureGenie Concierge
          </div>
          
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-slate-850">Personal Development Consultation</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Wondering about fitting clothing fits or heirloom activity castles? Describe your youngster's age group and interests, and let the concierge extract matching catalog items.
            </p>
          </div>

          <form onSubmit={handleGetRecommendation} className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Youngster's Age</label>
                <input
                  type="number"
                  placeholder="e.g. 4"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none font-bold"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Educational focus</label>
                <input
                  type="text"
                  placeholder="e.g. sensory coordination"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={parentFocus}
                  onChange={(e) => setParentFocus(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Keywords / Favorites</label>
              <input
                type="text"
                placeholder="e.g. dinosaurs, cozy knitwear, active play"
                className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isRecLoading}
              className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy/95 disabled:bg-slate-200 text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Smile className="w-3.5 h-3.5 animate-bounce-short" />
              <span>{isRecLoading ? "Assembling development metrics..." : "Consult Genie Specialist"}</span>
            </button>
          </form>
        </div>

        {/* Display recommendations in clean style */}
        <div className="flex-1 flex flex-col justify-end pt-4 min-h-[180px]">
          {isRecLoading && (
            <div className="text-center py-10 space-y-2">
              <RefreshCw className="w-8 h-8 text-brand-navy/60 animate-spin mx-auto" />
              <p className="text-[11px] text-slate-400">Genie is searching active shelf inventory...</p>
            </div>
          )}

          {recContent && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 shadow-xs relative text-left space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5 text-brand-pink" /> Curated Proposals</span>
                <span className="flex items-center gap-1 text-brand-navy font-bold">
                  {isRecMock ? "Mock Advice Mode" : "Live Grounded Gemini"}
                </span>
              </div>
              
              <div className="max-h-72 overflow-y-auto pr-1">
                {renderSimpleFormatting(recContent)}
              </div>
            </div>
          )}

          {!recContent && !isRecLoading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Need present inspiration? Consult our Genie with child age group factors!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
