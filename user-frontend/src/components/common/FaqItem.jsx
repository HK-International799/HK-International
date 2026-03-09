import { useState } from "react";

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between w-full text-left font-medium"
      >
        {question}
        <span>{open ? "-" : "+"}</span>
      </button>

      {open && (
        <p className="text-gray-500 mt-3 text-sm">
          {answer}
        </p>
      )}
    </div>
  );
}