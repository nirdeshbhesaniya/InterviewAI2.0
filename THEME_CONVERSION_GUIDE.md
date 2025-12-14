# 🎨 Theme Conversion Guide

## ✅ Completed Conversions

### 1. CSS Variables (index.css)
- ✅ Updated all CSS variables to the new premium theme
- ✅ Replaced dark mode variables with single light theme
- ✅ Updated scrollbar styles
- ✅ Updated utility classes (glass-effect, text-gradient)
- ✅ Updated markdown and code block styles

### 2. Layout Components
- ✅ **Header.jsx** - Navigation, dropdowns, mobile menu
- ✅ **Footer.jsx** - Footer styling
- ✅ **MainLayout.jsx** - No changes needed (wrapper only)
- ✅ **ProtectedRoute.jsx** - No changes needed (logic only)

### 3. Auth Pages
- ✅ **Login.jsx** - Form inputs, buttons, links
- ✅ **SignUp.jsx** - Form inputs, photo upload, buttons
- ✅ **ForgotPassword.jsx** - All 3 steps converted

### 4. UI Components
- ✅ **button.jsx** - All button variants
- ✅ **card.jsx** - Card and all sub-components
- ✅ **input.jsx** - Input field styling
- ✅ **badge.jsx** - All badge variants

---

## 🔄 Conversion Patterns

Use these patterns to convert remaining files:

### Background Colors
```jsx
// ❌ OLD
className="bg-white"
className="bg-gray-50"
className="bg-slate-100"
className="bg-bg-card"
className="bg-bg-body"

// ✅ NEW
className="bg-[rgb(var(--bg-card))]"
className="bg-[rgb(var(--bg-body))]"
className="bg-[rgb(var(--bg-body-alt))]"
className="bg-[rgb(var(--bg-elevated))]"
className="bg-[rgb(var(--bg-elevated-alt))]"
```

### Text Colors
```jsx
// ❌ OLD
className="text-black"
className="text-gray-900"
className="text-gray-700"
className="text-gray-600"
className="text-gray-500"
className="text-text-primary"
className="text-text-secondary"
className="text-text-muted"

// ✅ NEW
className="text-[rgb(var(--text-primary))]"      // headings
className="text-[rgb(var(--text-secondary))]"    // body text
className="text-[rgb(var(--text-muted))]"        // hints, metadata
className="text-[rgb(var(--text-disabled))]"     // disabled state
```

### Border Colors
```jsx
// ❌ OLD
className="border-gray-200"
className="border-gray-300"
className="border-slate-300"
className="border-border-subtle"

// ✅ NEW
className="border-[rgb(var(--border))]"
className="border-[rgb(var(--border-subtle))]"
className="border-[rgb(var(--border-strong))]"
```

### Accent/Primary Colors
```jsx
// ❌ OLD
className="bg-primary"
className="text-primary"
className="bg-secondary"
className="text-secondary"
className="bg-highlight"
className="text-highlight"
className="bg-gradient-to-r from-highlight to-pink-500"
className="bg-gradient-to-r from-primary to-secondary"

// ✅ NEW
className="bg-[rgb(var(--accent))]"
className="text-[rgb(var(--accent))]"
className="hover:bg-[rgb(var(--accent-hover))]"
className="bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))]"
```

### Focus States
```jsx
// ❌ OLD
focus:ring-primary
focus:ring-highlight
focus:border-primary

// ✅ NEW
focus:ring-[rgb(var(--accent))]
focus:ring-[rgb(var(--accent))]/50
focus:border-[rgb(var(--accent))]
```

### Buttons
```jsx
// ❌ OLD - Primary Button
className="bg-gradient-to-r from-highlight to-pink-500 hover:shadow-lg hover:shadow-highlight/50 text-white"

// ✅ NEW - Primary Button
className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] hover:shadow-lg text-white"

// ❌ OLD - Secondary Button
className="bg-white text-gray-900 hover:bg-gray-50 border border-gray-300"

// ✅ NEW - Secondary Button
className="bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated-alt))] border border-[rgb(var(--border))]"
```

### Cards
```jsx
// ❌ OLD
className="bg-bg-card shadow-xl shadow-primary/10 rounded-2xl border border-border-subtle"

// ✅ NEW
className="bg-[rgb(var(--bg-card))] shadow-lg rounded-2xl border border-[rgb(var(--border))]"
```

---

## 📝 Files Still Needing Conversion

