import { useEffect, useState } from 'react'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 1500)
      return () => clearTimeout(t)
    }
  }, [visible])

  return show ? (
    <div className={styles.toast}>{message}</div>
  ) : null
}
