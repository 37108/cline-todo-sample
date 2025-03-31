### コンポーネント設計
- 汎用的なコンポーネントは shadcn/ui を利用してください
- React コンポーネントはパスカルケースで命名してください
- 特別な理由がない限りはサーバーコンポーネントにしてください
- React コンポーネントに対して Storybook の stories を用意してください
  - stories は React コンポーネントと同一のディレクトリで管理します
- Next.js のページコンポーネントでは metadata をエクスポートしてください
- アクセシビリティと日本語圏ユーザーが利用することを想定して、IME の挙動などに注意を払ってください
- React コンポーネントのスタイリングは Tailwind CSS を利用してクラス名で行ってください
- 日時は HTML 標準のタグではなく、shadcn の [Date Picker](https://ui.shadcn.com/docs/components/date-picker) をドキュメントを参照して作成してください

#### 副作用の扱い
- useEffect の利用を極力避けてください
- useSyncExternalStore で処理ができる場合は useEffect を利用しないでください
- useEffect を利用する場合は適切な依存配列とクリーンアップ関数を定義してください

#### データの取得
- データフェッチには fetch を利用してください。
  - タグをつけて、更新などの処理ではキャッシュの更新を行うようにしてください
  ```typescript
  fetch(`https://...`, { next: { tags: ['collection'] } })
  ```
- コンポーネントでのデータ取得は、クライアント側での処理が不要な場合に、サーバーコンポーネントで非同期処理を用いてください
  ```typescript
  const Page = async () => {
    const data = await fetch('path/to/api');

    return <div>{data}</div>;
  }
  ```
- 更新などの処理の場合は tags から必要に応じて revalidation を行ってください

#### フォームの扱い
- React サーバー関数を利用してフォームを実装します
- Zod で定義したスキーマと useActionState を利用してバリデーションを実行してください
