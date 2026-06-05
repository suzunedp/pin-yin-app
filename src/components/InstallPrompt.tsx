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
    setTimeout(onDismiss, 800)
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
              <span className={styles.stepText}>Safariの下部にある共有ボタン（<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{verticalAlign: 'middle'}}><path d="M12,1L8,5H11V14H13V5H16M18,23H6C4.89,23 4,22.1 4,21V9A2,2 0 0,1 6,7H9V9H6V21H18V9H15V7H18A2,2 0 0,1 20,9V21A2,2 0 0,1 18,23Z" /></svg>）をタップ</span>
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
