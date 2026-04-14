/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "tertiary-fixed-dim": "#ffb597",
              "surface-bright": "#f8f9fa",
              "on-tertiary-container": "#d4815d",
              "inverse-primary": "#abc7ff",
              "on-tertiary-fixed": "#360f00",
              "tertiary-fixed": "#ffdbcd",
              "surface-container": "#edeeef",
              "primary-container": "#002d62",
              "surface": "#f8f9fa",
              "on-tertiary": "#ffffff",
              "surface-variant": "#e1e3e4",
              "background": "#f8f9fa",
              "secondary-fixed": "#cce5ff",
              "inverse-surface": "#2e3132",
              "surface-dim": "#d9dadb",
              "on-secondary-container": "#46647e",
              "outline-variant": "#c4c6d1",
              "on-primary-fixed": "#001b3f",
              "on-secondary-fixed-variant": "#2b4963",
              "primary": "#00193c",
              "on-surface": "#191c1d",
              "secondary": "#43617c",
              "surface-container-high": "#e7e8e9",
              "primary-fixed-dim": "#abc7ff",
              "on-primary-fixed-variant": "#24467c",
              "on-error": "#ffffff",
              "on-secondary": "#ffffff",
              "error-container": "#ffdad6",
              "inverse-on-surface": "#f0f1f2",
              "secondary-container": "#c1e0ff",
              "on-surface-variant": "#43474f",
              "on-secondary-fixed": "#001d31",
              "on-tertiary-fixed-variant": "#743417",
              "surface-tint": "#3e5e95",
              "tertiary": "#330e00",
              "surface-container-low": "#f3f4f5",
              "on-primary": "#ffffff",
              "on-error-container": "#93000a",
              "on-primary-container": "#7796d1",
              "tertiary-container": "#541d02",
              "on-background": "#191c1d",
              "outline": "#747781",
              "error": "#ba1a1a",
              "surface-container-lowest": "#ffffff",
              "secondary-fixed-dim": "#abcae8",
              "surface-container-highest": "#e1e3e4",
              "primary-fixed": "#d7e2ff"
          },
          "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
          },
          "fontFamily": {
              "headline": ["Manrope"],
              "body": ["Work Sans"],
              "label": ["Work Sans"]
          }
      },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
