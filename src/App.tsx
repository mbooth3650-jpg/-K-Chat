import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Plus, Settings, Send, Trash2, Edit2, Copy, Check, 
  Moon, Sun, Bot, User, Sparkles, Menu, X, ArrowRight, Code, Terminal,
  Sliders, Key, Globe, Shield, RefreshCw, Cpu, BookOpen, Volume2, VolumeX,
  Download, Upload, Search, BarChart2, Zap, Star, Bookmark, Share2,
  RotateCcw, Compass, Briefcase, Feather, Languages, GraduationCap,
  ChevronRight, CornerDownLeft, Tag, Folder, Filter, CheckCircle2,
  ChevronDown
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export type SessionCategory = "전체" | "업무" | "개발" | "개인" | "학습" | "일반";

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string; bgLight: string; bgDark: string; border: string }> = {
  "업무": { 
    label: "업무", 
    icon: "💼", 
    color: "text-blue-600 dark:text-blue-400", 
    bgLight: "bg-blue-50 text-blue-700", 
    bgDark: "dark:bg-blue-950/70 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800" 
  },
  "개발": { 
    label: "개발", 
    icon: "💻", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bgLight: "bg-emerald-50 text-emerald-700", 
    bgDark: "dark:bg-emerald-950/70 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800" 
  },
  "개인": { 
    label: "개인", 
    icon: "👤", 
    color: "text-amber-600 dark:text-amber-400", 
    bgLight: "bg-amber-50 text-amber-700", 
    bgDark: "dark:bg-amber-950/70 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800" 
  },
  "학습": { 
    label: "학습", 
    icon: "📚", 
    color: "text-purple-600 dark:text-purple-400", 
    bgLight: "bg-purple-50 text-purple-700", 
    bgDark: "dark:bg-purple-950/70 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800" 
  },
  "일반": { 
    label: "일반", 
    icon: "💬", 
    color: "text-slate-600 dark:text-slate-400", 
    bgLight: "bg-slate-100 text-slate-700", 
    bgDark: "dark:bg-slate-800 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700" 
  }
};

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  tokens?: any;
  isBookmarked?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: "gemini" | "chatanywhere";
  updatedAt: number;
  category: "업무" | "개발" | "개인" | "학습" | "일반";
  tags?: string[];
}

interface PersonaPreset {
  id: string;
  name: string;
  icon: string;
  title: string;
  personality: string;
  tone: string;
  style: string;
  customInstructions: string;
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: "k-assistant",
    name: "K-스마트 비서",
    icon: "🌟",
    title: "친절하고 정중한 한국어 만능 비서",
    personality: "친절하고 세심하며 따뜻함",
    tone: "해요체 (~해요, ~에요)",
    style: "핵심 요약 후 알기 쉬운 단계별 설명 및 실전 팁 포함",
    customInstructions: "한국어 모국어 화자 관점에서 가장 자연스럽고 신뢰감 있는 문장으로 답변합니다. 불필요한 서론은 생략하고 요점을 바로 전달하세요."
  },
  {
    id: "senior-dev",
    name: "수석 시니어 개발자",
    icon: "💻",
    title: "명쾌한 아키텍처 & 코드 리뷰어",
    personality: "논리적이고 명료하며 실용주의적임",
    tone: "하십시오체 및 전문적 어조 (~합니다)",
    style: "구체적 코드 예시, 시간/공간 복잡도, 모범 관례(Best Practices) 제시",
    customInstructions: "버그의 근본 원인을 짚고, 모던한 TypeScript/React 및 알고리즘 모범 사례를 명확한 주석과 함께 제공하세요."
  },
  {
    id: "business-consultant",
    name: "비즈니스 전략 컨설턴트",
    icon: "📊",
    title: "기획서 · 전략 분석 · 이메일 마스터",
    personality: "분석적이고 결과 지향적이며 프로페셔널함",
    tone: "단정하고 정중한 격식체 (~합니다, ~바랍니다)",
    style: "현황 분석(AS-IS), 목표(TO-BE), 구체적 액션 플랜 템플릿 구성",
    customInstructions: "즉시 보고서나 제안서, 결재 문서에 활용할 수 있도록 군더더기 없이 세련된 한국어 비즈니스 문체로 작성하세요."
  },
  {
    id: "creative-copywriter",
    name: "창의적 카피라이터",
    icon: "✍️",
    title: "트렌디한 마케팅 문구 & 스토리텔러",
    personality: "재치 있고 영감을 주며 감각적임",
    tone: "매력적이고 생동감 넘치는 어조",
    style: "시선을 사로잡는 헤드카피, SNS 타겟별 버전 3가지 이상 제안",
    customInstructions: "소비자의 공감을 이끌어내는 센스 있는 한국어 신조어, 트렌드, 리듬감 있는 문장을 구사하세요."
  },
  {
    id: "academic-mentor",
    name: "논문 · 지식 멘토",
    icon: "📚",
    title: "어려운 학술/과학 개념을 쉽게 풀어주는 선생님",
    personality: "체계적이고 깊이 있으며 통찰력 있음",
    tone: "이해하기 쉽고 다정한 설명조",
    style: "일상 속 비유, 단계별 원리 해설, 핵심 요약(Takeaway)",
    customInstructions: "전문 용어를 직관적인 일상 언어로 재해석하고 질문자가 원리를 본질적으로 이해할 수 있게 돕습니다."
  }
];

