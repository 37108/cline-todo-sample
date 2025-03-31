## コーディング

### ディレクトリ構造
- `/app/` ディレクトリには favicon、global.css、API Routes、page、layout ファイル、Intercepting Routes のみ配置してください
- `/components/` ディレクトリには shadcn コマンドで生成したコードと汎用的なコンポーネントのみを配置します
- 環境変数と定数は `/config/env.ts` と `/config.constants.ts` で管理します
  - /config/index.ts で `export * from './env'`、`export * from './constants'` を利用して export してください
- `/features/` には [bullet-proof-react](https://github.com/alan2207/bulletproof-react) を参考にコードを配置します
  - `/features/(sample)/actions/` には React サーバ関数 のコードをまとめます
  - `/features/(sample)/api/` には フロントエンドから API を呼び出すためのコードをまとめます
  - `/features/(sample)/components/` には React コンポーネントをまとめます
  - `/features/(sample)/hooks/` には React Hooks をまとめます
  - `/features/(sample)/repositories/` には バックエンドでリポジトリ層に関するやり取りを纏め明日
  - `/features/(sample)/models/` には Zod のスキーマと TypeScript interface をまとめます
  - `/features/(sample)/utils/` には features で利用するが上記のどれにも該当しないコードをまとめます
  - 日時に関する処理は `/features/temporal/` 以下にまとめてください
- `/database/` ディレクトリにはデータベースとの接続や初期化の処理を書いてください
- `/services/` ディレクトリにはユースケースを実現するためのサーバー側のコードを配置します

下記はディレクトリのサンプルです。

```tree
├── app
│   ├── api
│   ├── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── sample
│       └── [id]
│           └── page.tsx
├── components
│   ├── external-button.tsx
│   │   ├── index.tsx
│   └── ui
│       ├── alert.tsx
│       └── tooltip.tsx
├── config
│   ├── index.ts
│   ├── constants.ts
│   └── env.ts
├── features
│   └── sample
│       ├── actions
│       ├── api
│       ├── components
│       ├── hooks
│       ├── repositories
│       ├── models
│       └── utils
├── database
│   └── index.ts
```

### TypeScript
- 関数を優先して利用して、クラスの利用は最小限にとどめてください
- 関数名はキャメルケースで、クラス名はパスカルケースで記載してください
- ファイルは関数名をケバブケースにしたものを、 `(kebab-case-name/index.ts)` に配置してください
  - テストも同一ディレクトリに、 `(kebab-case-name/index.test.ts)` に配置してください
- any の使用を避けてください。型がわからない場合は unknown 型を利用して絞り込みをしてください
- ユーティリティ型を利用してください
- 単一責任の原則を遵守して関数は小さくとどめてください
- [`es-toolkit`](https://es-toolkit.slash.page/) で実装できる処理はライブラリを利用してください
- 日時に関する処理は ECMAScript 標準の Intl オブジェクトを利用してください
  - 指定がない限りはタイムゾーンには日本時間を採用してください
- Zod を利用してスキーマの定義と型の定義は Zod で行います
- コンパニオンオブジェクトパターンで Zod スキーマと型をエクスポートします
  ```typescript
  export const User = z.object({
    id: z.string().uuid(),
    name: z.string().min(5).max(16),
    place: z.string().max(120).optional(),
  });
  export type User = z.infer<typeof User>;
  ```
- 環境変数は `/config/env.ts` で管理します。
  ```typescript
  export const env = {
    greeting: process.env.GREETING
  } as const;
  ```
- 定数は `/config/constants.ts` で管理します
  ```typescript
  export const MAX_LIMIT = 30 as const;
  ```

### エラーハンドリング
関数とクラスでは、 [`neverthrow`](https://github.com/supermacro/neverthrow) の Result 型を利用してエラーハンドリングをしてください。
エラーメッセージには詳細な内容を詰めてください。

```TypeScript
import { err, ok, Result } from "neverthrow";

const fetchConfig = async (): Promise<Result<Config, Error>> => {
  try {
    const res = await fetch('/config');
    if (res.ok) {
      return ok(await res.json());
    };
    return err('some message');
  } catch (error) {
    return err(error.message);
  }
};
```

### テスト
- React Hooks、そのほかの関数には単体テストを vitest を用いて必ず実装してください
- 単体テストは対象のファイルと同一ディレクトリに配置してください
- ファイル名は `(対象のファイル名).test.ts` などにしてください
- テストケースは `it should be (result) when (case)` のような形にしてください
  ```TypeScript
  it('should be 5 when 3 plus 2') {
    expect(sum(3,2)).toBe(5);
  };
  ```
- API は MSW を利用してモックしてください。API を定義する場合は MSW のコードも更新してください
