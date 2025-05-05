# 🎵 YouTube Music Anti-AFK 🤖

[![Userscript Version](https://img.shields.io/badge/version-0.2.0-blue?style=flat-square)](https://raw.githubusercontent.com/InvictusNavarchus/ytmusic-anti-afk/master/ytmusic-anti-afk.user.js)

Tired of YouTube Music stopping mid-groove just because you're listening intently (or happen to be away from the keyboard)? 😫 This userscript keeps the tunes flowing by automatically handling those pesky "Are you still there?" checks! ✨

## ✨ Features

* ✅ **Automatic AFK Prompt Bypass:** Detects the "Are you still there?" / "Video paused. Continue watching?" modal and clicks "Yes" for you.
* 🔔 **Warning Notification Handling:** Catches the earlier "Still watching? Video will pause soon" notification and clicks "Yes" to prevent the main interruption.
* 💾 **Persistent Logging:** Records every bypass attempt (success/failure, timestamp) using your userscript manager's storage (`GM_setValue`/`GM_getValue`).
* 📄 **CSV Log Export:** Easily export the stored logs with a couple of clicks using the on-page button (`GM_download`).
* 📊 **On-Page UI & Feedback:**
    * Adds a subtle floating `📊` button (bottom-left) for log export access.
    * Displays clear, non-intrusive toast notifications (bottom-right) for script actions and status updates (✅ Success / ❌ Failure).
* 🚀 **Efficient Detection:** Uses a `MutationObserver` to watch for prompts without impacting browser performance.

## 🚀 Installation

1.  **🔧 Install a Userscript Manager:** You need a browser extension to run userscripts. Popular choices:
    * [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari, Opera)
    * [Greasemonkey](https://www.greasespot.net/) (Firefox)
    * [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge, Opera)

2.  **✅ Install the Script:** Click the direct installation link below. Your userscript manager should pop up and ask for confirmation.
    * 🔗 **[Install YouTube Music Anti-AFK Script](https://raw.githubusercontent.com/InvictusNavarchus/ytmusic-anti-afk/master/ytmusic-anti-afk.user.js)**

3.  **🎧 Verify:** Open (or refresh) [music.youtube.com](music.youtube.com/). The script is active if you see the `📊` button in the bottom-left corner.

##🖱️ Usage

* **🧘 Automatic:** Just play your music on [music.youtube.com](http://googleusercontent.com/youtube.com/6)! The script works silently in the background. When a prompt appears, it should be dismissed automatically within seconds, followed by a confirmation toast.
* **📊 Log Export:**
    1.  Click the floating `📊` button (bottom-left).
    2.  A toast notification will appear showing the log count.
    3.  If logs exist, click the `Export CSV` button within the toast.
    4.  Your browser will prompt you to save the `.csv` file. 🎉

## <details><summary>⚙️ How It Works (Technical Details)</summary>

1.  **Initialization:** When the YouTube Music page loads, the script sets up its components (toast system, stats button, observer).
2.  **👀 DOM Monitoring:** A `MutationObserver` watches for changes in the page structure, specifically looking for elements related to AFK prompts (`ytmusic-popup-container`, `tp-yt-paper-dialog`, `ytmusic-you-there-renderer`, etc.) or visibility changes.
3.  **🎯 Detection:** When the observer signals a potential match, the script confirms if the actual AFK modal or warning notification elements are present and visible.
4.  **👆 Bypass Action:** If found, it locates the confirmation button (usually "Yes") and programmatically clicks it.
5.  **📝 Logging & Feedback:** The action's result is recorded using `GM_setValue` and shown via a toast. It double-checks if the modal closed after the click, sometimes retrying if needed.
6.  **📤 Export Mechanism:** Clicking the export action retrieves logs via `GM_getValue`, formats them as CSV, and uses `GM_download` to trigger the browser download.

</details>

## ⚠️ Important Notes

> [!WARNING]
> **Website Changes Can Break the Script:** This script relies on YouTube Music's current HTML structure. Future website updates might change element IDs or classes, which could stop the script from working correctly.

> [!IMPORTANT]
> **Log Storage Limits:** Logs are saved using your userscript manager (`GM_setValue`). This storage isn't unlimited and could be cleared by browser settings, extension updates, or manual actions. Export logs periodically if you need a permanent record.