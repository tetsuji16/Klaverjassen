# Klaverjassen — Leer & Speel

スマートフォンのブラウザでAmsterdam式Klaverjassenを学び、CPUまたは1台を共有する4人で遊べる静的Webアプリです。ゲームデータは端末内だけに保存され、外部APIやバックエンドは使用しません。

## 主な機能

- 11段階の日本語チュートリアルと実技問題
- 初級・中級・上級のCPU対戦と学習アシスト
- 4ディール短縮戦、16ディール標準戦
- 手札を隠して端末を渡す4人用パス＆プレイ
- Amsterdam式の合法手、roem、nat、pit自動判定
- オフライン再訪、途中保存、モーション軽減、高コントラスト

## 開発

```sh
corepack enable
pnpm install
pnpm dev
```

テストと本番ビルド：

```sh
pnpm test
pnpm build
```

## GitHub Pages

リポジトリの Settings → Pages で、Sourceを **GitHub Actions** に設定してください。`master`または`main`へpushすると、`.github/workflows/deploy-pages.yml`がテストとビルドを実行して公開します。

本アプリはHash Routerと相対アセットパスを使用するため、ユーザーサイトとプロジェクトサイトの両方で動作します。

## プライバシー

設定、チュートリアル進捗、途中の対戦はブラウザのlocalStorageだけに保存されます。アカウント、アクセス解析、広告、外部フォント、外部通信はありません。
