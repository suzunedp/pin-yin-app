import { useEffect, useState } from 'react'
import styles from './InstallPrompt.module.css'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface Props {
  deferredPrompt: BeforeInstallPromptEvent | null
  onDismiss: () => void
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

export default function InstallPrompt({ deferredPrompt, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const dismiss = () => {
    localStorage.setItem('install-prompt-dismissed', 'true')
    setVisible(false)
    setTimeout(onDismiss, 420)
  }

  const handleAdd = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    }
    dismiss()
  }

  return (
    <div className={`${styles.dialog} ${visible ? styles.visible : ''}`}>
      <div className={styles.contentRow}>
        <div className={styles.appIcon}>
          <span className={styles.appIconText}>拼</span>
        </div>
        <div className={styles.textGroup}>
          <p className={styles.title}>ホーム画面に追加</p>
          <p className={styles.description}>
            アプリをホーム画面に追加すると、いつでも素早くアクセスできます
          </p>
        </div>
      </div>

      {isIOS ? (
        <>
          <div className={styles.stepsSection}>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>
                <span className={styles.stepNumText}>1</span>
              </div>
              <span className={styles.stepText}>Safariの下部にある共有ボタン（□↑）をタップ</span>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>
                <span className={styles.stepNumText}>2</span>
              </div>
              <span className={styles.stepText}>「ホーム画面に追加」を選択</span>
            </div>
          </div>
          <div className={styles.buttonSection}>
            <button className={styles.btnClose} onClick={dismiss}>閉じる</button>
          </div>
        </>
      ) : (
        <div className={styles.buttonSection}>
          <button className={styles.btnInstall} onClick={handleAdd}>ホーム画面に追加</button>
          <button className={styles.btnDismiss} onClick={dismiss}>後で</button>
        </div>
      )}
    </div>
  )
}
