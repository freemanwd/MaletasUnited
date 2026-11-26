"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";
import { usePlay } from "@/lib/play-context";
import { plusBenefits, siteConfig, waiverCopy } from "@/lib/site";
import { HostForm } from "./HostForm";
import { ProfileForm } from "./ProfileForm";

export function Overlay() {
  const { modal, toast, closeModal } = usePlay();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("input,button,select,textarea")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  return (
    <div id="overlay">
      {modal ? (
        <div
          className="scrim"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" ref={dialogRef}>
            <ModalBody />
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function ModalBody() {
  const { modal, closeModal, repo, plus, showToast, joinWithWaiver, state } = usePlay();
  const router = useRouter();

  if (modal?.type === "signup") return <ProfileForm />;
  if (modal?.type === "host") return <HostForm />;

  if (modal?.type === "plus") {
    return (
      <>
        <h2>Maletas Plus</h2>
        <p>
          <span className="price num">{siteConfig.plusPrice}</span> a month. Cancel any time.
        </p>
        <ul className="clean">
          {plusBenefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="small muted">
          Demo: no card is taken and nothing is charged. On the live site this button opens Stripe
          Checkout.
        </p>
        <div className="row">
          <button
            className="btn primary"
            type="button"
            onClick={async () => {
              await repo.setPlus(true);
              closeModal();
              showToast("Plus is on. Search by ZIP or postcode.");
            }}
          >
            Turn on Plus in this demo
          </button>
          <button className="btn" type="button" onClick={closeModal}>
            Not now
          </button>
        </div>
      </>
    );
  }

  if (modal?.type === "checkout") {
    const rows = state.cart
      .map((id, index) => {
        const product = state.products.find((item) => item.id === id);
        if (!product) return null;
        return { product, index };
      })
      .filter((row): row is { product: (typeof state.products)[number]; index: number } =>
        Boolean(row),
      );
    const total = rows.reduce((sum, row) => sum + row.product.price, 0);
    return (
      <>
        <h2>Your bag</h2>
        {rows.length ? (
          rows.map(({ product, index }) => (
            <div className="row between" key={`${product.id}-${index}`}>
              <span>{product.name}</span>
              <span className="row">
                <span className="num">${product.price}</span>
                <button
                  className="btn sm"
                  type="button"
                  aria-label={`Remove ${product.name}`}
                  onClick={() => repo.removeFromCart(index)}
                >
                  Remove
                </button>
              </span>
            </div>
          ))
        ) : (
          <p className="muted">Your bag is empty.</p>
        )}
        {rows.length ? (
          <>
            <div className="row between">
              <strong>Total</strong>
              <strong className="num">{money(total)}</strong>
            </div>
            <p className="small muted">
              Demo: checkout is not connected. On the live site Stripe takes payment, pays the
              vendor, and keeps the Maletas commission.
            </p>
            <button className="btn primary" type="button" disabled>
              Checkout (demo)
            </button>
          </>
        ) : null}
        <div className="row">
          <button className="btn" type="button" onClick={closeModal}>
            Close
          </button>
        </div>
      </>
    );
  }

  if (modal?.type === "waiver") {
    const game = state.games.find((item) => item.id === modal.gameId);
    if (!game) return <p>Game not found.</p>;
    return (
      <>
        <h2>{waiverCopy.title}</h2>
        <p>{waiverCopy.body}</p>
        <p className="small muted">
          You are signing up for {game.title} · {game.when}.
        </p>
        <form
          className="form"
          onSubmit={async (event) => {
            event.preventDefault();
            const accepted = new FormData(event.currentTarget).get("waiver") === "on";
            if (!accepted) {
              showToast("Tick the waiver to join this sheet");
              return;
            }
            const joined = await joinWithWaiver(game.id);
            showToast(`You are on the sheet for ${joined.title}`);
            router.push(`/games/${game.id}`);
          }}
        >
          <label className="check" htmlFor="waiver">
            <input id="waiver" name="waiver" type="checkbox" required />
            <span>{waiverCopy.checkbox}</span>
          </label>
          <div className="row">
            <button className="btn primary" type="submit">
              Add my name
            </button>
            <button className="btn" type="button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </>
    );
  }

  return plus ? null : null;
}
