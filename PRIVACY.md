# Privacy Policy for CleanTable

**Last Updated:** October 10, 2026

## 1. Overview
**CleanTable** ("the Extension") is committed to protecting your privacy. CleanTable is designed and engineered as an offline, 100% client-side tool to detect, clean, and export web tables to spreadsheet and data formats (Excel, Google Sheets, CSV, JSON, SQL, Markdown).

**We do NOT collect, store, sell, or transmit any personal data, web browsing history, or webpage content to any remote server.**

---

## 2. Information We Do NOT Collect
- **No Personal Information:** We do not collect names, email addresses, IP addresses, physical addresses, or device IDs.
- **No Browsing History:** We do not track, record, or monitor the websites you visit or your browsing activity.
- **No Table Data Collection:** All table extraction, cleaning, and formatting processes execute strictly in-memory inside your local web browser. None of your extracted data is ever sent to external servers or third parties.
- **No Analytics or Trackers:** CleanTable does not include Google Analytics, advertising trackers, fingerprinting scripts, or telemetry SDKs.

---

## 3. Chrome Permissions & Why They Are Needed

CleanTable adheres strictly to the principle of least privilege:

| Permission | Purpose |
| :--- | :--- |
| **`activeTab`** | Allows CleanTable to access the currently active browser tab when the user clicks the extension icon to detect tables and display previews. |
| **`scripting`** | Injects the table cleaning and visual highlighting scripts into the active webpage upon user interaction. |
| **`clipboardWrite`** | Enables the 1-click export functionality to copy cleaned table data (TSV, CSV, JSON, SQL, Markdown) to your local clipboard when you click an export button. |
| **`storage`** | Stores user preferences locally on your device (such as default export format, toggle preferences, and offline PRO license key) via `chrome.storage.local`. No data is synced or sent off-device. |
| **Host Permissions (`https://api.gumroad.com/*`)** | Used exclusively to verify PRO license keys against the Gumroad API if a user chooses to activate a paid PRO license. |

---

## 4. Third-Party Services
CleanTable does not share any data with third-party advertising or analytics companies. The only external network interaction that may occur is an optional license verification request to Gumroad (`api.gumroad.com`) strictly if you activate a PRO license.

---

## 5. Data Security
Because CleanTable does not collect or store any user data on external servers, your data is inherently secure and remains entirely within your local browser environment.

---

## 6. Compliance with Chrome Web Store Developer Policies
CleanTable strictly complies with the [Google Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/user-data-policy/), including:
- Operating with a Single Purpose.
- Requesting only necessary permissions.
- Zero sale or transfer of user data.
- Zero remote code execution (100% packaged locally).

---

## 7. Contact Information
If you have questions or concerns regarding this Privacy Policy, please contact us by opening an issue on our official GitHub repository:
- **GitHub Repository:** [https://github.com/sergiocalvog/cleantable](https://github.com/sergiocalvog/cleantable)
- **Developer:** Sergio Calvo (`sergiocalvog`)
