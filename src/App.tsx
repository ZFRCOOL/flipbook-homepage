import React, {forwardRef, useEffect, useRef, useState} from 'react';
import HTMLFlipBook from 'react-pageflip';
import {BookOpen, Compass, Mail, Pencil, Ruler, User, Wrench} from 'lucide-react';

type PageProps = {
  children: React.ReactNode;
  density?: 'hard' | 'soft';
};

const Page = forwardRef<HTMLDivElement, PageProps>(({children, density = 'soft'}, ref) => {
  const readerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({scale: 1, height: 0});
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    if (density === 'hard') return;
    const reader = readerRef.current!;
    const content = contentRef.current!;
    const mobile = window.matchMedia('(max-width: 767px)');
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!mobile.matches) {
          setFit(previous => previous.height === 0 ? previous : {scale: 1, height: 0});
          setHasMore(false);
          return;
        }
        const style = getComputedStyle(reader);
        const available = reader.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        const natural = content.offsetHeight;
        if (available <= 0 || natural <= 0) return;
        // Keep small text readable; longer pages remain scrollable.
        const scale = Math.min(1, Math.max(0.88, available / natural));
        const height = Math.ceil(natural * scale);
        setFit(previous => previous.scale === scale && previous.height === height ? previous : {scale, height});
        setHasMore(height - available - reader.scrollTop > 4);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(reader);
    observer.observe(content);
    mobile.addEventListener('change', measure);
    measure();
    return () => { observer.disconnect(); mobile.removeEventListener('change', measure); cancelAnimationFrame(frame); };
  }, [density]);
  // Let the browser scroll long mobile pages without the flip library taking the gesture.
  const handleReadingTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    if (density === 'soft' && window.matchMedia('(max-width: 767px)').matches &&
        event.currentTarget.scrollHeight > event.currentTarget.clientHeight) {
      event.stopPropagation();
    }
  };
  return (
    <div className={`page ${density === 'hard' ? 'hard' : ''}`} ref={ref} data-density={density}>
      <div ref={readerRef} className="page-content" onTouchStartCapture={handleReadingTouch}
        onTouchMoveCapture={handleReadingTouch} onTouchEndCapture={handleReadingTouch}
        onScroll={(event) => {
          const reader = event.currentTarget;
          setHasMore(reader.scrollHeight - reader.clientHeight - reader.scrollTop > 4);
        }}>
        {density === 'hard' ? children : <div className="page-fit-stage" style={fit.height ? {height: fit.height} : undefined}>
          <div ref={contentRef} className="page-fit-content" style={fit.height ? {transform: `scale(${fit.scale})`} : undefined}>{children}</div>
        </div>}
      </div>
      {density === 'soft' && hasMore && <div className="reading-hint" aria-live="polite">下方还有内容 · 向上滑动 ↑</div>}
    </div>
  );
});

Page.displayName = 'Page';

function ProfilePhoto() {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const timeout = window.setTimeout(() => setStatus(current => current === 'loading' ? 'error' : current), 12000);
    return () => window.clearTimeout(timeout);
  }, [attempt]);
  const suffix = attempt ? `?retry=${attempt}` : '';
  return <div className="profile-photo">
    <img src={`${import.meta.env.BASE_URL}profile-photo-640.webp${suffix}`}
      srcSet={`${import.meta.env.BASE_URL}profile-photo-320.webp${suffix} 320w, ${import.meta.env.BASE_URL}profile-photo-640.webp${suffix} 640w`}
      sizes="(max-width: 767px) 112px, 280px" width={640} height={640}
      loading="eager" decoding="async" fetchPriority="high" alt="御风未来头像"
      className={`w-full h-[280px] md:h-[340px] object-cover rounded-[18px] border-2 border-gray-700 ${status === 'loaded' ? '' : 'opacity-0'}`}
      onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />
    {status !== 'loaded' && <div className="photo-status" role="status">
      <span className="text-3xl" aria-hidden="true">御风</span>
      {status === 'error' ? <button type="button" onClick={(event) => {
        event.stopPropagation(); setStatus('loading'); setAttempt(value => value + 1);
      }}>头像未加载，点此重试</button> : <span>头像加载中…</span>}
    </div>}
  </div>;
}