const DEFAULT_MODELS = {
  gemini: [
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", badge: "추천", desc: "한국어 추론 및 코딩에 최적화된 고속 모델" },
    { id: "gemini-4-argon", name: "Gemini 4 Argon", badge: "심층 추론", desc: "복잡한 문제 해결 및 긴 문서 분석" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", badge: "초고속", desc: "가장 빠르고 가벼운 즉각 응답" },
  ],
  chatanywhere: [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", badge: "경제적", desc: "빠르고 가벼운 다목적 OpenAI 모델" },
    { id: "gpt-4o", name: "GPT-4o", badge: "최상위", desc: "고난도 지능형 멀티모달 모델" },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", badge: "코딩 특화", desc: "우수한 코딩 및 한국어 문장력" },
  ]
};

interface RecommendationCategory {
  id: string;
  name: string;
  icon: string;
  items: {
    title: string;
    description: string;
    prompt: string;
    tag: string;
  }[];
}

const KOREAN_RECOMMENDATIONS: RecommendationCategory[] = [
  {
    id: "all",
    name: "전체 추천",
    icon: "🌟",
    items: [
      {
        title: "비즈니스 제휴 제안서 작성",
        description: "상대방의 관심을 끄는 정중하고 프로페셔널한 이메일",
        prompt: "새로운 파트너사에게 솔루션 공동 협업 및 제휴를 제안하는 정중하고 설득력 있는 비즈니스 이메일 초안을 작성해주세요.",
        tag: "업무"
      },
      {
        title: "React 성능 최적화 가이드",
        description: "불필요한 리렌더링 방지 및 메모이제이션 팁",
        prompt: "React 19 환경에서 대규모 리스트를 렌더링할 때 발생하는 렌더링 병목 현상을 해결하는 구체적인 최적화 기법 4가지를 코드 예시와 함께 알려줘.",
        tag: "개발"
      },
      {
        title: "어려운 기술 개념 초등학생 비유 설명",
        description: "양자역학 / 블록체인 등 복잡한 원리 쉽게 풀기",
        prompt: "양자 컴퓨터의 중첩(Superposition)과 얽힘(Entanglement) 원리를 중학생도 단번에 무릎을 치며 이해할 수 있게 재미있는 일상 비유로 설명해줘.",
        tag: "학습"
      },
      {
        title: "신규 서비스 바이럴 마케팅 카피",
        description: "SNS 클릭률(CTR)을 높이는 3가지 톤의 카피라이팅",
        prompt: "직장인 대상 자동 일정 정리 AI 앱을 론칭합니다. 인스타그램 광고에 쓸 클릭률 높은 매력적인 헤드카피 3종과 서브카피를 제안해줘.",
        tag: "기획"
      }
    ]
  },
  {
    id: "business",
    name: "비즈니스 · 업무",
    icon: "💼",
    items: [
      {
        title: "기획서 핵심 요약 보고서",
        description: "임원 보고용 한눈에 들어오는 1페이지 브리핑",
        prompt: "새로운 사내 업무 자동화 툴 도입 프로젝트에 대해 경영진에게 1장으로 보고할 수 있는 깔끔한 '기획 요약 보고서(Executive Summary)' 템플릿과 내용을 작성해줘.",
        tag: "보고서"
      },
      {
        title: "완곡하고 정중한 거절 메일",
        description: "파트너십을 해치지 않는 세련된 한국어 비즈니스 거절",
        prompt: "일정 및 예산 문제로 인해 협력사의 제안을 이번에는 수용하기 어렵다는 내용을 최대한 예의 바르고 상호 관계를 배려하여 작성한 거절 이메일을 써줘.",
        tag: "이메일"
      },
      {
        title: "회의록 안건 정리 및 액션 아이템",
        description: "담당자/기한이 명시된 효율적 회의록 포맷",
        prompt: "스프린트 기획 회의에서 나온 논의 사항을 [배경 / 핵심 결정 사항 / 논란 이슈 / 액션 아이템(담당자 및 마감일)] 구조로 정리하는 표준 회의록 템플릿을 만들어줘.",
        tag: "회의"
      },
      {
        title: "고객 클레임 대응 답변문",
        description: "진정성 있는 사과와 신속한 보상/대안 안내",
        prompt: "배송 지연으로 불편을 겪은 VIP 고객에게 보낼 진심 어린 사과문과 적절한 보상 혜택 안내 문구를 고객 감동 관점에서 작성해줘.",
        tag: "CS"
      }
    ]
  },
  {
    id: "coding",
    name: "개발 · 프로그래밍",
    icon: "💻",
    items: [
      {
        title: "TypeScript 타입 에러 해결",
        description: "복잡한 제네릭과 유니온 타입 문제 해결",
        prompt: "다음 TypeScript 코드에서 제네릭 타입 추론 오류가 발생하는 원인을 분석하고, 엄격한 타입 안정성을 유지하면서 해결하는 베스트 프랙티스를 알려줘.",
        tag: "TypeScript"
      },
      {
        title: "RESTful API 명세서 설계",
        description: "엔드포인트, 상태 코드, 요청/응답 스키마",
        prompt: "전자상거래 주문/결제 시스템을 위한 표준 RESTful API 규격(엔드포인트 URL, HTTP 메서드, 응답 상태 코드, JSON 포맷)을 설계해줘.",
        tag: "API"
      },
      {
        title: "SQL 쿼리 성능 튜닝",
        description: "인덱스 활용 및 실행 계획(EXPLAIN) 분석",
        prompt: "수백만 건의 사용자 로그 테이블에서 특정 기간 동안의 활동 통계를 집계할 때 풀테이블 스캔을 방지하고 인덱스를 효율적으로 타는 SQL 튜닝 방안을 설명해줘.",
        tag: "Database"
      },
      {
        title: "Git 충돌(Conflict) 해결 가이드",
        description: "브랜치 머지 충돌 시 안전한 해결 절차",
        prompt: "main 브랜치와 feature 브랜치를 머지할 때 여러 파일에서 충돌이 났을 때, 초보자도 실수 없이 안전하게 해결하는 Git 명령어 단계별 가이드를 정리해줘.",
        tag: "Git"
      }
    ]
  },
  {
    id: "creative",
    name: "창작 · 기획",
    icon: "✍️",
    items: [
      {
        title: "유튜브 쇼츠 / 릴스 숏폼 대본",
        description: "초반 3초 후킹과 반전이 있는 60초 스크립트",
        prompt: "'생산성을 3배 올려주는 스마트폰 숨은 꿀팁'을 주제로 시청자의 이탈을 막는 초반 3초 후킹이 포함된 60초 쇼츠 영상 대본(화면 연출 지문 포함)을 써줘.",
        tag: "숏폼"
      },
      {
        title: "웹소설 시놉시스 & 캐릭터 설정",
        description: "현대 판타지 / 로맨스 주인공 매력 구체화",
        prompt: "현대 배경의 흥미진진한 능력자 판타지 웹소설을 구상 중이야. 매력적인 주인공의 특수 능력, 숨겨진 결핍, 조력자와의 케미스트리를 입체적으로 설정해줘.",
        tag: "스토리"
      },
      {
        title: "창업 브랜드 네이밍 5선",
        description: "의미, 어원, 도메인/상표권 고려한 브랜드명",
        prompt: "친환경 생분해성 라이프스타일 브랜드를 창업하려고 해. 부르기 쉽고 현대적인 감각의 브랜드 네이밍 5가지와 각 이름에 담긴 스토리텔링을 제안해줘.",
        tag: "브랜딩"
      },
      {
        title: "블로그 SEO 최적화 글 구조",
        description: "검색 상위 노출을 위한 소제목 및 본문 구성",
        prompt: "'2026 재테크 기초'를 주제로 구글 및 네이버 검색 상위 노출을 노리는 완벽한 SEO 블로그 포스팅 목차와 서론 본론 결론 핵심을 작성해줘.",
        tag: "SEO"
      }
    ]
  },
  {
    id: "translation",
    name: "번역 · 교정",
    icon: "🌐",
    items: [
      {
        title: "영어 비즈니스 이메일 한국어 자연 번역",
        description: "직역이 아닌 실무 감각의 매끄러운 뉘앙스",
        prompt: "해외 바이어로부터 온 영문 비즈니스 서신을 한국 비즈니스 문화에 딱 맞게 정중하고 매끄러운 한국어로 번역하고 핵심 요청사항을 3줄 요약해줘.",
        tag: "번역"
      },
      {
        title: "한국어 맞춤법 및 문장 다듬기",
        description: "어색한 번역투 제거 및 가독성 극대화",
        prompt: "내가 쓴 문장의 맞춤법, 띄어쓰기를 검수하고, 번역투나 피동 표현을 자연스러운 능동형 현대 한국어 문장으로 교정해줘.",
        tag: "교정"
      },
      {
        title: "해외 컨퍼런스 영문 발표 대본",
        description: "자연스러운 영어 발표 표현과 발음 팁",
        prompt: "5분간의 IT 신제품 소개 발표를 위한 자신감 넘치는 영어 프레젠테이션 스크립트를 작성해줘. 청중의 주의를 끄는 오프닝 멘트도 포함해줘.",
        tag: "영어발표"
      }
    ]
  }
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("k_chat_sessions_v8");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Ensure category exists
        return parsed.map((s: any) => ({
          ...s,
          category: s.category || "일반",
          tags: s.tags || []
        }));
      } catch (e) { }
    }
    return [{
      id: Date.now().toString(),
      title: "새로운 대화",
      messages: [],
      model: "gemini-3.8-flash",
      provider: "gemini",
      updatedAt: Date.now(),
      category: "일반",
      tags: []
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => sessions[0]?.id || "");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"persona" | "tokens" | "general">("persona");
  const [sidebarView, setSidebarView] = useState<"chats" | "bookmarks">("chats");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Category filter for sidebar
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<SessionCategory>("전체");
  
  // Category change menu popup for session
  const [activeCategoryMenuSessionId, setActiveCategoryMenuSessionId] = useState<string | null>(null);

  // Recommendation Category Tab
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Inline Title Editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Tag modal/inline input
  const [tagInputSessionId, setTagInputSessionId] = useState<string | null>(null);
  const [newTagText, setNewTagText] = useState("");

  // Voice Speech (TTS)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("k_chat_settings_v8");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      provider: "gemini" as "gemini" | "chatanywhere",
      model: "gemini-3.8-flash",
      apiKey: "",
      baseUrl: "https://api.chatanywhere.tech/v1",
      persona: PERSONA_PRESETS[0],
      temperature: 0.7,
      darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches
    };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("k_chat_sessions_v8", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("k_chat_settings_v8", JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, currentSessionId, isLoading, searchKeyword]);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveCategoryMenuSessionId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const totalCumulativeTokens = sessions.reduce((acc, session) => {
    return acc + session.messages.reduce((msgAcc, msg) => {
      const t = msg.tokens?.total_tokens || msg.tokens?.totalTokenCount || 0;
      return msgAcc + t;
    }, 0);
  }, 0);

  // Category counts
  const categoryCounts = {
    전체: sessions.length,
    업무: sessions.filter(s => s.category === "업무").length,
    개발: sessions.filter(s => s.category === "개발").length,
    개인: sessions.filter(s => s.category === "개인").length,
    학습: sessions.filter(s => s.category === "학습").length,
    일반: sessions.filter(s => s.category === "일반").length,
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    if (selectedFilterCategory === "전체") return true;
    return s.category === selectedFilterCategory;
  });

  // Collect all bookmarked messages
  const allBookmarks: { sessionId: string; sessionTitle: string; message: Message }[] = [];
  sessions.forEach(s => {
    s.messages.forEach(m => {
      if (m.isBookmarked) {
        allBookmarks.push({ sessionId: s.id, sessionTitle: s.title, message: m });
      }
    });
  });

  const createNewChat = (categoryOverride?: "업무" | "개발" | "개인" | "학습" | "일반") => {
    const initialCategory = categoryOverride || (selectedFilterCategory !== "전체" ? selectedFilterCategory : "일반");
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "새로운 대화",
      messages: [],
      model: settings.provider === "gemini" ? "gemini-3.8-flash" : "gpt-4o-mini",
      provider: settings.provider,
      updatedAt: Date.now(),
      category: initialCategory,
      tags: []
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
    setSearchOpen(false);
    setSearchKeyword("");
    setSidebarView("chats");
    stopTTS();
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    stopTTS();
    const updated = sessions.filter(s => s.id !== id);
    if (updated.length === 0) {
      const fresh: ChatSession = {
        id: Date.now().toString(),
        title: "새로운 대화",
        messages: [],
        model: settings.provider === "gemini" ? "gemini-3.8-flash" : "gpt-4o-mini",
        provider: settings.provider,
        updatedAt: Date.now(),
        category: "일반",
        tags: []
      };
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
      }
    }
  };

  const setSessionCategory = (sessionId: string, newCat: "업무" | "개발" | "개인" | "학습" | "일반", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, category: newCat } : s));
    setActiveCategoryMenuSessionId(null);
  };

  const addTagToSession = (sessionId: string, tag: string) => {
    if (!tag.trim()) return;
    const cleanTag = tag.trim().replace(/^#/, "");
    setSessions(sessions.map(s => {
      if (s.id === sessionId) {
        const existing = s.tags || [];
        if (!existing.includes(cleanTag)) {
          return { ...s, tags: [...existing, cleanTag] };
        }
      }
      return s;
    }));
    setNewTagText("");
    setTagInputSessionId(null);
  };

  const removeTagFromSession = (sessionId: string, tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, tags: (s.tags || []).filter(t => t !== tagToRemove) };
      }
      return s;
    }));
  };

  const saveTitle = () => {
    if (titleInput.trim()) {
      setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, title: titleInput.trim() } : s));
    }
    setEditingTitle(false);
  };

  const toggleBookmark = (messageId: string) => {
    setSessions(sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: s.messages.map(m => m.id === messageId ? { ...m, isBookmarked: !m.isBookmarked } : m)
        };
      }
      return s;
    }));
  };

  const exportSessionsToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `k_chat_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importSessionsFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = parsed.map((s: any) => ({
              ...s,
              category: s.category || "일반",
              tags: s.tags || []
            }));
            setSessions(formatted);
            setCurrentSessionId(formatted[0].id);
          }
        } catch (err) {
          console.error("JSON 파싱 에러:", err);
        }
      };
    }
  };

  // Text-To-Speech (TTS)
  const toggleTTS = (messageId: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, "코드 블록 생략.").replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ko-KR";
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now()
    };

    const updatedMessages = [...currentSession.messages, userMsg];
    
    let newTitle = currentSession.title;
    let newCategory = currentSession.category;

    // Auto Title & Category classification on first message
    if (currentSession.title === "새로운 대화" && updatedMessages.length === 1) {
      try {
        const titleRes = await fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            model: currentSession.model,
            provider: currentSession.provider,
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl
          })
        });
        const titleData = await titleRes.json();
        if (titleData.title) {
          newTitle = titleData.title;
        }
        if (titleData.category && currentSession.category === "일반") {
          newCategory = titleData.category;
        }
      } catch (err) {
        newTitle = text.slice(0, 18) + (text.length > 18 ? "..." : "");
      }
    }

    setSessions(sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: newTitle,
          category: newCategory,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const persona = settings.persona;
      const effectiveSystemPrompt = `당신의 이름은 "${persona.name}"입니다. 
