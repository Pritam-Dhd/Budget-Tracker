export const Currencies = [
  { value: "USD", label: "$ Dollar", locale: "en-US" },
  { value: "EUR", label: "€ Euro", locale: "de-DE" },
  { value: "GBP", label: "£ Pound", locale: "en-GB" },
  { value: "JPY", label: "¥ Yen", locale: "ja-JP" },
  { value: "INR", label: "₹ Rupee", locale: "hi-IN" },
  { value: "NPR", label: "₨ Nepalese Rupee", locale: "en-NP" },
  { value: "AUD", label: "A$ Australian Dollar", locale: "en-AU" },
  { value: "CAD", label: "C$ Canadian Dollar", locale: "en-CA" },
];

export type Currency=(typeof Currencies)[0];
