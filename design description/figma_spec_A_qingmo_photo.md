# Figma MCP 実装指示書 A
## 青墨 Qīng Mò — 画像埋め込みパターン

---

## ファイル設定

| 項目 | 値 |
|------|-----|
| ファイル名 | 拼音アプリ デザインカンプ |
| フレームサイズ | iPhone 15 Pro (393×852px) |
| フレーム名 | 青墨 Qīng Mò — 画像版 [手動で手直し] |

---

## Step 1: 画像の確認（最初に実行）

リモート MCP 経由で操作するため、**画像は事前に Figma ファイル上に配置しておく**。

### 事前準備（Claude Code 実行前に手動で行う）

1. Figma ファイルを開き、作業フレームとは別の場所（キャンバス上の空きスペース）に水墨山水画像を直接ドラッグ&ドロップしてアップロードする
   - ファイル名は何でもよい
2. Figma のレイヤーパネルで、配置した画像ノードの名前を **`source/sumi-landscape`** に変更する
   - この名前が `findOne()` の検索キーになるため、Claude Code 実行前に必ず設定すること

### Claude Code での参照手順

```javascript
// 事前配置済みの画像ノードを名前で検索して imageHash を取得する
const sourceImage = figma.currentPage.findOne(
  n => n.name === 'source/sumi-landscape' && n.type === 'RECTANGLE'
);

// 画像の fills から imageHash を取り出す
const imageHash = sourceImage.fills[0].imageHash;

// 取得した imageHash をヘッダー矩形の Fill に適用する
imageRect.fills = [{
  type: 'IMAGE',
  imageHash,
  scaleMode: 'FILL',
  imageTransform: [[1, 0, 0], [0, 1, 0.3]] // 上寄せ 30%
}];
```

**手順まとめ:**
1. 事前に Figma 上へ画像をアップロード・リネームしておく
2. `figma.currentPage.findOne()` で名前検索して imageHash を取得
3. ヘッダー矩形の fills に `{ type: 'IMAGE', imageHash, scaleMode: 'FILL' }` を設定

---

## Step 2: Variables（カラートークン）の登録（デザイン要素より先に実行）

**すべての色は Variables を参照する。ベタ打ち禁止。**

### Collection 設定

```
Collection 名: 青墨 / Qīng Mò
Mode 名: Default
```

### 登録するトークン一覧

以下を `figma.variables.createVariable()` で順番に作成する。

```javascript
// 疑似コード — MCP 経由で実行
const collection = figma.variables.createVariableCollection('青墨 / Qīng Mò');
const modeId = collection.defaultModeId;

const tokens = [
  // Background
  { name: 'bg/primary',         hex: '#EDF0F2', desc: 'ボディ背景' },
  { name: 'bg/hero',            hex: '#DDE4EA', desc: 'ヘッダー背景矩形' },
  { name: 'bg/overlay',         hex: '#D0DCE4', desc: 'ヘッダー青みオーバーレイ' },
  { name: 'bg/surface',         hex: '#FFFFFFcc', desc: '入力・出力エリア（アルファ値 80% を変数に内包）' },
  // Text
  { name: 'text/primary',       hex: '#1A2E3A', desc: 'メインテキスト・拼音' },
  { name: 'text/secondary',     hex: '#5A7888', desc: 'サブテキスト・ペーストボタン' },
  { name: 'text/muted',         hex: '#7A9AAA', desc: 'ラベル・補足・元テキスト' },
  // Border
  { name: 'border/default',     hex: '#B8C4CC', desc: 'ボーダー全般' },
  // Button
  { name: 'btn/primary-bg',     hex: '#2E4C5Ee5', desc: 'プライマリボタン背景（アルファ値 ~90% を変数に内包）' },
  { name: 'btn/primary-text',   hex: '#DDE4EA', desc: 'プライマリボタンテキスト' },
  // Gradient（グラデーション端点色として登録）
  { name: 'gradient/fade-end',  hex: '#EDF0F2', desc: 'ヘッダー下部フェード終端色' },
];

for (const token of tokens) {
  const variable = figma.variables.createVariable(token.name, collection, 'COLOR');
  const { r, g, b, a } = hexToRgba(token.hex); // 8桁hex対応（例: #FFFFFFcc → a=0.8）
  variable.setValueForMode(modeId, { r, g, b, a });
  variable.description = token.desc;
}
```

