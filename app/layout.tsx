:root {
  --font-ui: var(--font-sfu-futura), Arial, Helvetica, sans-serif;
}

html,
body {
  font-family: var(--font-ui);
}

body,
p,
span,
a,
li,
label,
input,
textarea,
select,
button,
th,
td,
small {
  font-family: var(--font-ui);
  font-weight: 400;
}

h1,
h2,
h3,
h4,
h5,
h6,
.font-serif,
.font-display,
nav a,
button,
[role="button"] {
  font-family: var(--font-ui) !important;
  font-weight: 700;
}

.font-sans {
  font-family: var(--font-ui) !important;
  font-weight: 400;
}

.font-serif {
  font-family: var(--font-ui) !important;
  font-weight: 700;
}

input::placeholder,
textarea::placeholder {
  font-family: var(--font-ui);
  font-weight: 400;
}