function ContactCard() {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="contact-card w-full text-center">
    <button type="button" className="group mx-auto block max-w-full" aria-label="显示或收起邮箱"
      aria-expanded={isOpen} aria-controls="contact-email"
      onMouseDownCapture={event => event.stopPropagation()} onMouseUpCapture={event => event.stopPropagation()}
      onTouchStartCapture={event => event.stopPropagation()} onTouchEndCapture={event => event.stopPropagation()}
      onTouchMoveCapture={event => event.stopPropagation()} onClick={(event) => {
        event.stopPropagation(); setIsOpen(open => !open);
      }}>
      <svg width="250" height="180" viewBox="0 0 200 150" fill="none" stroke="#2c2c2c"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        className="pointer-events-none max-w-full group-hover:-translate-y-1 transition-transform duration-300">
        <rect x="10" y="20" width="180" height="110" rx="5" fill="#fdfbf7" />
        <path d="M10 20 L100 80 L190 20" fill="rgba(181, 234, 215, 0.3)" />
        <path d="M10 130 L80 80" /><path d="M190 130 L120 80" />
        <rect x="150" y="30" width="30" height="35" strokeDasharray="2,2" fill="rgba(255, 183, 178, 0.3)" />
        <circle cx="165" cy="47" r="8" /><path d="M155 40 Q165 35 175 40" />
      </svg>
    </button>
    <div id="contact-email" hidden={!isOpen} className="mt-6" aria-live="polite">
      <p className="text-xl md:text-2xl font-bold text-gray-800 mb-4 break-all select-all">zfrcool2001@gmail.com</p>
      <div className="flex flex-wrap justify-center gap-4">
        <span className="text-lg underline decoration-2 underline-offset-4 hover:text-blue-600 highlight-yellow">GitHub</span>
        <span className="text-lg underline decoration-2 underline-offset-4 hover:text-blue-600 highlight-blue">小红书</span>
        <span className="text-lg underline decoration-2 underline-offset-4 hover:text-blue-600 highlight-pink">抖音</span>
      </div>
    </div>
  </div>;
}

const timelineItems = [
  {
    year: '2023年 - 毕业入职',
    desc: '从大学的校园中走出，蜕变为社会牛马，打工为生。',
    dot: 'bg-amber-200',
  },
  {
    year: '2024年 - 悟道之旅',
    desc: '读到了《富爸爸穷爸爸》这本书，开启了财商启蒙，试图从股票市场和基金市场中变成中国巴菲特，可惜被白酒挂在山顶了。',
    dot: 'bg-sky-200',
  },
  {
    year: '2025年 - 初识',
    desc: '接触到国外顶级模型 ChatGPT 和国内 DeepSeek，被深深吸引，感觉人生开启了新的篇章！',
    dot: 'bg-rose-200',
  },
  {
    year: '2026年 - 醒悟',
    desc: '职场打工生活只会消磨人的意志，一点点地蚕食掉一个人的创造性和思维启迪，慢慢变成行尸走肉和傀儡，因此我将利用 vibe-coding 和想象力，去塑造属于 Idea 自由的未来！',
    dot: 'bg-lime-200',
  },
  {
    year: '2026年初 - 大胆尝试',
    desc: '我录制了第一条抖音视频，是利用 vibe-coding 进行自由创作的，这是我迈入自媒体的第一次大胆尝试，感觉非常奇妙，乐在其中，果然，兴趣是最好的老师！',
    dot: 'bg-violet-200',
  },
];

