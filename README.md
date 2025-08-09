# Facebook Mass Unfollower

A simple JavaScript script to mass unfollow Facebook accounts directly from your browser's console.  
Includes adjustable delays to avoid triggering Facebook's anti-spam systems.

---

## 🚀 Features
- Unfollow multiple Facebook accounts automatically.
- Adjustable delay between each unfollow action for safer operation.
- Works directly in your browser console (no installation needed).
- Logs each unfollowed account in the console.

---

## 📋 How to Use
1. Open your Facebook **Following** page or any page showing accounts you follow.
2. Press `F12` or `Ctrl + Shift + I` (Windows) / `Cmd + Option + I` (Mac) to open **Developer Tools**.
3. Go to the **Console** tab.
4. Paste the script from this repository into the console.
5. Press **Enter** to run.

---

## ⚙️ Configuration
Inside the script, you can edit:
```javascript
const OPT = {
  betweenItemsMs: 4000, // Delay between unfollows (in milliseconds)
  maxActions: 300,      // Max number of accounts to unfollow
  autoScroll: true,     // Auto scroll the page to load more accounts
  scrollStep: 1400      // Scroll amount in pixels
};
