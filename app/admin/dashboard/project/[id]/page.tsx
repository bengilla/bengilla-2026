'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './edit.module.css';
import { CATEGORIES } from '@/lib/types';
import type { ImageItem, Project } from '@/lib/types';

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; title: string; message: string; type: 'alert' | 'confirm'; onConfirm?: () => void }>({ open: false, title: '', message: '', type: 'alert' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showAlert(title: string, message: string) {
    setModal({ open: true, title, message, type: 'alert' });
  }

  function showConfirm(title: string, message: string, onConfirm: () => void) {
    setModal({ open: true, title, message, type: 'confirm', onConfirm });
  }

  // 正确获取 params.id
  useEffect(() => {
    if (params.id) setProjectId(params.id);
  }, [params.id]);

  useEffect(() => {
    if (!projectId) return;
    async function load() {
      try {
        const [projRes, imgRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/images`),
        ]);
        const projData = await projRes.json();
        const imgData = await imgRes.json();

        if (projData.project) {
          setProject(projData.project);
          setNameZh(projData.project.name_zh || '');
          setNameEn(projData.project.name_en || '');
          setCategory(projData.project.category || 'other');
          setDescription(projData.project.description || '');
        }
        setImages(imgData.images || []);
      } catch {
        console.error('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !nameZh.trim()) {
      showAlert('提示', '请填写项目名称（中文）');
      return;
    }
    if (!nameEn.trim()) {
      showAlert('提示', '请填写项目名称（英文）');
      return;
    }
    if (!category) {
      showAlert('提示', '请选择项目类别');
      return;
    }
    if (images.length === 0) {
      showAlert('提示', '请至少上传一张照片');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_zh: nameZh.trim(), name_en: nameEn.trim(), category, description }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        showAlert('成功', '保存成功');
      }
    } catch {
      showAlert('错误', '保存失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || !projectId) return;
    setUploading(true);

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.image) {
          setImages((prev) => [...prev, data.image]);
        }
      } catch {
        console.error('Upload failed for', file.name);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDeleteImage(imageId: string) {
    if (!projectId) return;
    showConfirm('确认', '确定删除这张图片？', async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/images`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId }),
        });
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || []);
        }
      } catch {
        showAlert('错误', '删除失败');
      }
    });
  }

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (!project) {
    return <div className={styles.loading}>项目不存在</div>;
  }

  // Modal component
  function ModalOverlay() {
    if (!modal.open) return null;
    return (
      <div className={styles.modalOverlay} onClick={() => setModal({ ...modal, open: false })}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>{modal.title}</span>
            <button className={styles.modalClose} onClick={() => setModal({ ...modal, open: false })}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className={styles.modalBody}>
            <p>{modal.message}</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.modalBtn} onClick={() => {
              if (modal.type === 'confirm' && modal.onConfirm) {
                modal.onConfirm();
              }
              setModal({ ...modal, open: false });
            }}>确定</button>
            {modal.type === 'confirm' && (
              <button className={styles.modalCancelBtn} onClick={() => setModal({ ...modal, open: false })}>取消</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ModalOverlay />
      <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <Link href="/admin/dashboard" className={styles.backLink}>
            <i className="fas fa-arrow-left" /> 返回
          </Link>
          <span className={styles.dashLabel}>Admin</span>
        </div>
      </div>

      <div className={styles.pageContent}>
        <h1 className={styles.pageTitle}>编辑项目</h1>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>项目名称（中文） *</label>
              <input
                type="text"
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>项目名称（英文） *</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
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
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving || !nameZh.trim() || !nameEn.trim() || !category || images.length === 0}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>

        {/* 图片管理 */}
        <div className={styles.imageSection}>
          <h2 className={styles.sectionTitle}>
            图片 ({images.length})
          </h2>

          {/* 上传区 */}
          <div
            className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
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
            {uploading ? (
              <div className={styles.uploadText}>上传中...</div>
            ) : (
              <>
                <i
                  className="fas fa-cloud-upload-alt"
                  style={{ fontSize: '32px', marginBottom: '12px' }}
                />
                <div className={styles.uploadText}>
                  点击或拖拽上传图片
                </div>
                <div className={styles.uploadHint}>
                  支持 JPG、PNG、WebP，每张最大 10MB
                </div>
              </>
            )}
          </div>

          {/* 图片网格 */}
          {images.length > 0 ? (
            <div className={styles.imageGrid}>
              {images.map((img) => (
                <div key={img.id} className={styles.imageCard}>
                  <img src={img.url} alt={img.filename} />
                  <button
                    className={styles.imageDeleteBtn}
                    onClick={() => handleDeleteImage(img.id)}
                    title="删除图片"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noImages}>还没有上传图片</div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
