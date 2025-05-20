import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <div class="home-container">
      <header class="hero-section">
        <img src="assets/images/salon-hero.jpg" alt="Salone di Bellezza" class="hero-image">
        <div class="hero-text">
          <h1>Eleganza & Stile Quotidiano</h1>
          <p>Scopri la tua bellezza, ogni giorno.</p>
          <button class="cta-button" (click)="navigateToServices()">I Nostri Servizi</button>
        </div>
      </header>

      <section class="welcome-section">
        <h2>Benvenuti nel Vostro Angolo di Paradiso</h2>
        <p>
          Il nostro salone è più di un semplice luogo per trattamenti di bellezza; è uno spazio dove potrete rilassarvi,
          rigenerarvi e riscoprire la vostra luce interiore. Offriamo una vasta gamma di servizi, dalla cura dei capelli
          all'estetica avanzata, tutti eseguiti da professionisti esperti con prodotti di altissima qualità.
        </p>
      </section>

      <section class="featured-services">
        <h2>Servizi in Evidenza</h2>
        <div class="services-grid">
          <div class="service-card">
            <img src="assets/images/hair-service.jpg" alt="Servizio Capelli" class="service-image">
            <h3>Taglio & Piega</h3>
            <p>Look moderni e classici per esaltare la tua personalità.</p>
          </div>
          <div class="service-card">
            <img src="assets/images/nails-service.jpg" alt="Servizio Unghie" class="service-image">
            <h3>Manicure & Pedicure</h3>
            <p>Cura e bellezza per le tue mani e i tuoi piedi.</p>
          </div>
          <div class="service-card">
            <img src="assets/images/facial-service.jpg" alt="Servizio Viso" class="service-image">
            <h3>Trattamenti Viso</h3>
            <p>Soluzioni personalizzate per una pelle radiosa.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    .home-container {
      font-family: 'Arial', sans-serif; /* Scegli un font elegante */
      color: #333;
    }

    .hero-section {
      position: relative;
      text-align: center;
      color: white;
      height: 70vh; /* Altezza della sezione hero */
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden; /* Per evitare che l'immagine debordi se più grande */
    }

    .hero-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover; /* Copre l'area mantenendo le proporzioni */
      z-index: -1; /* Mette l'immagine dietro il testo */
      filter: brightness(0.6); /* Scurisce leggermente l'immagine per leggibilità testo */
    }

    .hero-text {
      z-index: 1;
      padding: 20px;
      background-color: rgba(0, 0, 0, 0.3); /* Sfondo semitrasparente per il testo */
      border-radius: 10px;
    }

    .hero-text h1 {
      font-size: 3.5rem;
      margin-bottom: 0.5em;
      font-weight: bold;
      color: #f7f7f7; /* Colore chiaro per contrasto */
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    .hero-text p {
      font-size: 1.5rem;
      margin-bottom: 1.5em;
      color: #e0e0e0;
    }

    .cta-button {
      padding: 12px 25px;
      font-size: 1.1rem;
      color: white;
      background-color: #c59d5f; /* Un colore oro/bronzo elegante */
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      text-transform: uppercase;
    }

    .cta-button:hover {
      background-color: #b38b50;
    }

    .welcome-section, .featured-services {
      padding: 40px 20px;
      text-align: center;
      max-width: 900px;
      margin: 0 auto; /* Centra la sezione */
    }

    .welcome-section h2, .featured-services h2 {
      font-size: 2.5rem;
      color: #4a4a4a;
      margin-bottom: 20px;
      position: relative;
      display: inline-block;
    }
    
    .welcome-section h2::after, .featured-services h2::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background-color: #c59d5f;
      margin: 10px auto 0;
    }

    .welcome-section p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #555;
    }

    .services-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around; /* O space-between */
      gap: 20px; /* Spazio tra le card */
      margin-top: 30px;
    }

    .service-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      overflow: hidden;
      width: calc(33.333% - 20px); /* Per tre card per riga, con gap */
      min-width: 280px; /* Larghezza minima per responsività */
      margin-bottom: 20px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .service-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .service-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .service-card h3 {
      font-size: 1.5rem;
      color: #c59d5f;
      margin: 15px 0 10px;
    }

    .service-card p {
      font-size: 1rem;
      padding: 0 15px 15px;
      color: #666;
      line-height: 1.5;
    }

    /* Media queries per responsività */
    @media (max-width: 992px) {
      .service-card {
        width: calc(50% - 20px); /* Due card per riga */
      }
    }

    @media (max-width: 768px) {
      .hero-text h1 {
        font-size: 2.5rem;
      }
      .hero-text p {
        font-size: 1.2rem;
      }
      .service-card {
        width: 100%; /* Una card per riga */
      }
    }
  `
})
export class HomeComponent {
  navigateToServices() {
    // Implementa la navigazione alla pagina dei servizi
    // Esempio: this.router.navigate(['/servizi']);
    console.log('Naviga ai servizi');
  }
}
