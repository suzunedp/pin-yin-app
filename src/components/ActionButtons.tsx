import styles from './ActionButtons.module.css'

interface ActionButtonsProps {
  pinyin: string
  combined: string
  onCopy: (msg: string) => void
}

export default function ActionButtons({ pinyin, combined, onCopy }: ActionButtonsProps) {
  const copyPinyin = async () => {
    if (!pinyin) return
    await navigator.clipboard.writeText(pinyin)
    onCopy('拼音をコピーしました')
  }

  const copyBoth = async () => {
    if (!combined) return
    await navigator.clipboard.writeText(combined)
    onCopy('漢字＋拼音をコピーしました')
  }

  return (
    <div className={styles.row}>
      <button className={styles.secondary} onClick={copyBoth} type="button" disabled={!combined}>
        漢字＋拼音 をコピー
      </button>
      <button className={styles.primary} onClick={copyPinyin} type="button" disabled={!pinyin}>
        拼音をコピー
      </button>
    </div>
  )
}
