import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { pinyin } from 'pinyin-pro'
import bgImage from '../public/sumi-landscape.jpeg'
import InputArea from './components/InputArea'
import OutputArea from './components/OutputArea'
import ActionButtons from './components/ActionButtons'
import Toast from './components/Toast'
import InstallPrompt from './components/InstallPrompt'
import styles from './App.module.css'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function App() {
  const [input, setInput] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [toastKey, setToastKey] = useState(0)
  const [showInstall, setShowInstall] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
      const isDismissed = localStorage.getItem('install-prompt-dismissed')
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      if (!isStandalone && !isDismissed && (isIOS || deferredPromptRef.current)) {
        setShowInstall(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleInstallDismiss = useCallback(() => {
    setShowInstall(false)
  }, [])

  const pinyinArray = useMemo(
    () => (input ? pinyin(input, { toneType: 'symbol', type: 'array' }) : []),
    [input]
  )

  const pinyinString = pinyinArray.join(' ')

  const combinedString = useMemo(() => {
    if (!input || pinyinArray.length === 0) return ''
    return [...input].map((char, i) => {
      const py = pinyinArray[i]
      return py && py !== char ? `${char}(${py})` : char
    }).join('')
  }, [input, pinyinArray])

  const handleCopy = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastKey((k) => k + 1)
  }, [])

  return (
    <div className={styles.root}>
      <img
        src={bgImage}
        alt=""
        className={styles.bg}
        aria-hidden="true"
      />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <header className={styles.appbar}>
          <p className={styles.appName}>拼　音</p>
          <p className={styles.appSub}>PĪNYĪN · 漢字から拼音へ</p>
        </header>

        <main className={styles.body}>
          <InputArea value={input} onChange={setInput} />
          <OutputArea pinyin={pinyinString} original={input} />
          <ActionButtons
            pinyin={pinyinString}
            combined={combinedString}
            onCopy={handleCopy}
          />
        </main>
      </div>

      <Toast key={toastKey} message={toastMsg} visible={!!toastMsg} />

      {showInstall && (
        <InstallPrompt
          deferredPrompt={deferredPromptRef.current}
          onDismiss={handleInstallDismiss}
        />
      )}
    </div>
  )
}
