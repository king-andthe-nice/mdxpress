# Vaultwarden 2025完整評測：自托管密碼管理器，Bitwarden 開源替代方案完全指南

密碼管理器已成為數位時代每個人必備的安全工具。LastPass 資料外洩事件、1Password 漲價策略，以及用戶對數據主權日益增長的需求，使得自托管密碼管理方案在技術社群中迅速崛起。Vaultwarden 作為 Bitwarden 伺服器端的開源實現，以輕量級資源佔用和完整功能，成為個人和小型團隊部署私有密碼庫的首選方案。本文將深入介紹 Vaultwarden 的核心優勢、2025 年最新部署流程，以及如何從主流密碼管理器無痛遷移到自托管方案。

## 為何選擇 Vaultwarden：開源密碼管理的核心價值

Vaultwarden 是由英國開發者 dani-garcia 基於 Rust 語言重寫的 Bitwarden 伺服器實現，完全相容 Bitwarden 官方客戶端卻僅需極低的硬體資源。官方 Bitwarden 伺服器需要至少 2GB RAM 和較高的 CPU 算力，而 Vaultwarden 官方 Docker 映像僅約 50MB，閒置運行記憶體低於 100MB，能在 512MB RAM 的低價 VPS 或樹莓派上流暢運行。這意味著用戶可以用每年不到 30 美元的成本，獲得與付費雲端服務同等甚至更高的數據控制權。

與瀏覽器內建密碼管理相比，Vaultwarden 的核心差異在於跨平台同步和專業安全功能。所有主流平台（iOS、Android、Windows、macOS、Linux）都有官方或第三方 Bitwarden 客戶端支援，支援生物識別解鎖、雙層驗證（TOTP）存放、安全密碼生成、緊急アクセス（Emergency Access）等企業級功能。用戶的登錄資訊、信用卡、身份證件、安全筆記等敏感資料，均可通過點對點加密在設備間安全同步，伺服器端只儲存加密後的密文，即使伺服器被入侵，攻擊者也無法讀取任何有意義的內容。

## 2025年 Vaultwarden 部署：Docker Compose 詳細步驟

部署 Vaultwarden 的推薦方式同樣是 Docker Compose，配合 Caddy 或 Nginx Proxy Manager 實現 HTTPS 反向代理。以下是完整部署流程，適合已有基本 Linux 操作經驗的用戶。

### 前置準備與環境要求

在開始之前，確保目標伺服器滿足以下條件：一台具有固定 IP 或域名解析的 Linux 伺服器（筆者推薦 Ubuntu 22.04 LTS 或 Debian 12），已安裝 Docker（20.10 以上版本）和 Docker Compose（2.0 以上版本）。需要一個指向伺服器 IP 的域名，例如 password.yourdomain.com，並建議提前配置好郵件轉發服務（可使用免費的 Cloudflare Email Routing 或 Resend）用於發送邀請郵件和密碼重置郵件。

硬體方面，Vaultwarden 對資源需求極低——512MB RAM 和 5GB 磁盤空間就能流暢運行，支持單用戶或小型團隊（10人以內）使用。如果需要更高的並發性能或長期存放大規模資料，建議 RAM 至少 1GB。

### 建立 Docker Compose 配置

首先建立 Vaultwarden 的工作目錄：

```bash
mkdir -p /opt/vaultwarden
cd /opt/vaultwarden
```

建立 docker-compose.yml 檔案：

```yaml
version: '3.8'

services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: always
    environment:
      WEBSOCKET_ENABLED: "true"
      SIGNUPS_ALLOWED: "true"
      SMTP_HOST: smtp.example.com
      SMTP_FROM: noreply@example.com
      SMTP_PORT: 587
      SMTP_SSL: "false"
      SMTP_USERNAME: your_smtp_username
      SMTP_PASSWORD: your_smtp_password
    volumes:
      - ./data:/data
    ports:
      - "127.0.0.1:8080:80"
      - "127.0.0.1:3012:3012"

  caddy:
    image: caddy:2
    container_name: caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy_data:/data
    depends_on:
      - vaultwarden
```

建立 Caddyfile 配置反向代理：

```
password.yourdomain.com {
  reverse_proxy /notifications/hub vaultwarden:3012
  reverse_proxy /* vaultwarden:8080
}
```

啟動服務：

```bash
docker-compose up -d
```

### 初始化配置與管理員帳戶

部署完成後，通過瀏覽器訪問你的域名，按提示建立第一個帳戶。建議使用強密碼並啟用雙層驗證（支持 TOTP 或硬體安全鑰匙如 YubiKey）。如需啟用管理員面板用於管理用戶和系統設置，請在環境變數中加入 ADMIN_TOKEN 或稍後通過 API 生成。

## Vaultwarden 進階配置與安全加固

### 啟用緊急アクセス功能

緊急アクセス是 Vaultwarden 的一項重要安全功能，允許你指定可信聯絡人，在緊急情況下（如忘記主密碼或無法访问帳戶）授予他們訪問你密碼庫的限時權限。設置方法：在 Web Vault 登入後，點擊「工具」>「緊急アクセス」，輸入可信聯絡人的 Bitwarden 帳戶郵箱，設置等待時間（建議 7 天以上）和最大等待時間。

### 移動客戶端配置

下載 Bitwarden 官方客戶端（iOS/Android/桌面端），在設置中將伺服器 URL 更改為你的自托管地址即可。Vaultwarden 完全相容官方客戶端，所有同步、密碼生成、自動填寫等功能均正常運作。iOS 用戶還可利用 Shortcuts 配合 Bitwarden CLI 實現更深入的自動化。

### 定時備份策略

Vaultwarden 的資料全部儲存在 ./data 目錄中，建議使用以下策略進行定時備份：

```bash
# 每日凌晨 3 點執行備份
0 3 * * * tar -czf /backup/vaultwarden-$(date +\%Y\%m\%d).tar.gz -C /opt/vaultwarden data
# 保留最近 30 天的備份
find /backup -name "vaultwarden-*.tar.gz" -mtime +30 -delete
```

## 從 Bitwarden 官方版遷移到 Vaultwarden

如果你目前在使用 Bitwarden 免費版或付費版，可以輕鬆遷移到 Vaultwarden。在 Web Vault 設定中找到「工具」>「匯出保管庫」，選擇 CSV 或 JSON 格式匯出所有登錄資訊，登入 Vaultwarden 後選擇「工具」>「匯入」，選擇對應格式即可完成遷移。注意：匯出的 CSV 包含未加密的密碼，請確保在安全環境下操作並在匯入後立即刪除匯出檔案。

## 總結：Vaultwarden 是否適合你

Vaultwarden 適合以下場景的用戶：對數據隱私和主權有高度要求、希望擺脫訂閱費用的個人用戶、需要在多設備間同步登錄資訊但不想使用雲端服務的小型團隊、擁有技術能力並希望完全控制自己資料的開發者和技術愛好者。如果你追求零費用的密碼管理解決方案，且對自托管技術有一定了解，Vaultwarden 無疑是 2025 年最具性價比的選擇。配合離線備份和定期更新，你將擁有一個安全、可靠、完全自有的密碼管理系統。