### Variables 登録後の参照方法

```javascript
// 変数を名前で取得してノードに適用する
function applyVariable(node, property, variableName) {
  const variable = figma.variables.getLocalVariables()
    .find(v => v.name === variableName);
  if (variable) {
    figma.variables.setBoundVariableForPaint(node, property, variable);
  }
}

// 使用例
applyVariable(bodyRect, 'fill', 'bg/primary');
applyVariable(titleText, 'fill', 'text/primary');
```

---

## Step 3: フレーム・レイヤー構造の作成

### レイヤー構造

画像は**画面全体の背景**として配置し、UI要素を半透明で重ねる。

```
Frame: 青墨 Qīng Mò — 画像版 [w393 × h852]
  ├─ Rect: bg-base              ← bg/hero（最背面）
  ├─ Rect: image-layer          ← 水墨画像 Fill（全面）
  ├─ Rect: color-overlay        ← bg/overlay、opacity 12%
  ├─ Frame: Content [w393 × h852]（背景transparent、Auto Layout縦）
  │   ├─ Frame: appbar
  │   │   ├─ Text: app-name     ← text/primary
  │   │   └─ Text: app-sub      ← text/secondary
  │   └─ Frame: Body
  │       ├─ Frame: input-section
  │       │   ├─ Text: input-label   ← text/secondary
  │       │   └─ Frame: textarea-wrap ← bg/surface + border/default（背景はフレーム直接）
  │       │       └─ Frame: paste-btn   ← bg/surface + border/default
  │       │           ├─ Icon: source/paste-icon
  │       │           └─ Text: paste-label ← text/secondary
  │       ├─ Frame: output-section（ラッパー、fill なし）
  │       │   ├─ Text: input-label   ← text/secondary（拼音ラベル）
  │       │   └─ Frame: textarea-wrap ← bg/surface + border/default
  │       │       ├─ Text: pinyin-text   ← text/primary
  │       │       └─ Text: original-text ← text/secondary
  │       └─ Frame: button-row
  │           ├─ Frame: btn-secondary ← bg/surface + border/default
  │           │   └─ Text             ← text/secondary
  │           └─ Frame: btn-primary   ← btn/primary-bg
  │               └─ Text             ← btn/primary-text
```

---

## Step 4: 各レイヤーの詳細仕様

### 背景レイヤー（フレーム最背面、全画面）

#### Rect: bg-base
- サイズ: w393 × h852
- Fill: Variable `bg/hero`

#### Rect: image-layer
- サイズ: w393 × h852
- Fill: `{ type: 'IMAGE', imageHash: <Step1で取得>, scaleMode: 'FILL' }`
- Image crop: 上寄せ（y方向 30% 位置を中心）

#### Rect: color-overlay
- サイズ: w393 × h852
- Fill: Variable `bg/overlay`
- Opacity: **12%**
- 用途: 青みを画像全体に薄く乗せてトーンを統一する

### Content Frame（w393 × h852、背景transparent）

#### appbar（padding 20px 20px 14px）
- app-name:
  - 文字: `拼　音`（全角スペースあり）
  - フォント: Noto Serif SC、22px、weight 300
  - Fill: Variable `text/primary`
  - Letter Spacing: 0.28em
- app-sub:
  - 文字: `PĪNYĪN · 漢字から拼音へ`
  - フォント: Noto Sans SC、11px、weight 400
  - Fill: Variable `text/secondary`
  - Letter Spacing: 0.18em
  - 位置: app-name の4px下

---

### Body（padding 20px、Auto Layout 縦 gap 12px）

#### input-label
- 文字: `漢字を入力`
- フォント: Noto Sans SC、12px、weight 400
- Fill: Variable `text/secondary`
- Letter Spacing: 0.12em

#### textarea-wrap — input（相対配置コンテナ、フレーム自体が背景を持つ）
- **サイズ: w353 × h140**
- Fill: Variable `bg/surface`（**opacity 100%**）
- Border: 0.5px、color Variable `border/default`
- Border Radius: 8px
- Padding: 12px 14px 56px 14px（下56px = paste-btn 48px + 余白 8px）
- 入力テキスト: Noto Serif SC、**18px**、Fill: Variable `text/primary`
- テキストエリア高さ: 72px（textAutoResize: NONE、3行分）