### High Priority
1. **LandingPage.jsx** - Hero section, features, testimonials
2. **Dashboard.jsx** - Main dashboard cards and stats
3. **Codebase.jsx** - Code editor interface
4. **ProfilePage.jsx** - User profile forms and cards
5. **ResourcesPage.jsx** - Resource cards and upload modal
6. **NotesPage.jsx** - Notes cards and editor
7. **SettingsPageNew.jsx** - Settings toggles and forms
8. **NotificationsPageNew.jsx** - Notification cards
9. **InterviewPrepModern.jsx** - Interview interface
10. **MCQTest.jsx** - MCQ test interface
11. **TestHistoryPage.jsx** - Test history cards

### Feature Components
12. **ChatbotWindow.jsx** - Chatbot interface
13. **ChatbotToggle.jsx** - Chatbot button
14. **FAQSection.jsx** - FAQ accordion
15. **PrepCard.jsx** - Preparation cards
16. **CreateCardForm.jsx** - Card creation form
17. **ContactSupport.jsx** - Support form
18. **UploadResourceModal.jsx** - Upload modal

### UI Components (Lower Priority)
19. **Loader.jsx**
20. **SimpleButton.jsx**
21. **SimpleCard.jsx**
22. **separator.jsx**
23. **scroll-area.jsx**

---

## 🎯 Quick Search & Replace Guide

### Using Find & Replace in VS Code:

1. **Remove dark mode classes:**
   - Find: `dark:[^\s]+`
   - Replace: `` (empty)

2. **Convert bg-white:**
   - Find: `bg-white`
   - Replace: `bg-[rgb(var(--bg-card))]`

3. **Convert text-black:**
   - Find: `text-black`
   - Replace: `text-[rgb(var(--text-primary))]`

4. **Convert border-gray-200:**
   - Find: `border-gray-200`
   - Replace: `border-[rgb(var(--border))]`

5. **Convert text-gray-900:**
   - Find: `text-gray-900`
   - Replace: `text-[rgb(var(--text-primary))]`

6. **Convert text-gray-700:**
   - Find: `text-gray-700`
   - Replace: `text-[rgb(var(--text-secondary))]`

7. **Convert text-gray-600:**
   - Find: `text-gray-600`
   - Replace: `text-[rgb(var(--text-secondary))]`

8. **Convert text-gray-500:**
   - Find: `text-gray-500`
   - Replace: `text-[rgb(var(--text-muted))]`

9. **Convert bg-gray-50:**
   - Find: `bg-gray-50`
   - Replace: `bg-[rgb(var(--bg-body-alt))]`

10. **Convert bg-gray-100:**
    - Find: `bg-gray-100`
    - Replace: `bg-[rgb(var(--bg-body-alt))]`

---

## 🚀 Next Steps

1. Apply conversions to each file in the "Files Still Needing Conversion" list
2. Test each page to ensure visual consistency
3. Remove any remaining `dark:` prefixed classes
4. Verify all gradients use the new accent colors
5. Check mobile responsiveness after changes

---

## 💡 Tips

- **Use the Button component** from `ui/button.jsx` instead of custom button classes
- **Use the Card component** from `ui/card.jsx` for consistent card styling
- **Keep white text on accent backgrounds** for proper contrast
- **Use shadow-sm or shadow-md** instead of custom shadow values
- **Test on mobile** - the new theme should work seamlessly on all devices

---

## ✨ Theme Colors Reference

```css
/* Backgrounds */
--bg-body: 248 250 252              /* Soft off-white page */
--bg-body-alt: 241 245 249          /* Section separation */
--bg-elevated: 255 255 255          /* Cards, modals */
--bg-elevated-alt: 248 250 252      /* Hover states */

/* Text */
--text-primary: 15 23 42            /* Headings */
--text-secondary: 51 65 85          /* Paragraphs */
--text-muted: 100 116 139           /* Hints */
--text-disabled: 148 163 184        /* Disabled */

/* Borders */
--border: 226 232 240               /* Default */

/* Accent */
--accent: 59 130 246                /* Primary blue */
--accent-hover: 37 99 235           /* Darker blue */
```

---

## 🎨 Design Goals Achieved

✅ High readability for long content  
✅ Low eye strain with soft contrasts  
✅ Clean, modern professional look  
✅ Clear visual hierarchy  
✅ No harsh blacks or whites  
✅ Single consistent theme (no dark mode toggle)  
✅ Comfortable for long reading sessions  
✅ Mobile-friendly design