역할: ${persona.title}
성격: ${persona.personality}
말투: ${persona.tone}
답변 스타일: ${persona.style}
시스템 지침: ${persona.customInstructions}
반드시 한국인 사용자에게 최적화된 모국어 수준의 자연스럽고 고품질인 한국어로 답변하세요. 불필요한 장황한 서론이나 뻔한 인사는 생략하고 핵심 정보를 명확하게 제시하세요.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          model: currentSession.model,
          provider: currentSession.provider,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
          systemPrompt: effectiveSystemPrompt,
          temperature: settings.temperature
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "답변을 가져오는 중 오류가 발생했습니다.");
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text || "",
        timestamp: Date.now(),
        tokens: data.usage
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMsg],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ 오류 발생: ${err.message || "서버 통신에 실패했습니다."}`,
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMsg],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = () => {
    if (currentSession.messages.length === 0 || isLoading) return;
    
    let lastUserIndex = -1;
    for (let i = currentSession.messages.length - 1; i >= 0; i--) {
      if (currentSession.messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserText = currentSession.messages[lastUserIndex].content;
    const truncated = currentSession.messages.slice(0, lastUserIndex);
    
    setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, messages: truncated } : s));
    handleSendMessage(lastUserText);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessageContent = (content: string, highlightKeyword?: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const firstNewlineIndex = part.indexOf("\n");
        const lang = firstNewlineIndex !== -1 ? part.slice(3, firstNewlineIndex).trim() : "text";
        const code = firstNewlineIndex !== -1 ? part.slice(firstNewlineIndex + 1, -3) : part.slice(3, -3);

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 text-xs sm:text-sm shadow-md">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 text-slate-400 font-mono text-xs border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">{lang || "code"}</span>
              </div>
              <button
                onClick={() => copyToClipboard(code, `code-${index}`)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]"
              >
                {copiedId === `code-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === `code-${index}` ? "복사 완료" : "코드 복사"}</span>
              </button>
            </div>
            <SyntaxHighlighter
              language={lang || "javascript"}
              style={settings.darkMode ? vscDarkPlus : oneLight}
              customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "0.85rem", lineHeight: 1.55 }}
            >
              {code.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }

      if (highlightKeyword && highlightKeyword.trim()) {
        const regex = new RegExp(`(${highlightKeyword})`, "gi");
        const subParts = part.split(regex);
        return (
          <span key={index} className="whitespace-pre-wrap break-words">
            {subParts.map((sub, sIdx) => 
              sub.toLowerCase() === highlightKeyword.toLowerCase() ? (
                <mark key={sIdx} className="bg-amber-300 dark:bg-amber-500/30 text-slate-900 dark:text-amber-200 rounded px-1">{sub}</mark>
              ) : (
                sub
              )
            )}
          </span>
        );
      }

      return (
        <span key={index} className="whitespace-pre-wrap break-words">
          {part}
        </span>
      );
    });
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("현재 브라우저는 음성 입력을 지원하지 않습니다. Chrome 브라우저를 이용해주세요.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputMessage(prev => prev + (prev ? " " : "") + speechToText);
    };

    recognition.start();
  };

  const displayedMessages = searchKeyword.trim()
    ? currentSession.messages.filter(m => m.content.toLowerCase().includes(searchKeyword.toLowerCase()))
    : currentSession.messages;

  const activeRecCategory = KOREAN_RECOMMENDATIONS.find(c => c.id === selectedCategory) || KOREAN_RECOMMENDATIONS[0];
  const currentCatConf = CATEGORY_CONFIG[currentSession.category] || CATEGORY_CONFIG["일반"];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 flex flex-col w-72 lg:w-80 h-full bg-white dark:bg-slate-900 
        border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">한국어 AI 스튜디오</h1>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">카테고리 자동 분류 & 태그</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => createNewChat()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-xs rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>새로운 대화 시작</span>
          </button>
        </div>

        {/* Tab Switcher: Chats vs Bookmarks */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            onClick={() => setSidebarView("chats")}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors text-center ${sidebarView === "chats" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            대화 목록 ({sessions.length})
          </button>
          <button
            onClick={() => setSidebarView("bookmarks")}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors text-center flex items-center justify-center gap-1.5 ${sidebarView === "bookmarks" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>즐겨찾기 ({allBookmarks.length})</span>
          </button>
        </div>

        {/* Category Filter Chips (Only in chats view) */}
        {sidebarView === "chats" && (
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 px-1">
              <span className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                카테고리 필터
              </span>
              <span>{filteredSessions.length}개 표시</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["전체", "업무", "개발", "개인", "학습", "일반"] as SessionCategory[]).map(cat => {
                const isSelected = selectedFilterCategory === cat;
                const conf = cat !== "전체" ? CATEGORY_CONFIG[cat] : null;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilterCategory(cat)}
                    className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      isSelected 
                        ? "bg-indigo-600 text-white shadow-2xs font-semibold" 
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <span className="truncate">
                      {conf ? conf.icon + " " : ""}{cat}
                    </span>
                    <span className={`text-[10px] ml-1 px-1 rounded-full ${isSelected ? "bg-white/20 text-white" : "text-slate-400"}`}>
                      {categoryCounts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sidebar Content (Chat List or Bookmarks) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {sidebarView === "chats" ? (
            <>
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12 px-4 text-xs text-slate-400">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">'{selectedFilterCategory}' 카테고리 대화가 없습니다.</p>
                  <button
                    onClick={() => createNewChat(selectedFilterCategory === "전체" ? "일반" : selectedFilterCategory)}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                  >
                    + 이 카테고리로 대화 시작하기
                  </button>
                </div>
              ) : (
                filteredSessions.map(session => {
                  const catConfig = CATEGORY_CONFIG[session.category] || CATEGORY_CONFIG["일반"];
                  const isCurrent = session.id === currentSessionId;
                  const isMenuOpen = activeCategoryMenuSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setCurrentSessionId(session.id);
                        setSidebarOpen(false);
                        stopTTS();
                      }}
                      className={`
                        relative group flex flex-col p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all border
                        ${isCurrent 
                          ? "bg-indigo-50/80 dark:bg-indigo-950/60 text-slate-900 dark:text-white border-indigo-300 dark:border-indigo-800 shadow-2xs" 
                          : "bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200/80 dark:border-slate-800"}
                      `}
                    >
                      {/* Top Row: Title & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate flex-1">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                          <span className="truncate font-semibold">{session.title}</span>
                        </div>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                          title="대화 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Row: Category Pill & Custom Tags */}
                      <div className="flex items-center flex-wrap gap-1 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                        {/* Category Selector Pill */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCategoryMenuSessionId(isMenuOpen ? null : session.id);
                            }}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${catConfig.bgLight} ${catConfig.bgDark} ${catConfig.border} hover:opacity-85 transition-opacity`}
                            title="카테고리 변경"
                          >
                            <span>{catConfig.icon}</span>
                            <span>{catConfig.label}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          {/* Category Dropdown Menu */}
                          {isMenuOpen && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 bottom-full mb-1 z-50 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 text-xs animate-in fade-in"
                            >
                              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">분류 변경</div>
                              {(["업무", "개발", "개인", "학습", "일반"] as ("업무" | "개발" | "개인" | "학습" | "일반")[]).map(c => {
                                const cConf = CATEGORY_CONFIG[c];
                                return (
                                  <button
                                    key={c}
                                    onClick={(e) => setSessionCategory(session.id, c, e)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-[11px] ${session.category === c ? "text-indigo-600 font-bold" : "text-slate-700 dark:text-slate-300"}`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span>{cConf.icon}</span>
                                      <span>{cConf.label}</span>
                                    </span>
                                    {session.category === c && <Check className="w-3 h-3 text-indigo-600" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Custom Tags */}
                        {session.tags && session.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="group/tag inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500"
                            onClick={(e) => removeTagFromSession(session.id, tag, e)}
                            title="클릭하여 태그 삭제"
                          >
                            <span>#{tag}</span>
                            <X className="w-2.5 h-2.5 opacity-0 group-hover/tag:opacity-100" />
                          </span>
                        ))}

                        {/* Inline Tag Adder */}
                        {tagInputSessionId === session.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={newTagText}
                              onChange={(e) => setNewTagText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addTagToSession(session.id, newTagText);
                                if (e.key === "Escape") setTagInputSessionId(null);
                              }}
                              placeholder="태그 입력..."
                              autoFocus
                              className="w-16 px-1 py-0.5 text-[10px] bg-white dark:bg-slate-800 border border-indigo-500 rounded focus:outline-none"
                            />
                            <button
                              onClick={() => addTagToSession(session.id, newTagText)}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTagInputSessionId(session.id);
                              setNewTagText("");
                            }}
                            className="opacity-0 group-hover:opacity-100 px-1 py-0.5 text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity"
                            title="태그 추가"
                          >
                            +태그
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                저장된 답변 ({allBookmarks.length})
              </div>
              {allBookmarks.length === 0 ? (
                <div className="text-center py-12 px-4 text-xs text-slate-400">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-500" />
                  <p className="font-medium text-slate-500 dark:text-slate-400">즐겨찾기한 답변이 없습니다.</p>
                  <p className="mt-1 text-[11px] text-slate-400">메시지 하단의 별표(★)를 눌러 보관하세요.</p>
                </div>
              ) : (
                allBookmarks.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentSessionId(item.sessionId);
                      setSidebarView("chats");
                      setSidebarOpen(false);
                      stopTTS();
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[130px]">{item.sessionTitle}</span>
                      <span className="text-slate-400">{new Date(item.message.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.message.content}
                    </p>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportSessionsToJson}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="대화 기록 JSON 내보내기"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>내보내기</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="대화 기록 JSON 불러오기"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>가져오기</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importSessionsFromJson} 
              accept=".json" 
              className="hidden" 
            />
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" />
              <span>페르소나 및 설정</span>
            </div>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono">
              {settings.persona.name}
            </span>
          </button>
          
          <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">화면 테마</span>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              {settings.darkMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>다크 모드</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>라이트 모드</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Studio Area */}
      <main className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <div className="flex items-center gap-2">
                {editingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitle();
                        if (e.key === "Escape") setEditingTitle(false);
                      }}
                      autoFocus
                      className="px-2 py-0.5 text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 border border-indigo-500 rounded focus:outline-none"
                    />
                    <button onClick={saveTitle} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { setEditingTitle(true); setTitleInput(currentSession.title); }}>
                    <h2 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                      {currentSession.title}
                    </h2>
                    <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                {/* Current Category Badge with quick switcher */}
                <select
                  value={currentSession.category}
                  onChange={(e) => setSessionCategory(currentSession.id, e.target.value as any)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border focus:outline-none cursor-pointer ${currentCatConf.bgLight} ${currentCatConf.bgDark} ${currentCatConf.border}`}
                >
                  <option value="업무">💼 업무</option>
                  <option value="개발">💻 개발</option>
                  <option value="개인">👤 개인</option>
                  <option value="학습">📚 학습</option>
                  <option value="일반">💬 일반</option>
                </select>

                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  <span>{settings.persona.icon}</span>
                  <span>{settings.persona.name}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>추천 엔진:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{currentSession.model}</span>
                {currentSession.tags && currentSession.tags.length > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-slate-400">
                    {currentSession.tags.map(t => `#${t}`).join(" ")}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Token Counter Widget */}
            <div 
              onClick={() => { setActiveTab("tokens"); setSettingsOpen(true); }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:border-indigo-500 transition-colors"
              title="누적 토큰 사용량 확인"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{totalCumulativeTokens.toLocaleString()} 토큰</span>
            </div>

            {/* In-chat Search Toggle */}
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchKeyword(""); }}
              className={`p-2 rounded-lg transition-colors ${searchOpen ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              title="대화 검색"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Model Selector Dropdown */}
            <select
              value={currentSession.model}
              onChange={(e) => {
                const newModel = e.target.value;
                const newProvider = DEFAULT_MODELS.chatanywhere.some(m => m.id === newModel) ? "chatanywhere" : "gemini";
                setSessions(sessions.map(s => s.id === currentSessionId ? { ...s, model: newModel, provider: newProvider } : s));
              }}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <optgroup label="✨ 추천 엔진 (Google AI Studio)">
                {DEFAULT_MODELS.gemini.map(m => (
                  <option key={m.id} value={m.id}>★ {m.name} ({m.badge})</option>
                ))}
              </optgroup>
              <optgroup label="🌐 ChatAnywhere / OpenAI 호환">
                {DEFAULT_MODELS.chatanywhere.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.badge})</option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Search Bar Subheader */}
        {searchOpen && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="대화 내용 검색 (키워드를 입력하면 노란색으로 강조됩니다)..."
              className="w-full bg-transparent text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-slate-100"
              autoFocus
            />
            {searchKeyword && (
              <span className="text-xs text-indigo-600 dark:text-indigo-400 shrink-0 font-medium">
                {displayedMessages.length}개 일치
              </span>
            )}
            <button
              onClick={() => { setSearchKeyword(""); setSearchOpen(false); }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Message Scroll View */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {currentSession.messages.length === 0 ? (
            /* Empty State: Korean Recommendations Dashboard */
            <div className="max-w-4xl mx-auto py-4 px-2">
              {/* Hero Banner */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-2xl shadow-lg mb-3">
                  <span className="text-2xl">{settings.persona.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  <span className="text-indigo-600 dark:text-indigo-400">{settings.persona.name}</span>와 함께하는 한국어 스튜디오
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  현재 분류: <span className="font-semibold text-indigo-600 dark:text-indigo-400">[{currentCatConf.icon} {currentCatConf.label}]</span> | 첫 질문 내용에 맞춰 카테고리가 자동 판별되고 제목이 지어집니다.
                </p>
              </div>

              {/* Korean Recommendations Section Header & Tabs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">추천 한국어 프롬프트</h4>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">원클릭 시작</span>
                  </div>
                  
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {KOREAN_RECOMMENDATIONS.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeRecCategory.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="group p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shrink-0">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <span className="truncate max-w-[240px] font-mono text-[10px]">{item.prompt}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Persona Switcher Cards */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">추천 페르소나 빠른 선택</h4>
                  <button onClick={() => { setActiveTab("persona"); setSettingsOpen(true); }} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    페르소나 커스텀 설정
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {PERSONA_PRESETS.map((p) => {
                    const isSelected = settings.persona.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSettings({ ...settings, persona: p })}
                        className={`p-3 rounded-xl border text-left transition-all ${isSelected ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"}`}
                      >
                        <div className="text-xl mb-1">{p.icon}</div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{p.personality}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">검색 결과가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">"{searchKeyword}"와 일치하는 메시지를 찾을 수 없습니다.</p>
            </div>
          ) : (
            /* Chat Message List */
            <div className="max-w-3xl mx-auto space-y-6">
              {displayedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                    ${msg.role === "user" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gradient-to-tr from-slate-800 to-slate-700 text-white dark:from-indigo-900 dark:to-indigo-800"}
                  `}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-300" />}
                  </div>

                  <div className={`
                    max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-xs
                    ${msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-800"}
                  `}>
                    <div>{renderMessageContent(msg.content, searchKeyword)}</div>

                    {/* Bottom Metadata & Action Bar */}
                    <div className={`
                      flex items-center justify-between gap-3 mt-3 pt-2.5 border-t text-[11px]
                      ${msg.role === "user" 
                        ? "border-indigo-500/40 text-indigo-200" 
                        : "border-slate-200 dark:border-slate-800 text-slate-400"}
                    `}>
                      <span className="font-mono text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {msg.tokens && (
                          <span className="font-mono text-[10px] opacity-75">
                            {msg.tokens.total_tokens || msg.tokens.totalTokenCount || 0} 토큰
                          </span>
                        )}

                        {/* Text-To-Speech Button (Assistant Only) */}
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => toggleTTS(msg.id, msg.content)}
                            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${speakingMessageId === msg.id ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                            title={speakingMessageId === msg.id ? "음성 정지" : "한국어 음성으로 듣기"}
                          >
                            {speakingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Bookmark Button */}
                        <button
                          onClick={() => toggleBookmark(msg.id)}
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${msg.isBookmarked ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}
                          title={msg.isBookmarked ? "즐겨찾기 해제" : "답변 즐겨찾기에 보관"}
                        >
                          <Star className={`w-3.5 h-3.5 ${msg.isBookmarked ? "fill-amber-500" : ""}`} />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${msg.role === "user" ? "hover:bg-indigo-700 text-indigo-100" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                          title="텍스트 복사"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-sm">
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium text-xs sm:text-sm">{settings.persona.name}이(가) 답변을 작성 중입니다...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* Quick Action Badges */}
            {currentSession.messages.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={retryLastMessage}
                    disabled={isLoading}
                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-40"
                    title="마지막 질문 다시 생성"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>다시 답변받기</span>
                  </button>
                  <span>•</span>
                  <span>대화 모델: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{currentSession.model}</strong></span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Enter: 전송</span>
                  <span>/</span>
                  <span>Shift+Enter: 줄바꿈</span>
                </div>
              </div>
            )}

            {/* Input Box */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`${settings.persona.name}에게 질문하기... (한국어로 답변)`}
                rows={1}
                className="w-full py-3 pl-4 pr-24 bg-transparent text-sm text-slate-900 dark:text-slate-100 focus:outline-none resize-none max-h-36 leading-relaxed"
              />

              <div className="absolute right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="한국어 음성 입력 (마이크)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={isLoading || !inputMessage.trim()}
                  onClick={() => handleSendMessage()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-xs transition-all active:scale-95"
                  title="메시지 전송"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1.5 truncate">
                <span>카테고리:</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${currentCatConf.bgLight} ${currentCatConf.bgDark} ${currentCatConf.border}`}>
                  {currentCatConf.icon} {currentCatConf.label}
                </span>
                <span>•</span>
                <span>페르소나:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-medium">{settings.persona.name}</strong>
              </div>
              <span className="shrink-0 font-medium text-slate-500 dark:text-slate-400">
                {currentSession.provider === "gemini" ? "Google AI Studio Gemini API" : "ChatAnywhere OpenAI API"}
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Settings & Token Monitor Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">스튜디오 환경 설정</h3>
                  <p className="text-xs text-slate-500">페르소나 커스텀, 토큰 모니터링, API 설정</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/60 dark:bg-slate-900/40">
              <button
                onClick={() => setActiveTab("persona")}
                className={`py-3 px-3.5 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "persona" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <span>🤖 페르소나 설정</span>
              </button>
              <button
                onClick={() => setActiveTab("tokens")}
                className={`py-3 px-3.5 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "tokens" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <span>📊 토큰 모니터링</span>
              </button>
              <button
                onClick={() => setActiveTab("general")}
                className={`py-3 px-3.5 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "general" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                <span>⚙️ LLM 및 API 설정</span>
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {activeTab === "persona" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      페르소나 프리셋 선택
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PERSONA_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, persona: p })}
                          className={`p-3 rounded-xl border text-left transition-all ${settings.persona.id === p.id ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{p.icon}</span>
                            <span className="font-bold text-xs">{p.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{p.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      챗봇 호칭 이름
                    </label>
                    <input
                      type="text"
                      value={settings.persona.name}
                      onChange={(e) => setSettings({ ...settings, persona: { ...settings.persona, name: e.target.value } })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      말투 (Tone)
                    </label>
                    <input
                      type="text"
                      value={settings.persona.tone}
                      onChange={(e) => setSettings({ ...settings, persona: { ...settings.persona, tone: e.target.value } })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      추가 시스템 지침
                    </label>
                    <textarea
                      value={settings.persona.customInstructions}
                      onChange={(e) => setSettings({ ...settings, persona: { ...settings.persona, customInstructions: e.target.value } })}
                      rows={3}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ) : activeTab === "tokens" ? (
                <div className="space-y-6">
                  {/* Total Stat Box */}
                  <div className="p-5 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white rounded-xl shadow-sm">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-1">전체 누적 토큰 소비량</div>
                    <div className="text-3xl font-extrabold font-mono">{totalCumulativeTokens.toLocaleString()} tokens</div>
                    <div className="text-xs opacity-90 mt-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>총 {sessions.length}개 세션에서 생성된 토큰 통계입니다.</span>
                    </div>
                  </div>

                  {/* Per Session Distribution */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      세션별 토큰 사용량 분포
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {sessions.map(s => {
                        const sessionTokens = s.messages.reduce((acc, m) => acc + (m.tokens?.total_tokens || m.tokens?.totalTokenCount || 0), 0);
                        const percentage = totalCumulativeTokens > 0 ? Math.round((sessionTokens / totalCumulativeTokens) * 100) : 0;
                        const cConf = CATEGORY_CONFIG[s.category] || CATEGORY_CONFIG["일반"];
                        return (
                          <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="truncate max-w-[200px] text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                <span>{cConf.icon}</span>
                                <span>{s.title}</span>
                              </span>
                              <span className="font-mono text-indigo-600 dark:text-indigo-400">{sessionTokens.toLocaleString()} 토큰 ({percentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      기본 LLM 제공자
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, provider: "gemini", model: "gemini-3.8-flash" })}
                        className={`p-3.5 rounded-xl border text-left transition-all ${settings.provider === "gemini" ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <div className="font-bold text-xs mb-0.5">Google AI Studio</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Gemini 3.8 Flash (강력 추천)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, provider: "chatanywhere", model: "gpt-4o-mini" })}
                        className={`p-3.5 rounded-xl border text-left transition-all ${settings.provider === "chatanywhere" ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        <div className="font-bold text-xs mb-0.5">ChatAnywhere</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">GPT-4o / Claude 호환 API</div>
                      </button>
                    </div>
                  </div>

                  {settings.provider === "chatanywhere" && (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          ChatAnywhere API 키
                        </label>
                        <input
                          type="password"
                          value={settings.apiKey}
                          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Base URL
                        </label>
                        <input
                          type="text"
                          value={settings.baseUrl}
                          onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                          placeholder="https://api.chatanywhere.tech/v1"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        창의성 온도 (Temperature: {settings.temperature})
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>정확하고 일관됨 (0.0)</span>
                      <span>창의적이고 다양함 (1.0)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow-sm transition-all"
              >
                적용 및 닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
