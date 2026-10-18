<div align="center">

<div style="display: flex; align-items: center; justify-content: center; gap: 24px;">
  <img src="public/spinel.svg" alt="Spinel" width="128" height="128" />
  <h1 style="margin: 0;">Spinel</h1>
</div>

面倒な作業をAIに任せる、デスクトップ常駐のエージェント

<p>
  <a href="#概要">概要</a> ・
  <a href="#機能">機能</a> ・
  <a href="#しくみ">しくみ</a> ・
  <a href="#セットアップ">セットアップ</a> ・
  <a href="#メール連携の設定">メール連携の設定</a> ・
  <a href="#セキュリティ">セキュリティ</a>
</p>

[![Release](https://img.shields.io/github/v/release/Harukoto-Project/spinel?style=for-the-badge&color=ff375b&labelColor=18181b)](https://github.com/Harukoto-Project/spinel/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-ff375b?style=for-the-badge&labelColor=18181b)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white&labelColor=18181b)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=18181b)](https://react.dev/)

</div>

---

## 概要

Spinelは、デスクトップに常駐して、日々の細かい作業をAIに任せるためのアプリです。実際の処理は裏で動くサーバー側のノードが行い、人の手が要るときだけアプリに通知が届きます。

できることは少しずつ増やしていきます。いまはメールの仕分けと通知に対応しています。

<table>
  <tr>
    <td width="33%" valign="top">
      <h4>常駐して任せる</h4>
      ウィンドウを閉じてもトレイに残って動き続けます。Windowsの起動時に自動で立ち上げることもできます。
    </td>
    <td width="33%" valign="top">
      <h4>処理はノードで動く</h4>
      常時動かしておくサーバーが仕事をこなします。ノードは複数登録して切り替えられます。
    </td>
    <td width="33%" valign="top">
      <h4>AIが判断する</h4>
      JevとClaudeに判断を任せて、人が目を通す手間を減らします。
    </td>
  </tr>
</table>

## 機能

| 機能 | 状況 |
| --- | --- |
| メールの仕分けと通知 | 利用できます |
| その他の機能 | 順次追加していく予定です |

### メールの仕分けと通知

<table>
  <tr>
    <td width="33%" valign="top">
      <h4>新着だけを取得</h4>
      GmailとOutlookにOAuth2で接続します。対象は接続後に届いたメールだけで、過去のメールにはさかのぼりません。
    </td>
    <td width="33%" valign="top">
      <h4>二段階で判定</h4>
      Jevがスコアを付け、閾値で除外か通知かを決めます。判断がつかないものだけClaudeが見直します。
    </td>
    <td width="33%" valign="top">
      <h4>必要なものだけ通知</h4>
      通知するメールはWindowsのトースト通知で届き、通常か緊急かで絞れます。除外したメールも履歴に残ります。
    </td>
  </tr>
</table>

## しくみ

処理はすべてノードが行い、アプリは設定の変更と通知の受信を受け持ちます。次の図は、メール機能の流れです。

```mermaid
flowchart LR
    subgraph Mail["メールプロバイダー"]
        G["Gmail API"]
        O["Microsoft Graph<br/>(Outlook)"]
    end

    subgraph Node["ノード(サーバー)"]
        P["MailPoller<br/>新着のみ取得"]
        J["Jev<br/>スコア付け"]
        C["Claude<br/>難しいものだけ再判定"]
        DB[("MySQL<br/>履歴・設定")]
        H["NotificationHub"]
        P --> J --> C --> H
        J --> DB
        C --> DB
    end

    subgraph App["Spinel(デスクトップアプリ)"]
        WS["WebSocket常駐接続"]
        T["Windows通知"]
        UI["設定・履歴UI"]
        WS --> T
    end

    G --> P
    O --> P
    H -- "WebSocket" --> WS
    UI -- "HTTPS + 管理キー" --> Node
```

ノードが各アカウントの新着メールを定期的に取得し、Jevのスコアを`IGNORE_BELOW`と`NOTIFY_ABOVE`の閾値と比べて、除外、通知、要再判定に分けます。再判定になったものはClaudeが決めます。通知するメールは、接続中のアプリへWebSocketで届きます。

### 構成

<table>
  <tr>
    <td valign="top"><code>src/</code></td>
    <td valign="top">フロントエンド。React 19、Tailwind CSS v4、shadcn/ui</td>
  </tr>
  <tr>
    <td valign="top"><code>src-tauri/</code></td>
    <td valign="top">デスクトップアプリ本体。Tauri 2とRust。keyring、tokio-tungstenite、通知と自動起動のプラグインを使用</td>
  </tr>
  <tr>
    <td valign="top"><code>server/</code></td>
    <td valign="top">ノードのAPI。Node.js 22、Fastify、mysql2、mailparser</td>
  </tr>
  <tr>
    <td valign="top"><code>public/</code></td>
    <td valign="top">ロゴなどの静的ファイル</td>
  </tr>
</table>

判定にはTypeSafeのJevとAnthropicの[Claude](https://www.anthropic.com/claude)を使っています。

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Rust" src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white" />
  <img alt="Fastify" src="https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
</p>

## セットアップ

先に次のものを用意してください。

| 対象 | 用意するもの |
| --- | --- |
| 共通 | Node.js 22以上、Yarn |
| アプリ | Rustと[Tauriの前提環境](https://tauri.app/start/prerequisites/) |
| ノード | MySQL。データベースは先に作っておく |
| AI | TypeSafeとAnthropicのAPIキー |
| メール連携 | Google CloudのOAuthクライアント(デスクトップアプリ種別)。Outlookを使うならMicrosoft Entra IDに登録したアプリも |

### 1. ノードを起動する

```bash
cd server
yarn install
cp .env.example .env
```

PowerShellでは`cp`の代わりに`copy`を使います。`.env`で設定する項目は次のとおりです。

| 変数 | 内容 |
| --- | --- |
| `DATABASE_URL` | 必須。`mysql://user:password@host:3306/database`の形式 |
| `TYPESAFE_API_KEY`, `ANTHROPIC_API_KEY` | AI判定に使うAPIキー。省略して、アプリの「APIキーの設定」から保存することもできる(その場合は保存した値が優先される) |
| `JEV_MODEL`, `CLAUDE_MODEL` | 使うモデル |
| `HOST`, `PORT` | 待ち受け先。既定は0.0.0.0と8787 |
| `ADMIN_KEY` | 管理キーを固定したいときだけ。省略すると自動で生成される |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | メール連携でGmailを使うなら両方必要。アプリ側には設定しない |
| `OUTLOOK_CLIENT_ID` | メール連携でOutlookを使うなら設定する。シークレットは不要。アプリ側には設定しない |
| `IGNORE_BELOW`, `NOTIFY_ABOVE` | メールを除外する閾値と通知する閾値。既定は0.2と0.7 |

```bash
yarn dev
```

本番では`yarn build`のあとに`yarn start`で起動します。

> [!IMPORTANT]
> 管理キーは初回起動時にコンソールへ一度しか表示されません。必ず控えてください。なくした場合は、MySQLの`admin_keys`テーブルの行を消して再起動すると作り直されます。

> [!WARNING]
> 管理キー、APIキー、メール連携の認可コードは、管理キー付きのHTTPでノードに送られます。公開ネットワーク越しに使うなら、リバースプロキシなどでノードのアドレスを`https://`にしてください。

### 2. アプリを起動する

リポジトリのルートで作業します。アプリ側に`.env`は要りません。OAuthのクライアントIDやAPIキーなどの機密情報は、すべてノード側で扱います。

```bash
yarn install
yarn tauri dev
```

インストーラーは`yarn tauri build`で作れます。配布するインストーラーに機密情報は含まれません。

### 3. アプリとノードをつなぐ

<table>
  <tr>
    <td width="33%" valign="top">
      <h4>① ノードを追加</h4>
      Dashboardの「ノードを追加」で、名前とアドレスを登録します。ノードの<code>/health</code>に接続できれば追加できます。
    </td>
    <td width="33%" valign="top">
      <h4>② 管理キーを保存</h4>
      「メールの通知設定」で管理キーを保存すると、通知の受信が始まります。AI判定のAPIキーを`.env`に入れていない場合は、「APIキーの設定」で保存します。
    </td>
    <td width="33%" valign="top">
      <h4>③ アカウントを追加</h4>
      メールを使うなら、メールアカウントのページで「アカウントを追加」を押し、ブラウザからGoogleかOutlookにサインインします。
    </td>
  </tr>
</table>

## メール連携の設定

<details>
<summary>Google</summary>

<br />

[Google Cloud Console](https://console.cloud.google.com/)で、OAuthクライアントをデスクトップアプリの種別で作ります。リダイレクトURIの登録は要りません。Gmail APIを有効にし、スコープは`gmail.readonly`を使います。クライアントIDとシークレットは、ノードの`.env`にだけ入れます。

</details>

<details>
<summary>Outlook</summary>

<br />

[Microsoft Entra ID](https://entra.microsoft.com/)でアプリを登録します。

| 項目 | 設定 |
| --- | --- |
| サポートされるアカウントの種類 | 任意の組織ディレクトリ内のアカウントと個人のMicrosoftアカウント |
| プラットフォーム | モバイルとデスクトップ アプリケーション |
| リダイレクトURI | `http://localhost` |
| APIのアクセス許可 | Microsoft Graphの委任で`Mail.Read`、`User.Read`、`offline_access` |

パブリッククライアントなのでシークレットは不要です。`OUTLOOK_CLIENT_ID`だけをノードの`.env`に設定してください。組織アカウントでは、テナントの設定によって管理者の同意が求められることがあります。

</details>

## セキュリティ

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>管理キー</h4>
      ノードに保存するのはSHA-256のハッシュだけです。クライアント側はOSの資格情報ストアに入れ、画面には再表示しません。
    </td>
    <td width="50%" valign="top">
      <h4>WebSocketの認証</h4>
      管理キーで取得した使い捨てのチケットを使います。有効期間は30秒で、使えるのは一度きり。提示は<code>Authorization</code>ヘッダーで行います。
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>ブロック</h4>
      認証に失敗し続けるIPは、一時的にブロックされます。
    </td>
    <td width="50%" valign="top">
      <h4>OAuth</h4>
      メール連携では、PKCEのS256と<code>state</code>の検証を行い、ループバックで認可コードを受け取ります。
    </td>
  </tr>
</table>

## 開発

コミットメッセージはConventional Commitsを土台にしています。細かい書き方は[COMMIT_CONVENTION.md](COMMIT_CONVENTION.md)を見てください。

## ライセンス

[Apache License 2.0](LICENSE)で公開しています。

<div align="center">

---

[Harukoto-Project](https://github.com/Harukoto-Project)

</div>
