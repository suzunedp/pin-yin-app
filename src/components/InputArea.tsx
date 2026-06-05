import styles from './InputArea.module.css'

interface InputAreaProps {
  value: string
  onChange: (v: string) => void
}

export default function InputArea({ value, onChange }: InputAreaProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch {
      // clipboard read failed (permissions denied)
    }
  }

  return (
    <div className={styles.section}>
      <p className={styles.label}>漢字を入力</p>
      <div className={styles.wrap}>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="漢字を入力してください"
          rows={3}
          spellCheck={false}
        />
        <button className={styles.pasteBtn} onClick={handlePaste} type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
            <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z" />
          </svg>
          <span>貼り付け</span>
        </button>
      </div>
    </div>
  )
}
