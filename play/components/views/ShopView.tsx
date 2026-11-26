"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";

export function ShopView() {
  const { state, repo, openModal, showToast } = usePlay();
  const affiliates = state.products.filter((product) => product.kind === "affiliate");
  const merch = state.products.filter((product) => product.kind === "merch");

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Shop</h2>
        <span className="row">
          <span className="tag plus">Demo marketplace</span>
          <button className="btn" type="button" onClick={() => openModal({ type: "checkout" })}>
            Bag · <span className="num">{state.cart.length}</span>
          </button>
        </span>
      </div>
      <p className="muted">
        Maletas is a matchmaker marketplace: partner and vendor listings with outbound or affiliate
        links. Optional Maletas merch later checks out through Stripe Connect. Nothing here is a
        real partnership.
      </p>
      <h3>Partner and vendor listings</h3>
      <div className="grid">
        {affiliates.map((product) => {
          const vendor = state.vendors.find((item) => item.id === product.vendorId);
          return (
            <article className="card" key={product.id}>
              <div className="thumb">{product.tile}</div>
              <strong>{product.name}</strong>
              <div className="small muted">
                {vendor?.name} · ships from {vendor?.country} · sample affiliate
              </div>
              <div className="row between">
                <span className="price num">${product.price}</span>
                <a
                  className="btn sm primary"
                  href={product.url}
                  rel="noopener noreferrer sponsored"
                  target="_blank"
                >
                  Visit vendor
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <h3>Maletas merch (later)</h3>
      <div className="grid">
        {merch.map((product) => (
          <article className="card" key={product.id}>
            <div className="thumb">{product.tile}</div>
            <strong>{product.name}</strong>
            <div className="small muted">Optional merch via Stripe Connect. Demo only.</div>
            <div className="row between">
              <span className="price num">${product.price}</span>
              <button
                className="btn sm"
                type="button"
                onClick={async () => {
                  await repo.addToCart(product.id);
                  showToast("Added to bag (demo)");
                }}
              >
                Add to bag
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="small muted">
        Vendors and products are sample listings, not real partnerships.{" "}
        <Link href="/shop/bag">Open bag</Link>
      </p>
    </div>
  );
}
