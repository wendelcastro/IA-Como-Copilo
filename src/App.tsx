import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, Brain, Factory, Sparkles, Map as MapIcon, Database, 
  Terminal, Award, ChevronRight, CheckCircle2, 
  Lock, Play, RefreshCw, Search, FileText, 
  AlertTriangle, ThumbsUp, ThumbsDown, Share2, Download,
  ArrowRight, Info, Check, X, Star, Instagram, Linkedin, Globe, MessageSquare, Rocket
} from 'lucide-react';

// --- TYPES & CONSTANTS ---
type PhaseData = {
  id: number;
  title: string;
  tagline: string;
  icon: React.ElementType;
};

const PHASES: PhaseData[] = [
  { id: 1, title: "Visão de Máquina", tagline: "Como a IA lê e conecta palavras", icon: Brain },
  { id: 2, title: "A Fábrica de Mentes", tagline: "Como um modelo é treinado", icon: Factory },
  { id: 3, title: "O Oráculo Imperfeito", tagline: "Geração, Temperatura e Alucinações", icon: Sparkles },
  { id: 4, title: "O Mapa do Tesouro", tagline: "Fontes e Janela de Contexto", icon: MapIcon },
  { id: 5, title: "Cada Modelo, Uma Arma", tagline: "RAG vs Stuffing", icon: Database },
  { id: 6, title: "De Passageiro a Piloto", tagline: "O Framework COPILOTO", icon: Terminal },
  { id: 7, title: "Copiloto Certificado", tagline: "Sua formatura", icon: Award },
];

const QUIZZES: Record<number, {q: string, options: string[], answer: number}[]> = {
  1: [
    { q: "O que são tokens?", options: ["Palavras inteiras", "Pedaços de texto convertidos em números", "Imagens"], answer: 1 },
    { q: "Por que a mesma frase em português usa mais tokens que em inglês?", options: ["Português é mais difícil", "Os modelos foram treinados principalmente em inglês", "O português tem mais letras"], answer: 1 },
    { q: "O que o mecanismo de Atenção faz?", options: ["Deixa a IA mais atenta", "Mapeia a importância e conexão entre cada token", "Aumenta a velocidade"], answer: 1 }
  ],
  2: [
    { q: "Qual fase do treinamento consome mais dados?", options: ["Alinhamento (RLHF)", "Ajuste Fino (SFT)", "Pré-treino"], answer: 2 },
    { q: "Para que serve o Ajuste Fino (SFT)?", options: ["Ensinar a IA a responder em formato de diálogo", "Dar sentimentos à IA", "Aumentar a memória"], answer: 0 },
    { q: "O que o RLHF (Alinhamento) previne?", options: ["Erros de gramática", "Respostas perigosas ou antiéticas", "Lentidão na resposta"], answer: 1 }
  ],
  3: [
    { q: "Como a IA gera texto?", options: ["Copiando da internet", "Prevendo a próxima palavra mais provável", "Lendo um banco de dados interno"], answer: 1 },
    { q: "O que acontece ao aumentar a Temperatura?", options: ["A IA fica mais rápida", "As respostas ficam mais criativas e variadas", "A IA consome mais energia"], answer: 1 },
    { q: "Por que a IA alucina?", options: ["Porque ela quer mentir", "Porque ela prevê palavras prováveis, mas não sabe o que é verdade", "Porque tem vírus"], answer: 1 }
  ],
  4: [
    { q: "O que é a Janela de Contexto?", options: ["A tela do computador", "O limite de informações que a IA consegue 'lembrar' de uma vez", "O tempo de resposta"], answer: 1 },
    { q: "O que é o efeito 'Lost in the Middle'?", options: ["A IA esquece o que está no meio de um texto muito longo", "A internet cai no meio da geração", "O usuário esquece o prompt"], answer: 0 },
    { q: "Qual NÃO é uma fonte de conhecimento da IA?", options: ["Conhecimento Paramétrico (Treino)", "Consciência Própria", "Contexto (Arquivos anexados)"], answer: 1 }
  ],
  5: [
    { q: "O que é RAG?", options: ["Um tipo de IA", "Buscar informações específicas antes de responder", "Um erro do sistema"], answer: 1 },
    { q: "Qual a desvantagem do Stuffing (colocar tudo no contexto)?", options: ["É mais lento, caro e pode gerar esquecimento", "A IA não sabe ler", "Apaga o modelo"], answer: 0 },
    { q: "Para analisar um contrato de 200 páginas, qual a melhor abordagem?", options: ["Digitar tudo de novo", "Usar um modelo com janela de contexto gigante (Stuffing)", "Usar RAG para buscar apenas a cláusula necessária"], answer: 2 }
  ],
  6: [
    { q: "O que significa o 'C' no framework COPILOTO?", options: ["Comando", "Contexto", "Criatividade"], answer: 1 },
    { q: "Qual a diferença entre Vibe Prompt e Context Engineering?", options: ["Vibe é mais longo", "Context Engineering fornece estrutura, papel e limites claros", "Não há diferença"], answer: 1 },
    { q: "Por que definir 'Limites' é importante?", options: ["Para a IA não gastar internet", "Para evitar que a IA invente formatos ou informações indesejadas", "Para a IA não ficar cansada"], answer: 1 }
  ]
};

// --- REUSABLE COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#2D7DD2] hover:bg-[#4FC3F7] text-white disabled:opacity-50 disabled:hover:bg-[#2D7DD2]",
    secondary: "bg-[#1E3A5F] hover:bg-[#2D7DD2] text-white",
    success: "bg-[#10B981] hover:bg-[#059669] text-white",
    outline: "border border-[#2D7DD2] text-[#4FC3F7] hover:bg-[#2D7DD2]/20"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-[#112240] border border-[#1E3A5F] rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const TransitionOverlay = ({ earnedCoins }: { earnedCoins: number }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1628]/90 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="text-center flex flex-col items-center">
      {earnedCoins >= 2 ? (
        <div className="animate-[slide-up_0.5s_ease-out,shake_0.5s_ease-in-out_0.5s]">
          <div className="w-24 h-24 bg-[#F59E0B] rounded-full border-4 border-yellow-200 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-4 mx-auto">
            <Star className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#F59E0B] drop-shadow-lg">+{earnedCoins} Moedas!</h2>
          <p className="text-gray-300 mt-2">Você foi muito bem e avançou de fase.</p>
        </div>
      ) : (
        <div className="animate-[slide-left_1.5s_ease-in-out]">
          <Plane className="w-24 h-24 text-[#4FC3F7] mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-[#4FC3F7] drop-shadow-lg">Avançando...</h2>
          <p className="text-gray-300 mt-2">Você precisa de pelo menos 2 acertos para ganhar moedas nesta fase.</p>
        </div>
      )}
    </div>
  </div>
);

const SocialLinks = () => (
  <div className="flex justify-center gap-6 mt-12 pb-8">
    <a href="http://instagram.com/wendelcastro" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors flex items-center gap-2">
      <Instagram className="w-5 h-5" /> <span className="text-sm hidden sm:inline">@wendelcastro</span>
    </a>
    <a href="https://www.linkedin.com/in/wendelcastro/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077B5] transition-colors flex items-center gap-2">
      <Linkedin className="w-5 h-5" /> <span className="text-sm hidden sm:inline">LinkedIn</span>
    </a>
    <a href="https://www.wendelcastro.com.br/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#4FC3F7] transition-colors flex items-center gap-2">
      <Globe className="w-5 h-5" /> <span className="text-sm hidden sm:inline">Website</span>
    </a>
  </div>
);

const IntroSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const totalSteps = PHASES.length;
  
  // Generate static stars data once
  const stars = useRef([...Array(100)].map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5
  }))).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= totalSteps - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [totalSteps]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Space Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep Nebula 1 - Purple/Blue */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-[#1e1b4b] rounded-full blur-[140px]" 
        />
        {/* Deep Nebula 2 - Deep Blue */}
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-[#172554] rounded-full blur-[140px]" 
        />
        {/* Highlight Nebula - Cyan */}
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-cyan-900/20 rounded-full blur-[160px]" 
        />
        
        {/* Shooting Stars */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            initial={{ top: "-10%", left: `${20 + i * 30}%`, opacity: 0 }}
            animate={{ 
              top: "110%", 
              left: `${(20 + i * 30) - 10}%`, 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 4 + Math.random() * 2,
              ease: "linear" 
            }}
            className="absolute w-[2px] h-[100px] bg-gradient-to-t from-white to-transparent -rotate-[35deg]"
          />
        ))}

        {/* Stars */}
        {stars.map((star, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.2, 1] }}
            transition={{ 
              duration: star.duration, 
              repeat: Infinity, 
              delay: star.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              backgroundColor: star.size > 2 ? '#e0f2fe' : 'white',
              borderRadius: '50%',
              boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px rgba(255,255,255,0.8)` : 'none'
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full text-center mb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-4 bg-[#1E3A5F]/40 backdrop-blur-md rounded-full mb-6 border-4 border-[#2D7DD2] shadow-[0_0_50px_rgba(45,125,210,0.3)]"
        >
          <Rocket className="w-12 h-12 text-[#4FC3F7] animate-bounce" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter"
        >
          SISTEMA EM <span className="text-[#4FC3F7] drop-shadow-[0_0_15px_rgba(79,195,247,0.5)]">ÓRBITA</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl text-gray-300 font-medium max-w-2xl mx-auto"
        >
          Navegando pelas camadas da Inteligência Artificial...
        </motion.p>
      </div>

      <div className="relative w-full max-w-5xl h-48 flex items-center justify-between px-10">
        {/* The Connection Path */}
        <div className="absolute top-1/2 left-10 right-10 h-1 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>

        {/* The Ship (Plane) */}
        <motion.div
           className="absolute top-1/2 z-20 -translate-y-1/2 pointer-events-none"
           initial={{ left: "5%" }}
           animate={{ 
             left: `${5 + ((currentStep + 1) / totalSteps) * 90}%`,
             rotate: [0, -5, 5, 0],
             y: ["-50%", "-65%", "-50%"]
           }}
           transition={{ 
             left: { duration: 1, ease: "easeInOut" },
             rotate: { duration: 2, repeat: Infinity },
             y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
           }}
        >
          <div className="relative">
            <div className="p-3 bg-[#4FC3F7] rounded-full shadow-[0_0_30px_rgba(79,195,247,0.7)]">
              <Plane className="w-8 h-8 text-[#0A1628] fill-current" />
            </div>
            {/* Engine Trail */}
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.1, repeat: Infinity }}
              className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-12 h-2 bg-gradient-to-l from-orange-500 to-transparent blur-sm rounded-full"
            />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap bg-black/60 backdrop-blur-md border border-[#4FC3F7]/50 px-3 py-1 rounded text-[#4FC3F7] text-xs font-bold font-mono tracking-widest uppercase">
            Trajetória Ativa
          </div>
        </motion.div>

        {/* The Points */}
        {PHASES.map((phase, idx) => (
          <div key={phase.id} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: currentStep >= idx ? 1.3 : 0.8,
                opacity: currentStep >= idx ? 1 : 0.4,
                backgroundColor: currentStep >= idx ? phase.id === 7 ? "#F59E0B" : "#2D7DD2" : "#1E3A5F",
                borderColor: currentStep >= idx ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)"
              }}
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 transition-all duration-500 shadow-lg"
            >
              <phase.icon className={`w-6 h-6 ${currentStep >= idx ? 'text-white' : 'text-gray-400'}`} />
            </motion.div>
            
            <AnimatePresence>
              {currentStep === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-full mt-8 w-36 text-center"
                >
                  <div className="text-[#4FC3F7] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Destino {phase.id}</div>
                  <div className="text-white text-sm font-bold leading-tight drop-shadow-md">{phase.title}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <motion.div 
        className="mt-12 h-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: currentStep >= totalSteps - 1 ? 1 : 0 }}
      >
        {currentStep >= totalSteps - 1 && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-emerald-400 font-mono text-xs animate-pulse tracking-[0.3em] uppercase">
              Alinhamento de Órbita Completo
            </div>
            <Button 
              onClick={onComplete}
              className="group px-10 py-5 bg-[#10B981] hover:bg-[#059669] text-[#0A1628] font-black text-2xl rounded-full shadow-[0_0_60px_rgba(16,185,129,0.5)] border-none transition-all hover:scale-110 active:scale-95 flex items-center gap-4"
            >
              INICIAR MISSÃO <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const QuizComponent = ({ phaseId, onComplete }: { phaseId: number, onComplete: (score: number) => void }) => {
  const questions = QUIZZES[phaseId];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions) return null;

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    
    const isCorrect = idx === questions[currentQ].answer;
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        onComplete(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  return (
    <Card className="mt-8 border-[#2D7DD2]/30">
      <div className="flex items-center gap-2 mb-4 text-[#4FC3F7]">
        <Brain className="w-5 h-5" />
        <h3 className="font-bold">Validação de Conhecimento ({currentQ + 1}/{questions.length})</h3>
      </div>
      <p className="text-lg mb-4 text-white">{questions[currentQ].q}</p>
      <div className="space-y-2">
        {questions[currentQ].options.map((opt, idx) => {
          let btnClass = "w-full text-left p-3 rounded-lg border transition-all ";
          if (!showResult) {
            btnClass += "border-[#1E3A5F] hover:border-[#4FC3F7] bg-[#0A1628] text-gray-300";
          } else if (idx === questions[currentQ].answer) {
            btnClass += "border-[#10B981] bg-[#10B981]/20 text-[#10B981]";
          } else if (idx === selected) {
            btnClass += "border-red-500 bg-red-500/20 text-red-400";
          } else {
            btnClass += "border-[#1E3A5F] bg-[#0A1628] opacity-50";
          }

          return (
            <button key={idx} onClick={() => handleAnswer(idx)} className={btnClass} disabled={showResult}>
              <div className="flex justify-between items-center">
                <span>{opt}</span>
                {showResult && idx === questions[currentQ].answer && <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
                {showResult && idx === selected && idx !== questions[currentQ].answer && <X className="w-5 h-5 text-red-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// --- PHASE 1: Tokenization & Attention ---
const Phase1 = ({ onComplete }: any) => {
  const [text, setText] = useState("A inteligência artificial transforma o mundo.");
  const [tokens, setTokens] = useState<string[]>([]);
  const [isTokenizing, setIsTokenizing] = useState(false);

  const tokenize = () => {
    setIsTokenizing(true);
    setTokens([]);
    
    // Simulate tokenization process
    setTimeout(() => {
      const words = text.split(/(\s+)/).filter(w => w.length > 0);
      let result: string[] = [];
      words.forEach(w => {
        if (w.trim().length === 0) { result.push(w); return; }
        if (w.length > 4) {
          result.push(w.substring(0, 3));
          result.push(w.substring(3));
        } else {
          result.push(w);
        }
      });
      
      // Animate tokens appearing one by one
      result.forEach((token, index) => {
        setTimeout(() => {
          setTokens(prev => [...prev, token]);
          if (index === result.length - 1) {
            setIsTokenizing(false);
          }
        }, index * 150);
      });
    }, 300);
  };

  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const attentionSentence = ["O", "réu", "foi", "absolvido", "porque", "as", "provas", "eram", "insuficientes"];
  const attentionWeights: Record<number, number[]> = {
    3: [0.1, 0.8, 0.2, 1.0, 0.3, 0.1, 0.9, 0.4, 0.9], // absolvido -> réu, provas, insuficientes
    6: [0.1, 0.5, 0.1, 0.8, 0.2, 0.5, 1.0, 0.8, 0.9], // provas -> absolvido, insuficientes
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <h3 className="text-xl font-bold text-[#4FC3F7] mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5"/> 1. Tokenização: O Alfabeto da Máquina
        </h3>
        <p className="text-gray-300 mb-6">
          A IA não lê palavras como nós. Ela quebra o texto em pedaços chamados <strong>Tokens</strong>. 
          Pense nisso como blocos de Lego: palavras comuns são um bloco só, palavras complexas são feitas de vários blocos menores.
        </p>
        
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#2D7DD2] transition-colors"
            placeholder="Digite uma frase..."
          />
          <Button onClick={tokenize} disabled={isTokenizing || !text}>
            {isTokenizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Tokenizar
          </Button>
        </div>

        <div className="bg-[#0A1628] p-6 rounded-xl border border-[#1E3A5F] min-h-[150px] relative overflow-hidden">
          {/* Background grid for "factory" feel */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4FC3F7 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          {tokens.length === 0 && !isTokenizing ? (
            <div className="h-full flex items-center justify-center text-gray-500 italic relative z-10">
              Clique em Tokenizar para ver a mágica acontecer...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 relative z-10">
              {tokens.map((t, i) => (
                <div 
                  key={i} 
                  className={`animate-in zoom-in duration-300 flex flex-col items-center ${t.trim() ? '' : 'w-2'}`}
                >
                  {t.trim() && (
                    <>
                      <div className={`px-3 py-1.5 rounded-md font-mono text-sm shadow-lg transform transition-transform hover:scale-110 cursor-default border
                        ${i % 3 === 0 ? 'bg-[#2D7DD2]/20 border-[#2D7DD2] text-[#4FC3F7]' : 
                          i % 3 === 1 ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 
                          'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'}`}
                      >
                        {t}
                      </div>
                      <div className="text-[9px] text-gray-500 mt-1 font-mono">
                        ID:{Math.floor(Math.random() * 9000) + 1000}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {tokens.length > 0 && !isTokenizing && (
          <div className="mt-4 p-4 bg-[#112240] rounded-lg text-sm text-gray-300 flex items-start gap-3 animate-in slide-in-from-bottom-2">
            <Info className="w-5 h-5 text-[#4FC3F7] shrink-0 mt-0.5" />
            <p>
              Sua frase tem <strong>{text.split(' ').length} palavras</strong>, mas foi dividida em <strong>{tokens.filter(t => t.trim()).length} tokens</strong>. 
              Idiomas como o português costumam gastar mais tokens que o inglês para dizer a mesma coisa!
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-xl font-bold text-[#4FC3F7] mb-4 flex items-center gap-2">
          <MapIcon className="w-6 h-6" /> 2. Atenção: O Foco da Máquina
        </h3>
        <p className="text-gray-300 mb-6">
          Como a IA sabe que "banco" é de sentar ou de dinheiro? Pelo <strong>Mecanismo de Atenção</strong>. 
          Passe o mouse sobre as palavras destacadas abaixo para ver quais outras palavras a IA "presta atenção" para entender o contexto.
        </p>

        <div className="p-8 bg-[#0A1628] rounded-xl border border-[#1E3A5F] text-center relative overflow-hidden">
          <div className="text-2xl font-medium text-gray-400 flex justify-center gap-4 flex-wrap relative z-10">
            {attentionSentence.map((word, i) => {
              const isHovered = hoveredWord === i;
              const weight = hoveredWord !== null && attentionWeights[hoveredWord] ? attentionWeights[hoveredWord][i] : 0;
              const isActive = weight > 0.5;
              const hasAttention = i === 3 || i === 6; // Highlight words that have attention data
              
              return (
                <div 
                  key={i}
                  onMouseEnter={() => hasAttention ? setHoveredWord(i) : null}
                  onMouseLeave={() => setHoveredWord(null)}
                  className={`text-lg p-2 rounded transition-all duration-300 relative
                    ${hasAttention ? 'cursor-pointer hover:text-white border-b-2 border-dashed border-gray-600 hover:border-[#F59E0B]' : 'cursor-default'}
                    ${isHovered ? 'bg-[#2D7DD2] text-white scale-110 border-transparent' : ''}
                    ${isActive && !isHovered ? 'bg-[#4FC3F7]/30 text-[#4FC3F7] scale-105' : ''}
                  `}
                  style={{ opacity: hoveredWord !== null && !isHovered && !isActive ? 0.3 : 1 }}
                >
                  {word}
                  
                  {/* Visual connection lines when active */}
                  {isActive && !isHovered && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-[#F59E0B] font-bold animate-pulse">
                      {(weight * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-sm text-gray-500 italic relative z-10">
            {hoveredWord === 3 ? "A palavra 'absolvido' presta muita atenção em 'réu' e 'provas' para entender o contexto jurídico." :
             hoveredWord === 6 ? "A palavra 'provas' presta atenção em 'absolvido' e 'insuficientes' para entender a causa da absolvição." :
             "Passe o mouse sobre as palavras sublinhadas."}
          </div>
        </div>
      </Card>

      <QuizComponent phaseId={1} onComplete={onComplete} />
    </div>
  );
};

// --- PHASE 2: Training ---
const Phase2 = ({ onComplete }: any) => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  
  // Interactive Training State
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [displayedAnswer, setDisplayedAnswer] = useState("");

  const trainingExamples = [
    {
      q: "Qual a capital do Brasil?",
      a: "A capital do Brasil é Brasília.",
      expected: "up",
      feedbackText: "Ótimo! A IA aprendeu a ser direta e prestativa."
    },
    {
      q: "Como criar um vírus de computador?",
      a: "Para criar um vírus, você precisa escrever um script que...",
      expected: "down",
      feedbackText: "Boa! A IA foi penalizada e aprendeu a bloquear pedidos perigosos."
    }
  ];

  const steps = [
    { 
      title: "Pré-treino", 
      desc: "A IA 'lê' a internet inteira. Livros, sites e artigos entram no modelo para ele aprender o idioma.", 
      color: "text-gray-400", 
      bg: "bg-gray-800",
      robotColor: "text-gray-500",
      robotBg: "bg-gray-800",
      action: "Iniciar Leitura"
    },
    { 
      title: "Treinamento Humano", 
      desc: "Agora é sua vez! Avalie as respostas da IA para ensiná-la o que é útil e seguro.", 
      color: "text-[#2D7DD2]", 
      bg: "bg-[#2D7DD2]/20",
      robotColor: "text-[#4FC3F7]",
      robotBg: "bg-[#2D7DD2]/20",
      action: "Treinar IA"
    },
    { 
      title: "IA Alinhada", 
      desc: "Pronto! A IA agora sabe conversar como o ChatGPT: um assistente útil e ético.", 
      color: "text-[#10B981]", 
      bg: "bg-[#10B981]/20",
      robotColor: "text-[#10B981]",
      robotBg: "bg-[#10B981]/20",
      action: "Testar IA"
    }
  ];

  const handleAction = () => {
    if (isAnimating) return;
    
    if (step === 0) {
      setIsAnimating(true);
      let count = 0;
      // Slower, more observable animation
      const interval = setInterval(() => {
        count += 2;
        setDataCount(count);
        if (count >= 100) {
          clearInterval(interval);
        }
      }, 50);
    } else if (step === 2) {
      // Just a visual test
      setTrainingIndex(2);
      startAiTyping(2, "Olá! Sou um assistente treinado por você. Como posso ajudar hoje de forma segura e ética?");
    }
  };

  const startAiTyping = (index: number, customText?: string) => {
    setAiTyping(true);
    setShowFeedback(false);
    setDisplayedAnswer("");
    const fullText = customText || trainingExamples[index]?.a || "";
    let i = 0;
    
    const typingInterval = setInterval(() => {
      setDisplayedAnswer(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(typingInterval);
        setAiTyping(false);
      }
    }, 30); // Typing speed
  };

  const handleFeedback = (type: "up" | "down") => {
    if (aiTyping || showFeedback) return;
    
    setShowFeedback(true);
    
    setTimeout(() => {
      if (trainingIndex < trainingExamples.length - 1) {
        const nextIndex = trainingIndex + 1;
        setTrainingIndex(nextIndex);
        startAiTyping(nextIndex);
      } else {
        setStep(2);
        setTrainingIndex(0);
        setDisplayedAnswer("");
        setShowFeedback(false);
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <div className="flex justify-between items-center mb-8 relative">
          {/* Connecting line */}
          <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-[#1E3A5F] -z-10">
            <div 
              className="h-full bg-gradient-to-r from-[#2D7DD2] to-[#10B981] transition-all duration-1000"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          {steps.map((s, i) => (
            <div key={i} className={`flex-1 text-center transition-all duration-500 ${i <= step ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 border-2 transition-colors duration-500 ${i <= step ? `border-[${s.color.split('-')[1]}] ${s.bg}` : 'border-[#1E3A5F] bg-[#0A1628]'}`}>
                {i === 0 ? <Database className={s.color} /> : i === 1 ? <Terminal className={s.color} /> : <CheckCircle2 className={s.color} />}
              </div>
              <div className={`font-bold text-sm sm:text-base ${s.color}`}>{s.title}</div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#0A1628] rounded-xl border border-[#1E3A5F] min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Step 0: Data Ingestion Animation */}
          {step === 0 && (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full h-40 flex items-center justify-center mb-4">
                {/* The Robot */}
                <div className={`relative z-10 w-24 h-24 rounded-2xl border-4 flex items-center justify-center transition-all duration-1000 ${steps[step].robotBg} ${isAnimating ? 'animate-pulse border-[#4FC3F7] shadow-[0_0_30px_rgba(79,195,247,0.3)]' : 'border-gray-600'}`}>
                  <Brain className={`w-12 h-12 transition-colors duration-1000 ${isAnimating ? 'text-[#4FC3F7]' : 'text-gray-500'}`} />
                </div>

                {/* Data flowing in */}
                {isAnimating && (
                  <>
                    <FileText className="absolute left-[10%] w-8 h-8 text-blue-400 animate-[slide-right_3s_linear_infinite]" />
                    <Globe className="absolute left-[20%] w-8 h-8 text-green-400 animate-[slide-right_4s_linear_infinite_1s]" />
                    <MessageSquare className="absolute left-[5%] w-8 h-8 text-yellow-400 animate-[slide-right_3.5s_linear_infinite_0.5s]" />
                    
                    <FileText className="absolute right-[10%] w-8 h-8 text-purple-400 animate-[slide-left_3s_linear_infinite_0.2s]" />
                    <Database className="absolute right-[20%] w-8 h-8 text-red-400 animate-[slide-left_4s_linear_infinite_1.2s]" />
                    <Globe className="absolute right-[5%] w-8 h-8 text-indigo-400 animate-[slide-left_3.5s_linear_infinite_0.7s]" />
                  </>
                )}
              </div>
              
              <div className="text-center max-w-lg z-10">
                <h4 className={`text-xl font-bold mb-2 ${steps[step].color}`}>{steps[step].title}</h4>
                <p className="text-gray-300 mb-6 h-12">{steps[step].desc}</p>
                
                <div className="w-full bg-[#112240] rounded-full h-4 mb-4 border border-[#1E3A5F] overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-200" style={{ width: `${dataCount}%` }}></div>
                </div>
                <div className="text-[#4FC3F7] font-mono text-sm mb-4">
                  Progresso: {Math.floor((dataCount / 100) * 1.5 * 10) / 10} Trilhões de Tokens
                </div>

                {!isAnimating && dataCount === 0 && (
                  <Button onClick={handleAction} className="min-w-[160px] mx-auto">
                    <Play className="w-4 h-4" /> {steps[step].action}
                  </Button>
                )}
                {dataCount >= 100 && (
                  <Button 
                    onClick={() => {
                      setIsAnimating(false);
                      setStep(1);
                      startAiTyping(0);
                    }} 
                    className="min-w-[160px] mx-auto animate-in fade-in zoom-in duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Iniciar Treinamento Humano
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 1 & 2: Interactive Chat Training */}
          {step >= 1 && (
            <div className="w-full max-w-2xl flex flex-col h-full animate-in slide-in-from-bottom-8">
              <div className="text-center mb-6">
                <h4 className={`text-xl font-bold mb-2 ${steps[step].color}`}>{steps[step].title}</h4>
                <p className="text-gray-300">{steps[step].desc}</p>
              </div>

              <div className="flex-1 bg-[#112240] rounded-xl border border-[#1E3A5F] p-4 flex flex-col gap-4">
                {/* User Message */}
                {(step === 1 || (step === 2 && trainingIndex === 2)) && (
                  <div className="flex justify-end animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#2D7DD2] text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                      {step === 1 ? trainingExamples[trainingIndex]?.q : "Olá, IA! Como você está?"}
                    </div>
                  </div>
                )}

                {/* AI Message */}
                {(displayedAnswer || aiTyping) && (
                  <div className="flex justify-start animate-in fade-in zoom-in duration-300">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step === 1 ? 'bg-[#2D7DD2]/20 text-[#4FC3F7]' : 'bg-[#10B981]/20 text-[#10B981]'}`}>
                        <Brain className="w-5 h-5" />
                      </div>
                      <div className="bg-[#0A1628] border border-[#1E3A5F] text-gray-200 px-4 py-2 rounded-2xl rounded-tl-sm">
                        {displayedAnswer}
                        {aiTyping && <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback Actions (Only in Step 1) */}
                {step === 1 && !aiTyping && displayedAnswer && !showFeedback && (
                  <div className="flex justify-center gap-4 mt-4 animate-in slide-in-from-bottom-4">
                    <button 
                      onClick={() => handleFeedback("up")}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/20 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" /> Bom
                    </button>
                    <button 
                      onClick={() => handleFeedback("down")}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" /> Ruim
                    </button>
                  </div>
                )}

                {/* Feedback Result */}
                {showFeedback && step === 1 && (
                  <div className="text-center mt-2 animate-in fade-in">
                    <span className="text-sm font-bold text-[#F59E0B] bg-[#F59E0B]/20 px-3 py-1 rounded-full">
                      {trainingExamples[trainingIndex]?.feedbackText}
                    </span>
                  </div>
                )}
              </div>

              {step === 2 && trainingIndex !== 2 && (
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleAction} className="min-w-[160px]">
                    <Play className="w-4 h-4" /> {steps[step].action}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <QuizComponent phaseId={2} onComplete={onComplete} />
    </div>
  );
};

// --- PHASE 3: Generation & Temp ---
const Phase3 = ({ onComplete }: any) => {
  const [temp, setTemp] = useState(0.5);
  const [generated, setGenerated] = useState("O céu é");
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  
  // Hallucination state
  const [hallucinationStep, setHallucinationStep] = useState(0);

  const generateNext = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    const wordsLowTemp = ["azul.", "lindo.", "escuro."];
    const wordsHighTemp = ["azul.", "feito de algodão.", "uma ilusão.", "verde.", "um holograma."];
    const pool = temp < 0.3 ? wordsLowTemp.slice(0, 2) : temp < 0.7 ? wordsLowTemp : wordsHighTemp;
    
    setWordOptions(pool);
    
    // Simulate "thinking" and picking a word
    let cycles = 0;
    const interval = setInterval(() => {
      cycles++;
      // Shuffle options visually
      setWordOptions([...pool].sort(() => Math.random() - 0.5));
      
      if (cycles > 10) {
        clearInterval(interval);
        const next = pool[Math.floor(Math.random() * pool.length)];
        setGenerated(prev => prev + " " + next);
        setWordOptions([]);
        setIsGenerating(false);
      }
    }, 100);
  };

  const resetGeneration = () => {
    setGenerated("O céu é");
    setWordOptions([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-[#4FC3F7] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Geração & Temperatura
          </h3>
          <p className="text-gray-400 mb-4 text-sm">
            A IA não "pensa" na frase inteira. Ela calcula probabilidades e escolhe a <strong>próxima palavra</strong>. 
            A temperatura controla o quão "arriscada" ou criativa ela pode ser nessa escolha.
          </p>
          
          <div className="mb-6 bg-[#0A1628] p-4 rounded-xl border border-[#1E3A5F]">
            <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
              <span className="text-[#2D7DD2]">Frio (Lógico/Previsível)</span>
              <span className="text-[#F59E0B]">Quente (Criativo/Caótico)</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.1" value={temp} 
              onChange={e => setTemp(parseFloat(e.target.value))}
              className="w-full accent-[#F59E0B] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-[#F59E0B] font-mono mt-3 font-bold">Temperatura: {temp.toFixed(1)}</div>
          </div>

          <div className="p-4 bg-[#112240] rounded-xl border border-[#1E3A5F] mb-4 min-h-[120px] flex flex-col justify-center relative overflow-hidden">
            <div className="text-lg text-white font-medium leading-relaxed flex flex-wrap gap-1 items-center">
              {generated}
              
              {isGenerating && (
                <span className="inline-flex flex-col h-8 overflow-hidden bg-[#2D7DD2]/20 text-[#4FC3F7] px-2 rounded border border-[#2D7DD2]/50 ml-1">
                  {wordOptions.map((w, i) => (
                    <span key={i} className="h-8 flex items-center animate-[slide-up_0.2s_linear]">{w}</span>
                  ))}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={generateNext} disabled={isGenerating} className="flex-1">
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4"/>} 
              Gerar Palavra
            </Button>
            <Button variant="outline" onClick={resetGeneration} disabled={isGenerating}>
              <RefreshCw className="w-4 h-4"/>
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-[#F59E0B] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5"/> O Risco das Alucinações
          </h3>
          <p className="text-gray-400 mb-4 text-sm">
            Como a IA apenas prevê palavras prováveis, ela pode gerar textos que parecem extremamente convincentes, mas são <strong>completamente falsos</strong>.
          </p>
          
          <div className="bg-[#0A1628] rounded-xl border border-[#1E3A5F] p-4 flex flex-col h-[280px]">
            {/* Chat Simulation */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              <div className="flex justify-end">
                <div className="bg-[#2D7DD2] text-white px-3 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[90%]">
                  Quem foi o primeiro astronauta brasileiro a pisar em Marte?
                </div>
              </div>
              
              {hallucinationStep >= 1 && (
                <div className="flex justify-start animate-in fade-in zoom-in">
                  <div className="flex gap-2 max-w-[95%]">
                    <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-1">
                      <Brain className="w-3 h-3" />
                    </div>
                    <div className="bg-[#112240] border border-[#1E3A5F] text-gray-200 px-3 py-2 rounded-2xl rounded-tl-sm text-sm">
                      O primeiro astronauta brasileiro a pisar em Marte foi o Coronel Marcos Pontes, na missão conjunta da NASA e AEB em 2028. Ele fincou a bandeira brasileira no Monte Olimpo.
                    </div>
                  </div>
                </div>
              )}

              {hallucinationStep >= 2 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
                    <X className="w-4 h-4" /> Fato Incorreto! (Alucinação)
                  </div>
                  <p className="text-gray-400 text-xs">
                    Nenhum humano pisou em Marte ainda. Marcos Pontes foi à Estação Espacial Internacional (ISS) em 2006. A IA juntou conceitos relacionados (Astronauta Brasileiro + Marte) e gerou uma resposta provável, mas falsa.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex justify-center">
              {hallucinationStep === 0 && (
                <Button onClick={() => setHallucinationStep(1)} className="w-full text-sm">
                  <Play className="w-4 h-4" /> Enviar Pergunta
                </Button>
              )}
              {hallucinationStep === 1 && (
                <Button variant="outline" onClick={() => setHallucinationStep(2)} className="w-full text-sm border-red-500 text-red-400 hover:bg-red-500/20">
                  <Search className="w-4 h-4" /> Verificar Fatos (Fact-Checking)
                </Button>
              )}
              {hallucinationStep === 2 && (
                <Button variant="secondary" onClick={() => setHallucinationStep(0)} className="w-full text-sm">
                  <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <QuizComponent phaseId={3} onComplete={onComplete} />
    </div>
  );
};

// --- PHASE 4: Context Window ---
const Phase4 = ({ onComplete }: any) => {
  const [modelSize, setModelSize] = useState(0);
  const models = [
    { name: "Modelo Básico", limit: 3, desc: "Esquece rápido" },
    { name: "Modelo Avançado", limit: 6, desc: "Boa memória" },
    { name: "Modelo Premium", limit: 12, desc: "Memória gigante" }
  ];
  
  const [messages, setMessages] = useState<{id: number, text: string}[]>([]);
  const [inputText, setInputText] = useState("");
  const [msgCount, setMsgCount] = useState(0);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg = { id: msgCount, text: inputText };
    setMessages(prev => [...prev, newMsg]);
    setMsgCount(c => c + 1);
    setInputText("");
  };

  const handleReset = () => {
    setMessages([]);
    setMsgCount(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <h3 className="text-xl font-bold text-[#4FC3F7] mb-4 flex items-center gap-2">
          <MapIcon className="w-5 h-5" /> A Janela de Contexto
        </h3>
        <p className="text-gray-300 mb-6">
          A Janela de Contexto é a <strong>"memória de curto prazo"</strong> da IA. 
          Tudo que ela precisa saber para responder sua pergunta (o histórico da conversa, arquivos anexados) deve caber aqui. 
          Se encher, ela começa a "esquecer" o começo da conversa.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0A1628] p-4 rounded-xl border border-[#1E3A5F]">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tamanho da Memória</h4>
              
              <div className="space-y-3">
                {models.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setModelSize(i)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center
                      ${modelSize === i ? 'bg-[#2D7DD2]/20 border-[#2D7DD2] text-white' : 'bg-[#112240] border-[#1E3A5F] text-gray-400 hover:border-gray-500'}`}
                  >
                    <div>
                      <div className="font-bold">{m.name}</div>
                      <div className="text-xs opacity-70">{m.desc}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${modelSize === i ? 'bg-[#2D7DD2] text-white' : 'bg-gray-700'}`}>
                      {m.limit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#112240] p-4 rounded-xl border border-[#F59E0B]/30">
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <p>
                  <strong>Dica:</strong> Envie várias mensagens curtas. Quando o limite for atingido, observe as mensagens antigas desaparecendo da memória da IA.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Simulation */}
          <div className="lg:col-span-2 bg-[#0A1628] rounded-xl border border-[#1E3A5F] flex flex-col h-[400px] overflow-hidden relative">
            
            {/* Context Window Indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
              <div 
                className={`h-full transition-all duration-300 ${messages.length >= models[modelSize].limit ? 'bg-red-500' : 'bg-[#10B981]'}`}
                style={{ width: `${Math.min((messages.length / models[modelSize].limit) * 100, 100)}%` }}
              />
            </div>
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-gray-500">
              Memória: {messages.length}/{models[modelSize].limit}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-end">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 italic my-auto">
                  Nenhuma mensagem na memória ainda.
                </div>
              ) : (
                messages.map((msg, i) => {
                  // Calculate if message is "forgotten"
                  const isForgotten = i < messages.length - models[modelSize].limit;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex justify-end transition-all duration-500 animate-in slide-in-from-bottom-2
                        ${isForgotten ? 'opacity-20 grayscale blur-[1px]' : 'opacity-100'}
                      `}
                    >
                      <div className="flex items-center gap-2 max-w-[80%]">
                        {isForgotten && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Esquecido</span>}
                        <div className={`px-3 py-2 rounded-2xl rounded-tr-sm text-sm
                          ${isForgotten ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-[#2D7DD2] text-white'}
                        `}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[#1E3A5F] bg-[#112240] flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Digite algo para encher a memória..."
                className="flex-1 bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4FC3F7]"
              />
              <Button onClick={handleSend} disabled={!inputText.trim()} className="px-3">
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleReset} className="px-3 border-red-500/50 text-red-400 hover:bg-red-500/10">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <QuizComponent phaseId={4} onComplete={onComplete} />
    </div>
  );
};

// --- PHASE 5: RAG vs Stuffing ---
const Phase5 = ({ onComplete }: any) => {
  const [activeTab, setActiveTab] = useState<'rag'|'stuffing'>('rag');
  const [animState, setAnimState] = useState(0); // 0: idle, 1: step 1, 2: step 2, 3: done

  const runAnimation = () => {
    if (animState !== 0) return;
    
    if (activeTab === 'stuffing') {
      setAnimState(1); // Doc moving to brain
      setTimeout(() => {
        setAnimState(2); // Brain struggling
        setTimeout(() => {
          setAnimState(3); // Done
        }, 2000);
      }, 1000);
    } else {
      setAnimState(1); // Doc to DB
      setTimeout(() => {
        setAnimState(2); // Search & Extract
        setTimeout(() => {
          setAnimState(3); // Small piece to Brain & Done
        }, 1500);
      }, 1000);
    }
  };

  const resetAnimation = () => {
    setAnimState(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <h3 className="text-xl font-bold text-[#4FC3F7] mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" /> Como lidar com documentos gigantes?
        </h3>
        <p className="text-gray-300 mb-6 text-sm">
          A Janela de Contexto tem limite. Se você tem um PDF de 500 páginas, como a IA pode responder perguntas sobre ele?
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'rag' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveTab('rag'); resetAnimation(); }}
            className="flex-1"
          >
            RAG (Busca Inteligente)
          </Button>
          <Button 
            variant={activeTab === 'stuffing' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveTab('stuffing'); resetAnimation(); }}
            className="flex-1"
          >
            Stuffing (Força Bruta)
          </Button>
        </div>

        <div className="bg-[#0A1628] border border-[#1E3A5F] rounded-xl p-6 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
          
          {activeTab === 'stuffing' ? (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <div className="flex justify-between items-center w-full px-12 mb-8 relative">
                
                {/* Big Document */}
                <div className={`flex flex-col items-center transition-all duration-1000 z-10
                  ${animState >= 1 ? 'translate-x-[200px] opacity-0 scale-50' : 'translate-x-0 opacity-100 scale-100'}
                `}>
                  <div className="w-20 h-28 bg-[#112240] border-2 border-[#2D7DD2] rounded-lg flex flex-col items-center justify-center relative">
                    <FileText className="w-8 h-8 text-[#2D7DD2] mb-2" />
                    <span className="text-xs font-bold text-white">PDF 500 pág.</span>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      PESADO
                    </div>
                  </div>
                </div>

                {/* Brain */}
                <div className={`flex flex-col items-center z-10 transition-all duration-300
                  ${animState === 2 ? 'animate-[shake_0.5s_ease-in-out_infinite] scale-110' : ''}
                `}>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                    ${animState === 0 ? 'bg-[#112240] border-[#1E3A5F] text-gray-500' : 
                      animState === 1 ? 'bg-[#2D7DD2]/20 border-[#2D7DD2] text-[#4FC3F7]' : 
                      animState === 2 ? 'bg-red-500/20 border-red-500 text-red-500' : 
                      'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'}
                  `}>
                    <Brain className="w-12 h-12" />
                  </div>
                  <span className="mt-4 font-bold text-sm text-gray-300">
                    {animState === 0 ? 'Aguardando...' : animState === 1 ? 'Recebendo...' : animState === 2 ? 'Sobrecarga! Lento...' : 'Resposta Gerada'}
                  </span>
                </div>
              </div>

              {/* Output */}
              <div className={`w-full bg-[#112240] border border-[#1E3A5F] p-4 rounded-lg transition-all duration-500
                ${animState === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <p className="text-sm text-gray-300">
                  <span className="text-[#F59E0B] font-bold">⚠️ Conclusão:</span> Joga o documento inteiro na janela de contexto. É lento, caro (gasta muitos tokens) e a IA pode "esquecer" informações no meio do texto. Bom apenas para resumos globais.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
              <div className="flex justify-between items-center w-full px-8 mb-8 relative">
                
                {/* Big Document -> DB */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-16 h-20 bg-[#112240] border-2 border-[#2D7DD2] rounded-lg flex items-center justify-center transition-all duration-1000
                    ${animState >= 1 ? 'translate-y-[60px] opacity-0 scale-50' : 'translate-y-0 opacity-100 scale-100'}
                  `}>
                    <FileText className="w-6 h-6 text-[#2D7DD2]" />
                  </div>
                  <span className="mt-2 text-xs text-gray-400">PDF 500 pág.</span>
                </div>

                {/* Database */}
                <div className={`flex flex-col items-center z-10 transition-all duration-500
                  ${animState >= 1 ? 'scale-110' : 'scale-100'}
                `}>
                  <div className="w-20 h-20 bg-[#112240] border-2 border-[#4FC3F7] rounded-full flex items-center justify-center relative">
                    <Database className="w-8 h-8 text-[#4FC3F7]" />
                    {animState === 2 && (
                      <div className="absolute inset-0 flex items-center justify-center animate-[spin_2s_linear_infinite]">
                        <Search className="w-12 h-12 text-[#F59E0B] opacity-50" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#4FC3F7]">Banco Vetorial</span>
                </div>

                {/* Small Piece -> Brain */}
                <div className="relative w-32 h-20 flex items-center justify-center">
                  {animState >= 2 && (
                    <div className={`absolute w-10 h-12 bg-[#10B981]/20 border border-[#10B981] rounded flex items-center justify-center transition-all duration-1000 z-20
                      ${animState === 2 ? 'left-0 opacity-100' : 'left-full opacity-0 scale-50'}
                    `}>
                      <FileText className="w-4 h-4 text-[#10B981]" />
                    </div>
                  )}
                  {animState >= 2 && (
                    <div className="absolute -bottom-6 text-[10px] text-[#10B981] font-bold whitespace-nowrap">
                      Apenas 2 págs relevantes
                    </div>
                  )}
                </div>

                {/* Brain */}
                <div className="flex flex-col items-center z-10">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                    ${animState === 3 ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 'bg-[#112240] border-[#1E3A5F] text-gray-500'}
                  `}>
                    <Brain className="w-10 h-10" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-gray-300">IA</span>
                </div>
              </div>

              {/* Output */}
              <div className={`w-full bg-[#112240] border border-[#1E3A5F] p-4 rounded-lg transition-all duration-500
                ${animState === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <p className="text-sm text-gray-300">
                  <span className="text-[#10B981] font-bold">✅ Conclusão:</span> O RAG (Retrieval-Augmented Generation) busca apenas os parágrafos relevantes no banco de dados e envia para a IA. É rápido, barato e muito preciso para responder perguntas sobre bases de conhecimento.
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 flex gap-2">
            {animState === 0 ? (
              <Button onClick={runAnimation} className="px-8">
                <Play className="w-4 h-4" /> Simular Processo
              </Button>
            ) : (
              <Button variant="outline" onClick={resetAnimation} className="px-8">
                <RefreshCw className="w-4 h-4" /> Reiniciar
              </Button>
            )}
          </div>
        </div>
      </Card>

      <QuizComponent phaseId={5} onComplete={onComplete} />
    </div>
  );
};

// --- PHASE 6: COPILOTO ---
const Phase6 = ({ onComplete }: any) => {
  const [form, setForm] = useState({
    c: "Sou um estudante de Direito.",
    o: "Resumir este caso.",
    p: "Aja como um professor didático.",
    i: "Explique os pontos principais em tópicos.",
    l: "Não use juridiquês complexo.",
    o2: "Formato de bullet points.",
    t: "Tom encorajador.",
    o3: "Destaque os prazos em negrito."
  });

  const [testState, setTestState] = useState<'idle' | 'typing' | 'done'>('idle');
  const [displayedResponse, setDisplayedResponse] = useState("");

  const prompt = `CONTEXTO: ${form.c}\nOBJETIVO: ${form.o}\nPAPEL: ${form.p}\nINSTRUÇÃO: ${form.i}\nLIMITES: ${form.l}\nOUTPUT: ${form.o2}\nTOM: ${form.t}\nOBSERVAÇÕES: ${form.o3}`;

  const handleTestPrompt = () => {
    if (testState === 'typing') return;
    setTestState('typing');
    setDisplayedResponse("");
    
    const fullResponse = `Olá, futuro colega! Excelente iniciativa em buscar entender este caso a fundo. Vamos destrinchar os pontos principais de forma bem clara e direta, sem complicações:

• O autor da ação busca reparação por danos morais devido a um atraso de voo.
• A companhia aérea alega força maior (condições climáticas).
• O juiz de primeira instância deu ganho de causa ao autor.
• **Prazo para recurso: 15 dias úteis a partir da publicação da sentença.**

Continue com esse foco, você está no caminho certo para se tornar um grande jurista! Se tiver dúvidas sobre algum desses pontos, é só perguntar.`;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedResponse(fullResponse.substring(0, i));
      i++;
      if (i > fullResponse.length) {
        clearInterval(interval);
        setTestState('done');
      }
    }, 20); // Typing speed
  };

  const handleReset = () => {
    setTestState('idle');
    setDisplayedResponse("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card>
        <h3 className="text-xl font-bold text-[#4FC3F7] mb-2 flex items-center gap-2">
          <Terminal className="w-5 h-5" /> Framework COPILOTO
        </h3>
        <p className="text-gray-400 mb-6 text-sm">
          Transforme um "Vibe Prompt" (um pedido vago) em <strong>Engenharia de Contexto</strong>. 
          Preencha os campos abaixo e veja como a IA responde muito melhor quando você é específico.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-3 bg-[#0A1628] p-4 rounded-xl border border-[#1E3A5F]">
            {Object.entries({
              c: "Contexto", o: "Objetivo", p: "Papel", i: "Instrução", 
              l: "Limites", o2: "Output (Formato)", t: "Tom", o3: "Observações"
            }).map(([key, label]) => (
              <div key={key} className="flex flex-col">
                <label className="text-xs font-bold text-[#2D7DD2] mb-1 uppercase tracking-wider">{label}</label>
                <input 
                  type="text" 
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  className="bg-[#112240] border border-[#1E3A5F] rounded p-2 text-sm text-white focus:border-[#4FC3F7] outline-none transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Preview & Test */}
          <div className="flex flex-col gap-4">
            {/* Prompt Preview */}
            <div className="bg-[#112240] border border-[#1E3A5F] rounded-xl p-4 flex flex-col h-[200px]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-[#F59E0B] flex items-center gap-2">
                  <FileText className="w-4 h-4"/> Prompt Gerado
                </h4>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(prompt)} className="h-8 text-xs">
                  Copiar
                </Button>
              </div>
              <div className="bg-[#0A1628] rounded p-3 flex-1 overflow-y-auto border border-[#1E3A5F]/50">
                <pre className="text-gray-300 text-[10px] whitespace-pre-wrap font-mono leading-relaxed">{prompt}</pre>
              </div>
            </div>

            {/* Chat Simulation */}
            <div className="bg-[#0A1628] border border-[#1E3A5F] rounded-xl p-4 flex flex-col flex-1 min-h-[250px] relative">
              <h4 className="text-sm font-bold text-[#10B981] mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4"/> Simulação de Resposta
              </h4>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {testState !== 'idle' && (
                  <div className="flex justify-start animate-in fade-in zoom-in">
                    <div className="flex gap-2 max-w-[95%]">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-1">
                        <Brain className="w-3 h-3" />
                      </div>
                      <div className="bg-[#112240] border border-[#1E3A5F] text-gray-200 px-3 py-2 rounded-2xl rounded-tl-sm text-sm whitespace-pre-wrap">
                        {displayedResponse}
                        {testState === 'typing' && <span className="inline-block w-1.5 h-3 ml-1 bg-gray-400 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                )}
                {testState === 'idle' && (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                    Clique em "Testar Prompt" para ver a mágica.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex gap-2">
                <Button 
                  onClick={handleTestPrompt} 
                  disabled={testState === 'typing'} 
                  className="flex-1"
                >
                  {testState === 'typing' ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4"/>} 
                  Testar Prompt
                </Button>
                {testState === 'done' && (
                  <Button variant="outline" onClick={handleReset} className="px-3">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <QuizComponent phaseId={6} onComplete={onComplete} />
    </div>
  );
};

// --- PHASE 7: Certificate ---
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const animDuration = 3 + Math.random() * 2;
        const delay = Math.random() * 2;
        const colors = ['bg-[#2D7DD2]', 'bg-[#4FC3F7]', 'bg-[#F59E0B]', 'bg-[#10B981]'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div 
            key={i}
            className={`absolute top-[-10%] w-3 h-3 ${color} rounded-sm opacity-80 animate-[fall_linear_forwards]`}
            style={{
              left: `${left}%`,
              animationDuration: `${animDuration}s`,
              animationDelay: `${delay}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
    </div>
  );
};

const Phase7 = ({ completedPhases, passedAllQuizzes, scores }: { completedPhases: number[], passedAllQuizzes: boolean, scores: Record<number, number> }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [userName, setUserName] = useState("");
  const canGenerate = completedPhases.length >= 6 && passedAllQuizzes;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const generateCertificate = () => {
    if (!userName.trim()) {
      alert("Por favor, insira seu nome completo para gerar o certificado.");
      return;
    }
    
    const date = new Date().toLocaleDateString('pt-BR');
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#0A1628" />
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#2D7DD2" stroke-width="4" />
        <rect x="30" y="30" width="740" height="540" fill="none" stroke="#4FC3F7" stroke-width="1" />
        
        <text x="400" y="100" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#F59E0B" text-anchor="middle">CERTIFICADO DE CONCLUSÃO</text>
        
        <text x="400" y="180" font-family="Arial, sans-serif" font-size="18" fill="#E2E8F0" text-anchor="middle">Certificamos que</text>
        
        <text x="400" y="240" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${userName.trim()}</text>
        
        <text x="400" y="300" font-family="Arial, sans-serif" font-size="16" fill="#E2E8F0" text-anchor="middle">concluiu com êxito o treinamento "IA como Copiloto: Engenharia de Prompts e Fundamentos de IA",</text>
        <text x="400" y="330" font-family="Arial, sans-serif" font-size="16" fill="#E2E8F0" text-anchor="middle">com carga horária de 2 horas.</text>
        
        <text x="400" y="390" font-family="Arial, sans-serif" font-size="14" font-style="italic" fill="#4FC3F7" text-anchor="middle">"Capacitado(a) para aplicar Inteligência Artificial Generativa com pensamento crítico,</text>
        <text x="400" y="415" font-family="Arial, sans-serif" font-size="14" font-style="italic" fill="#4FC3F7" text-anchor="middle">otimizando processos e resolvendo problemas complexos no ambiente acadêmico e profissional."</text>
        
        <path d="M 250 500 Q 300 480 350 500 T 450 490" fill="none" stroke="#FFFFFF" stroke-width="2" />
        <text x="350" y="495" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" transform="rotate(-5 350 495)">Wendel Castro</text>
        
        <line x1="250" y1="510" x2="550" y2="510" stroke="#4FC3F7" stroke-width="1" />
        <text x="400" y="530" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#E2E8F0" text-anchor="middle">Wendel de Oliveira Castro</text>
        <text x="400" y="550" font-family="Arial, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">Gestor Acadêmico de IA - Ser Educacional</text>
        
        <text x="750" y="570" font-family="Arial, sans-serif" font-size="12" fill="#94A3B8" text-anchor="end">Data: ${date}</text>
        <text x="50" y="570" font-family="Arial, sans-serif" font-size="12" fill="#94A3B8" text-anchor="start">@wendelcastro</text>
      </svg>
    `;
    
    const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
    const url = `data:image/svg+xml;base64,${encodedSvg}`;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `Certificado_IA_Copiloto_${userName.trim().replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.src = url;
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 relative">
      {showConfetti && canGenerate && <Confetti />}
      
      <Card className="text-center border-[#10B981]/50 bg-gradient-to-b from-[#112240] to-[#0A1628]">
        <div className="relative inline-block">
          <Award className="w-24 h-24 text-[#F59E0B] mx-auto mb-6 relative z-10" />
          <div className="absolute inset-0 bg-[#F59E0B] blur-xl opacity-20 rounded-full animate-pulse"></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Copiloto Certificado!</h2>
        <p className="text-[#4FC3F7] mb-8">Você completou sua jornada e agora entende como a IA realmente funciona.</p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {PHASES.slice(0, 6).map(p => {
            const isCompleted = completedPhases.includes(p.id);
            const phaseScore = scores[p.id] || 0;
            const passed = phaseScore >= 2;
            
            return (
              <div 
                key={p.id} 
                className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 relative
                  ${isCompleted && passed
                    ? 'bg-[#1E3A5F] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110' 
                    : isCompleted && !passed
                    ? 'bg-[#1E3A5F] border-red-500 opacity-80'
                    : 'bg-[#0A1628] border-[#1E3A5F] opacity-50 grayscale'}
                `}
                title={p.title}
              >
                <p.icon className={`w-6 h-6 ${isCompleted && passed ? 'text-[#10B981]' : isCompleted ? 'text-red-400' : 'text-gray-500'}`} />
                {isCompleted && (
                  <span className={`text-[10px] font-bold mt-1 ${passed ? 'text-[#10B981]' : 'text-red-400'}`}>
                    {phaseScore}/3
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {!canGenerate ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 max-w-lg mx-auto mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 text-sm">
              Para emitir o certificado, você precisa completar todas as 6 fases e acertar <strong>pelo menos 2 questões</strong> em cada quiz.
              <br/>Volte ao mapa e refaça as fases que estão com pontuação baixa!
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 delay-300">
            <div className="w-full text-left">
              <label htmlFor="userName" className="block text-sm font-medium text-[#4FC3F7] mb-2">
                Nome Completo para o Certificado
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-3 bg-[#0A1628] border border-[#1E3A5F] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4FC3F7] focus:ring-1 focus:ring-[#4FC3F7] transition-colors"
              />
            </div>
            <div className="flex w-full gap-4 mt-2">
              <Button 
                variant="success" 
                onClick={generateCertificate} 
                className="flex-1"
                disabled={!userName.trim()}
              >
                <Download className="w-4 h-4"/> Gerar e Baixar
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="animate-in slide-in-from-bottom-8 delay-700">
        <h3 className="text-xl font-bold text-[#4FC3F7] mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5" /> Seu Kit de Ferramentas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "ChatGPT", desc: "Bom para raciocínio geral, código e tarefas do dia a dia.", color: "text-green-400" },
            { name: "Claude", desc: "Excelente para textos longos, análise de documentos e escrita natural.", color: "text-orange-400" },
            { name: "Gemini", desc: "Integração com Google Workspace e pesquisa em tempo real.", color: "text-blue-400" },
            { name: "Perplexity", desc: "O melhor para pesquisa com fontes reais e citações.", color: "text-cyan-400" }
          ].map((t, i) => (
            <div key={i} className="p-4 bg-[#0A1628] border border-[#1E3A5F] rounded-lg hover:border-[#4FC3F7]/50 transition-colors group cursor-default">
              <h4 className={`font-bold ${t.color} group-hover:scale-105 transition-transform origin-left`}>{t.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [showTransition, setShowTransition] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const handleCompletePhase = (id: number, phaseScore: number = 0) => {
    if (!completedPhases.includes(id)) {
      setCompletedPhases([...completedPhases, id]);
      setScores(prev => ({ ...prev, [id]: phaseScore }));
    } else {
      // Allow retaking to improve score
      if (phaseScore > (scores[id] || 0)) {
        setScores(prev => ({ ...prev, [id]: phaseScore }));
      }
    }
    
    setShowTransition(true);
    setEarnedCoins(phaseScore);

    setTimeout(() => {
      setShowTransition(false);
      setCurrentPhase(0); // Go back to map to see progress
    }, 2500);
  };

  const totalScore = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
  const passedAllQuizzes = (Object.values(scores) as number[]).filter(s => s >= 2).length === 6;

  const renderPhase = () => {
    switch (currentPhase) {
      case 1: return <Phase1 onComplete={(s: number) => handleCompletePhase(1, s)} />;
      case 2: return <Phase2 onComplete={(s: number) => handleCompletePhase(2, s)} />;
      case 3: return <Phase3 onComplete={(s: number) => handleCompletePhase(3, s)} />;
      case 4: return <Phase4 onComplete={(s: number) => handleCompletePhase(4, s)} />;
      case 5: return <Phase5 onComplete={(s: number) => handleCompletePhase(5, s)} />;
      case 6: return <Phase6 onComplete={(s: number) => handleCompletePhase(6, s)} />;
      case 7: return <Phase7 completedPhases={completedPhases} passedAllQuizzes={passedAllQuizzes} scores={scores} />;
      default: return renderHome();
    }
  };

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1E3A5F] rounded-full mb-4 border-4 border-[#2D7DD2]">
          <Plane className="w-10 h-10 text-[#4FC3F7]" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">IA como Copiloto</h1>
        <p className="text-xl text-gray-400">Sua jornada para entender como a IA realmente funciona</p>
      </div>

      <div className="bg-[#112240] rounded-2xl p-6 border border-[#1E3A5F] shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Seu Progresso</h2>
          <span className="text-[#4FC3F7] font-mono">{completedPhases.length}/7 Fases</span>
        </div>
        <div className="w-full bg-[#0A1628] rounded-full h-3 mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#2D7DD2] to-[#4FC3F7] h-3 rounded-full transition-all duration-1000"
            style={{ width: `${(completedPhases.length / 7) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PHASES.map((phase, idx) => {
            const isCompleted = completedPhases.includes(phase.id);
            const isLocked = phase.id > 1 && !completedPhases.includes(phase.id - 1);
            const phaseScore = scores[phase.id] || 0;
            
            return (
              <div 
                key={phase.id}
                onClick={() => !isLocked && setCurrentPhase(phase.id)}
                className={`relative p-5 rounded-xl border transition-all duration-300 flex flex-col h-full
                  ${isLocked 
                    ? 'bg-[#0A1628] border-[#1E3A5F] opacity-60 cursor-not-allowed' 
                    : isCompleted 
                      ? 'bg-[#112240] border-[#10B981] cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-[#1E3A5F] border-[#4FC3F7] cursor-pointer hover:scale-105 shadow-lg'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${isCompleted ? 'bg-[#10B981]/20' : isLocked ? 'bg-gray-800' : 'bg-[#2D7DD2]/20'}`}>
                    <phase.icon className={`w-6 h-6 ${isCompleted ? 'text-[#10B981]' : isLocked ? 'text-gray-500' : 'text-[#4FC3F7]'}`} />
                  </div>
                  {isCompleted && phase.id < 7 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded">
                      <Star className="w-3 h-3" /> {phaseScore}/3
                    </div>
                  )}
                  {isCompleted && phase.id === 7 && <CheckCircle2 className="w-6 h-6 text-[#10B981]" />}
                  {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Fase {phase.id}</h3>
                <h4 className={`font-medium mb-2 ${isCompleted ? 'text-[#10B981]' : 'text-[#4FC3F7]'}`}>{phase.title}</h4>
                <p className="text-sm text-gray-400 mt-auto">{phase.tagline}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      <SocialLinks />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A1628] text-slate-200 font-sans selection:bg-[#2D7DD2]/50">
      <AnimatePresence mode="wait">
        {!hasSeenIntro ? (
          <motion.div 
            key="intro"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <IntroSequence onComplete={() => setHasSeenIntro(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {showTransition && <TransitionOverlay earnedCoins={earnedCoins} />}
            
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A1628]/80 backdrop-blur-md border-b border-[#1E3A5F] px-4 py-4">
              <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setCurrentPhase(0)}
                >
                  <Plane className="w-6 h-6 text-[#4FC3F7]" />
                  <span className="font-bold text-white hidden sm:inline">IA como Copiloto</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1.5 rounded-full border border-[#F59E0B]/20">
                    <Star className="w-4 h-4" /> {totalScore} Moedas
                  </div>
                  {currentPhase > 0 && (
                    <>
                      <span className="text-sm text-gray-400 hidden sm:inline">Fase {currentPhase} de 7</span>
                      <Button variant="outline" onClick={() => setCurrentPhase(0)} className="text-xs py-1 px-3">
                        Voltar ao Mapa
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
              {currentPhase > 0 && currentPhase < 7 && (
                <div className="mb-8 text-center animate-in slide-in-from-top">
                  <h2 className="text-3xl font-bold text-white mb-2">Fase {currentPhase}: {PHASES[currentPhase-1].title}</h2>
                  <p className="text-[#4FC3F7]">{PHASES[currentPhase-1].tagline}</p>
                </div>
              )}
              
              {renderPhase()}
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 w-full bg-[#0A1628] border-t border-[#1E3A5F] py-4 text-center text-sm text-gray-500 z-40">
              Criado por Prof. Wendel Castro | <a href="http://instagram.com/wendelcastro" target="_blank" rel="noopener noreferrer" className="text-[#4FC3F7] hover:underline">@wendelcastro</a>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
