import React, { useState } from 'react';
import { Icon } from '../brand/Icon.jsx';
import { Button } from '../actions/Button.jsx';
import { TextField } from './TextField.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Name / email / message with validation, sending, success and error states.
 *  onSubmit(values) must return a Promise. `status` forces a state for documentation. */
export function ContactForm({ onSubmit, status: forced, initial = {}, className = '' }) {
  const [v, setV] = useState({ name: '', email: '', message: '', ...initial });
  const [err, setErr] = useState({});
  const [status, setStatus] = useState('idle');
  const s = forced || status;
  const validate = () => {
    const e = {};
    if (!v.name.trim()) e.name = 'Please add your name.';
    if (!EMAIL.test(v.email)) e.email = 'This email looks incomplete.';
    if (v.message.trim().length < 10) e.message = 'A sentence or two is enough.';
    setErr(e); return !Object.keys(e).length;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try { await (onSubmit ? onSubmit(v) : new Promise((r) => setTimeout(r, 1200))); setStatus('success'); }
    catch (e) { setStatus('error'); }
  };
  if (s === 'success') {
    return (
      <div className={'fj-form__status fj-form__status--success ' + className} role="status">
        <Icon name="circle-check" size={20} />
        <div><strong>Thanks!</strong>Your message is on its way. I’ll answer by email.</div>
      </div>
    );
  }
  const set = (k) => (e) => { setV({ ...v, [k]: e.target.value }); if (err[k]) setErr({ ...err, [k]: undefined }); };
  const busy = s === 'sending';
  return (
    <form className={'fj-form ' + className} onSubmit={submit} noValidate>
      {s === 'error' ? (
        <div className="fj-form__status fj-form__status--error" role="alert">
          <Icon name="circle-alert" size={20} />
          <div><strong>Message not sent.</strong>Something went wrong on my side. Try again, or email ponomaleks@gmail.com directly.</div>
        </div>
      ) : null}
      <div className="fj-form__row">
        <TextField label="Name" name="name" autoComplete="name" value={v.name} onChange={set('name')} error={err.name} disabled={busy} />
        <TextField label="Email" name="email" type="email" autoComplete="email" value={v.email} onChange={set('email')} error={err.email} disabled={busy} />
      </div>
      <TextField label="Message" name="message" multiline value={v.message} onChange={set('message')} error={err.message} hint={err.message ? undefined : 'Role, team, or project. Plain words are fine.'} disabled={busy} />
      <div className="fj-form__foot">
        <Button type="submit" loading={busy} arrow={!busy} iconEnd={undefined}>{busy ? 'Sending…' : 'Send message'}</Button>
        <span className="fj-form__note">Goes straight to my inbox</span>
      </div>
    </form>
  );
}
