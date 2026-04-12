'use client';

import { useState, useEffect, useRef } from 'react';
import type { Project } from '@/lib/types';
import { tCategory } from '@/lib/i18n';

interface HeroSliderProps {
  projects: Project[];
}

export default function HeroSlider({ projects }: HeroSliderProps) {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(() => {
    const seed = Date.now() + Math.random();
    return projects.length > 0 ? Math.floor((seed % 1) * projects.length) : 0;
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [scale, setScale] = useState(1);
  const [categoryLabel, setCategoryLabel] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wheelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);
  const isPinching = useRef<boolean>(false);
  const isScaling = useRef<boolean>(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const overlayOpen = useRef<boolean>(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const currentProject = projects[currentProjectIndex];

  useEffect(() => {
    if (currentProject) {
      setCategoryLabel(tCategory(currentProject.category));
    }
  }, [currentProject]);

  // 加载当前项目的图片
  useEffect(() => {
    if (!currentProject) return;

    async function load() {
      try {
        const res = await fetch(`/api/projects/${currentProject.id}/images`);
        const data = await res.json();
        setImages(data.images?.map((img: { url: string }) => img.url) || []);
        setCurrentImageIndex(0);
        setNextImageIndex(null);
      } catch {
        setImages([]);
      }
    }
    load();
  }, [currentProject]);

  // 监听项目切换事件
  useEffect(() => {
    function handleSwitch(e: CustomEvent<{ projectId: string }>) {
      const idx = projects.findIndex((p) => p.id === e.detail.projectId);
      if (idx !== -1) {
        setCurrentProjectIndex(idx);
        setCurrentImageIndex(0);
        setNextImageIndex(null);
      }
    }
    window.addEventListener('switchProject', handleSwitch as EventListener);
    return () =>
      window.removeEventListener('switchProject', handleSwitch as EventListener);
  }, [projects]);

  useEffect(() => {
    function handleOpenProjects() {
      overlayOpen.current = true;
    }
    function handleCloseProjects() {
      overlayOpen.current = false;
    }
    window.addEventListener('openProjects', handleOpenProjects);
    window.addEventListener('closeProjects', handleCloseProjects);
    return () => {
      window.removeEventListener('openProjects', handleOpenProjects);
      window.removeEventListener('closeProjects', handleCloseProjects);
    };
  }, []);

  function goToSlide(index: number, dir: 'next' | 'prev') {
    if (sliding || index === currentImageIndex || images.length === 0) return;
    setSliding(true);
    setDirection(dir);
    setNextImageIndex(index);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setNextImageIndex(null);
      setSliding(false);
    }, 500);
  }

  function nextSlide() {
    if (images.length === 0 || isScaling.current) return;
    goToSlide((currentImageIndex + 1) % images.length, 'next');
  }

  function prevSlide() {
    if (images.length === 0) return;
    goToSlide((currentImageIndex - 1 + images.length) % images.length, 'prev');
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 5000);
  }

  // 双指缩放
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      isPinching.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance.current = Math.hypot(dx, dy);
      initialScale.current = scale;
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && isPinching.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const scaleFactor = currentDistance / initialPinchDistance.current;
      const newScale = Math.min(1, Math.max(0.7, initialScale.current * scaleFactor));
      setScale(newScale);
    }
  }

  function handleWheel(e: React.WheelEvent) {
    if (e.deltaY > 0) {
      setScale(prev => Math.max(0.7, prev - 0.02));
    } else {
      setScale(prev => Math.min(1, prev + 0.02));
    }

    // 停止滚轮1秒后重置计时器
    isScaling.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = setTimeout(() => {
      isScaling.current = false;
      resetTimer();
    }, 1000);
  }

  function resetScale() {
    setScale(1);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    touchEndY.current = e.changedTouches[0].clientY;

    if (isPinching.current) {
      isPinching.current = false;
      isScaling.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        resetTimer();
      }, 1000);
    } else {
      if (overlayOpen.current) return;

      const diffX = touchStartX.current - touchEndX.current;
      const diffY = touchStartY.current - touchEndY.current;
      const threshold = 50;

      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        window.dispatchEvent(new CustomEvent('openProjects'));
      } else if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        resetTimer();
      }
    }
  }

  useEffect(() => {
    if (images.length > 0) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [images]);

  if (!currentProject || images.length === 0) {
    return (
      <div className="hero-work">
        <div className="hero-empty">暂无图片</div>
      </div>
    );
  }

  return (
    <>
      <div
        className="hero-work"
        ref={heroRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className="hero-slide-wrapper"
          style={{ transform: scale < 1 ? `scale(${scale})` : undefined }}
        >
          {/* 当前图片 */}
          <img
            src={images[currentImageIndex]}
            alt={currentProject?.name_zh || '作品'}
            className={`hero-slide ${sliding ? (direction === 'next' ? 'slide-out-left' : 'slide-out-right') : ''}`}
            style={{ objectFit: scale < 1 ? 'contain' : 'cover' }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />

          {/* 下一张图片 */}
          {nextImageIndex !== null && (
            <img
              src={images[nextImageIndex]}
              alt=""
              className={`hero-slide ${direction === 'next' ? 'slide-in-right' : 'slide-in-left'}`}
              style={{ objectFit: scale < 1 ? 'contain' : 'cover' }}
            />
          )}
        </div>

        {/* 信息叠加层 - 底部细线 */}
        <div className="hero-info">
          <div className="hero-info-line">
            <div className="hero-info-name">{currentProject.name_zh}</div>
            <div className="hero-info-name-en">{currentProject.name_en}</div>
            <div className="hero-info-category">
              {categoryLabel}
            </div>
          </div>
        </div>
      </div>

      <button
        className="slider-arrow left"
        onClick={() => {
          prevSlide();
          resetTimer();
        }}
        aria-label="上一张"
      >
        <i className="fas fa-chevron-left" />
      </button>
      <button
        className="slider-arrow right"
        onClick={() => {
          nextSlide();
          resetTimer();
        }}
        aria-label="下一张"
      >
        <i className="fas fa-chevron-right" />
      </button>

      {scale < 1 && (
        <button
          className="scale-reset-btn"
          onClick={resetScale}
          aria-label="恢复原始大小"
        >
          <i className="fas fa-expand" />
        </button>
      )}

      <div className="slider-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === currentImageIndex && !sliding ? 'active' : ''}`}
            onClick={() => {
              if (i === currentImageIndex) return;
              const dir = i > currentImageIndex ? 'next' : 'prev';
              goToSlide(i, dir);
              resetTimer();
            }}
          />
        ))}
      </div>
    </>
  );
}
