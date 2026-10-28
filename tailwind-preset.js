/* @overide6/ui – Tailwind CSS 3 preset mapping utilities onto tokens.css.
 *
 *   import overide6 from "@overide6/ui/tailwind-preset";
 *   export default { presets: [overide6], content: [...] };
 *
 * Triplet tokens support opacity modifiers (bg-accent/10); derived colours
 * such as accent-soft are complete colours and do not. Light and dark come
 * from the tokens, so no dark: variants are needed for these colours. */

const triplet = (token) => `rgb(var(${token}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        canvas: triplet("--color-canvas"),
        surface: {
          DEFAULT: triplet("--color-surface"),
          soft: triplet("--color-surface-soft"),
          strong: triplet("--color-surface-strong"),
        },
        line: {
          DEFAULT: triplet("--color-line-soft"),
          strong: triplet("--color-line-strong"),
        },
        ink: triplet("--color-ink"),
        muted: triplet("--color-muted"),
        subtle: triplet("--color-subtle"),
        accent: {
          DEFAULT: triplet("--color-accent"),
          soft: "var(--accent-soft)",
          line: "var(--accent-line)",
          on: triplet("--color-on-accent"),
        },
        success: {
          DEFAULT: triplet("--color-success"),
          soft: "var(--success-soft)",
          line: "var(--success-line)",
        },
        warning: {
          DEFAULT: triplet("--color-warning"),
          soft: "var(--warning-soft)",
          line: "var(--warning-line)",
        },
        danger: {
          DEFAULT: triplet("--color-danger"),
          soft: "var(--danger-soft)",
          line: "var(--danger-line)",
        },
        chart: {
          DEFAULT: triplet("--color-chart"),
          2: triplet("--color-chart-2"),
          grid: triplet("--color-chart-grid"),
        },
        bar: {
          DEFAULT: triplet("--color-bar"),
          line: triplet("--color-bar-line"),
          ink: triplet("--color-bar-ink"),
          dim: triplet("--color-bar-dim"),
          accent: "var(--bar-accent)",
          "accent-soft": "var(--bar-accent-soft)",
        },
      },
      fontFamily: {
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        ui: "var(--radius)",
        "ui-sm": "var(--radius-sm)",
        "ui-lg": "var(--radius-lg)",
      },
      boxShadow: {
        modal: "var(--shadow-modal)",
      },
      minHeight: {
        control: "var(--control-height)",
      },
      maxWidth: {
        page: "var(--page-width)",
      },
    },
  },
};
