import { useState } from "react";

interface UseOptimisticToggleResult {
  value: boolean;
  count: number;
  toggle: () => void;
  isPending: boolean;
}

export function useOptimisticToggle(
  initialValue: boolean,
  initialCount: number,
  onOptimistic: (newValue: boolean) => Promise<void> | void,
): UseOptimisticToggleResult {
  const [value, setValue] = useState(initialValue);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const toggle = async () => {
    if (isPending) return;

    const newValue = !value;
    const newCount = count + (newValue ? 1 : -1);

    // Optimistic update
    setValue(newValue);
    setCount(newCount);
    setIsPending(true);

    try {
      await onOptimistic(newValue);
    } catch {
      // Rollback
      setValue(value);
      setCount(count);
    } finally {
      setIsPending(false);
    }
  };

  return { value, count, toggle, isPending };
}
