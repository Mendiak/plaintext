# Modernist Component Guide

Follow these minimal patterns to ensure consistency and lack of noise.

## 1. Buttons (Form Follows Function)
Avoid gradients and heavy shadows. Use border, background, and padding for clarity.

```css
.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #f0f0f0;
  border: 1px solid #1a1a1a;
  color: #1a1a1a;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}
.button:hover { background-color: #e5e5e5; }
.button--primary { background-color: #1a1a1a; color: #fff; }
```

## 2. Form Inputs (Honest Materials)
Clear borders and generous spacing. No focus "glow".

```css
.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d1d1;
  background: #fff;
}
.input:focus {
  outline: none;
  border-color: #1a1a1a;
}
```

## 3. Cards & Containers (Structure)
Use subtle borders or background shifts. Avoid "floating" cards with large shadows.

```css
.card {
  padding: 2rem;
  border: 1px solid #eeeeee;
  background-color: #ffffff;
}
```

## 4. Typography Hierarchy
Use size and weight, not color, to separate information.

```css
h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
p { font-size: 1rem; color: #333333; }
```
