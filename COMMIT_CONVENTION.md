# コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) をベースにします。

## 基本フォーマット

```
<type>(<scope>): <subject>

<body>

<footer>
```

- `<scope>`、`<body>`、`<footer>` は省略可能です。
- `<subject>` は日本語で、体言止めで簡潔に書きます(目安50文字以内)。
- `<body>` には「何を」ではなく「なぜ」を書きます。

## type一覧

| type       | 説明                                                   |
| ---------- | ------------------------------------------------------ |
| `feat`     | 新機能の追加                                           |
| `fix`      | バグ修正                                               |
| `docs`     | ドキュメントのみの変更                                 |
| `style`    | 動作に影響しない整形                                   |
| `refactor` | 機能追加・バグ修正を含まない再構成                     |
| `perf`     | パフォーマンス改善                                     |
| `test`     | テストの追加・修正                                     |
| `build`    | ビルド・依存関係の変更(Cargo.toml、requirements.txt等) |
| `ci`       | CI設定の変更                                           |
| `chore`    | その他の雑務                                           |
| `revert`   | 以前のコミットの取り消し                               |

## scopeの例

`audio`, `vad`, `stt`, `diarization`, `translate`, `overlay`, `vr`, `sidecar`, `config`, `docs`

## 例

```
feat(vad): 音声区間の検出とセグメント分割を追加
fix(overlay): 翻訳完了時に字幕の表示時間が延長されない問題を修正
docs: READMEにVRChatの音声ルーティング手順を追記
```

## Breaking Change

後方互換性のない変更はfooterに `BREAKING CHANGE:` を付けて説明します。

## 注意事項

次の情報はコミットメッセージに含めません。

- APIキー・トークンなどの認証情報
- 個人情報、非公開のURL
