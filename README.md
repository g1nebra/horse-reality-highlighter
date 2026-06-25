# Horse Reality Highlighter

> Horse Reality Highlighter ☆ a Chrome extension by **claymore**
>
> 🌐 **English** · [Español](README.es.md)

This Chrome extension helps you find specific horses on **Horse Reality** by highlighting them on the Foundation page based on their **Breed**, **Coat** and **Sex**.

## Features

-   **Save coats from a horse's profile.** A **"Save coat to Highlighter"** button under the horse photo captures that horse's **foal coat** (the image the Foundation uses), so you can hunt for matching foals.
    -   Works for adult horses (reads the "as a foal" image from the **Colour** tab, opens it automatically if needed), foals shown with their dam (picks the smaller foal layer), and foals shown alone.
    ![alt text](image-2.png)
-   **Managed coat list.** Every saved coat appears in the settings panel with a **thumbnail**, a **link to the photo** and a **link back to the source horse**. Each coat has an **enable/disable** toggle so you can switch highlights on and off without losing them.
-   **Sex filter.** Highlight only **mares**, only **stallions**, or **both**.
-   **Breed filter.** Select a specific breed or search across "All Breeds".
-   Matching horses are highlighted with a **gold border** and background; the "Buy" button turns gold too.
-   The styling matches the companion **HR color predictor** extension (Horse Reality's official colour palette).

    ![alt text](image-3.png)

## Fairness and Safe Play

-   All logic runs locally on your browser. No data is sent to any external server.
-   This tool does **not** have autoclickers, auto-buyers, or any form of botting. It does not interact with the game server.
-   It simply modifies the CSS (styles) of the page to highlight specific images you are looking for. You still need to manually check and purchase the horse.

This kind of tool falls under Horse Reality's [Rule 7: Writing Scripts](https://v2.horsereality.com/rules#7), which permits *"Programs that scrape publicly available Horse Reality data to an external spreadsheet or database, or that only modify the user interface."* This extension only modifies the user interface — it highlights and restyles elements that are already on the page.

This does not mean the extension is officially supported by Horse Reality. Per the same rule, third-party programs are the exclusive responsibility of those who develop them. Horse Reality is not responsible for the maintenance, integrity, or continuation of this extension. Any bugs or feature requests should be sent directly to the developer, not to HR support.


## How to Install

1.  **Download** the source code for this extension to a folder on your computer.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  In the top right corner, toggle **Developer mode** to **ON**.
4.  Click the **Load unpacked** button that appears in the top left.
5.  Select the folder where you saved the extension files (the folder containing `manifest.json`).
6.  The extension is now installed!

## How to Use

### Save coats from a horse profile

1.  Open any horse's profile page (`/horses/...`).
2.  Click **"Save coat to Highlighter"**.
3.  A confirmation appears with a thumbnail of the captured **foal coat**. It's now in your list (enabled by default).
    *   *Note*: For adult horses the foal image lives in the **Colour** tab. The button opens that tab automatically if it isn't loaded yet, if you ever see "Coat not found", open the Colour tab once and click again.

### Highlight on the Foundation

1.  Go to the Horse Reality Foundation page.
2.  Click the **"Config Highlighter"** button fixed in the **top-right corner** of your screen to open the settings panel.
3.  **Breed**: select a breed, or leave it as "All Breeds".
4.  **Sex**: choose **Both**, **Mares**, or **Stallions**.
5.  **Saved Coats**: every saved coat is listed with a thumbnail and links. Use each row's **checkbox** to enable/disable it, or **×** to remove it.
    *   You can also paste an image filename or URL into **"Add a coat ID manually"** and click **Add**.
6.  Highlighting updates instantly, no Save button needed. A horse is highlighted only when it matches the breed **and** sex filters **and** at least one enabled coat.

## How to Update

1.  Replace the old files in your folder with the new versions.
2.  Go back to `chrome://extensions/`.
3.  Find the "Horse Reality Highlighter" card and click the **Refresh/Reload icon** (circular arrow).
4.  **Refresh** the Horse Reality webpage to see the changes.

## Browser Compatibility

This extension is built on the **Chromium** engine and works on:

-   **Google Chrome**
-   **Microsoft Edge**
-   **Opera** & **Opera GX**
-   **Brave**
-   **Vivaldi**
-   **Chromium**

*Note: Firefox is not currently supported without modifications.*
