'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { tProjects, tSelected, tContactMe } from '@/lib/i18n';

interface HeaderProps {
  projects: Project[];
}

export default function Header({ projects }: HeaderProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectText, setProjectText] = useState('Projects');
  const [selectedText, setSelectedText] = useState('Selected · 0 Projects');

  useEffect(() => {
    setProjectText(tProjects());
    setSelectedText(tSelected(projects.length));
  }, []);

  useEffect(() => {
    setSelectedText(tSelected(projects.length));
  }, [projects]);

  useEffect(() => {
    if (!activeProject && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  }, [projects, activeProject]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 监听手机端点击图片打开项目列表
    function handleOpenProjects() {
      setOverlayOpen(true);
    }
    window.addEventListener('openProjects', handleOpenProjects);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('openProjects', handleOpenProjects);
    };
  }, []);

  function handleProjectSelect(project: Project) {
    setActiveProject(project);
    setOverlayOpen(false);
    window.dispatchEvent(new CustomEvent('closeProjects'));
    window.dispatchEvent(
      new CustomEvent('switchProject', { detail: { projectId: project.id } })
    );
  }

  function handleEmailClick(e: React.MouseEvent) {
    e.preventDefault();
    const email = 'bengilla@outlook.com';
    
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(link);
    }
    
    setTimeout(() => {
      navigator.clipboard.writeText(email).then(() => {
        alert(`${tContactMe()}\n\n${email}`);
      }).catch(() => {});
    }, 100);
  }

  return (
    <>
      <header>
        <div className="header-inner">
          <Link href="/" className="logo">
            BENGILLA
          </Link>
          <nav>
            <button
              className="nav-projects-btn"
              onClick={() => setOverlayOpen(true)}
            >
              {projectText}
              <span className="nav-arrow">
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            <button
              onClick={handleEmailClick}
              className="nav-contact"
              title="Email"
              type="button"
            >
              {isMobile ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              ) : (
                'bengilla@outlook.com'
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Projects Overlay */}
      <div
        className={`projects-overlay ${overlayOpen ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setOverlayOpen(false);
            window.dispatchEvent(new CustomEvent('closeProjects'));
          }
        }}
      >
        <div className="projects-modal">
          <div className="projects-modal-header">
            <span className="projects-modal-title">
              {selectedText}
            </span>
            <button
              className="projects-modal-close"
              onClick={() => {
                setOverlayOpen(false);
                window.dispatchEvent(new CustomEvent('closeProjects'));
              }}
              aria-label="关闭"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleProjectSelect(project)}
              >
                <div className="project-card-thumb">
                  <img
                    src={project.cover_image || 'https://via.placeholder.com/400x300/1a1a1a/666?text=No+Image'}
                    alt={project.name_zh}
                    loading="lazy"
                  />
                </div>
                <div className="project-card-info">
                  <div className="project-card-name">{project.name_zh}</div>
                  {project.name_en && (
                    <div className="project-card-name-en">{project.name_en}</div>
                  )}
                  {project.imageCount !== undefined && (
                    <div className="project-card-count">{project.imageCount} images</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 弹窗底部 Email */}
          <div className="projects-modal-footer">
            <button onClick={handleEmailClick} className="modal-email" type="button">
              bengilla@outlook.com
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
