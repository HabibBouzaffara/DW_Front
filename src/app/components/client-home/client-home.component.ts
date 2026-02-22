import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="ch-page">
      <div class="ch-hero">
        <div class="ch-glow ch-glow--1"></div>
        <div class="ch-glow ch-glow--2"></div>

        <div class="ch-hero__content">
          <span class="ch-tag">Welcome back</span>
          <h1 class="ch-title">Discover Our<br><span class="ch-title--accent">Product Catalog</span></h1>
          <p class="ch-desc">Browse our full range of products, filter by category, and explore detailed product pages.</p>
          <div class="ch-actions">
            <a routerLink="/products" class="ch-btn ch-btn--primary" id="btn-browse-products">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="6" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><rect x="9" y="10" width="6" height="6" rx="1"/><rect x="16" y="10" width="6" height="6" rx="1"/><rect x="2" y="17" width="6" height="6" rx="1"/><rect x="9" y="17" width="6" height="6" rx="1"/><rect x="16" y="17" width="6" height="6" rx="1"/></svg>
              Browse Products
            </a>
          </div>
        </div>

        <div class="ch-hero__visual">
          <div class="ch-card-demo">
            <div class="ch-card-demo__img"></div>
            <div class="ch-card-demo__body">
              <div class="ch-card-demo__line ch-card-demo__line--sm"></div>
              <div class="ch-card-demo__line ch-card-demo__line--lg"></div>
              <div class="ch-card-demo__price">$249.99</div>
            </div>
          </div>
          <div class="ch-card-demo ch-card-demo--offset">
            <div class="ch-card-demo__img ch-card-demo__img--2"></div>
            <div class="ch-card-demo__body">
              <div class="ch-card-demo__line ch-card-demo__line--sm"></div>
              <div class="ch-card-demo__line ch-card-demo__line--md"></div>
              <div class="ch-card-demo__price">$89.99</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature strip -->
      <div class="ch-features">
        <div class="ch-feature">
          <div class="ch-feature__icon">🔍</div>
          <h3>Smart Search</h3>
          <p>Instantly find any product by name across the full catalog</p>
        </div>
        <div class="ch-feature">
          <div class="ch-feature__icon">🏷️</div>
          <h3>Category Filter</h3>
          <p>Narrow down by category — Bikes, Components, Accessories and more</p>
        </div>
        <div class="ch-feature">
          <div class="ch-feature__icon">📄</div>
          <h3>Product Details</h3>
          <p>View full product pages with images, pricing and specifications</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ch-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: #e2e8f0;
      overflow: hidden;
    }

    /* ── Hero ── */
    .ch-hero {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 2rem;
      padding: 5rem 4rem 4rem;
      overflow: hidden;
    }

    .ch-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
    }
    .ch-glow--1 { width: 400px; height: 400px; background: rgba(124,58,237,0.25); top: -80px; left: -80px; }
    .ch-glow--2 { width: 350px; height: 350px; background: rgba(96,165,250,0.2); bottom: -60px; right: 10%; }

    .ch-tag {
      display: inline-block;
      background: rgba(167,139,250,0.15);
      border: 1px solid rgba(167,139,250,0.3);
      color: #a78bfa;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.3rem 0.9rem;
      border-radius: 999px;
      margin-bottom: 1.25rem;
    }

    .ch-title {
      font-size: 3.2rem;
      font-weight: 900;
      line-height: 1.15;
      margin: 0 0 1rem;
      color: #f1f5f9;
    }

    .ch-title--accent {
      background: linear-gradient(90deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .ch-desc {
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.7;
      margin: 0 0 2rem;
      max-width: 380px;
    }

    .ch-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

    .ch-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.9rem 2rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    }
    .ch-btn svg { width: 18px; height: 18px; }
    .ch-btn:hover { transform: translateY(-3px); opacity: 0.92; }

    .ch-btn--primary {
      background: linear-gradient(90deg, #7c3aed, #4f46e5);
      color: #fff;
      box-shadow: 0 8px 30px rgba(124,58,237,0.4);
    }

    /* ── Visual (decorative cards) ── */
    .ch-hero__visual {
      display: flex;
      gap: 1.25rem;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .ch-card-demo {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      overflow: hidden;
      width: 160px;
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.4);
      animation: float 4s ease-in-out infinite;
    }

    .ch-card-demo--offset {
      margin-top: 2.5rem;
      animation-delay: -2s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    .ch-card-demo__img {
      height: 110px;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      opacity: 0.7;
    }
    .ch-card-demo__img--2 { background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); }

    .ch-card-demo__body { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .ch-card-demo__line { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.12); }
    .ch-card-demo__line--sm { width: 50%; }
    .ch-card-demo__line--md { width: 70%; }
    .ch-card-demo__line--lg { width: 85%; }

    .ch-card-demo__price {
      margin-top: 0.25rem;
      font-size: 0.95rem;
      font-weight: 800;
      background: linear-gradient(90deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* ── Features ── */
    .ch-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 2.5rem 4rem 4rem;
    }

    .ch-feature {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 2rem;
      text-align: center;
      transition: border-color 0.25s, transform 0.25s;
    }

    .ch-feature:hover {
      border-color: rgba(167,139,250,0.35);
      transform: translateY(-5px);
    }

    .ch-feature__icon { font-size: 2.2rem; margin-bottom: 0.75rem; }
    .ch-feature h3 { font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem; color: #f1f5f9; }
    .ch-feature p { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.6; }

    /* Responsive */
    @media (max-width: 768px) {
      .ch-hero { grid-template-columns: 1fr; padding: 3rem 1.5rem 2rem; text-align: center; }
      .ch-hero__visual { display: none; }
      .ch-title { font-size: 2.2rem; }
      .ch-desc { max-width: 100%; }
      .ch-actions { justify-content: center; }
      .ch-features { grid-template-columns: 1fr; padding: 1.5rem; }
    }
  `]
})
export class ClientHomeComponent {}
