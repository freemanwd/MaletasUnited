"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";

export function ShopView() {
  const { state, repo, openModal, showToast } = usePlay();

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Shop</h2>
        <button className="btn" type="button" onClick={() => openModal({ type: "checkout" })}>
          Bag · <span className="num">{state.cart.length}</span>
        </button>
      </div>
      <p className="muted">
        Gear from independent soccer vendors. Maletas earns a commission on each sale. Checkout is
        a demo; nothing is charged.
      </p>
      <div className="grid">
        {state.products.map((product) => {
          const vendor = state.vendors.find((item) => item.id === product.vendorId);
          return (
            <article className="card" key={product.id}>
              <div className="thumb">{product.tile}</div>
              <strong>{product.name}</strong>
              <div className="small muted">
                {vendor?.name} · ships from {vendor?.country} · sample
              </div>
              <div className="row between">
                <span className="price num">${product.price}</span>
                <button
                  className="btn sm primary"
                  type="button"
                  onClick={async () => {
                    await repo.addToCart(product.id);
                    showToast("Added to bag");
                  }}
                >
                  Add to bag
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="small muted">
        Vendors and products are sample listings, not real partnerships.{" "}
        <Link href="/shop/bag">Open bag</Link>
      </p>
    </div>
  );
}
