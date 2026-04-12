'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { CATEGORIES } from '@/lib/types';
import type { ImageItem } from '@/lib/types';

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

function Modal({ isOpen, title, message, onClose }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.modalClose} onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.modalBtn} onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showModal(title: string, message: string) {
    setModal({ open: true, title, message });
  }

  function handleFileUpload(files: FileList | null) {
    if (!files) return;
    const fileArray = Array.from(files);
    const newPending: PendingFile[] = fileArray.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDeletePending(id: string) {
    setPendingFiles((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError('');

    if (!nameZh.trim()) {
      setValidationError('请填写项目名称（中文）');
      return;
    }
    if (!nameEn.trim()) {
      setValidationError('请填写项目名称（英文）');
      return;
    }
    if (!category) {
      setValidationError('请选择项目类别');
      return;
    }
    if (pendingFiles.length === 0) {
      setValidationError('请至少上传一张照片');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_zh: nameZh.trim(), name_en: nameEn.trim(), category, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '创建失败');
        setLoading(false);
        return;
      }

      const projectId = data.project.id;

      setUploading(true);
      for (const pf of pendingFiles) {
        const formData = new FormData();
        formData.append('file', pf.file);
        formData.append('projectId', projectId);
        try {
          await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
        } catch {
          console.error('Upload failed for', pf.file.name);
        }
      }

      router.push('/admin/dashboard');
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Modal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <Link href="/admin/dashboard" className={styles.backLink}>
            <i className="fas fa-arrow-left" /> 返回
          </Link>
          <span className={styles.dashLabel}>Admin</span>
        </div>
      </div>

      <div className={styles.pageContent}>
        <h1 className={styles.pageTitle}>新建项目</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>项目名称（中文） *</label>
              <input
                type="text"
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                placeholder="例如：舞台视觉"
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label>项目名称（英文） *</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="例如：Stage Design"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>项目类别 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">请选择类别</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="项目简介"
              rows={4}
            />
          </div>

          {/* 图片上传 */}
          <div className={styles.formGroup}>
            <label>封面图片</label>
            <div
              className={styles.uploadArea}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              {loading && uploading ? (
                <div className={styles.uploadText}>上传中...</div>
              ) : pendingFiles.length === 0 ? (
                <>
                  <i className="fas fa-cloud-upload-alt" style={{ fontSize: '32px', marginBottom: '12px' }} />
                  <div className={styles.uploadText}>点击或拖拽上传图片</div>
                  <div className={styles.uploadHint}>支持 JPG、PNG、WebP</div>
                </>
              ) : null}
            </div>

            {pendingFiles.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {pendingFiles.map((pf) => (
                  <div key={pf.id} className={styles.imagePreviewCard}>
                    <img src={pf.previewUrl} alt={pf.file.name} />
                    <button
                      type="button"
                      className={styles.imageDeleteBtn}
                      onClick={() => handleDeletePending(pf.id)}
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(error || validationError) && <div className={styles.error}>{validationError || error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.back()}
            >
              取消
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !nameZh.trim() || !nameEn.trim() || !category || pendingFiles.length === 0}
            >
              {loading ? (uploading ? '上传中...' : '创建中...') : '创建项目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
