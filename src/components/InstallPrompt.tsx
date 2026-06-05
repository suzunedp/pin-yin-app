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
    <div className={`${styles.card} ${visible ? styles.visible : ''}`}>
      <h2 className={styles.title}>ホーム画面に追加</h2>
      <p className={styles.body}>
        アプリとしてホーム画面に追加すると、すばやく起動できます。
      </p>

      {isIOS ? (
        <>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span>Safariの下部にある共有ボタン（□↑）をタップ</span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span>「ホーム画面に追加」を選択</span>
            </li>
          </ol>
          <button className={styles.btnClose} onClick={dismiss}>閉じる</button>
        </>
      ) : (
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleAdd}>追加する</button>
          <button className={styles.btnText} onClick={dismiss}>今はしない</button>
        </div>
      )}
    </div>
  )
}
