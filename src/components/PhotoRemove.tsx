"use client";

import { useState, useTransition } from "react";
import { deleteSet, removePhoto } from "@/app/sets-actions";

type Props = {
  setId: string;
  photoKey: string;
  /** True when this is the only photograph left in its entry. */
  isLastInSet: boolean;
};

/**
 * Removing one photograph — a duplicate, a bad frame.
 *
 * Two clicks, because there is no undo for a misclick here: the photograph
 * leaves the entry and only the whole entry is restorable.
 *
 * A set must keep at least one photograph, so when this is the last one the
 * entry itself is soft-deleted instead. Either way the photograph disappears
 * from the trip and nothing is destroyed — the entry can be brought back from
 * Recently deleted.
 */
export function PhotoRemove({ setId, photoKey, isLastInSet }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    startTransition(async () => {
      if (isLastInSet) {
        await deleteSet(setId);
      } else {
        const result = await removePhoto(setId, photoKey);
        if (result.error) {
          setError(result.error);
          setIsConfirming(false);
          return;
        }
      }
      setIsConfirming(false);
    });
  };

  if (error) {
    return (
      <span className="shotx shotx--err" role="alert" title={error}>
        !
      </span>
    );
  }

  return isConfirming ? (
    <span className="shotask">
      <button type="button" onClick={remove} disabled={isPending} className="shotask__yes">
        {isPending ? "…" : "Delete"}
      </button>
      <button type="button" onClick={() => setIsConfirming(false)} className="shotask__no">
        Keep
      </button>
    </span>
  ) : (
    <button
      type="button"
      className="shotx"
      aria-label={isLastInSet ? "Delete this entry" : "Delete this photograph"}
      title={isLastInSet ? "Last one — deletes the entry" : "Delete this photograph"}
      onClick={() => setIsConfirming(true)}
    >
      ×
    </button>
  );
}
