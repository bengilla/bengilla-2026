'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import Modal from '@/components/admin/Modal';
import type { Project } from '@/lib/types';
import { getCategoryLabel } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassCurrent, setShowPassCurrent] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, title: '', message: '' });
  const [cleanupModal, setCleanupModal] = useState<{
    open: boolean;
    orphaned: { projectId: string; files: string[] }[];
    cleaning: boolean;
  }>({ open: false, orphaned: [], cleaning: false });

  function showAlert(title: string, message: string) {
    setConfirmModal({ open: true, title, message });
  }

  function showConfirm(title: string, message: string, onConfirm: () => void) {
    setConfirmModal({ open: true, title, message, onConfirm });
  }

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      console.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener('pageshow', handlePageShow);

    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.loggedIn) {
          window.location.replace('/admin');
        } else {
          loadProjects();
        }
      })
      .catch(() => window.location.replace('/admin'));

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  function handleDelete(id: string, name: string) {
    showConfirm('确认删除', `确定删除项目「${name}」吗？所有图片也会被删除。`, async () => {
      setDeleting(id);
      try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch {
        showAlert('错误', '删除失败');
      } finally {
        setDeleting(null);
      }
    });
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.replace('/admin');
  }

  async function handleChangePassword() {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('密码至少需要6个字符');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(data.error || '修改密码失败');
      }
    } catch {
      setPasswordError('网络错误');
    }
  }

  async function handleCleanup() {
    setCleanupModal({ open: true, orphaned: [], cleaning: false });
    const res = await fetch('/api/admin/cleanup-images');
    const data = await res.json();
    setCleanupModal((prev) => ({ ...prev, orphaned: data.orphaned || [] }));
  }

  async function handleCleanupDelete() {
    setCleanupModal((prev) => ({ ...prev, cleaning: true }));
    try {
      await fetch('/api/admin/cleanup-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: '*' }),
      });
      setCleanupModal({ open: false, orphaned: [], cleaning: false });
    } catch {
      setCleanupModal((prev) => ({ ...prev, cleaning: false }));
    }
  }

  return (
    <div className={styles.dashboard}>
      <Modal
        open={confirmModal.open}
        title={confirmModal.title}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        footer={
          <>
            <button
              className={styles.modalConfirmBtn}
              onClick={() => {
                confirmModal.onConfirm?.();
                setConfirmModal({ ...confirmModal, open: false });
              }}
            >
              确定
            </button>
            <button
              className={styles.modalCancelBtn}
              onClick={() => setConfirmModal({ ...confirmModal, open: false })}
            >
              取消
            </button>
          </>
        }
      >
        <p>{confirmModal.message}</p>
      </Modal>

      <div className={styles.dashHeader}>
        <div className={styles.dashHeaderInner}>
          <div className={styles.dashBrand}>
            <span className={styles.dashLogo}>BENGILLA</span>
            <span className={styles.dashLabel}>Admin</span>
          </div>
          <div className={styles.dashActions}>
            <button className={styles.backBtn} onClick={() => router.push('/')}>
              <i className="fas fa-external-link-alt" /> 查看网站
            </button>
            <button className={styles.backBtn} onClick={() => setPasswordModalOpen(true)}>
              <i className="fas fa-key" /> 修改密码
            </button>
            <button className={styles.backBtn} onClick={handleCleanup}>
              <i className="fas fa-trash" /> 清理图片
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <i className="fas fa-sign-out-alt" /> 退出
            </button>
          </div>
        </div>
      </div>

      <div className={styles.dashMain}>
        <div className={styles.dashTitleRow}>
          <h1 className={styles.dashTitle}>项目管理</h1>
          <button
            className={styles.addBtn}
            onClick={() => router.push('/admin/dashboard/project/new')}
          >
            <i className="fas fa-plus" /> 新建项目
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : projects.length === 0 ? (
          <div className={styles.empty}>
            <p>还没有项目</p>
            <button onClick={() => router.push('/admin/dashboard/project/new')}>
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className={styles.projectList}>
            {projects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.projectThumb}>
                  <img
                    src={project.cover_image || '/uploads/placeholder.webp'}
                    alt={project.name_zh}
                  />
                </div>
                <div className={styles.projectInfo}>
                  <h3>
                    {project.name_zh}
                    {project.name_en ? ` / ${project.name_en}` : ''}
                  </h3>
                  <p>{getCategoryLabel(project.category)}</p>
                  <span>{new Date(project.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className={styles.projectActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/admin/dashboard/project/${project.id}`)}
                  >
                    <i className="fas fa-pen" /> 编辑
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(project.id, project.name_zh)}
                    disabled={deleting === project.id}
                  >
                    <i className="fas fa-trash" /> {deleting === project.id ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={cleanupModal.open}
        title="清理无用图片"
        onClose={() => !cleanupModal.cleaning && setCleanupModal({ ...cleanupModal, open: false })}
        footer={
          <>
            {!cleanupModal.cleaning && cleanupModal.orphaned.length > 0 && (
              <button className={styles.modalConfirmBtn} onClick={handleCleanupDelete}>
                确认删除
              </button>
            )}
            <button
              className={styles.modalCancelBtn}
              onClick={() => setCleanupModal({ ...cleanupModal, open: false })}
              disabled={cleanupModal.cleaning}
            >
              取消
            </button>
          </>
        }
      >
        {cleanupModal.orphaned.length === 0 ? (
          <p className={styles.successText}>没有发现无用图片</p>
        ) : (
          <>
            <p className={styles.warningText}>发现以下无用图片，确认删除？</p>
            <div className={styles.orphanedList}>
              {cleanupModal.orphaned.map((item) => (
                <div key={item.projectId} className={styles.orphanedItem}>
                  <strong className={styles.dangerText}>项目文件夹: {item.projectId}</strong>
                  <ul className={styles.fileList}>
                    {item.files.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={passwordModalOpen}
        title="修改密码"
        onClose={() => setPasswordModalOpen(false)}
        footer={
          <>
            <button className={styles.modalConfirmBtn} onClick={handleChangePassword}>
              确认修改
            </button>
            <button className={styles.modalCancelBtn} onClick={() => setPasswordModalOpen(false)}>
              取消
            </button>
          </>
        }
      >
        {passwordSuccess ? (
          <p className={styles.successText}>密码修改成功！</p>
        ) : (
          <>
            <div className={styles.formGroup}>
              <label>当前密码</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassCurrent(!showPassCurrent)}>
                  {showPassCurrent ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>新密码</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassNew(!showPassNew)}>
                  {showPassNew ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>确认新密码</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassConfirm(!showPassConfirm)}>
                  {showPassConfirm ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>
            {passwordError && <p className={styles.errorText}>{passwordError}</p>}
          </>
        )}
      </Modal>
    </div>
  );
}
