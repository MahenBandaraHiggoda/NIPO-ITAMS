"use client";

import { useState } from "react";

const emptyForm = { item: "", quantity: "", year: "2026", justification: "" };

export default function RequestForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState([]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.item) newErrors.item = "Please choose an equipment type.";
    if (!form.quantity || Number(form.quantity) < 1)
      newErrors.quantity = "Enter a quantity of 1 or more.";
    if (!form.year || Number(form.year) < 2000)
      newErrors.year = "Enter a valid year.";
    if (form.justification.trim().length < 10)
      newErrors.justification = "Please explain why (at least 10 characters).";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitted([{ ...form, id: Date.now() }, ...submitted]);
    setForm(emptyForm);
  }

  const inputClass = "mt-1 w-full rounded-md border p-2 text-sm";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">New equipment request</h2>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Equipment type</label>
          <select name="item" value={form.item} onChange={handleChange} className={inputClass}>
            <option value="">Select...</option>
            <option>Desktop PC</option>
            <option>Laptop</option>
            <option>Printer</option>
            <option>Scanner</option>
            <option>Network switch</option>
          </select>
          {errors.item && <p className={errorClass}>{errors.item}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Requested quantity</label>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={inputClass} />
          {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Year</label>
          <input type="number" name="year" value={form.year} onChange={handleChange} className={inputClass} />
          {errors.year && <p className={errorClass}>{errors.year}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Justification</label>
          <textarea name="justification" rows={3} value={form.justification} onChange={handleChange} className={inputClass} />
          {errors.justification && <p className={errorClass}>{errors.justification}</p>}
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white">
            Submit request
          </button>
        </div>
      </form>

      {submitted.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No new requests yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {submitted.map((r) => (
            <li key={r.id} className="rounded-md border p-3 text-sm">
              <strong>{r.quantity} x {r.item}</strong> for {r.year}: {r.justification}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}