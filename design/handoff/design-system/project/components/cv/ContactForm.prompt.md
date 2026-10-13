Short contact form (name, email, message) with validation, sending, success and error states.

```jsx
<ContactForm onSubmit={(v) => fetch("/api/contact", {method:"POST", body: JSON.stringify(v)})} />
```

`status` forces a state for docs.
