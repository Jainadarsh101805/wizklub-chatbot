import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { User, Bot, GraduationCap, ArrowRight, CheckCircle2, Mail, Phone, Building, Info, Send, Zap, Sparkles, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = {
  INITIAL: 'INITIAL',
  SELECT_TYPE: 'SELECT_TYPE',
  ASK_NAME: 'ASK_NAME',
  ASK_EMAIL: 'ASK_EMAIL',
  ASK_PHONE: 'ASK_PHONE',
  ASK_ORG: 'ASK_ORG',
  QUIZ: 'QUIZ',
  COMPLETED: 'COMPLETED'
};

const QuizQuestion = ({ question, options, onSelect }) => (
  <div className="quiz-container animate-fade-in">
    <p className="quiz-question">{question}</p>
    <div className="quiz-options">
      {options.map((opt, i) => (
        <button key={i} onClick={() => onSelect(opt)} className="btn-option">
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const Particle = ({ delay, springConfig }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setTimeout(() => {
        x.set(e.clientX);
        y.set(e.clientY);
      }, delay);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [delay]);

  return (
    <motion.div
      className="particle-node"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  );
};

const AntigravityParticleCloud = () => {
  const particleCount = 12;
  const particles = useMemo(() => Array.from({ length: particleCount }), []);

  return (
    <div className="particle-cloud-container">
      {particles.map((_, i) => (
        <Particle
          key={i}
          delay={i * 30}
          springConfig={{ damping: 20 + i, stiffness: 200 - i * 5 }}
        />
      ))}
      <MouseMainNode />
    </div>
  );
};

const MouseMainNode = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 30, stiffness: 1000 });
  const smoothY = useSpring(y, { damping: 30, stiffness: 1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="mouse-main-node"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  );
};

export default function App() {
  const [step, setStep] = useState(STEPS.INITIAL);
  const [messages, setMessages] = useState([]);
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '' });
  const [inputValue, setInputValue] = useState('');
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const initialMessageAdded = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step, isTyping]);

  useEffect(() => {
    if (initialMessageAdded.current) return;
    initialMessageAdded.current = true;

    simulateBotResponse("Hi! I'm Adarsh, your personalized WizKlub guide. 🚀", () => {
      simulateBotResponse("I help children unlock their potential using STEM. To get started, are you a Parent or a School employee?", () => {
        setStep(STEPS.SELECT_TYPE);
      });
    });
  }, []);

  const simulateBotResponse = (text, callback = null, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(text);
      if (callback) callback();
    }, delay);
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { role: 'bot', text }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    addUserMessage(type === 'parent' ? "I'm a Parent." : "I'm a School employee.");

    simulateBotResponse(`Great to meet you! I'm Adarsh. May I know your full name?`, () => {
      setStep(STEPS.ASK_NAME);
    });
  };

  const handleInputSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const val = inputValue.trim();
    addUserMessage(val);
    setInputValue('');

    if (step === STEPS.ASK_NAME) {
      setFormData(prev => ({ ...prev, name: val }));
      simulateBotResponse(`Thanks, ${val.split(' ')[0]}! This helps me personalize your journey. What is your email address?`, () => {
        setStep(STEPS.ASK_EMAIL);
      });
    } else if (step === STEPS.ASK_EMAIL) {
      setFormData(prev => ({ ...prev, email: val }));
      simulateBotResponse(`Got it. And a mobile number to share the final report?`, () => {
        setStep(STEPS.ASK_PHONE);
      });
    } else if (step === STEPS.ASK_PHONE) {
      setFormData(prev => ({ ...prev, phone: val }));
      if (userType === 'school') {
        simulateBotResponse(`Finally, which school do you represent?`, () => {
          setStep(STEPS.ASK_ORG);
        });
      } else {
        proceedToQualification();
      }
    } else if (step === STEPS.ASK_ORG) {
      setFormData(prev => ({ ...prev, org: val }));
      proceedToQualification();
    }
  };

  const proceedToQualification = () => {
    simulateBotResponse("Perfect! Did you know that 80% of future jobs will require STEM skills? 🧠", () => {
      simulateBotResponse("Let's see your child's STEM Quotient with 3 quick questions. Ready?", () => {
        setStep(STEPS.QUIZ);
      });
    });
  };

  const quizQuestions = [
    { q: "If a robot moves 2 steps forward and 1 step back, how many steps does it take to move 3 steps forward?", options: ["3 steps", "5 steps", "7 steps"], correct: "5 steps" },
    { q: "Which of these is NOT an example of AI?", options: ["Netflix recommendations", "A standard calculator", "Face ID unlock"], correct: "A standard calculator" },
    { q: "What is the core skill behind solving complex puzzles?", options: ["Memory", "Logical Reasoning", "Speed"], correct: "Logical Reasoning" }
  ];

  const schoolQuestions = [
    { q: "What is the approximate student strength of your school?", options: ["Less than 500", "500 - 1500", "More than 1500"], correct: null },
    { q: "Is your school currently offering any Robotics or Coding programs?", options: ["Yes, basic programs", "No, looking to start", "Yes, advanced programs"], correct: null }
  ];

  const handleQuizAnswer = (answer) => {
    addUserMessage(answer);
    const questions = userType === 'parent' ? quizQuestions : schoolQuestions;

    if (currentQuizIdx < questions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      setStep(STEPS.COMPLETED);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#f59e0b']
      });

      simulateBotResponse(userType === 'parent'
        ? "Impressive! Your child's STEM awareness is already showing potential. 🌟"
        : "Thank you! WizKlub can significantly enhance your school's curriculum.", () => {
          simulateBotResponse(userType === 'parent'
            ? "I've sent a STEM starter kit to your email. Our expert counselor will call you within 24 hours!"
            : "Our partnership team will reach out with a customized proposal kit shortly.");
        });
    }
  };

  const calculateProgress = () => {
    const stepWeight = {
      [STEPS.INITIAL]: 5,
      [STEPS.SELECT_TYPE]: 15,
      [STEPS.ASK_NAME]: 30,
      [STEPS.ASK_EMAIL]: 45,
      [STEPS.ASK_PHONE]: 60,
      [STEPS.ASK_ORG]: 70,
      [STEPS.QUIZ]: 70 + (currentQuizIdx * 10),
      [STEPS.COMPLETED]: 100
    };
    return stepWeight[step] || 0;
  };

  return (
    <div className="main-viewport">
      <AntigravityParticleCloud />

      <div className="info-section animate-fade-in">
        <h1 className="brand-glow">WizKlub</h1>
        <p className="brand-tagline">The Innovation Lab for Future Leaders</p>

        <div className="feature-list">
          <div className="feature-item">
            <Zap className="feature-icon" size={20} />
            <div>
              <h3>Cognitive Excellence</h3>
              <p>Developing High Order Thinking Skills (HOTS) through 6D STEM curriculum.</p>
            </div>
          </div>
          <div className="feature-item">
            <Sparkles className="feature-icon" size={20} />
            <div>
              <h3>Tech Mastery</h3>
              <p>Practical Robotics, Coding, and AI modules designed for ages 6-14.</p>
            </div>
          </div>
          <div className="feature-item">
            <CheckCircle2 className="feature-icon" size={20} />
            <div>
              <h3>Global Impact</h3>
              <p>Trusted by 50,000+ students across top schools globally.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container shadow-2xl">
        <div className="progress-bar-container">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
          />
        </div>

        <header className="header">
          <div className="bot-icon">
            <Bot className="icon-white" />
          </div>
          <div className="header-text">
            <h1>Adarsh Chatbot</h1>
            <div className="status-indicator">
              <span className="pulse-dot" />
              <Sparkles size={10} className="mr-1" /> Verified AI
            </div>
          </div>
          <div className="social-proof-badge glass-card">
            <Zap size={10} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700 }}>42 active now</span>
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`chat-bubble ${msg.role === 'bot' ? 'bubble-bot' : 'bubble-user'}`}
            >
              {msg.text}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chat-bubble bubble-bot typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </motion.div>
          )}

          {step === STEPS.SELECT_TYPE && !isTyping && (
            <div className="type-selector animate-fade-in">
              <button onClick={() => handleUserTypeSelect('parent')} className="btn-type">
                <User className="icon-primary" />
                <span className="btn-label">Parent</span>
              </button>
              <button onClick={() => handleUserTypeSelect('school')} className="btn-type">
                <GraduationCap className="icon-secondary" />
                <span className="btn-label">School employee</span>
              </button>
            </div>
          )}

          {step === STEPS.QUIZ && !isTyping && (
            <div className="chat-bubble bubble-bot">
              <QuizQuestion
                question={userType === 'parent' ? quizQuestions[currentQuizIdx].q : schoolQuestions[currentQuizIdx].q}
                options={userType === 'parent' ? quizQuestions[currentQuizIdx].options : schoolQuestions[currentQuizIdx].options}
                onSelect={handleQuizAnswer}
              />
            </div>
          )}

          {step === STEPS.COMPLETED && !isTyping && (
            <div className="chat-bubble bubble-bot w-full">
              <div className="success-card animate-fade-in">
                <div className="success-icon-container">
                  <CheckCircle2 className="success-icon" />
                </div>
                <h3 className="success-title">Confirmed!</h3>
                <p className="success-text">
                  Demo slot reserved for <span style={{ color: 'white', fontWeight: 600 }}>{formData.name}</span>.
                </p>
                <a
                  href="https://wizklub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ marginTop: '12px', width: '100%', textDecoration: 'none' }}
                >
                  Book Final Demo Now <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="suggestions-bar">
          {step === STEPS.ASK_NAME && !inputValue && (
            <button onClick={() => setInputValue('I am exploring')} className="btn-pill">I am exploring</button>
          )}
          {step === STEPS.ASK_PHONE && !inputValue && (
            <button onClick={() => setInputValue('Call me in evening')} className="btn-pill">Call me in evening</button>
          )}
        </div>

        <form onSubmit={handleInputSubmit} className="input-bar">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              step === STEPS.ASK_NAME ? "Type your name..." :
                step === STEPS.ASK_EMAIL ? "Type your email..." :
                  step === STEPS.ASK_PHONE ? "Type your phone number..." :
                    step === STEPS.ASK_ORG ? "Type school name..." :
                      "Adarsh is listening..."
            }
            disabled={step === STEPS.SELECT_TYPE || step === STEPS.QUIZ || step === STEPS.COMPLETED || isTyping || step === STEPS.INITIAL}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send size={20} color={(inputValue.trim() && !isTyping) ? "#6366f1" : "#64748b"} />
          </button>
        </form>
      </div>
    </div>
  );
}
