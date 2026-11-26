"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { usePlay } from "@/lib/play-context";

export function BagView() {
  const { state, repo } = usePlay();
  const rows = state.cart
    .map((id, index) => {
      const product = state.products.find((item) => item.id === id);
      return product ? { product, index } : null;
    })
    .filter((row): row is { product: (typeof state.products)[number]; index: number } =>
      Boolean(row),
    );
  const total = rows.reduce((sum, row) => sum + row.product.price, 0);

  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/shop">Shop</Link> / bag
      </p>
      <h2>Your bag</h2>
      <span className="tag plus">Demo</span>
      {rows.length ? (
        <div className="card">
          {rows.map(({ product, index }) => (
            <div className="row between" key={`${product.id}-${index}`}>
              <span>{product.name}</span>
              <span className="row">
                <span className="num">${product.price}</span>
                <button className="btn sm" type="button" onClick={() => repo.removeFromCart(index)}>
                  Remove
                </button>
              </span>
            </div>
          ))}
          <div className="row between">
            <strong>Total</strong>
            <strong className="num">{money(total)}</strong>
          </div>
          <p className="small muted">
            Demo: checkout is not connected. Production uses Stripe to take payment, pay the
            vendor through Connect, and keep the Maletas commission.
          </p>
          <button className="btn primary" type="button" disabled>
            Checkout (demo)
          </button>
        </div>
      ) : (
        <div className="card">
          <p className="muted">Your bag is empty.</p>
          <Link className="btn pitch" href="/shop">
            Browse the shop
          </Link>
        </div>
      )}
    </div>
  );
}
