import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const fieldBase =
  "w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20";

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-clay">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextInput({ label, error, hint, id, required, className, ...props }: TextInputProps) {
  const generatedId = useId();
  id ??= generatedId;
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <input
        id={id}
        required={required}
        className={cn(fieldBase, error && "border-error focus:border-error focus:ring-error/20", className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, id, required, className, ...props }: TextAreaProps) {
  const generatedId = useId();
  id ??= generatedId;
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        required={required}
        className={cn(fieldBase, "min-h-32 resize-y", error && "border-error focus:border-error focus:ring-error/20", className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function SelectField({ label, error, hint, id, required, className, children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  id ??= generatedId;
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <select
        id={id}
        required={required}
        className={cn(fieldBase, "cursor-pointer", error && "border-error focus:border-error focus:ring-error/20", className)}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
