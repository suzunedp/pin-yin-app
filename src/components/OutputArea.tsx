import styles from './OutputArea.module.css'

interface OutputAreaProps {
  pinyin: string
  original: string
}

export default function OutputArea({ pinyin, original }: OutputAreaProps) {
  return (
    <div className={styles.section}>
      <p className={styles.label}>拼音</p>
      <div className={styles.wrap}>
        <p className={styles.pinyinText}>{pinyin || <span className={styles.placeholder}>拼音がここに表示されます</span>}</p>
        {original && <p className={styles.originalText}>{original}</p>}
      </div>
    </div>
  )
}