#### paste-btn（textarea 右下 絶対配置）
- 位置: bottom=**8px**、right=**8px**
- **サイズ: w100 × h48**
- Fill: Variable `bg/surface`（**opacity 100%**）
- Border: 0.5px、color Variable `border/default`
- Border Radius: 5px
- Padding: 16px 10px
- 内容: `source/paste-icon`（16px）+ `貼り付け`
- テキスト Fill: Variable `text/secondary`、12px、weight 400

#### output-section（ラッパーフレーム、fill なし）
input-section と同じ構造：ラベルテキスト + bordered textarea-wrap。

**ラベル: `input-label`**（拼音ラベル、output-section 内の y=0）
- 文字: `拼音`
- フォント: Noto Sans SC、12px、weight 400
- Fill: Variable `text/secondary`
- Letter Spacing: 0.12em

**textarea-wrap — output**
- **サイズ: w353 × h138**
- Fill: Variable `bg/surface`（**opacity 100%**）
- Border: 0.5px、color Variable `border/default`
- Border Radius: 8px
- Padding: 14px

| レイヤー | テキスト | フォント | Fill Variable |
|---------|---------|---------|---------------|
| pinyin-text | `nǐ hǎo shì jiè` | Noto Sans SC **22px** weight 300 | `text/primary` |
| original-text | `你好世界` | Noto Serif SC 13px weight 400 | `text/secondary` |

> pinyin-text: textAutoResize: NONE、高さ 88px（3行分）

#### button-row（Auto Layout 横、gap 8px）

**btn-secondary「漢字＋拼音 をコピー」**
- Fill: Variable `bg/surface`（**opacity 100%**）
- Border: 0.5px、color Variable `border/default`
- Border Radius: 6px
- Padding: 17px 0
- テキスト Fill: Variable `text/secondary`、Noto Sans SC 12px weight 400

**btn-primary「拼音をコピー」**
- Fill: Variable `btn/primary-bg`（**opacity 100%**）
- Border: none
- Border Radius: 6px
- Padding: 17px 0
- テキスト Fill: Variable `btn/primary-text`、Noto Sans SC 12px weight 400

---

## Variables 一覧（最終確認用）

| Variable 名 | Hex 値（RGBA） | アルファ | 用途 |
|-------------|--------------|---------|------|
| `bg/hero` | `#DDE4EA` | 100% | 最背面ベース背景 |
| `bg/overlay` | `#D0DCE4` | 100%（ノード側で opacity 12%） | 青みオーバーレイ（全面） |
| `bg/surface` | `#FFFFFFcc` | **80%（変数に内包）** | 入力・出力・ペースト・セカンダリBtn |
| `text/primary` | `#1A2E3A` | 100% | メインテキスト |
| `text/secondary` | `#5A7888` | 100% | サブテキスト |
| `text/muted` | `#7A9AAA` | 100% | ラベル・補足 |
| `border/default` | `#B8C4CC` | 100% | ボーダー全般 |
| `btn/primary-bg` | `#2E4C5Ee5` | **≈90%（変数に内包）** | プライマリボタン背景 |
| `btn/primary-text` | `#DDE4EA` | 100% | プライマリボタンテキスト |

> **注意:** `bg/surface`（80%）と `btn/primary-bg`（≈90%）はアルファ値を Variable 自体に内包する方式に変更。ノード側の opacity は設定しない。`bg/overlay` のみ例外としてノード側で opacity 12% を設定する。

---

## 注意事項

- **実行順序:** 事前に Figma へ画像をアップロード → Variables 登録 → フレーム作成 の順で実行する
- **画像ノード名:** `source/sumi-landscape` で統一する。名前が違うと findOne() で取得できないため注意
- **色のベタ打ち禁止:** すべての色プロパティは必ず Variable を参照させる
- **Adobe Stock ライセンス確認後に本番使用すること**
- オーバーレイの opacity（12%）を上げると青みが強くなる。Variable `bg/overlay` の色自体を変えることでトーン調整も可能

---

## 完了後

FigmaファイルのURLを返してください。
