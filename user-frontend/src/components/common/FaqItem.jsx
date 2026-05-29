import { useState } from "react";

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b py-1 rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between w-full text-left font-medium h-10 px-2 hover:bg-orange-200 rounded-2xl"
      >
        {question}
        <span>{open ? "-" : "+"}</span>
      </button>

      {open && (
        <h1 className="text-gray-500 mt-3 text-sm">
          {answer}
        </h1>
      )}
    </div>
  );
}