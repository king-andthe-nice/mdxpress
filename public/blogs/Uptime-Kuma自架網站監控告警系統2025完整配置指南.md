# 2025年Uptime Kuma完全配置指南：自架網站監控告警系統，告別付費監測服務

搭建網站或自托管服務時，及時掌握服務可用性是基本功。許多開發者依賴付費監測服務如Pingdom、UptimeRobot或StatusCake來實現網站監控，但這些方案存在免費配額有限、數據不透明、或月費隨著監控點增加而攀升的問題。對於技術愛好者和自托管玩家而言，Uptime Kuma提供了一個免費、開源、且功能完整的替代方案。本文將詳細介紹如何在2025年從零部署Uptime Kuma，配置多類型監控指標，並與 Telegram、Discord 等平台整合實現即時告警。

## 為何選擇 Uptime Kuma 作為監控方案

Uptime Kuma 是一款 2023 年開始走紅的開源監控工具，其核心設計理念是「簡單好用、功能完整、數據自主」。與傳統付費監測服務相比，Uptime Kuma 的優勢體現在幾個層面。首先是成本——你可以將它部署在任何閒置的 VPS 或本地伺服器上，完全免費且沒有用戶數量或監控網站數量限制。其次是數據所有權——所有監測數據都存儲在你自己的資料庫中，沒有第三方能夠訪問你的服務可用性歷史記錄。第三是自定義程度——你可以監控 TCP 連接、HTTP 端點、DNS 解析、甚至是 Docker 容器的運行狀態，而多數付費服務只提供標準的 HTTP 監控。

從技術架構來看，Uptime Kuma 使用 Node.js 作為後端runtime，預設使用 SQLite 存儲監控歷史（也可切換至 MySQL、PostgreSQL 或 SQL Server），前端則使用 Vue.js 建構。整個項目非常輕量，官方 Docker 映像僅約 150MB，記憶體佔用在閒置時低於 100MB，非常適合部署在低配置的小型 VPS 上。

## 部署 Uptime Kuma：Docker 與手動安裝詳解

Uptime Kuma 支持多種安裝方式，最推薦的是使用 Docker Compose 部署，這種方式升級簡單且不會破壞配置。

### Docker Compose 一鍵部署

在任意 Linux 環境中，首先確保已安裝 Docker 和 Docker Compose，然後建立工作目錄：

```bash
mkdir -p /opt/uptime-kuma
cd /opt/uptime-kuma
```

建立 docker-compose.yml 檔案：

```yaml
version: '3.8'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    restart: always
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Taipei
```

執行啟動命令：

```bash
docker-compose up -d
```

部署完成後，通過瀏覽器訪問 http://你的伺服器IP:3001 即可看到初始化介面。首次使用需要設定管理員帳戶，填寫用戶名和密碼後點擊註冊。

### 傳統方式安裝（無 Docker）

對於無法使用 Docker 的環境（如部分共享主機或特殊需求用戶），也可以選擇直接安裝。首先確認系統中已安裝 Node.js 18 或更高版本，然後：

```bash
# 克隆倉庫
git clone https://github.com/louislam/uptime-kuma.git
cd uptime-kuma

# 安裝依賴
npm run setup

# 啟動服務
node server/index.js
```

這種方式默認監聽 3001 端口，同樣可以通過反向代理（如 Nginx、Caddy）配合域名進行 HTTPS 訪問。

## 配置首個監控項目：HTTP 監控與證書告警

進入 Uptime Kuma 後台後，點擊右上角的「+」按鈕新增監控。以下是幾種常見監控類型的配置方法。

### HTTP(s) 端點監控

這是最基礎的監控類型，適合監控網站是否正常運行。配置欄位說明：

- **監控名稱**：自定義標識，如「我的個人網站」
- **監控類型**：選擇 HTTP(s)
- **目標 URL**：輸入需要監控的完整網址，如 https://example.com
- **監控間隔**：建議設置為 60 秒（付費版功能），免費版最低為 1 分鐘
- **超時時間**：建議設為 30 秒，避免網絡波動導致誤報
- **開啟 SSL 證書監控**：勾選後，系統會在證書過期前 7、14、30 天發送提醒

進階設置中，「期待狀態碼」欄位預設為 200-299 的 2xx 和 3xx 響應碼，如果你監控的是會返回 301 重定向的 URL，需要將期待狀態碼調整為包含相應範圍。

### TCP 連接監控

對於非 HTTP 服務（如 Minecraft 遊戲伺服器、SSH 服務、自定義 TCP 協議應用），可以使用 TCP 端口監控。輸入目標主機的 IP 或域名，以及監控端口號。Uptime Kuma 會嘗試建立 TCP 連接，成功建立則視為正常，連接超時或被拒絕則觸發告警。

### Docker 容器監控

如果你運行的是 Docker 化應用，可以啟用 Docker Socket 監控來追蹤容器狀態。在監控設置中選擇「Docker Container」類型，然後從下拉選單中選擇需要監控的容器名稱。這種監控方式會顯示容器的運行狀態（running、exited、restarting），並在容器意外停止時立即告警。

## 告警渠道整合：Telegram、Discord 與電子郵件

監控系統的核心價值在於「有事能及時通知」。Uptime Kuma 內建了豐富的告警整合，以下是幾種主流渠道的配置方法。