export default function App() {
  const bookRef = useRef<any>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pendingPageRef = useRef<number | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 跟踪当前页与横竖屏，用于“合书”状态（仅封面/仅封底）时让单页居中
  const [bookPage, setBookPage] = useState(0);
  const [bookOrientation, setBookOrientation] = useState('landscape');
  const [bookPageCount, setBookPageCount] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    const handleMouseDown = () => cursorRef.current?.classList.add('clicking');
    const handleMouseUp = () => cursorRef.current?.classList.remove('clicking');

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 库是否处于忙碌状态（翻页/拖角/折角动画未收尾）。
  // 注意：折角回落动画期间 state 已被置回 'read'，但 calc 仍持有动画数据，
  // 只看 state 会误判为空闲——这正是偶发“点击翻错页/没反应”的根源
  const isBookBusy = (pageFlip: any): boolean => {
    const controller = pageFlip.getFlipController();
    return pageFlip.getState() !== 'read' || controller.calc !== null;
  };

  const goToPage = (pageIndex: number) => {
    const pageFlip = bookRef.current?.pageFlip?.();
    if (!pageFlip) return;

    if (isBookBusy(pageFlip)) {
      // 忙碌中不强行下指令（page-flip 会强制收尾当前动画，折角过半时还会把
      // 当前页强制翻过去，叠加我们的翻页就会连翻两页、落在错误页面上）。
      // 只记住最后一次点击的目标，等真正空闲后执行
      pendingPageRef.current = pageIndex;
      // 库的收尾并非都有事件可监听（折角回落动画不发任何事件），轮询兜底消费
      if (pollTimerRef.current === null) {
        pollTimerRef.current = setInterval(() => {
          const pf = bookRef.current?.pageFlip?.();
          if (!pf) return;
          const pending = pendingPageRef.current;
          if (pending === null) {
            clearInterval(pollTimerRef.current!);
            pollTimerRef.current = null;
            return;
          }
          if (!isBookBusy(pf)) {
            clearInterval(pollTimerRef.current!);
            pollTimerRef.current = null;
            pendingPageRef.current = null;
            goToPage(pending);
          }
        }, 50);
      }
      return;
    }

    // 空闲时的新点击优先于任何排队目标
    pendingPageRef.current = null;
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    // 距离判断直接使用库内部跨页索引，与 flip()/turnToPage() 的行为基准完全一致
    const collection = pageFlip.getPageCollection();
    const targetSpread = collection.getSpreadIndexByPage(pageIndex);
    if (targetSpread === null) return;
    const currentSpread = collection.getCurrentSpreadIndex();
    if (targetSpread === currentSpread) return;

    // 相邻跨页走正常翻页动画；跨多页直接跳转（flip() 跨多页时动画基页会错乱）
    if (Math.abs(targetSpread - currentSpread) === 1) {
      pageFlip.flip(pageIndex);
    } else {
      pageFlip.turnToPage(pageIndex);
    }
    // turnToPage 不触发 flip 事件，flip 也要在动画开始时就让书开始平移，
    // 与 700ms 翻页动画同步，所以这里统一手动更新页码
    setBookPage(pageIndex);
  };

  // 翻页落定：校正实际页码（用户拖角翻页等情况），用于“合书”居中
  const handleFlipEnd = (e: {data: number}) => {
    setBookPage(e.data);
  };

  const handleInit = () => {
    const pageFlip = bookRef.current?.pageFlip?.();
    if (!pageFlip) return;
    setBookOrientation(pageFlip.getOrientation());
    setBookPageCount(pageFlip.getPageCount());
  };

  // 组件卸载时清理轮询定时器
  useEffect(() => {
    return () => {
      if (pollTimerRef.current !== null) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="site-shell w-full h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="personal-bg-gradient" />
        <div className="personal-bg-grid hand-drawn" />

        <div className="bg-note hand-drawn hidden md:block">
          <span className="bg-note-tape" />
          <p className="text-sm font-bold text-gray-700 tracking-wide">HELLO, I&apos;M YU FENG</p>
          <p className="text-[11px] text-gray-600 mt-2">AI x Execution x Future</p>
          <div className="mt-3 flex gap-1">
            <span className="bg-yellow-200 h-2 w-9 rounded-full" />
            <span className="bg-emerald-200 h-2 w-6 rounded-full" />
            <span className="bg-rose-200 h-2 w-4 rounded-full" />
          </div>
        </div>

        <div className="bg-polaroid hand-drawn hidden lg:block">
          <div className="bg-polaroid-frame">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="50" cy="28" r="14" />
              <path d="M50 42 L50 72 M50 54 L28 44 M50 54 L72 44 M50 72 L34 92 M50 72 L66 92" />
              <path d="M16 82 Q24 74 32 82" />
              <path d="M68 82 Q76 74 84 82" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 mt-3 tracking-[0.2em]">YU FENG FUTURE</p>
        </div>

        <div className="bg-stamp hand-drawn">
          <span className="text-[10px] font-bold tracking-[0.25em]">PORTFOLIO</span>
        </div>

        <svg
          className="absolute left-[10%] bottom-[14%] w-48 h-24 text-emerald-400/80 hand-drawn animate-[floatDoodle_8s_ease-in-out_infinite]"
          viewBox="0 0 180 90"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M4 66 Q30 40 58 60 Q88 82 116 56 Q142 34 176 54" />
          <path d="M20 24 Q38 6 56 24" />
          <path d="M84 26 Q102 8 120 26" />
        </svg>

        <svg
          className="absolute right-[6%] bottom-[10%] w-44 h-44 text-orange-300/80 hand-drawn animate-[spin_30s_linear_infinite]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <circle cx="50" cy="50" r="28" />
          <circle cx="52" cy="52" r="17" strokeDasharray="4 8" />
        </svg>

        <svg
          className="absolute right-[18%] top-[14%] w-28 h-28 text-pink-400/70 hand-drawn animate-[floatDoodle_7s_ease-in-out_infinite]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M20 26 L80 26 L80 74 L20 74 Z" strokeDasharray="5 5" />
          <path d="M28 38 H72 M28 50 H62 M28 62 H68" />
        </svg>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
        <defs>
          <filter id="squiggle">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise">
              <animate
                attributeName="baseFrequency"
                values="0.04;0.05;0.04"
                dur="0.2s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div id="custom-cursor" ref={cursorRef}>
        <Pencil className="w-8 h-8 text-gray-800 -rotate-90" strokeWidth={1.5} />
      </div>

      {/* 合书状态（仅封面/仅封底）时整体平移半页宽，让单页居中呈“合上的书”；
          平移过渡与翻页动画同为 700ms，翻开时书滑回展开位 */}
      <div
        className={`book-shell relative z-10 w-[92vw] h-[88vh] max-w-[1400px] max-h-[920px] mx-auto transition-transform duration-700 ease-in-out ${
          bookOrientation !== 'landscape' ? '' : bookPage === 0 ? 'book-closed-start' : bookPageCount > 0 && bookPage === bookPageCount - 1 ? 'book-closed-end' : ''
        }`}
      >
        {/* @ts-ignore */}
        <HTMLFlipBook
          width={620}
          height={820}
          size="stretch"
          minWidth={280}
          maxWidth={1200}
          minHeight={300}
          maxHeight={1650}
          maxShadowOpacity={0.8}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={true}
          drawShadow={true}
          flippingTime={700}
          className="flip-book mx-auto"
          ref={bookRef}
          onFlip={handleFlipEnd}
          onInit={handleInit}
          onChangeOrientation={(e) => setBookOrientation(e.data)}
        >
          <Page density="hard">
            <div className="cover-content h-full flex flex-col items-center justify-center text-center hand-drawn p-8 relative">
              <div className="cover-badge w-20 h-20 rounded-full border-2 border-dashed border-slate-500/70 bg-sky-100/60 flex items-center justify-center rotate-8 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor">
                  <circle cx="50" cy="50" r="41" strokeWidth="2.5" strokeDasharray="4 4" />
                  <path d="M24 36 L40 36 L32 64" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M60 35 L68 61 L76 35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M44 69 L56 69" strokeWidth="3" strokeLinecap="round" />
                  <path d="M56 22 L60 16 L64 22 L60 28 Z" strokeWidth="2" />
                  <circle cx="22" cy="56" r="2" fill="currentColor" />
                  <circle cx="78" cy="56" r="2" fill="currentColor" />
                </svg>
              </div>

              <div className="absolute left-8 top-12 text-sky-500/60 text-sm font-bold rotate-[-8deg]">{`<x/>`}</div>
              <div className="absolute right-24 top-24 text-rose-400/50 text-sm font-bold rotate-[10deg]">{`{AI}`}</div>
              <div className="absolute left-12 bottom-36 text-cyan-500/55 text-sm font-bold rotate-[6deg]">{`<>`}</div>
              <div className="absolute right-16 bottom-28 text-indigo-500/45 text-sm font-bold rotate-[-10deg]">{`v=`}</div>
              <svg
                className="absolute left-16 top-28 w-20 h-6 text-cyan-500/35"
                viewBox="0 0 100 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M4 20 Q20 2 34 18 Q48 30 64 14 Q80 2 96 16" />
              </svg>

              <h1 className="cover-title text-5xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tighter leading-tight">御风·Future</h1>
              <div className="hand-drawn-border inline-block px-8 py-3 mb-7 bg-[#fdfbf7]/70 backdrop-blur-sm">
                <span className="text-2xl text-gray-800 font-bold">AI-COOL玩</span>
              </div>
              <p className="text-[15px] md:text-lg text-slate-700 font-bold tracking-wide mb-10 bg-sky-50/60 px-4 py-2 rounded-xl border border-dashed border-slate-400">
                执行力驱动灵感，AI放大未来变量
              </p>
              <div
                className="mt-auto mb-8 animate-bounce cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPage(1);
                }}
              >
                <p className="text-xl text-gray-800 mb-2 font-bold inline-block px-4 bg-[#fdfbf7]/50 rounded-lg">点击翻开</p>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-gray-800 mt-2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Page>

          <Page density="hard">
            <div className="h-full flex flex-col items-center justify-center text-center hand-drawn p-8 opacity-75">
              <div className="w-24 h-24 mb-8 text-gray-800">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 50 Q50 20 80 50 T80 90 Q50 60 20 90 Z" />
                </svg>
              </div>
              <p className="text-lg text-gray-800 font-bold tracking-widest">保持热爱，奔赴未来</p>
            </div>
          </Page>

          <Page>
            <div className="hand-drawn h-full">
              <h2 className="text-4xl font-bold mb-8 text-gray-800 inline-block highlight-blue px-2">目录</h2>
              <ul className="space-y-8 text-2xl text-gray-700 mt-8">
                <li className="flex items-center cursor-pointer hover:text-blue-600 transition-colors group" onClick={(e) => { e.stopPropagation(); goToPage(3); }}>
                  <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mr-6 text-lg group-hover:bg-yellow-100">1</span>
                  <span className="border-b-2 border-transparent group-hover:border-current border-dashed">关于我</span>
                </li>
                <li className="flex items-center cursor-pointer hover:text-blue-600 transition-colors group" onClick={(e) => { e.stopPropagation(); goToPage(4); }}>
                  <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mr-6 text-lg group-hover:bg-pink-100">2</span>
                  <span className="border-b-2 border-transparent group-hover:border-current border-dashed">成长轨迹</span>
                </li>
                <li className="flex items-center cursor-pointer hover:text-blue-600 transition-colors group" onClick={(e) => { e.stopPropagation(); goToPage(5); }}>
                  <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mr-6 text-lg group-hover:bg-emerald-100">3</span>
                  <span className="border-b-2 border-transparent group-hover:border-current border-dashed">证书荣誉与能力</span>
                </li>
                <li className="flex items-center cursor-pointer hover:text-blue-600 transition-colors group" onClick={(e) => { e.stopPropagation(); goToPage(6); }}>
                  <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mr-6 text-lg group-hover:bg-yellow-100">4</span>
                  <span className="border-b-2 border-transparent group-hover:border-current border-dashed">联系我</span>
                </li>
              </ul>

              <div className="absolute bottom-12 right-12 opacity-40 text-rose-300">
                <svg width="120" height="120" viewBox="0 0 100 100" className="rotate-12">
                  <path d="M10 50 Q 50 10 90 50 T 90 90" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5,5" />
                  <circle cx="90" cy="90" r="5" fill="currentColor" />
                </svg>
              </div>
            </div>
          </Page>

          <Page>
            <div className="about-page hand-drawn h-full flex flex-col">
              <h2 className="text-4xl font-bold mb-8 text-gray-800 inline-block highlight-yellow px-2">关于我</h2>
              <div className="flex-1 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-2/5 flex justify-center relative">
                  <div className="absolute inset-0 bg-emerald-100/50 rounded-full blur-xl transform -rotate-6 scale-110" />
                  <div className="relative z-10 w-[240px] md:w-[280px] hand-drawn-border bg-[#fdfbf7]/95 shadow-[0_12px_28px_rgba(0,0,0,0.18)] rotate-[-2deg]">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-yellow-200/90 border border-dashed border-gray-500 rotate-3" />
                    <ProfilePhoto />
                    <p className="text-xs text-gray-600 mt-3 text-center tracking-[0.18em]">YU FENG FUTURE</p>
                  </div>
                </div>
                <div className="w-full md:w-3/5 space-y-4 text-[17px] md:text-[20px] text-gray-700 leading-relaxed">
                  <p>
                    你好！这里是<span className="highlight-pink font-bold">御风未来</span>，是一名工作了三年的自控工程师，专业是自动化，希望能通过结合 AI 和执行力，打造出属于自己的未来。
                  </p>
                  <hr className="hand-drawn-hr opacity-50" />
                  <p><span className="font-bold text-gray-800">居住地：</span>苏州</p>
                  <p><span className="font-bold text-gray-800">出生日期：</span>2001.03</p>
                  <p><span className="font-bold text-gray-800">人生态度：</span>打不倒我的，终将使我更加强大！</p>
                  <p><span className="font-bold text-gray-800">未来期盼：</span>希望能有更多志同道合的小伙伴一起找到自己的奋斗意义。</p>
                </div>
              </div>
            </div>
          </Page>

          <Page>
            <div className="hand-drawn h-full">
              <h2 className="text-4xl font-bold mb-10 text-gray-800 inline-block highlight-pink px-2">成长轨迹</h2>
              <div className="relative pl-10 border-l-4 border-gray-800 space-y-10 py-4">
                {timelineItems.map((item) => (
                  <div key={item.year} className="relative">
                    <div className={`absolute -left-[54px] top-1 w-8 h-8 ${item.dot} border-4 border-gray-800 rounded-full flex items-center justify-center`} />
                    <h3 className="text-2xl font-bold">{item.year}</h3>
                    <p className="text-gray-600 mt-2 text-lg leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Page>

          <Page>
            <div className="hand-drawn h-full">
              <h2 className="text-4xl font-bold mb-8 text-gray-800 inline-block highlight-blue px-2">证书荣誉与能力</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="hand-drawn-border p-6 bg-[#fffdf7]/90">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">证书荣誉</h3>
                  <ul className="space-y-2 text-lg text-gray-700 list-disc pl-6">
                    <li>驾驶证</li>
                    <li>优秀员工</li>
                    <li>全国数学建模大赛区奖</li>
                  </ul>
                </div>

                <div className="hand-drawn-border p-6 bg-[#fffdf7]/90">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">能力</h3>
                  <ul className="space-y-2 text-lg text-gray-700 list-disc pl-6">
                    <li>懂一点 Python</li>
                    <li>懂一点 PS</li>
                    <li>懂一点博图和 WINCC 编程</li>
                    <li>懂一点剪辑</li>
                  </ul>
                </div>

                <div className="hand-drawn-border p-6 bg-[#fffdf7]/90 md:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">副业尝试</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-lg text-gray-700 list-disc pl-6">
                    <li>闲鱼卖货</li>
                    <li>小红书 / 今日头条出文章</li>
                    <li>顺风车</li>
                    <li>游戏直播</li>
                    <li>飞书多维表格模板制作</li>
                  </ul>
                </div>
              </div>
            </div>
          </Page>

          <Page>
            <div className="hand-drawn h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-5xl font-bold mb-14 text-gray-800 highlight-pink px-4">联系我吧！</h2>
              <ContactCard />
            </div>
          </Page>

          <Page>
            <div className="h-full flex flex-col items-center justify-center text-center hand-drawn p-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-6 highlight-yellow px-4">感谢阅读！</h2>
              <div className="hand-drawn-border max-w-3xl bg-[#fffdf7]/90 px-6 py-5 text-gray-700 leading-relaxed text-[17px] md:text-[19px]">
                <p>
                  从自动化工程到 AI 自由创作，我始终相信：执行力让想法落地，热爱让坚持发光。感谢你翻完这本手绘小册，见证我的每一次试错与重启。愿我们都能在真实生活里保有好奇、保持行动，用作品定义自己的未来。
                </p>
                <p className="mt-3">
                  如果你也在寻找方向，欢迎一起并肩前行，把灵感变成果实，让普通日常长出不普通的答案。
                </p>
              </div>
              <div className="mt-8 opacity-60 text-rose-300">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
          </Page>

          <Page density="hard">
            <div className="h-full flex flex-col items-center justify-center text-center hand-drawn p-8 opacity-40">
              <div className="w-16 h-16 border-2 border-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-bold text-sm">Seal</span>
              </div>
            </div>
          </Page>

          <Page density="hard">
            <div className="h-full flex flex-col items-center justify-center text-center hand-drawn p-8">
              <h2 className="text-3xl font-bold text-gray-800">完</h2>
              <p className="mt-4 text-gray-700 font-mono text-sm">© 2026 御风·Future</p>
            </div>
          </Page>
        </HTMLFlipBook>
      </div>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-[#fdfbf7]/90 backdrop-blur-md px-3 py-1 rounded-full hand-drawn-border flex gap-3 items-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] scale-75 md:scale-90 origin-bottom">
        <button className="bottom-nav-item relative text-gray-700 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); goToPage(0); }} title="封面">
          <BookOpen size={18} strokeWidth={1.5} />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition-opacity bg-yellow-100 px-2 py-0.5 rounded pointer-events-none">封面</span>
        </button>
        <button className="bottom-nav-item relative text-gray-700 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); goToPage(2); }} title="目录">
          <Ruler size={18} strokeWidth={1.5} />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition-opacity bg-pink-100 px-2 py-0.5 rounded pointer-events-none">目录</span>
        </button>
        <button className="bottom-nav-item relative text-gray-700 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); goToPage(3); }} title="关于我">
          <User size={18} strokeWidth={1.5} />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition-opacity bg-emerald-100 px-2 py-0.5 rounded pointer-events-none">关于我</span>
        </button>
        <button className="bottom-nav-item relative text-gray-700 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); goToPage(4); }} title="成长轨迹">
          <Compass size={18} strokeWidth={1.5} />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition-opacity bg-yellow-100 px-2 py-0.5 rounded pointer-events-none">成长</span>
        </button>
        <button className="bottom-nav-item relative text-gray-700 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); goToPage(5); }} title="证书荣誉与能力">
          <Wrench size={18} strokeWidth={1.5} />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition-opacity bg-pink-100 px-2 py-0.5 rounded pointer-events-none whitespace-nowrap">荣誉能力</span>
        </button>
        <button className="bottom-nav-item relative text-gray-700 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); goToPage(6); }} title="联系我">
          <Mail size={18} strokeWidth={1.5} />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition-opacity bg-emerald-100 px-2 py-0.5 rounded pointer-events-none">联系</span>
        </button>
      </nav>

      <style dangerouslySetInnerHTML={{__html: `.bottom-nav-item:hover span { opacity: 1; }`}} />
    </div>
  );
}
