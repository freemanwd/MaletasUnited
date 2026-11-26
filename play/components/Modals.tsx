"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";
import { MATCHMAKER_SHORT } from "@/lib/legal";
import { usePlay } from "@/lib/play-context";
import { displayFee } from "@/lib/format";
import { TIER } from "@/lib/tier";
import { siteConfig, vipBenefits, waiverCopy } from "@/lib/site";
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
  const { modal, closeModal, repo, vip, showToast, joinWithWaiver, state } = usePlay();
  const router = useRouter();

  if (modal?.type === "signup") return <ProfileForm />;
  if (modal?.type === "host") return <HostForm />;

  if (modal?.type === "vip") {
    return (
      <>
        <h2>{TIER.productName}</h2>
        <p>
          <span className="price num">{siteConfig.vipMonthly}</span> a month, or{" "}
          <span className="price num">{siteConfig.vipYearly}</span> a year (save{" "}
          {siteConfig.vipYearlySave}).
        </p>
        <ul className="clean">
          {vipBenefits.map((item) => (
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
              await repo.setVip("monthly");
              closeModal();
              showToast(`${TIER.name} monthly is on in this demo`);
            }}
          >
            $1.99 / month (demo)
          </button>
          <button
            className="btn pitch"
            type="button"
            onClick={async () => {
              await repo.setVip("yearly");
              closeModal();
              showToast(`${TIER.name} yearly is on in this demo`);
            }}
          >
            $20 / year (demo)
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
              Demo: checkout is not connected. Optional Maletas merch later uses Stripe Connect.
              Partner listings checkout on the vendor site.
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
        <p>{MATCHMAKER_SHORT}</p>
        <p>{game.hostWaiver}</p>
        {game.feePaidToHost ? (
          <p className="small muted">
            {displayFee(game)}. Fees are between host and player. Maletas does not collect this fee.
          </p>
        ) : null}
        <p className="small muted">
          You are signing up for {game.title} · {game.when}. Draft pending attorney review.
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

  return vip ? null : null;
}