### Telegram 機器人告警

Telegram 是我最推薦的告警渠道——即時送達、完全免費、且支持群組通知。首先在 Telegram 中與 @BotFather 對話，創建一個新機器人並取得 Token。然後建立一個群組（可以是個人群組或包含機器的群組），將機器人加入群組，並取得群組的 Chat ID。

在 Uptime Kuma 的「設定」-「通知設定」頁面，選擇 Telegram 通知渠道，填入機器人 Token 和 Chat ID。測試消息發送成功後，後續所有告警都會即時推送到該群組。Uptime Kuma 支持在通知模板中使用變數，如 {monitor_name}、{monitor_url}、{msg}、{heartbeat_status} 等，可以自定義通知消息的顯示格式。

### Discord Webhook 通知

如果你的團隊已經使用 Discord 辦公，可以將 Uptime Kuma 接入 Discord Webhook。在 Discord 伺服器設定中建立一個文字頻道，然後在頻道設定的「整合」-「Webhook」中創建新的 Webhook，複製 Webhook URL。在 Uptime Kuma 中選擇 Discord 通知，貼上 URL 即可。

Discord 的優勢在於支持嵌入消息（Embed），可以以更美觀的形式展示監控狀態和響應時間圖表。Uptime Kuma 默認會發送包含監控名稱、狀態變化時間、影響時長等信息的格式化 Embed，適合團隊內部共享監控狀態。

### 電子郵件告警配置

對於技術能力較弱的用戶或作為備用告警渠道，電子郵件通知同樣值得配置。Uptime Kuma 支持 SMTP 直接發送郵件，你需要準備一個可以使用的 SMTP 伺服器（可以是免費的 Gmail、QQ 郵箱，或自托管的 Postfix、Mailu 等）。在通知設置中填入 SMTP 伺服器地址、端口、帳戶名稱和密碼，測試成功後即可啟用。

建議將郵件告警設為「二次確認」模式——即當 HTTP 監控失敗時，先發送 Telegram/Discord 告警，如果問題持續超過 5 分鐘才發送郵件，避免深夜被郵件轟炸。

## 進階使用：維護時段、自動化與 SSO

### 設置維護時段

在進行伺服器維護、系統升級或網站改版時，通常需要暫時關閉監控告警以避免大量誤報。Uptime Kuma 提供了「維護時段」功能，支援「暫停所有監控」和「僅暫停特定監控」兩種模式。進入「維護」頁面，點擊「新增維護時段」，設置開始時間、持續時長和影響範圍即可。在維護窗口內，所有相關告警會被靜音，但監控數據仍會持續記錄。

### 配合 Nginx Reverse Proxy 的 HTTPS 配置

生產環境中，建議將 Uptime Kuma 放置在 Nginx 或 Caddy 反向代理後方，這樣可以用域名+HTTPS 訪問，並避免直接暴露 3001 端口。以下是 Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name uptime.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name uptime.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

使用 Certbot 自動申請和更新 SSL 證書，整個過程完全自動化。

### 接入 LDAP 實現團隊登錄

如果是團隊或企業使用，可以通過環境變數開啟 LDAP 認證支持。設置 LDAP_URL、LDAP_BIND_DN、LDAP_SEARCH_FILTER 等變數，團隊成員即可使用企業帳戶登錄 Uptime Kuma，無需為每個用戶額外創建本地帳戶。

## 常見問題排查

即使部署和配置正確，日常使用中仍可能遇到一些問題。以下是幾個常見場景的解決方案。

**監控顯示「Down」但網站實際可訪問**：這種情況通常是 DNS 解析問題或網絡路由問題導致 Uptime Kuma 伺服器無法訪問目標。檢查 Uptime Kuma 伺服器的網絡連通性，嘗試使用 `curl -I` 命令從伺服器端直接測試目標 URL 的響應。也可以暫時將監控間隔從 60 秒調低至 30 秒，觀察心跳記錄中是否所有請求都失敗，以區分是網絡問題還是偶發波動。

**Telegram 通知突然不送達**：首先檢查 Telegram Bot 的 Token 是否仍有效，BotFather 可以通過 /revoke 命令刷新 Token。其次檢查是否因多次發送測試消息導致 Bot 被 Telegram 限流，通常等待 10-15 分鐘後自動恢復。對於高頻告警的監控場景，建議在通知設置中開啟「上山告警後靜止時間」選項，避免短時間內大量重複通知。

**Docker 容器監控顯示「未知」狀態**：確認 Docker Socket 是否正確映射到容器中。在 docker-compose.yml 中添加 `/var/run/docker.sock:/var/run/docker.sock` 映射後，需要重啟 Uptime Kuma 容器使配置生效。同時確保監控的容器名稱與 Docker 容器名稱完全一致（注意大小寫敏感）。

## 結語

Uptime Kuma 以其零成本、功能完整、部署簡便的特性，已成為自托管愛好者和小型開發團隊的首選監控方案。從個人部落格到企業級服務，都可以通過它獲得穩定的可用性監控和及時的告警通知。配合 Docker 的便捷部署，整個系統可以在 10 分鐘內完成搭建並投入實際使用。如果你正在尋找一個可靠的監控替代方案，不妨從今天開始將 Uptime Kuma 納入你的工具箱。